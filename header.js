class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <style>
            .welcome-container {
                background-color: #3970d7;
                display: flex; 
                justify-content: space-between;
                align-items: center;
                max-width: 100%; 
                padding: 10px 20px; 
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                color: white; 
                border-radius: 0; 
            }
            .welcome-container h1 {
                margin: 0; 
                font-size: 1.5em; 
            }
            .header-logo {
                font-weight: bold; 
                font-size: 1.2em; 
            }
            .nav-button {
                display: inline-block;
                padding: 15px 30px;
                font-size: 1.1rem;
                font-weight: bold;
                color: #004fa3;
                border: none;
                text-decoration: none;
                transition: background-color 0.3s, transform 0.2s;
                width: 100%;
                box-sizing: border-box;
                text-align: left;
                cursor: pointer;
            }
            .nav-button:hover {
                background-color: #e0e0e0; 
                transform: translateY(-2px);
            }
            .nav-button:active {
                transform: translateY(0);
                background-color: #d0d0d0;
            }
            .sidebar {
                position: fixed;
                top: 0;
                right: 0;
                height: 100vh;
                width: 250px;
                background-color: #d4d4d4;
                display: flex;
                flex-direction: column;
                align-items: start;
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                padding-top: 60px;
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .header-icons {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .notification-bell {
                position: relative;
                display: flex; 
                align-items: center;
                text-decoration: none;
            }
            .notification-bell svg {
                cursor: pointer;
            }
            .burger-menu {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                width: 2rem;
                height: 2rem;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                position: relative; 
                z-index: 1001;
            }
            .burger-menu span {
                width: 2rem;
                height: 0.25rem;
                background: #ffffff;
                border-radius: 10px;
                transition: all 0.3s linear;
                position: relative;
                transform-origin: 1px;
            }       
            .burger-menu.open span:first-child {
                transform: rotate(45deg);
            }
            .burger-menu.open span:nth-child(2) {
                opacity: 0;
            }
            .burger-menu.open span:nth-child(3) {
                transform: rotate(-45deg);
            }
            .notifications {
                display: none;
            }
            .notifications.opened {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%); 
                width: 80%;
                max-width: 600px;
                max-height: 70vh;
                border-radius: 10px;
                background-color: #f0f0f0; 
                z-index: 1002;
                display: flex; 
                flex-direction: column;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .close-btn {
                position: absolute;
                top: 15px;
                right: 20px;
                width: 2rem;
                height: 2rem;
                background: transparent;
                border: none;
                cursor: pointer;
            }
            .close-btn span {
                display: block;
                width: 2rem;
                height: 0.25rem;
                background: #dc3545; 
                border-radius: 10px;
                position: absolute;
                top: 50%;
                left: 0;
            }
            .close-btn span:first-child {
                transform: rotate(45deg);
            }
            .close-btn span:last-child {
                transform: rotate(-45deg);
            }
            .notifications h2 {
                margin: 0 0 20px 0;
                padding-bottom: 10px;
                border-bottom: 1px solid #ccc;
                text-align: center;
            }
            .notifications ul {
                list-style: none;
                padding: 0;
                margin: 0;
                overflow-y: auto; 
                flex-grow: 1; 
            }
            .notifications li {
                padding: 15px 10px;
                border-bottom: 1px solid #ccc;
                font-size: 0.95em;
            }
            .notifications li:last-child {
                border-bottom: none; 
            }
        </style>

        <header class="welcome-container">
            <h1>Bienvenido a {empresa}</h1>
            <span class="header-logo">{logo}</span> 
            <div class="header-icons">
                <a href="#" id="notification-bell-btn" class="notification-bell">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 24 24" width="28px"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="white" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.21 1.79-4 4-4s4 1.79 4 4v6z"/></svg>
                </a>
                <button class="burger-menu" id="burger-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>        
        </header>
        <nav class="sidebar" id="sidebar">
            <a class="nav-button" id="inicio">Inicio</a>
            <a class="nav-button" id="calendario">Calendario</a>
            <a class="nav-button" id="perfil">Perfil</a>
            <a  class="nav-button" id="log-out">Cerrar Sesion</a>
        </nav>

        <div class="notifications">
            <button id="close-notifications-btn" class="close-btn">
                <span></span>
                <span></span>
            </button>
            <h2>Notificaciones</h2>
            <ul>
                <li>Esto es un texto de prueba. Aqui se despliegaran mas alertas y notificaciones</li>
                <li>Esto es un texto de prueba. Aqui se despliegaran mas alertas y notificaciones</li>
                <li>Esto es un texto de prueba. Aqui se despliegaran mas alertas y notificaciones</li>
                <li>Esto es un texto de prueba. Aqui se despliegaran mas alertas y notificaciones</li>
            </ul>
        </div>    
        `;

        this.initLogic();
    }

    initLogic() {
        const burgerMenu = this.querySelector('#burger-menu');
        const sidebar = this.querySelector('#sidebar');
        const notificationBtn = this.querySelector('#notification-bell-btn');
        const notificationsPanel = this.querySelector('.notifications');
        const closeNotificationsBtn = this.querySelector('#close-notifications-btn');

        if (burgerMenu) {
            burgerMenu.addEventListener('click', () => {
                burgerMenu.classList.toggle('open');
                sidebar.classList.toggle('open');
            });
        }

        const toggleNotifications = () => {
            if (notificationsPanel) notificationsPanel.classList.toggle('opened');
        };

        if (notificationBtn) {
            notificationBtn.addEventListener('click', (event) => {
                event.preventDefault(); 
                toggleNotifications();
            });
        }

        if (closeNotificationsBtn) {
            closeNotificationsBtn.addEventListener('click', () => {
                toggleNotifications();
            });
        }

        // Navigation logic
        const navButtons = this.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const pageId = event.currentTarget.id;
                
                if (pageId === 'log-out') {
                    window.location.href = 'login.html';
                } else if (pageId) {
                    window.location.href = pageId + '.html';
                }
            });
        });
    }
}

customElements.define('app-header', Header);
