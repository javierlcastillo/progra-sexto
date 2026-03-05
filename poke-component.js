class PokeCards extends HTMLElement {
    constructor() {
        super();
        this.offset = 0;
        this.limit = 100;
        this.currentType = 'all';
        this.allTypeResults = []; 
    }

    async connectedCallback() {
        this.renderSkeleton();
        await this.loadTypes();
        await this.fetchPokemons();
    }

    renderSkeleton() {
        this.innerHTML = `
            <style>
                .controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .search-section {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                    max-width: 400px;
                }
                .search-section input {
                    flex-grow: 1;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    font-size: 1rem;
                }
                .filter-section select {
                    padding: 8px 15px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    text-transform: capitalize;
                }
                .pagination-section {
                    display: flex;
                    gap: 10px;
                }
                .btn-pagination {
                    padding: 8px 20px;
                    background-color: #3970d7;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .btn-pagination:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                .btn-pagination:hover:not(:disabled) {
                    background-color: #2a52a3;
                }
                .poke-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .poke-card {
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    padding: 20px;
                    text-transform: capitalize;
                }
                .poke-card img { 
                    width: 120px; height: 120px; object-fit: contain; 
                }
                .loading { 
                    text-align: center; padding: 50px; font-size: 1.2em; color: #666; 
                }
                .title-section { 
                    text-align: center; padding: 20px 0; color: #333; 
                }
            </style>
            
            <h2 class="title-section">Pokédex Pro</h2>
            
            <div class="controls">
                <!-- Barra de Búsqueda -->
                <div class="search-section">
                    <input type="text" id="search-input" placeholder="Buscar por nombre o ID...">
                    <button id="search-btn" class="btn-pagination">Buscar</button>
                </div>

                <div class="filter-section">
                    <label for="type-filter">Tipo: </label>
                    <select id="type-filter">
                        <option value="all">Todos</option>
                    </select>
                </div>
                
                <div class="pagination-section" id="pagination-controls">
                    <button id="prev-btn" class="btn-pagination" disabled>Anterior</button>
                    <span id="page-info" style="align-self: center; font-weight: bold;">Cargando...</span>
                    <button id="next-btn" class="btn-pagination">Siguiente</button>
                </div>
            </div>

            <div id="loading" class="loading">Buscando en la hierba alta...</div>
            <div id="container" class="poke-container"></div>
        `;

        this.querySelector('#type-filter').addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.offset = 0;
            this.querySelector('#search-input').value = '';
            this.fetchPokemons();
        });

        this.querySelector('#prev-btn').addEventListener('click', () => {
            if (this.offset >= this.limit) {
                this.offset -= this.limit;
                this.fetchPokemons();
            }
        });

        this.querySelector('#next-btn').addEventListener('click', () => {
            this.offset += this.limit;
            this.fetchPokemons();
        });

        const searchInput = this.querySelector('#search-input');
        const searchBtn = this.querySelector('#search-btn');

        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    async handleSearch() {
        const query = this.querySelector('#search-input').value.trim().toLowerCase();
        const container = this.querySelector('#container');
        const loading = this.querySelector('#loading');
        const pagination = this.querySelector('#pagination-controls');

        if (!query) {
            this.fetchPokemons();
        }

        container.innerHTML = '';
        loading.style.display = 'block';
        loading.innerHTML = 'Buscando espécimen...';
        pagination.style.display = 'none';

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            if (!res.ok) throw new Error('No encontrado');
            
            const pokemon = await res.json();
            this.renderCards([pokemon]);
            loading.style.display = 'none';
        } catch (error) {
            loading.innerHTML = `<span style="color: red;">Pokémon "${query}" no encontrado.</span>`;
            console.error('Error de búsqueda:', error);
        }
    }

    async loadTypes() {
        try {
            const res = await fetch('https://pokeapi.co/api/v2/type');
            const data = await res.json();
            const select = this.querySelector('#type-filter');
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                select.appendChild(option);
            });
        } catch (error) { console.error('Error tipos:', error); }
    }

    async fetchPokemons() {
        const container = this.querySelector('#container');
        const loading = this.querySelector('#loading');
        const pageInfo = this.querySelector('#page-info');
        const pagination = this.querySelector('#pagination-controls');
        
        container.innerHTML = '';
        loading.style.display = 'block';
        loading.innerHTML = 'Buscando en la hierba alta...';
        pagination.style.display = 'flex';
        this.updateButtons(true);

        try {
            let pokemonList = [];
            let total = 0;

            if (this.currentType === 'all') {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`);
                const data = await res.json();
                pokemonList = data.results;
                total = data.count;
            } else {
                if (this.offset === 0) {
                    const res = await fetch(`https://pokeapi.co/api/v2/type/${this.currentType}`);
                    const data = await res.json();
                    this.allTypeResults = data.pokemon.map(p => p.pokemon);
                }
                total = this.allTypeResults.length;
                pokemonList = this.allTypeResults.slice(this.offset, this.offset + this.limit);
            }

            const pokemonPromises = pokemonList.map(async (p) => {
                const res = await fetch(p.url);
                return res.json();
            });

            const pokemons = await Promise.all(pokemonPromises);
            this.renderCards(pokemons);
            
            loading.style.display = 'none';
            pageInfo.textContent = `${this.offset + 1} - ${Math.min(this.offset + this.limit, total)} de ${total}`;
            this.updateButtons(false, total);

        } catch (error) {
            loading.innerHTML = `<span style="color: red;">Error de conexión.</span>`;
            console.error(error);
        }
    }

    updateButtons(isLoading, total = 0) {
        const prevBtn = this.querySelector('#prev-btn');
        const nextBtn = this.querySelector('#next-btn');
        if (isLoading) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            prevBtn.disabled = this.offset === 0;
            nextBtn.disabled = (this.offset + this.limit) >= total;
        }
    }

    renderCards(pokemons) {
        const container = this.querySelector('#container');
        container.innerHTML = pokemons.map(pokemon => `
            <div class="poke-card">
                <img src="${pokemon.sprites.front_default || 'https://via.placeholder.com/120?text=?'}" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
                <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            </div>
        `).join('');
    }
}

customElements.define('poke-cards', PokeCards);