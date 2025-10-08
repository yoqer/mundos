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
        voiceInterface.remove();
    }
    
    // También cerrar elementos específicos de voz
    const voiceElements = document.querySelectorAll('[class*="voice"], [id*="voice"]');
    voiceElements.forEach(element => {
        if (element.style.position === 'fixed' || element.style.position === 'absolute') {
            element.remove();
        }
    });
    
    // Cerrar específicamente el sistema de voz flotante
    const floatingVoice = document.querySelector('.voice-status, .voice-controls, .voice-feedback');
    if (floatingVoice && floatingVoice.parentElement) {
        floatingVoice.parentElement.remove();
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
            e.preventDefault();
            e.stopPropagation();
            
            // Buscar el contenedor padre más cercano
            const modal = e.target.closest('.modal, .banner, .interface, .voice-interface, .cookie-consent-banner, .cookie-customization-modal');
            if (modal) {
                modal.remove();
                return;
            }
            
            // Si no encuentra un modal específico, cerrar elementos flotantes de voz
            closeVoiceInterface();
            closeCookieBanner();
        }
    });
});

// Función para mostrar/ocultar secciones correctamente
function switchSection(sectionId) {
    try {
        console.log(`Switching to section: ${sectionId}`);
        
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
            console.log(`Section ${sectionId} activated`);
        } else {
            console.warn(`Section ${sectionId} not found`);
        }
        
        // Actualizar botones de navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log(`Button for ${sectionId} activated`);
        } else {
            console.warn(`Button for ${sectionId} not found`);
        }
        
        // Actualizar estado global si existe
        if (window.appState) {
            window.appState.currentSection = sectionId;
        }
    } catch (error) {
        console.error('Error in switchSection:', error);
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


// Función específica para forzar el cierre del elemento flotante de voz
function forceCloseVoiceFloating() {
    // Buscar todos los elementos que puedan ser el flotante de voz
    const possibleVoiceElements = [
        '.voice-interface',
        '.voice-status',
        '.voice-controls',
        '.voice-feedback',
        '[class*="voice"]',
        '[id*="voice"]'
    ];
    
    possibleVoiceElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
                element.remove();
                console.log(`Removed floating voice element: ${selector}`);
            }
        });
    });
    
    // Buscar elementos por contenido de texto
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.textContent && element.textContent.includes('Sistema de Voz')) {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
                element.remove();
                console.log('Removed voice element by text content');
            }
        }
    });
}

// Añadir botón de emergencia para cerrar elementos flotantes
function addEmergencyCloseButton() {
    const emergencyBtn = document.createElement('button');
    emergencyBtn.innerHTML = '🚫 Cerrar Todo';
    emergencyBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 99999;
        background: #ff4757;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    emergencyBtn.onclick = function() {
        forceCloseVoiceFloating();
        closeAllModals();
        this.remove();
    };
    
    document.body.appendChild(emergencyBtn);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
        if (emergencyBtn.parentElement) {
            emergencyBtn.remove();
        }
    }, 10000);
}

// Exportar nuevas funciones
window.forceCloseVoiceFloating = forceCloseVoiceFloating;
window.addEmergencyCloseButton = addEmergencyCloseButton;
