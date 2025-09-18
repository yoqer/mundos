// === MEJORAS PARA MÓVIL Y GESTIÓN DE COOKIES ===

class MobileImprovements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupResponsiveHandlers();
        this.improveCookieManagement();
        this.setupTouchOptimizations();
        this.setupModalImprovements();
        this.setupAccessibilityFeatures();
    }
    
    setupResponsiveHandlers() {
        // Detectar dispositivo móvil
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent);
        
        // Añadir clases CSS según dispositivo
        document.body.classList.add(this.isMobile ? 'mobile-device' : 'desktop-device');
        if (this.isTablet) document.body.classList.add('tablet-device');
        
        // Manejar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Manejar resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    improveCookieManagement() {
        // Mejorar gestión de cookies
        const cookieOverlay = document.querySelector('.cookie-consent-overlay');
        const cookieText = document.querySelector('.cookie-text');
        
        if (cookieOverlay) {
            // Añadir botón de cerrar mejorado
            this.addImprovedCloseButton(cookieOverlay);
            
            // Manejar aceptación de cookies
            const acceptButtons = cookieOverlay.querySelectorAll('[data-action="accept"], .accept-button, button[onclick*="accept"]');
            acceptButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.hideCookieElements();
                });
            });
            
            // Manejar rechazo de cookies
            const rejectButtons = cookieOverlay.querySelectorAll('[data-action="reject"], .reject-button, button[onclick*="reject"]');
            rejectButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.hideCookieElements();
                });
            });
        }
    }
    
    hideCookieElements() {
        // Ocultar overlay de cookies
        const cookieOverlay = document.querySelector('.cookie-consent-overlay');
        if (cookieOverlay) {
            cookieOverlay.classList.add('hidden');
            cookieOverlay.style.display = 'none';
        }
        
        // Ocultar texto de cookies
        const cookieTexts = document.querySelectorAll('.cookie-text, .cookie-notice, [class*="cookie"]');
        cookieTexts.forEach(element => {
            if (element.textContent.toLowerCase().includes('cookie') || 
                element.textContent.toLowerCase().includes('navegar')) {
                element.classList.add('cookie-text-hidden');
            }
        });
        
        // Guardar preferencia
        localStorage.setItem('cookiesAccepted', 'true');
        localStorage.setItem('cookiesHandled', Date.now().toString());
    }
    
    addImprovedCloseButton(modal) {
        // Verificar si ya existe un botón de cerrar
        let closeButton = modal.querySelector('.close-button, .modal-close, [data-action="close"]');
        
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.innerHTML = '×';
            closeButton.setAttribute('aria-label', 'Cerrar');
            modal.appendChild(closeButton);
        }
        
        // Mejorar funcionalidad del botón de cerrar
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal(modal);
        });
        
        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.closeModal(modal);
            }
        });
        
        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }
    
    closeModal(modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        
        // Si es el modal de cookies, ejecutar lógica de cookies
        if (modal.classList.contains('cookie-consent-overlay')) {
            this.hideCookieElements();
        }
    }
    
    setupTouchOptimizations() {
        // Mejorar experiencia táctil
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevenir zoom accidental en inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'range') {
                input.style.fontSize = '16px';
            }
        });
        
        // Mejorar scroll en modales
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay, .modal');
        modals.forEach(modal => {
            modal.style.webkitOverflowScrolling = 'touch';
        });
    }
    
    setupModalImprovements() {
        // Mejorar todos los modales para móvil
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay, .modal, [class*="overlay"]');
        
        modals.forEach(modal => {
            // Añadir botón de cerrar mejorado
            this.addImprovedCloseButton(modal);
            
            // Mejorar posicionamiento en móvil
            if (this.isMobile) {
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.right = '0';
                modal.style.bottom = '0';
                modal.style.zIndex = '10000';
                modal.style.display = modal.style.display || 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.padding = '1rem';
            }
            
            // Mejorar contenido del modal
            const modalContent = modal.querySelector('.cookie-consent-circle, .voice-navigation-circle, .modal-content');
            if (modalContent && this.isMobile) {
                modalContent.style.maxWidth = '90vw';
                modalContent.style.maxHeight = '80vh';
                modalContent.style.overflow = 'auto';
                modalContent.style.webkitOverflowScrolling = 'touch';
                modalContent.style.borderRadius = '20px';
                modalContent.style.position = 'relative';
            }
        });
    }
    
    setupAccessibilityFeatures() {
        // Mejorar accesibilidad en móvil
        
        // Añadir indicadores de focus visibles
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid #007AFF';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
        
        // Mejorar navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    handleOrientationChange() {
        // Manejar cambios de orientación
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay');
        modals.forEach(modal => {
            if (!modal.classList.contains('hidden')) {
                // Reajustar modal después del cambio de orientación
                setTimeout(() => {
                    const modalContent = modal.querySelector('.cookie-consent-circle, .voice-navigation-circle');
                    if (modalContent) {
                        modalContent.style.maxHeight = '80vh';
                    }
                }, 200);
            }
        });
    }
    
    handleResize() {
        // Manejar cambios de tamaño de ventana
        const currentIsMobile = window.innerWidth <= 768;
        
        if (currentIsMobile !== this.isMobile) {
            this.isMobile = currentIsMobile;
            document.body.classList.toggle('mobile-device', this.isMobile);
            document.body.classList.toggle('desktop-device', !this.isMobile);
            
            // Reconfigurar modales
            this.setupModalImprovements();
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Método público para ocultar cookies manualmente
    static hideCookies() {
        const instance = window.mobileImprovements || new MobileImprovements();
        instance.hideCookieElements();
    }
    
    // Método público para cerrar modal específico
    static closeModal(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) {
            const instance = window.mobileImprovements || new MobileImprovements();
            instance.closeModal(modal);
        }
    }
}

// Inicializar mejoras móviles cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileImprovements = new MobileImprovements();
    });
} else {
    window.mobileImprovements = new MobileImprovements();
}

// Verificar si las cookies ya fueron aceptadas
if (localStorage.getItem('cookiesAccepted') === 'true') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.mobileImprovements) {
                window.mobileImprovements.hideCookieElements();
            }
        }, 100);
    });
}

// Exportar para uso global
window.MobileImprovements = MobileImprovements;

