class PokeFight extends HTMLElement {
    constructor() {
        super();
        this.fighters = 0;
        this.pokemonData = [];
        this.logs = [];
        this.currentTurn = 0;
        this.maxTurns = 18;
    }
    
    async connectedCallback(){
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
        <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            font-family: 'Courier New', Courier, monospace;
            overflow-x: hidden;
        }

        #foto-pelea {
            width: 100vw;
            height: 35vh;
            object-fit: cover;
            object-position: center;
            display: block;
            transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pelea {
            position: relative;
            overflow: hidden;
        }

        .fighter {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: opacity 0.4s ease-in;
            opacity: 0;
            z-index: 5;
        }

        .fighter.active {
            opacity: 1;
        }

        #fighter-one {
            bottom: 40%;
            left: 15%;
        }

        #fighter-two {
            bottom: 40%;
            right: 15%;
        }

        .pokemon-sprite {
            width: 250px;
            height: 250px;
            image-rendering: pixelated;
            filter: drop-shadow(5px 5px 0 rgba(0,0,0,0.1));
        }

       .hp-card {
            background: #f8f8d8;
            border: 4px solid #606060;
            border-radius: 0 20px 0 20px;
            padding: 12px;
            width: 250px;
            box-shadow: 6px 6px 0 rgba(0,0,0,0.1);
        }


        .pokemon-name {
            text-transform: uppercase;
            font-size: 0.9rem;
            font-weight: bold;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
        }

        .hp-bar-container {
            background: #404040;
            height: 12px;
            border: 2px solid #000;
            border-radius: 10px;
            overflow: hidden;
        }

        .hp-bar-fill {
            height: 100%;
            background: #70f8a8;
            width: 100%;
        }

        #outside-textbox {
            position: relative;
            background-color: #c3a958; 
            width: 90%;
            height: 140px;
            margin: 30px auto;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: #333;
            font-weight: bold;
            line-height: 1.4;
            bottom: 25vh;
            transition: all 0.8s ease;

            box-shadow:
                0 -8px 0 0 black,
                0 8px 0 0 black,
                -8px 0 0 0 black,
                8px 0 0 0 black;
        }

        #outside-textbox::after {
            content: "";
            position: absolute;
            top: -4px; bottom: -4px;
            left: -4px; right: -4px;
            box-shadow:
                inset 4px 4px 0 0 transparent,
                inset -4px -4px 0 0 transparent;
            z-index: -1;
        }

        #inside-textbox {
            background-color: #324f66;
            position: relative;
            color: white;
            display: flex;
            align-items: center;
            padding-left: 20px;
            width: calc(100% - 20px); 
            height: calc(100% - 20px);
            box-sizing: border-box;
            transition: all 0.8s ease;

            box-shadow:
                0 -4px 0 0 white,
                0 4px 0 0 white,
                -4px 0 0 0 white,
                4px 0 0 0 white;
        }

        .poke-fight {
            width: 100%;
        }

        .pokemon-selection {
            position: relative;
            margin-top: -20vh;
            z-index: 10;
            background-color: #f0f0f0;
            padding-bottom: 50px;
            transition: transform 0.8s ease, opacity 0.8s ease;
        }

        .btn-pixel {
            background: #e0e0e0;
            border: 4px solid #000;
            padding: 5px 10px;
            font-family: inherit;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            margin-left: 20px;
        }

        .summary-list {
            font-size: 0.8rem;
            max-height: 100px;
            overflow-y: auto;
            width: 100%;
        }

        body.battle-active #foto-pelea {
            height: 60vh;
        }

        body.battle-active #outside-textbox {
            bottom: 10vh;
        }

        body.battle-active .pokemon-selection {
            transform: translateY(100px);
        }
    </style>

    <div class="poke-fight">
        <div class="pelea">
            <img src="public/poke-fight.png" id="foto-pelea">
            <div class="fighter" id="fighter-one"></div>
            <div class="fighter" id="fighter-two"></div>
            <div class="container" id="outside-textbox">
                <div class="container" id="inside-textbox">
                    <div id="text-content">¡Selecciona tu Pokémon!</div>
                    <div id="action-container"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="pokemon-selection">
        <poke-list></poke-list>
    </div>
        `;
    }

    setupEventListeners(){
        const pokeList = this.querySelector('poke-list');

        if (pokeList) {
            pokeList.addEventListener('pokemon-selected', (e) => {
                const id = e.detail.id;
                this.handleSelection(id);
            });
        }
    }

    async handleSelection(pokemonId){
        if (this.fighters >= 2) return;
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const data = await res.json();
            const hpBase = data.stats.find(s => s.stat.name === 'hp').base_stat;
            data.maxHp = hpBase;
            data.currentHp = hpBase;
            this.pokemonData.push(data);
            document.body.classList.add('battle-active');
            this.renderFighter(data);
            
            if (this.fighters === 2) {
                this.showActionButton("INICIAR PELEA", () => this.startBattle());
            }
        } catch (error) {
            console.error("Error al cargar Pokémon:", error);
        }
    }

    renderFighter(pokemonData) {
        let fighterSpot;

        window.scrollTo({top: 0, behavior: "smooth"})

        if(this.fighters === 0){
            fighterSpot = this.querySelector('#fighter-one');
        } else if (this.fighters === 1){
            fighterSpot = this.querySelector('#fighter-two');
        } else {
            this.fighters = 0;
            return this.renderFighter(pokemonData);
        }

        const hp = pokemonData.maxHp;
        const sprite = pokemonData.sprites.front_default;

        fighterSpot.innerHTML = `
            <div class="hp-card">
                <div class="pokemon-name">
                    <span>${pokemonData.name}</span>
                    <span>Lv50</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" id="hp-bar-${this.fighters}" style="width: 100%; transition: width 0.5s ease;"></div>
                </div>
                <div id="hp-text-${this.fighters}" style="text-align: right; font-size: 0.7rem; margin-top: 2px;">
                    ${hp}/${hp} HP
                </div>
            </div>
            <img src="${sprite}" class="pokemon-sprite" alt="${pokemonData.name}">
        `;

        setTimeout(() => fighterSpot.classList.add('active'), 50);

        const textContent = this.querySelector('#text-content');
        if (this.fighters === 0) {
            textContent.innerHTML = `¡Adelante, ${pokemonData.name.toUpperCase()}!`;
        } else {
            textContent.innerHTML = `¡${pokemonData.name.toUpperCase()} salvaje apareció!`;
        }

        this.fighters++;
    }

    showActionButton(label, callback) {
        const container = this.querySelector('#action-container');
        container.innerHTML = `<button class="btn-pixel">${label}</button>`;
        container.querySelector('button').onclick = callback;
    }

    startBattle() {
        this.currentTurn = 1;
        this.logs = [];
        this.processTurn();
    }

    processTurn() {
        const attackerIdx = this.currentTurn % 2 !== 0 ? 0 : 1;
        const defenderIdx = attackerIdx === 0 ? 1 : 0;
        const attacker = this.pokemonData[attackerIdx];
        const defender = this.pokemonData[defenderIdx];
        
        const moveIndex = Math.floor(Math.random() * attacker.moves.length);
        const moveName = attacker.moves[moveIndex].move.name.replace(/-/g, ' ').toUpperCase();
        
        let damage = Math.floor(Math.random() * 8) + 5;
        let specialEffect = "";

        if (this.currentTurn % 3 === 0) {
            const isAttack = Math.random() > 0.5;
            if (isAttack) {
                damage = Math.floor(damage * 2.5);
                specialEffect = "¡ATAQUE ESPECIAL! ";
            } else {
                damage = 2;
                specialEffect = "¡DEFENSA ESPECIAL! ";
            }
        }

        defender.currentHp = Math.max(0, defender.currentHp - damage);
        
        const logEntry = `Turno ${this.currentTurn}: ${specialEffect}¡${attacker.name.toUpperCase()} usó ${moveName}! Quita ${damage} HP.`;
        this.logs.push(logEntry);
        
        this.querySelector('#text-content').innerHTML = logEntry;
        
        const hpFill = this.querySelector(`#hp-bar-${defenderIdx}`);
        const hpPercent = (defender.currentHp / defender.maxHp) * 100;
        hpFill.style.width = hpPercent + "%";

        const hpText = this.querySelector(`#hp-text-${defenderIdx}`);
        hpText.innerHTML = `${defender.currentHp}/${defender.maxHp} HP`;

        if (this.currentTurn < this.maxTurns && defender.currentHp > 0) {
            this.showActionButton("SIGUIENTE", () => {
                this.currentTurn++;
                this.processTurn();
            });
        } else {
            this.showActionButton("RESUMEN", () => this.showSummary());
        }
    }

    showSummary() {
        const p1 = this.pokemonData[0];
        const p2 = this.pokemonData[1];
        let winnerText = "";

        if (p1.currentHp > p2.currentHp) {
            winnerText = `¡EL GANADOR ES ${p1.name.toUpperCase()}!`;
        } else if (p2.currentHp > p1.currentHp) {
            winnerText = `¡EL GANADOR ES ${p2.name.toUpperCase()}!`;
        } else {
            winnerText = "¡ES UN EMPATE!";
        }

        const textContent = this.querySelector('#text-content');
        this.querySelector('#action-container').innerHTML = "";
        let summary = `<div class="summary-list"><strong>${winnerText}</strong><br><br><strong>RESUMEN:</strong><br>`;
        this.logs.forEach(log => summary += `• ${log}<br>`);
        summary += `</div>`;
        textContent.innerHTML = summary;
        this.showActionButton("REINICIAR", () => location.reload());
    }
}

customElements.define('poke-fight', PokeFight);