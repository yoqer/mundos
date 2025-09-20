// === MEJORAS ESPECÍFICAS PARA MÓVIL ===

class MobileImprovements {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.init();
    }
    
    init() {
        this.setupMobileDetection();
        this.forceCloseButtons();
        this.setupMinimizeButtons();
        this.ensureContentVisibility();
        this.setupTouchOptimizations();
        this.handleCookieManagement();
    }
    
    setupMobileDetection() {
        document.body.classList.add(this.isMobile ? 'mobile-device' : 'desktop-device');
        
        // Forzar que el contenido sea visible en móvil
        if (this.isMobile) {
            document.body.classList.add('mobile-content-visible');
        }
    }
    
    forceCloseButtons() {
        // Buscar todos los modales y añadir botones X funcionales
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay, .modal, [class*="overlay"]');
        
        modals.forEach(modal => {
            this.addFunctionalCloseButton(modal);
        });
        
        // Observer para modales que se crean dinámicamente
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains('overlay') || node.classList.contains('modal'))) {
                            this.addFunctionalCloseButton(node);
                        }
                        // Buscar dentro del nodo añadido
                        const innerModals = node.querySelectorAll && node.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay, .modal, [class*="overlay"]');
                        if (innerModals) {
                            innerModals.forEach(innerModal => this.addFunctionalCloseButton(innerModal));
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    addFunctionalCloseButton(modal) {
        // Remover botones X existentes que no funcionen
        const existingCloseButtons = modal.querySelectorAll('.close-button, .modal-close, [data-action="close"]');
        existingCloseButtons.forEach(btn => {
            if (!btn.classList.contains('functional-close')) {
                btn.remove();
            }
        });
        
        // Crear botón X funcional
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button functional-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Cerrar');
        closeButton.style.cssText = `
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            width: 36px !important;
            height: 36px !important;
            border: none !important;
            background: rgba(255, 0, 0, 0.8) !important;
            color: white !important;
            border-radius: 50% !important;
            font-size: 18px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 10001 !important;
            transition: all 0.3s ease !important;
            line-height: 1 !important;
            touch-action: manipulation !important;
        `;
        
        // Evento de cierre funcional
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal(modal);
        });
        
        closeButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal(modal);
        });
        
        // Añadir al modal
        modal.appendChild(closeButton);
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalVisible(modal)) {
                this.closeModal(modal);
            }
        });
        
        // Cerrar al tocar fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }
    
    setupMinimizeButtons() {
        // Añadir botones de minimizar a extensiones de voz
        const voiceModals = document.querySelectorAll('.voice-navigation-overlay, [class*="voice"]');
        
        voiceModals.forEach(modal => {
            const voiceCircle = modal.querySelector('.voice-navigation-circle');
            if (voiceCircle && !voiceCircle.querySelector('.minimize-button')) {
                this.addMinimizeButton(voiceCircle);
            }
        });
    }
    
    addMinimizeButton(voiceCircle) {
        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'minimize-button';
        minimizeButton.innerHTML = '−';
        minimizeButton.setAttribute('aria-label', 'Minimizar');
        minimizeButton.style.cssText = `
            position: absolute !important;
            top: 8px !important;
            left: 8px !important;
            width: 36px !important;
            height: 36px !important;
            border: none !important;
            background: rgba(0, 123, 255, 0.8) !important;
            color: white !important;
            border-radius: 50% !important;
            font-size: 14px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 10001 !important;
            transition: all 0.3s ease !important;
            touch-action: manipulation !important;
        `;
        
        minimizeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.minimizeVoiceExtension(voiceCircle);
        });
        
        minimizeButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.minimizeVoiceExtension(voiceCircle);
        });
        
        voiceCircle.appendChild(minimizeButton);
    }
    
    minimizeVoiceExtension(voiceCircle) {
        voiceCircle.classList.add('minimized');
        
        // Hacer que el círculo minimizado sea clickeable para expandir
        voiceCircle.addEventListener('click', (e) => {
            if (voiceCircle.classList.contains('minimized')) {
                e.preventDefault();
                e.stopPropagation();
                this.expandVoiceExtension(voiceCircle);
            }
        });
    }
    
    expandVoiceExtension(voiceCircle) {
        voiceCircle.classList.remove('minimized');
    }
    
    closeModal(modal) {
        // Múltiples métodos para asegurar que se cierre
        modal.classList.add('hidden', 'mobile-hidden', 'hiding');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        
        // Si es modal de cookies, ejecutar lógica específica
        if (modal.classList.contains('cookie-consent-overlay') || modal.innerHTML.includes('cookie')) {
            this.hideCookieElements();
        }
        
        // Remover clase modal-open del body
        document.body.classList.remove('mobile-modal-open');
        document.body.classList.add('mobile-content-visible');
        
        // Asegurar que el contenido principal sea visible
        setTimeout(() => {
            this.ensureContentVisibility();
        }, 100);
    }
    
    isModalVisible(modal) {
        return modal.style.display !== 'none' && 
               !modal.classList.contains('hidden') && 
               !modal.classList.contains('mobile-hidden');
    }
    
    hideCookieElements() {
        // Ocultar todos los elementos relacionados con cookies
        const cookieElements = document.querySelectorAll(
            '.cookie-consent-overlay, .cookie-text, .cookie-notice, [class*="cookie"]'
        );
        
        cookieElements.forEach(element => {
            element.classList.add('hidden', 'mobile-hidden');
            element.style.display = 'none';
        });
        
        // Ocultar texto específico de navegación y cookies
        const textElements = document.querySelectorAll('*');
        textElements.forEach(element => {
            if (element.textContent && 
                (element.textContent.toLowerCase().includes('al navegar aceptas') ||
                 element.textContent.toLowerCase().includes('cookies') ||
                 element.textContent.toLowerCase().includes('términos'))) {
                element.classList.add('cookie-text-hidden');
                element.style.display = 'none';
            }
        });
        
        // Guardar preferencia
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('cookiesHandled', Date.now().toString());
    }
    
    ensureContentVisibility() {
        // Forzar que el contenido principal sea visible
        const container = document.querySelector('.container');
        const main = document.querySelector('.main');
        const navigation = document.querySelector('.navigation, .nav');
        
        if (container) {
            container.style.display = 'grid';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            container.style.zIndex = '1';
        }
        
        if (main) {
            main.style.display = 'block';
            main.style.visibility = 'visible';
            main.style.opacity = '1';
            main.style.zIndex = '2';
        }
        
        if (navigation) {
            navigation.style.display = 'block';
            navigation.style.visibility = 'visible';
            navigation.style.opacity = '1';
            navigation.style.zIndex = '2';
        }
        
        // Mostrar todas las secciones
        const sections = document.querySelectorAll('.section, [class*="section"]');
        sections.forEach(section => {
            if (!section.classList.contains('hidden')) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
            }
        });
    }
    
    setupTouchOptimizations() {
        // Mejorar experiencia táctil
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevenir zoom accidental
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'range') {
                input.style.fontSize = '16px';
            }
        });
        
        // Mejorar scroll en modales
        const scrollableElements = document.querySelectorAll(
            '.cookie-consent-circle, .voice-navigation-circle, .modal-content'
        );
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowY = 'auto';
        });
    }
    
    handleCookieManagement() {
        // Si las cookies ya fueron aceptadas, ocultarlas inmediatamente
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            setTimeout(() => {
                this.hideCookieElements();
            }, 100);
        }
        
        // Manejar botones de aceptar/rechazar cookies
        const acceptButtons = document.querySelectorAll(
            '[data-action="accept"], .accept-button, button[onclick*="accept"], [class*="accept"]'
        );
        const rejectButtons = document.querySelectorAll(
            '[data-action="reject"], .reject-button, button[onclick*="reject"], [class*="reject"]'
        );
        
        acceptButtons.forEach(button => {
            button.addEventListener('click', () => this.hideCookieElements());
            button.addEventListener('touchend', () => this.hideCookieElements());
        });
        
        rejectButtons.forEach(button => {
            button.addEventListener('click', () => this.hideCookieElements());
            button.addEventListener('touchend', () => this.hideCookieElements());
        });
    }
    
    // Métodos públicos
    static forceCloseAllModals() {
        const instance = window.mobileImprovements || new MobileImprovements();
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay, .modal, [class*="overlay"]');
        modals.forEach(modal => instance.closeModal(modal));
    }
    
    static showContent() {
        const instance = window.mobileImprovements || new MobileImprovements();
        instance.ensureContentVisibility();
    }
    
    static hideCookies() {
        const instance = window.mobileImprovements || new MobileImprovements();
        instance.hideCookieElements();
    }
}

// Inicializar inmediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileImprovements = new MobileImprovements();
    });
} else {
    window.mobileImprovements = new MobileImprovements();
}

// Verificar cookies aceptadas al cargar
if (localStorage.getItem('cookiesAccepted') === 'true') {
    setTimeout(() => {
        MobileImprovements.hideCookies();
        MobileImprovements.showContent();
    }, 500);
}

// Forzar visibilidad del contenido después de 2 segundos
setTimeout(() => {
    MobileImprovements.showContent();
}, 2000);

// Exportar para uso global
window.MobileImprovements = MobileImprovements;

