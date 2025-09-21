// === INTERFAZ MÓVIL CIRCULAR MEJORADA ===

class MobileCircularInterface {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isExtensionActive = false;
        this.init();
    }
    
    init() {
        if (this.isMobile) {
            this.setupMobileInterface();
            this.hideDefaultModals();
            this.createCircularInterface();
            this.setupEventListeners();
        }
    }
    
    setupMobileInterface() {
        document.body.classList.add('mobile-device', 'mobile-interface-active');
        
        // Asegurar que el contenido principal sea visible
        setTimeout(() => {
            this.ensureContentVisibility();
        }, 500);
    }
    
    hideDefaultModals() {
        // Ocultar modales por defecto en móvil
        const modals = document.querySelectorAll('.cookie-consent-overlay, .voice-navigation-overlay');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.add('mobile-hidden');
        });
        
        // Ocultar texto de cookies
        this.hideCookieElements();
    }
    
    createCircularInterface() {
        // Crear interfaz circular flotante
        const circularInterface = document.createElement('div');
        circularInterface.className = 'mobile-circular-interface';
        circularInterface.innerHTML = `
            <button class="mobile-circular-btn" data-action="menu" title="Menú">
                ☰
            </button>
            <button class="mobile-circular-btn mobile-voice-btn" data-action="voice" title="Voz">
                🎤
            </button>
            <button class="mobile-circular-btn" data-action="help" title="Ayuda">
                ❓
            </button>
            <button class="mobile-circular-btn" data-action="settings" title="Configuración">
                ⚙️
            </button>
        `;
        
        document.body.appendChild(circularInterface);
        
        // Crear panel de extensión lateral
        this.createExtensionPanel();
    }
    
    createExtensionPanel() {
        const extensionPanel = document.createElement('div');
        extensionPanel.className = 'mobile-extension-panel';
        extensionPanel.innerHTML = `
            <div class="mobile-panel-controls">
                <button class="mobile-panel-btn mobile-minimize-btn" data-action="minimize" title="Minimizar">
                    ⬜
                </button>
                <button class="mobile-panel-btn mobile-close-btn" data-action="close" title="Cerrar">
                    ×
                </button>
            </div>
            <div class="extension-content">
                <h3>🎤 Sistema de Voz</h3>
                <p>Navegación por voz activada</p>
                <div class="voice-controls">
                    <button class="voice-control-btn" data-action="start-voice">Iniciar Voz</button>
                    <button class="voice-control-btn" data-action="stop-voice">Detener Voz</button>
                </div>
                <div class="voice-status">
                    <span class="status-indicator">🔴</span>
                    <span class="status-text">Desactivado</span>
                </div>
                <div class="language-selector">
                    <label>Idioma:</label>
                    <select id="mobile-voice-language">
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
            </div>
        `;
        
        document.body.appendChild(extensionPanel);
    }
    
    setupEventListeners() {
        // Eventos para interfaz circular
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mobile-circular-btn')) {
                const action = e.target.dataset.action;
                this.handleCircularAction(action);
            }
            
            if (e.target.classList.contains('mobile-panel-btn')) {
                const action = e.target.dataset.action;
                this.handlePanelAction(action);
            }
            
            if (e.target.classList.contains('voice-control-btn')) {
                const action = e.target.dataset.action;
                this.handleVoiceAction(action);
            }
        });
        
        // Eventos táctiles
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('mobile-circular-btn') || 
                e.target.classList.contains('mobile-panel-btn')) {
                e.preventDefault();
            }
        });
    }
    
    handleCircularAction(action) {
        switch (action) {
            case 'voice':
                this.toggleExtensionPanel();
                break;
            case 'menu':
                this.showNavigationMenu();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }
    
    handlePanelAction(action) {
        const panel = document.querySelector('.mobile-extension-panel');
        
        switch (action) {
            case 'close':
                this.closeExtensionPanel();
                break;
            case 'minimize':
                this.minimizeExtensionPanel();
                break;
        }
    }
    
    handleVoiceAction(action) {
        switch (action) {
            case 'start-voice':
                this.startVoiceNavigation();
                break;
            case 'stop-voice':
                this.stopVoiceNavigation();
                break;
        }
    }
    
    toggleExtensionPanel() {
        const panel = document.querySelector('.mobile-extension-panel');
        
        if (this.isExtensionActive) {
            this.closeExtensionPanel();
        } else {
            this.openExtensionPanel();
        }
    }
    
    openExtensionPanel() {
        const panel = document.querySelector('.mobile-extension-panel');
        panel.classList.add('active');
        panel.classList.remove('minimized');
        this.isExtensionActive = true;
    }
    
    closeExtensionPanel() {
        const panel = document.querySelector('.mobile-extension-panel');
        panel.classList.remove('active', 'minimized');
        this.isExtensionActive = false;
    }
    
    minimizeExtensionPanel() {
        const panel = document.querySelector('.mobile-extension-panel');
        panel.classList.add('minimized');
        panel.classList.remove('active');
        this.isExtensionActive = false;
        
        // Hacer clickeable para expandir
        panel.addEventListener('click', (e) => {
            if (panel.classList.contains('minimized')) {
                e.preventDefault();
                e.stopPropagation();
                this.expandFromMinimized();
            }
        });
    }
    
    expandFromMinimized() {
        const panel = document.querySelector('.mobile-extension-panel');
        panel.classList.remove('minimized');
        panel.classList.add('active');
        this.isExtensionActive = true;
    }
    
    startVoiceNavigation() {
        // Integrar con el sistema de voz existente
        if (window.voiceNavigation) {
            window.voiceNavigation.startListening();
        }
        
        // Actualizar UI
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator) statusIndicator.textContent = '🟢';
        if (statusText) statusText.textContent = 'Activado';
        
        this.showNotification('Sistema de voz activado');
    }
    
    stopVoiceNavigation() {
        // Integrar con el sistema de voz existente
        if (window.voiceNavigation) {
            window.voiceNavigation.stopListening();
        }
        
        // Actualizar UI
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator) statusIndicator.textContent = '🔴';
        if (statusText) statusText.textContent = 'Desactivado';
        
        this.showNotification('Sistema de voz desactivado');
    }
    
    showNavigationMenu() {
        // Mostrar menú de navegación adaptado para móvil
        const menu = document.createElement('div');
        menu.className = 'mobile-navigation-menu';
        menu.innerHTML = `
            <div class="menu-content">
                <button class="menu-close" data-action="close-menu">×</button>
                <h3>📱 Navegación</h3>
                <div class="menu-items">
                    <button class="menu-item" data-section="navegacion">🧭 Navegación</button>
                    <button class="menu-item" data-section="gemini">📚 Gemini Storybook</button>
                    <button class="menu-item" data-section="genie3">🎬 Genie3</button>
                    <button class="menu-item" data-section="videos">🎥 Videos</button>
                    <button class="menu-item" data-section="mundos">🌍 Mundos</button>
                    <button class="menu-item" data-section="resumen">📄 Resumen</button>
                    <button class="menu-item" data-section="presentaciones">📊 Presentaciones</button>
                    <button class="menu-item" data-section="importar">📥 Importar</button>
                    <button class="menu-item" data-section="editar">✏️ Editar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Eventos del menú
        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-close')) {
                menu.remove();
            } else if (e.target.classList.contains('menu-item')) {
                const section = e.target.dataset.section;
                this.navigateToSection(section);
                menu.remove();
            }
        });
    }
    
    navigateToSection(section) {
        // Activar la sección correspondiente
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(section) || 
                btn.dataset.section === section) {
                btn.click();
            }
        });
        
        this.showNotification(`Navegando a ${section}`);
    }
    
    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'mobile-help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <button class="help-close">×</button>
                <h3>❓ Ayuda - Editor de Mundos</h3>
                <div class="help-sections">
                    <div class="help-section">
                        <h4>🎤 Navegación por Voz</h4>
                        <p>Usa comandos como "voz", "navegar", "editar", "guardar"</p>
                    </div>
                    <div class="help-section">
                        <h4>📱 Interfaz Móvil</h4>
                        <p>Toca el botón de voz para abrir el panel de control</p>
                    </div>
                    <div class="help-section">
                        <h4>🔄 Extensiones</h4>
                        <p>Importa contenido desde ElevenLabs, Luma Labs, Gamma y más</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        helpModal.querySelector('.help-close').onclick = () => helpModal.remove();
        helpModal.onclick = (e) => { if (e.target === helpModal) helpModal.remove(); };
    }
    
    showSettings() {
        const settingsModal = document.createElement('div');
        settingsModal.className = 'mobile-settings-modal';
        settingsModal.innerHTML = `
            <div class="settings-content">
                <button class="settings-close">×</button>
                <h3>⚙️ Configuración</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <label>Idioma de la interfaz:</label>
                        <select id="interface-language">
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="auto-voice"> 
                            Activar voz automáticamente
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="haptic-feedback"> 
                            Vibración táctil
                        </label>
                    </div>
                </div>
                <button class="save-settings">Guardar Configuración</button>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        settingsModal.querySelector('.settings-close').onclick = () => settingsModal.remove();
        settingsModal.onclick = (e) => { if (e.target === settingsModal) settingsModal.remove(); };
        
        settingsModal.querySelector('.save-settings').onclick = () => {
            this.saveSettings();
            settingsModal.remove();
        };
    }
    
    saveSettings() {
        const interfaceLanguage = document.getElementById('interface-language').value;
        const autoVoice = document.getElementById('auto-voice').checked;
        const hapticFeedback = document.getElementById('haptic-feedback').checked;
        
        localStorage.setItem('mobileSettings', JSON.stringify({
            interfaceLanguage,
            autoVoice,
            hapticFeedback,
            timestamp: Date.now()
        }));
        
        this.showNotification('Configuración guardada');
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
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'mobile-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(74, 172, 254, 0.95);
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            z-index: 10000;
            font-size: 1rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
    
    // Métodos públicos
    static forceShowContent() {
        const instance = window.mobileCircularInterface || new MobileCircularInterface();
        instance.ensureContentVisibility();
    }
    
    static hideCookies() {
        const instance = window.mobileCircularInterface || new MobileCircularInterface();
        instance.hideCookieElements();
    }
}

// Inicializar interfaz móvil circular
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileCircularInterface = new MobileCircularInterface();
    });
} else {
    window.mobileCircularInterface = new MobileCircularInterface();
}

// Verificar cookies aceptadas al cargar
if (localStorage.getItem('cookiesAccepted') === 'true') {
    setTimeout(() => {
        MobileCircularInterface.hideCookies();
        MobileCircularInterface.forceShowContent();
    }, 500);
}

// Forzar visibilidad del contenido después de 2 segundos
setTimeout(() => {
    MobileCircularInterface.forceShowContent();
}, 2000);

// Exportar para uso global
window.MobileCircularInterface = MobileCircularInterface;
    
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

