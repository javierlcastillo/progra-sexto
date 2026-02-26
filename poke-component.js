class PokeCards extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = `
            <style>
                .poke-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 20px auto;
                    flex-grow: 1;
                }
                .poke-card {
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s ease-in-out;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    text-transform: capitalize;
                }
                .poke-card:hover {
                    transform: translateY(-5px);
                }
                .poke-card img {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                }
                .poke-card h3 {
                    margin: 10px 0 5px;
                    color: #3970d7;
                }
                .poke-card p {
                    color: #666;
                    margin: 5px 0;
                    font-size: 0.9em;
                }
                .loading {
                    text-align: center;
                    padding: 50px;
                    font-size: 1.2em;
                    color: #666;
                    flex-grow: 1;
                }
                .title-section {
                    text-align: center;
                    padding-top: 20px;
                    color: #333;
                }
            </style>
            <h2 class="title-section">Tus 5 Pokémon</h2>
            <div class="loading">Obteniendo datos de PokeAPI...</div>
        `;

        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=5');
            const data = await response.json();
            
            const pokemonPromises = data.results.map(async (poke) => {
                const res = await fetch(poke.url);
                return res.json();
            });
            
            const pokemons = await Promise.all(pokemonPromises);
            this.renderCards(pokemons);
            
        } catch (error) {
            this.innerHTML = `<div class="loading" style="color: red;">Error al conectar con la PokeAPI.</div>`;
            console.error('Error fetching PokeApi:', error);
        }
    }

    renderCards(pokemons) {
        const cardsHTML = pokemons.map(pokemon => `
            <div class="poke-card">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
                <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            </div>
        `).join('');

        this.innerHTML += `<div class="poke-container">${cardsHTML}</div>`;
        this.querySelector('.loading').remove();
    }
}

customElements.define('poke-cards', PokeCards);