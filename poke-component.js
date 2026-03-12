
class PokeList extends HTMLElement {
    constructor() {
        super();
        this.offset = 0;
        this.limit = 20; // Reducido para que cargue más rápido en la pantalla de pelea
        this.currentType = 'all';
        this.allTypeResults = []; 
    }

    async connectedCallback() {
        this.render();
        await this.loadTypes();
        await this.fetchPokemons();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <style>
                .poke-list-wrapper {
                    --type-normal: #A8A878; --type-fire: #F08030; --type-water: #6890F0;
                    --type-grass: #78C850; --type-electric: #F8D030; --type-ice: #98D8D8;
                    --type-fighting: #C03028; --type-poison: #A040A0; --type-ground: #E0C068;
                    --type-flying: #A890F0; --type-psychic: #F85888; --type-bug: #A8B820;
                    --type-rock: #B8A038; --type-ghost: #705898; --type-dragon: #7038F8;
                    --type-dark: #705848; --type-steel: #B8B8D0; --type-fairy: #EE99AC;
                }

                .controls {
                    background: #ffffff;
                    padding: 25px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    margin: 20px auto;
                    max-width: 900px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .search-section { display: flex; gap: 10px; width: 100%; }
                .search-section input {
                    flex-grow: 1;
                    padding: 12px 20px;
                    border-radius: 30px;
                    border: 2px solid #eee;
                    font-size: 1rem;
                    transition: all 0.3s;
                }

                .filter-pagination-row {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .btn-pagination {
                    padding: 10px 25px;
                    background-color: #3970d7;
                    color: white;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .btn-pagination:disabled { background-color: #e0e0e0; color: #999; }

                .poke-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 25px;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .poke-card {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid #f0f0f0;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                }

                .poke-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                    border-color: #ddd;
                }

                .img-container {
                    background: #f8f9fa;
                    border-radius: 50%;
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s ease;
                }

                .poke-card:hover .img-container {
                    background: #f0f0f0;
                }

                .poke-card img { 
                    width: 80px; 
                    height: 80px; 
                    image-rendering: pixelated;
                    transition: transform 0.3s ease;
                }

                .poke-card:hover img {
                    transform: scale(1.2);
                }
                .poke-card h3 { margin: 10px 0; text-transform: capitalize; color: #333; }
                
                .type-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: bold;
                    margin: 2px;
                    text-transform: uppercase;
                }

                .stats-container {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .stat-value {
                    font-weight: bold;
                    color: #333;
                    font-size: 1rem;
                }

                .stat-label {
                    font-size: 0.7rem;
                    color: #888;
                    text-transform: uppercase;
                }

                .loading { text-align: center; padding: 40px; font-size: 1.1rem; color: #3970d7; font-weight: bold; }
            </style>

            <div class="poke-list-wrapper">
                <div class="controls">
                    <div class="search-section">
                        <input type="text" id="search-input" placeholder="Nombre o ID del Pokémon...">
                        <button id="search-btn" class="btn-pagination">Buscar</button>
                    </div>

                    <div class="filter-pagination-row">
                        <select id="type-filter" style="padding: 10px 20px; border-radius: 20px; border: 2px solid #eee;">
                            <option value="all">Todos los Tipos</option>
                        </select>
                        
                        <div class="pagination-section" id="pagination-controls">
                            <button id="prev-btn" class="btn-pagination" disabled>Anterior</button>
                            <span id="page-info" style="align-self: center; font-weight: bold; margin: 0 15px;">...</span>
                            <button id="next-btn" class="btn-pagination">Siguiente</button>
                        </div>
                    </div>
                </div>

                <div id="loading" class="loading" style="display:none;">Buscando...</div>
                <div id="container" class="poke-container"></div>
            </div>
        `;
    }

    setupEventListeners() {
        this.querySelector('#type-filter').addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.offset = 0;
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

        this.querySelector('#search-btn').addEventListener('click', () => this.handleSearch());
        
    }


    async handleSearch() {
        const query = this.querySelector('#search-input').value.trim().toLowerCase();
        if (!query) { this.fetchPokemons(); return; }

        const container = this.querySelector('#container');
        const loading = this.querySelector('#loading');
        container.innerHTML = '';
        loading.style.display = 'block';

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            if (!res.ok) throw new Error();
            const pokemon = await res.json();
            this.renderCards([pokemon]);
            loading.style.display = 'none';
        } catch (error) {
            loading.innerHTML = `<div style="color: red;">Pokémon no encontrado.</div>`;
        }
    }

    async loadTypes() {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        const select = this.querySelector('#type-filter');
        data.results.forEach(type => {
            if(!['unknown', 'shadow'].includes(type.name)) {
                const opt = document.createElement('option');
                opt.value = type.name;
                opt.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                select.appendChild(opt);
            }
        });
    }



    async fetchPokemons() {
        const container = this.querySelector('#container');
        const loading = this.querySelector('#loading');
        container.innerHTML = '';
        loading.style.display = 'block';

        let list = [];
        let total = 0;

        if (this.currentType === 'all') {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`);
            const data = await res.json();
            list = data.results;
            total = data.count;
        } else {
            if (this.offset === 0) {
                const res = await fetch(`https://pokeapi.co/api/v2/type/${this.currentType}`);
                const data = await res.json();
                this.allTypeResults = data.pokemon.map(p => p.pokemon);
            }
            total = this.allTypeResults.length;
            list = this.allTypeResults.slice(this.offset, this.offset + this.limit);
        }

        const pokemons = await Promise.all(list.map(p => fetch(p.url).then(r => r.json())));
        this.renderCards(pokemons);
        loading.style.display = 'none';
        
        this.querySelector('#page-info').textContent = `${this.offset + 1}-${Math.min(this.offset + this.limit, total)} de ${total}`;
        this.querySelector('#prev-btn').disabled = this.offset === 0;
        this.querySelector('#next-btn').disabled = (this.offset + this.limit) >= total;
    }

    renderCards(pokemons) {
        const container = this.querySelector('#container');
        container.innerHTML = pokemons.map(pokemon => {
            const hp = pokemon.stats.find(s => s.stat.name === 'hp').base_stat;
            const attack = pokemon.stats.find(s => s.stat.name === 'attack').base_stat;
            
            return `
                <div class="poke-card" data-id="${pokemon.id.toString()}" style="border-top: 5px solid var(--type-${pokemon.types[0].type.name})">
                    <div style="text-align: right; font-size: 0.8rem; color: #777; margin-bottom: -10px;">
                        #${pokemon.id.toString().padStart(3, '0')}
                    </div>
                    <div class="img-container">
                        <img src="${pokemon.sprites.front_default || ''}" alt="${pokemon.name}">
                    </div>
                    <h3>${pokemon.name}</h3>
                    <div>
                        ${pokemon.types.map(t => `<span class="type-badge" style="background-color: var(--type-${t.type.name})">${t.type.name}</span>`).join('')}
                    </div>
                    
                    <div class="stats-container">
                        <div class="stat-item">
                            <span class="stat-value">${hp}</span>
                            <span class="stat-label">Vida</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${attack}</span>
                            <span class="stat-label">Daño</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const cards = container.querySelectorAll('.poke-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const pokemonId = card.dataset.id;
                this.dispatchEvent(new CustomEvent('pokemon-selected', {
                    detail: { id: pokemonId },
                    bubbles: true,
                    composed: true
                }));
            });
        });
    }
}

class PokeCards extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                .pokedex-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: sans-serif;
                }
                .battle-btn {
                    padding: 12px 25px;
                    background: linear-gradient(135deg, #ff1f1f, #c00);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            </style>
            <div class="pokedex-header">
                <h2 style="margin: 0; font-size: 2.2rem; color: #333; font-weight: 800;">Pokédex</h2>
                <button id="go-battle-btn" class="battle-btn">
                    <span>IR A BATALLA</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </button>
            </div>
            <poke-list></poke-list>
        `;

        this.querySelector('#go-battle-btn').addEventListener('click', () => {
            window.location.href = 'fight.html'; 
        });
    }
}

customElements.define('poke-list', PokeList);
customElements.define('poke-cards', PokeCards);
