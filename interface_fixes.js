// Correcciones para problemas de interfaz en GitHub Pages

// Función para cerrar ventanas modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Función para cerrar cualquier modal por clase
function closeModalByClass(className) {
    const modals = document.querySelectorAll(`.${className}`);
    modals.forEach(modal => modal.remove());
}

// Función para cerrar ventanas de voz
function closeVoiceInterface() {
    const voiceInterface = document.querySelector('.voice-interface');
    if (voiceInterface) {
        voiceInterface.style.display = 'none';
    }
}

// Función para cerrar banner de cookies
function closeCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.remove();
    }
}

// Función para cerrar todas las ventanas modales
function closeAllModals() {
    // Cerrar modales de cookies
    closeModalByClass('cookie-consent-banner');
    closeModalByClass('cookie-customization-modal');
    
    // Cerrar modales de voz
    closeModalByClass('voice-interface');
    
    // Cerrar otros modales
    closeModalByClass('import-modal');
    closeModalByClass('help-modal');
}

// Añadir event listeners para botones de cierre
document.addEventListener('DOMContentLoaded', function() {
    // Añadir funcionalidad de cierre con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Añadir funcionalidad de cierre a botones X
    document.addEventListener('click', function(e) {
        if (e.target.textContent === '×' || e.target.classList.contains('close-btn')) {
            const modal = e.target.closest('.modal, .banner, .interface');
            if (modal) {
                modal.remove();
            }
        }
    });
});

// Función para mostrar/ocultar secciones correctamente
function switchSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Función para inicializar correctamente las extensiones
function initializeExtensions() {
    // Verificar que NewExtensionsManager esté disponible
    if (typeof NewExtensionsManager !== 'undefined') {
        window.newExtensionsManager = new NewExtensionsManager();
    }
    
    // Verificar que AgentsExtension esté disponible
    if (typeof AgentsExtension !== 'undefined') {
        window.agentsExtension = new AgentsExtension();
    }
}

// Función para corregir problemas de visualización
function fixDisplayIssues() {
    // Asegurar que las secciones estén correctamente configuradas
    const sections = document.querySelectorAll('.content-section');
    sections.forEach((section, index) => {
        if (index === 0) {
            section.classList.add('active');
            section.style.display = 'block';
        } else {
            section.classList.remove('active');
            section.style.display = 'none';
        }
    });
    
    // Corregir z-index de modales
    const modals = document.querySelectorAll('.modal, .banner, .interface');
    modals.forEach(modal => {
        modal.style.zIndex = '9999';
    });
}

// Inicializar correcciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        fixDisplayIssues();
        initializeExtensions();
    }, 1000);
});

// Exportar funciones para uso global
window.closeModal = closeModal;
window.closeModalByClass = closeModalByClass;
window.closeVoiceInterface = closeVoiceInterface;
window.closeCookieBanner = closeCookieBanner;
window.closeAllModals = closeAllModals;
window.switchSection = switchSection;
