class Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <style>
            .footer {
                background-color: #333;
                color: white;
                text-align: center;
                padding: 15px 0;
                margin-top: auto; 
                width: 100%;
            }
            .footer p {
                margin: 5px 0;
                font-size: 0.9em;
            }
        </style>
        <footer class="footer">
            <p>&copy; 2026 {empresa}. Todos los derechos reservados.</p>
        </footer>
        `;

        // this.initLogic();
    }
    /* initLogic (){

    } */
}

customElements.define('app-footer', Footer);
