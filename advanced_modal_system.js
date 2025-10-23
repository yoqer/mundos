// === SISTEMA AVANZADO DE GESTIÓN DE MODALES ===

class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.zIndexCounter = 10000;
        this.escapeKeyHandler = this.handleEscapeKey.bind(this);
        this.clickOutsideHandler = this.handleClickOutside.bind(this);
        this.init();
    }

    init() {
        // Agregar event listeners globales
        document.addEventListener('keydown', this.escapeKeyHandler);
        document.addEventListener('click', this.clickOutsideHandler);
        
        // Prevenir scroll cuando hay modales abiertos
        this.updateBodyScroll();
    }

    // Crear modal con overlay
    createModal(content, options = {}) {
        const modal = {
            id: this.generateId(),
            element: null,
            overlay: null,
            options: {
                closable: true,
                clickOutsideToClose: true,
                escapeToClose: true,
                showCloseButton: true,
                className: '',
                animation: 'fadeIn',
                ...options
            }
        };

        // Crear overlay
        modal.overlay = document.createElement('div');
        modal.overlay.className = 'modal-overlay';
        modal.overlay.style.zIndex = this.zIndexCounter++;
        modal.overlay.dataset.modalId = modal.id;

        // Crear contenedor del modal
        modal.element = document.createElement('div');
        modal.element.className = `modal-container ${modal.options.className}`;
        modal.element.dataset.modalId = modal.id;
        modal.element.setAttribute('role', 'dialog');
        modal.element.setAttribute('aria-modal', 'true');

        // Agregar contenido
        if (typeof content === 'string') {
            modal.element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            modal.element.appendChild(content);
        }

        // Agregar botón de cierre si está habilitado
        if (modal.options.showCloseButton && modal.options.closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.setAttribute('aria-label', 'Cerrar modal');
            closeBtn.addEventListener('click', () => this.closeModal(modal.id));
            modal.element.appendChild(closeBtn);
        }

        // Ensamblar modal
        modal.overlay.appendChild(modal.element);
        document.body.appendChild(modal.overlay);

        // Registrar modal
        this.activeModals.add(modal);
        this.updateBodyScroll();

        // Aplicar animación
        this.applyAnimation(modal.overlay, modal.options.animation);

        // Focus management
        this.setFocus(modal.element);

        return modal;
    }

    // Cerrar modal por ID
    closeModal(modalId) {
        const modal = Array.from(this.activeModals).find(m => m.id === modalId);
        if (!modal) return;

        // Aplicar animación de salida
        modal.overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            if (modal.overlay && modal.overlay.parentNode) {
                modal.overlay.parentNode.removeChild(modal.overlay);
            }
            this.activeModals.delete(modal);
            this.updateBodyScroll();
        }, 300);
    }

    // Cerrar todos los modales
    closeAllModals() {
        const modals = Array.from(this.activeModals);
        modals.forEach(modal => this.closeModal(modal.id));
    }

    // Cerrar el modal más reciente
    closeTopModal() {
        if (this.activeModals.size === 0) return;
        
        const modals = Array.from(this.activeModals);
        const topModal = modals[modals.length - 1];
        if (topModal.options.closable) {
            this.closeModal(topModal.id);
        }
    }

    // Manejar tecla Escape
    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeTopModal();
        }
    }

    // Manejar clic fuera del modal
    handleClickOutside(event) {
        if (this.activeModals.size === 0) return;

        const target = event.target;
        if (target.classList.contains('modal-overlay')) {
            const modalId = target.dataset.modalId;
            const modal = Array.from(this.activeModals).find(m => m.id === modalId);
            
            if (modal && modal.options.clickOutsideToClose && modal.options.closable) {
                this.closeModal(modalId);
            }
        }
    }

    // Actualizar scroll del body
    updateBodyScroll() {
        if (this.activeModals.size > 0) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    }

    // Aplicar animación
    applyAnimation(element, animation) {
        element.style.animation = `${animation} 0.3s ease-out forwards`;
    }

    // Gestión de foco
    setFocus(element) {
        // Buscar el primer elemento focuseable
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            element.focus();
        }
    }

    // Generar ID único
    generateId() {
        return 'modal_' + Math.random().toString(36).substr(2, 9);
    }

    // Crear notificación
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Agregar botón de cierre
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            float: right;
            margin-left: 10px;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);

        document.body.appendChild(notification);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        return notification;
    }

    // Crear modal de confirmación
    showConfirmation(message, options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: 'Confirmación',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                confirmClass: 'btn-primary',
                cancelClass: 'btn-secondary',
                ...options
            };

            const content = document.createElement('div');
            content.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin-bottom: 15px; color: #333;">${config.title}</h3>
                    <p style="margin-bottom: 25px; color: #666; line-height: 1.5;">${message}</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="confirm-btn ${config.confirmClass}">${config.confirmText}</button>
                        <button class="cancel-btn ${config.cancelClass}">${config.cancelText}</button>
                    </div>
                </div>
            `;

            const modal = this.createModal(content, {
                className: 'confirmation-modal',
                clickOutsideToClose: false,
                escapeToClose: true
            });

            // Event listeners para los botones
            content.querySelector('.confirm-btn').addEventListener('click', () => {
                this.closeModal(modal.id);
                resolve(true);
            });

            content.querySelector('.cancel-btn').addEventListener('click', () => {
                this.closeModal(modal.id);
                resolve(false);
            });
        });
    }

    // Crear modal de entrada de texto
    showPrompt(message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: 'Entrada de texto',
                confirmText: 'Aceptar',
                cancelText: 'Cancelar',
                placeholder: '',
                ...options
            };

            const content = document.createElement('div');
            content.innerHTML = `
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 15px; color: #333;">${config.title}</h3>
                    <p style="margin-bottom: 15px; color: #666;">${message}</p>
                    <input type="text" class="prompt-input" value="${defaultValue}" 
                           placeholder="${config.placeholder}"
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="cancel-btn btn-secondary">${config.cancelText}</button>
                        <button class="confirm-btn btn-primary">${config.confirmText}</button>
                    </div>
                </div>
            `;

            const modal = this.createModal(content, {
                className: 'prompt-modal',
                clickOutsideToClose: false
            });

            const input = content.querySelector('.prompt-input');
            input.focus();
            input.select();

            // Event listeners
            content.querySelector('.confirm-btn').addEventListener('click', () => {
                this.closeModal(modal.id);
                resolve(input.value);
            });

            content.querySelector('.cancel-btn').addEventListener('click', () => {
                this.closeModal(modal.id);
                resolve(null);
            });

            // Enter para confirmar
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.closeModal(modal.id);
                    resolve(input.value);
                }
            });
        });
    }
}

// Instancia global del gestor de modales
window.modalManager = new ModalManager();

// Funciones de conveniencia globales
window.showModal = (content, options) => window.modalManager.createModal(content, options);
window.closeModal = (modalId) => window.modalManager.closeModal(modalId);
window.closeAllModals = () => window.modalManager.closeAllModals();
window.showNotification = (message, type, duration) => window.modalManager.showNotification(message, type, duration);
window.showConfirmation = (message, options) => window.modalManager.showConfirmation(message, options);
window.showPrompt = (message, defaultValue, options) => window.modalManager.showPrompt(message, defaultValue, options);

// Agregar estilos de animación adicionales
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideOutRight {
        from { 
            opacity: 1;
            transform: translateX(0);
        }
        to { 
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(additionalStyles);

console.log('Advanced Modal System loaded successfully');
