// === MEJORAS DEL SISTEMA DE NAVEGACIÓN ===

class NavigationManager {
    constructor() {
        this.currentSection = 'external-platforms';
        this.sections = new Map();
        this.history = [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        this.registerSections();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.initializeCurrentSection();
    }

    // Registrar todas las secciones disponibles
    registerSections() {
        const sectionElements = document.querySelectorAll('.content-section');
        sectionElements.forEach(section => {
            const id = section.id;
            const title = section.querySelector('h2')?.textContent || id;
            const navButton = document.querySelector(`[data-section="${id}"]`);
            
            this.sections.set(id, {
                element: section,
                title: title,
                button: navButton,
                isVisible: false,
                lastVisited: null
            });
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Event listener para botones de navegación
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-btn[data-section]')) {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                this.navigateToSection(sectionId);
            }
        });

        // Event listener para enlaces internos
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const sectionId = e.target.getAttribute('href').substring(1);
                if (this.sections.has(sectionId)) {
                    this.navigateToSection(sectionId);
                }
            }
        });
    }

    // Configurar navegación por teclado
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + número para navegación rápida
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9) {
                    const sections = Array.from(this.sections.keys());
                    if (sections[num - 1]) {
                        e.preventDefault();
                        this.navigateToSection(sections[num - 1]);
                    }
                }
            }

            // Ctrl + flecha izquierda/derecha para navegación secuencial
            if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                const sections = Array.from(this.sections.keys());
                const currentIndex = sections.indexOf(this.currentSection);
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    this.navigateToSection(sections[currentIndex - 1]);
                } else if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
                    e.preventDefault();
                    this.navigateToSection(sections[currentIndex + 1]);
                }
            }

            // Alt + H para historial
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                this.showNavigationHistory();
            }
        });
    }

    // Navegar a una sección específica
    navigateToSection(sectionId, addToHistory = true) {
        if (!this.sections.has(sectionId)) {
            console.warn(`Section '${sectionId}' not found`);
            return false;
        }

        // Agregar al historial
        if (addToHistory && this.currentSection !== sectionId) {
            this.addToHistory(this.currentSection);
        }

        // Ocultar sección actual
        if (this.currentSection && this.sections.has(this.currentSection)) {
            const currentSectionData = this.sections.get(this.currentSection);
            currentSectionData.element.classList.remove('active');
            currentSectionData.element.style.display = 'none';
            currentSectionData.isVisible = false;
            
            if (currentSectionData.button) {
                currentSectionData.button.classList.remove('active');
            }
        }

        // Mostrar nueva sección
        const newSectionData = this.sections.get(sectionId);
        newSectionData.element.classList.add('active');
        newSectionData.element.style.display = 'block';
        newSectionData.isVisible = true;
        newSectionData.lastVisited = new Date();
        
        if (newSectionData.button) {
            newSectionData.button.classList.add('active');
        }

        // Actualizar sección actual
        this.currentSection = sectionId;

        // Smooth scroll al inicio de la sección
        newSectionData.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        // Disparar evento personalizado
        this.dispatchNavigationEvent(sectionId);

        // Actualizar URL sin recargar página
        this.updateURL(sectionId);

        // Mostrar notificación de navegación
        this.showNavigationNotification(newSectionData.title);

        return true;
    }

    // Agregar al historial
    addToHistory(sectionId) {
        if (sectionId && sectionId !== this.history[this.history.length - 1]) {
            this.history.push(sectionId);
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }
    }

    // Navegar hacia atrás en el historial
    goBack() {
        if (this.history.length > 0) {
            const previousSection = this.history.pop();
            this.navigateToSection(previousSection, false);
            return true;
        }
        return false;
    }

    // Mostrar historial de navegación
    showNavigationHistory() {
        if (this.history.length === 0) {
            showNotification('No hay historial de navegación disponible', 'info');
            return;
        }

        const historyItems = this.history.map(sectionId => {
            const sectionData = this.sections.get(sectionId);
            return `<div class="history-item" data-section="${sectionId}">
                <strong>${sectionData.title}</strong>
                <small>Visitado: ${sectionData.lastVisited ? sectionData.lastVisited.toLocaleTimeString() : 'Desconocido'}</small>
            </div>`;
        }).join('');

        const content = `
            <div style="padding: 20px;">
                <h3 style="margin-bottom: 15px;">Historial de Navegación</h3>
                <div class="history-list" style="max-height: 300px; overflow-y: auto;">
                    ${historyItems}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn-secondary" onclick="closeAllModals()">Cerrar</button>
                </div>
            </div>
        `;

        const modal = showModal(content, {
            className: 'navigation-history-modal'
        });

        // Event listener para elementos del historial
        modal.element.addEventListener('click', (e) => {
            if (e.target.closest('.history-item')) {
                const sectionId = e.target.closest('.history-item').dataset.section;
                closeAllModals();
                this.navigateToSection(sectionId);
            }
        });
    }

    // Actualizar URL
    updateURL(sectionId) {
        if (history.pushState) {
            const newURL = `${window.location.pathname}#${sectionId}`;
            history.pushState({ section: sectionId }, '', newURL);
        }
    }

    // Disparar evento de navegación
    dispatchNavigationEvent(sectionId) {
        const event = new CustomEvent('sectionChanged', {
            detail: {
                currentSection: sectionId,
                previousSection: this.history[this.history.length - 1] || null,
                sectionData: this.sections.get(sectionId)
            }
        });
        document.dispatchEvent(event);
    }

    // Mostrar notificación de navegación
    showNavigationNotification(title) {
        const notification = document.createElement('div');
        notification.className = 'navigation-notification';
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(79, 172, 254, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            animation: slideInDown 0.3s ease-out, fadeOut 0.3s ease-out 1.7s forwards;
        `;
        notification.textContent = title;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 2000);
    }

    // Inicializar sección actual basada en URL
    initializeCurrentSection() {
        const hash = window.location.hash.substring(1);
        if (hash && this.sections.has(hash)) {
            this.navigateToSection(hash, false);
        } else {
            this.navigateToSection(this.currentSection, false);
        }
    }

    // Obtener información de la sección actual
    getCurrentSectionInfo() {
        return {
            id: this.currentSection,
            data: this.sections.get(this.currentSection),
            history: [...this.history]
        };
    }

    // Obtener todas las secciones
    getAllSections() {
        return Array.from(this.sections.entries()).map(([id, data]) => ({
            id,
            title: data.title,
            isVisible: data.isVisible,
            lastVisited: data.lastVisited
        }));
    }

    // Buscar secciones
    searchSections(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        this.sections.forEach((data, id) => {
            if (data.title.toLowerCase().includes(lowerQuery) || 
                id.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id,
                    title: data.title,
                    relevance: data.title.toLowerCase().indexOf(lowerQuery)
                });
            }
        });
        
        return results.sort((a, b) => a.relevance - b.relevance);
    }
}

// Manejar navegación del navegador (botón atrás/adelante)
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
        window.navigationManager.navigateToSection(e.state.section, false);
    }
});

// Instancia global del gestor de navegación
window.navigationManager = new NavigationManager();

// Funciones de conveniencia globales
window.navigateToSection = (sectionId) => window.navigationManager.navigateToSection(sectionId);
window.goBack = () => window.navigationManager.goBack();
window.showNavigationHistory = () => window.navigationManager.showNavigationHistory();

// Mejorar la función switchSection existente
window.switchSection = function(sectionId) {
    return window.navigationManager.navigateToSection(sectionId);
};

console.log('Navigation improvements loaded successfully');
