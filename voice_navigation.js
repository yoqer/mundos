// Sistema de Navegación por Voz Avanzado - Versión Unificada
class VoiceNavigationSystem {
    constructor() {
        this.currentDirectory = '/';
        this.directoryHistory = ['/'];
        this.commandHistory = [];
        this.maxHistorySize = 10;
        this.voiceEnabled = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentLanguage = 'es';
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.directoryStructure = {};
        this.languageResponses = {};
        this.isAuthenticated = false;
        this.hasShownCookieBanner = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadDirectoryStructure();
            await this.loadLanguageResponses();
            this.checkUserAuthentication();
            this.setupVoiceRecognition();
            this.createUnifiedInterface();
            this.setupEventListeners();
            console.log('Sistema de navegación por voz unificado inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando sistema de voz:', error);
        }
    }

    checkUserAuthentication() {
        // Verificar si el usuario está autenticado
        this.isAuthenticated = localStorage.getItem('user_authenticated') === 'true' || 
                              sessionStorage.getItem('user_session') !== null;
        
        // Verificar si ya se mostró el banner de cookies
        this.hasShownCookieBanner = localStorage.getItem('cookie_banner_shown') === 'true';
    }

    async loadDirectoryStructure() {
        try {
            const response = await fetch('directory_structure.json');
            this.directoryStructure = await response.json();
        } catch (error) {
            console.error('Error cargando estructura de directorios:', error);
            this.directoryStructure = this.getDefaultDirectoryStructure();
        }
    }

    async loadLanguageResponses() {
        try {
            const response = await fetch('language_responses.json');
            this.languageResponses = await response.json();
        } catch (error) {
            console.error('Error cargando respuestas de idioma:', error);
            this.languageResponses = this.getDefaultLanguageResponses();
        }
    }

    createUnifiedInterface() {
        // Remover interfaces existentes
        const existingVoice = document.querySelector('.voice-interface');
        const existingCookie = document.querySelector('.cookie-interface');
        if (existingVoice) existingVoice.remove();
        if (existingCookie) existingCookie.remove();

        // Crear interfaz unificada
        const unifiedInterface = document.createElement('div');
        unifiedInterface.className = 'voice-interface';
        
        // Añadir indicador de usuario autenticado
        if (this.isAuthenticated) {
            unifiedInterface.classList.add('authenticated-user');
        } else {
            unifiedInterface.classList.add('guest-user');
        }

        unifiedInterface.innerHTML = `
            <div class="user-status-indicator"></div>
            
            <div class="voice-status disabled">Sistema de Voz Desactivado</div>
            
            <div class="voice-controls">
                <button class="voice-btn" id="voice-toggle">🎤 Activar Voz</button>
                <button class="voice-btn" id="voice-help">❓ Ayuda</button>
                <select class="voice-select" id="language-select">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            
            <div class="voice-directory">Directorio: /</div>
            <div class="voice-feedback">Listo para comandos de voz</div>
            
            ${this.createCookieSection()}
        `;

        document.body.appendChild(unifiedInterface);
        this.interfaceElement = unifiedInterface;
        
        // Mostrar banner de cookies si es necesario
        this.handleCookieBanner();
    }

    createCookieSection() {
        if (this.isAuthenticated) {
            return ''; // No mostrar sección de cookies para usuarios autenticados
        }

        const shouldShowFirstTime = !this.hasShownCookieBanner;
        const sectionClass = shouldShowFirstTime ? 'cookie-section first-time' : 'cookie-section';

        return `
            <div class="${sectionClass}" id="cookie-section">
                <div class="cookie-status">Gestión de Cookies</div>
                <div class="cookie-quick-actions">
                    <button class="cookie-quick-btn accept" onclick="voiceNavigationSystem.acceptAllCookies()">✓ Aceptar</button>
                    <button class="cookie-quick-btn decline" onclick="voiceNavigationSystem.declineAllCookies()">✗ Rechazar</button>
                    <button class="cookie-quick-btn" onclick="voiceNavigationSystem.showCookieModal()">⚙️ Personalizar</button>
                </div>
            </div>
        `;
    }

    handleCookieBanner() {
        if (!this.isAuthenticated && !this.hasShownCookieBanner) {
            // Mostrar banner completo la primera vez
            this.showCookieBanner();
            localStorage.setItem('cookie_banner_shown', 'true');
            this.hasShownCookieBanner = true;
        }
    }

    showCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner show-for-guest';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <h3>🍪 Gestión de Cookies</h3>
                <p>Utilizamos cookies para mejorar su experiencia. Puede gestionar sus preferencias usando comandos de voz o los botones.</p>
                <div class="cookie-banner-buttons">
                    <button class="cookie-accept-btn" onclick="voiceNavigationSystem.acceptAllCookies()">Aceptar Todas</button>
                    <button class="cookie-decline-btn" onclick="voiceNavigationSystem.declineAllCookies()">Rechazar Todas</button>
                    <button class="cookie-custom-btn" onclick="voiceNavigationSystem.showCookieModal()">Personalizar</button>
                    <button class="cookie-voice-btn" onclick="voiceNavigationSystem.activateVoiceForCookies()">🎤 Usar Voz</button>
                </div>
                <p class="cookie-policy-link">
                    <a href="condiciones.html" target="_blank">Ver Política de Privacidad</a>
                </p>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Auto-ocultar después de 10 segundos si no hay interacción
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 10000);
    }

    setupEventListeners() {
        // Botón de activar/desactivar voz
        document.getElementById('voice-toggle').addEventListener('click', () => {
            this.toggleVoice();
        });

        // Botón de ayuda
        document.getElementById('voice-help').addEventListener('click', () => {
            this.showHelpModal();
        });

        // Selector de idioma
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Comando de teclado para activar voz (Ctrl+Shift+V)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggleVoice();
            }
        });
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Reconocimiento de voz no soportado en este navegador');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.getLanguageCode();

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('listening', 'Escuchando...');
        };

        this.recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const command = lastResult[0].transcript.toLowerCase().trim();
                this.processVoiceCommand(command);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Error de reconocimiento de voz:', event.error);
            this.handleVoiceError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.voiceEnabled) {
                // Reiniciar reconocimiento automáticamente
                setTimeout(() => {
                    if (this.voiceEnabled) {
                        this.recognition.start();
                    }
                }, 1000);
            } else {
                this.updateStatus('disabled', 'Sistema de Voz Desactivado');
            }
        };
    }

    toggleVoice() {
        if (this.voiceEnabled) {
            this.deactivateVoice();
        } else {
            this.activateVoice();
        }
    }

    activateVoice() {
        if (!this.recognition) {
            this.speak('Lo siento, el reconocimiento de voz no está disponible en este navegador.');
            return;
        }

        this.voiceEnabled = true;
        this.recognition.start();
        
        const toggleBtn = document.getElementById('voice-toggle');
        toggleBtn.textContent = '🔇 Desactivar Voz';
        toggleBtn.classList.add('active');
        
        this.updateStatus('active', 'Sistema de Voz Activado');
        this.speak(this.getResponse('welcome'));
    }

    deactivateVoice() {
        this.voiceEnabled = false;
        if (this.recognition) {
            this.recognition.stop();
        }
        
        const toggleBtn = document.getElementById('voice-toggle');
        toggleBtn.textContent = '🎤 Activar Voz';
        toggleBtn.classList.remove('active');
        
        this.updateStatus('disabled', 'Sistema de Voz Desactivado');
        this.speak('Sistema de voz desactivado');
    }

    activateVoiceForCookies() {
        this.activateVoice();
        setTimeout(() => {
            this.speak('Sistema de voz activado para gestión de cookies. Diga "aceptar todas", "rechazar todas" o "personalizar" para gestionar sus preferencias.');
        }, 1000);
    }

    processVoiceCommand(command) {
        this.updateStatus('processing', 'Procesando comando...');
        this.addToHistory(command);
        
        // Comandos de cookies (disponibles globalmente)
        if (this.processCookieCommands(command)) {
            return;
        }

        // Comandos globales
        if (this.processGlobalCommands(command)) {
            return;
        }

        // Comandos específicos del directorio actual
        if (this.processDirectoryCommands(command)) {
            return;
        }

        // Comando no reconocido
        this.handleUnknownCommand(command);
    }

    processCookieCommands(command) {
        const cookieCommands = {
            'cookies': () => this.showCookieSection(),
            'aceptar todas': () => this.acceptAllCookies(),
            'aceptar cookies': () => this.acceptAllCookies(),
            'rechazar todas': () => this.declineAllCookies(),
            'rechazar cookies': () => this.declineAllCookies(),
            'personalizar': () => this.showCookieModal(),
            'personalizar cookies': () => this.showCookieModal(),
            'política': () => this.showPrivacyPolicy(),
            'política de privacidad': () => this.showPrivacyPolicy()
        };

        const action = cookieCommands[command];
        if (action) {
            action();
            return true;
        }
        return false;
    }

    processGlobalCommands(command) {
        const globalCommands = {
            'ayuda': () => this.showHelp(),
            'help': () => this.showHelp(),
            'volver': () => this.goBack(),
            'back': () => this.goBack(),
            'inicio': () => this.goHome(),
            'home': () => this.goHome(),
            'donde estoy': () => this.announceLocation(),
            'where am i': () => this.announceLocation(),
            'historial': () => this.announceHistory(),
            'history': () => this.announceHistory()
        };

        const action = globalCommands[command];
        if (action) {
            action();
            return true;
        }
        return false;
    }

    processDirectoryCommands(command) {
        const currentDir = this.directoryStructure[this.currentDirectory];
        if (!currentDir || !currentDir.commands) {
            return false;
        }

        for (const [commandKey, commandData] of Object.entries(currentDir.commands)) {
            if (commandData.triggers && commandData.triggers.includes(command)) {
                this.executeDirectoryCommand(commandKey, commandData);
                return true;
            }
        }
        return false;
    }

    executeDirectoryCommand(commandKey, commandData) {
        if (commandData.action === 'navigate') {
            if (commandData.target.startsWith('/')) {
                this.navigateToDirectory(commandData.target);
            } else {
                this.navigateToSection(commandData.target);
            }
        } else if (commandData.action === 'function') {
            this.executeFunction(commandData.function, commandData.params);
        }
        
        this.speak(this.getResponse('navigation', { target: commandData.target }));
    }

    navigateToDirectory(directory) {
        if (this.directoryStructure[directory]) {
            this.directoryHistory.push(this.currentDirectory);
            this.currentDirectory = directory;
            this.updateDirectoryDisplay();
        }
    }

    navigateToSection(section) {
        if (typeof window.switchSection === 'function') {
            window.switchSection(section);
        }
    }

    executeFunction(functionName, params) {
        if (typeof window[functionName] === 'function') {
            window[functionName](params);
        }
    }

    // Métodos de gestión de cookies
    showCookieSection() {
        const cookieSection = document.getElementById('cookie-section');
        if (cookieSection) {
            cookieSection.classList.add('visible');
            this.speak('Sección de cookies activada. Puede usar comandos de voz para gestionar sus preferencias.');
        }
    }

    acceptAllCookies() {
        localStorage.setItem('cookie_consent', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
            timestamp: Date.now()
        }));
        
        this.hideCookieBanner();
        this.speak('Todas las cookies han sido aceptadas.');
    }

    declineAllCookies() {
        localStorage.setItem('cookie_consent', JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
            timestamp: Date.now()
        }));
        
        this.hideCookieBanner();
        this.speak('Se han rechazado las cookies opcionales. Solo se mantendrán las cookies necesarias.');
    }

    showCookieModal() {
        // Implementar modal de personalización de cookies
        this.speak('Abriendo personalización de cookies.');
        // Aquí se abriría el modal de personalización
    }

    showPrivacyPolicy() {
        window.open('condiciones.html', '_blank');
        this.speak('Abriendo política de privacidad en nueva ventana.');
    }

    hideCookieBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.remove();
        }
        
        const cookieSection = document.getElementById('cookie-section');
        if (cookieSection) {
            cookieSection.style.display = 'none';
        }
    }

    // Métodos de navegación
    goBack() {
        if (this.directoryHistory.length > 0) {
            this.currentDirectory = this.directoryHistory.pop();
            this.updateDirectoryDisplay();
            this.speak(this.getResponse('navigation_back'));
        } else {
            this.speak(this.getResponse('no_history'));
        }
    }

    goHome() {
        this.directoryHistory.push(this.currentDirectory);
        this.currentDirectory = '/';
        this.updateDirectoryDisplay();
        this.speak(this.getResponse('navigation_home'));
    }

    announceLocation() {
        const currentDir = this.directoryStructure[this.currentDirectory];
        const locationName = currentDir ? currentDir.name : 'Directorio desconocido';
        this.speak(`Está en ${locationName}`);
    }

    announceHistory() {
        if (this.commandHistory.length === 0) {
            this.speak('No hay comandos en el historial.');
            return;
        }
        
        const recentCommands = this.commandHistory.slice(-5).join(', ');
        this.speak(`Últimos comandos: ${recentCommands}`);
    }

    showHelp() {
        const currentDir = this.directoryStructure[this.currentDirectory];
        if (currentDir && currentDir.commands) {
            const commands = Object.keys(currentDir.commands).slice(0, 5).join(', ');
            this.speak(`Comandos disponibles: ${commands}. Diga "ayuda" para más información.`);
        } else {
            this.speak('Comandos globales disponibles: ayuda, volver, inicio, donde estoy, historial.');
        }
    }

    showHelpModal() {
        // Implementar modal de ayuda detallada
        this.speak('Abriendo ayuda detallada.');
    }

    handleUnknownCommand(command) {
        this.speak(this.getResponse('unknown_command'));
        this.updateFeedback(`Comando no reconocido: "${command}"`);
    }

    handleVoiceError(error) {
        let message = 'Error en el sistema de voz.';
        
        switch (error) {
            case 'no-speech':
                message = 'No se detectó voz. Intente hablar más claro.';
                break;
            case 'audio-capture':
                message = 'Error de captura de audio. Verifique su micrófono.';
                break;
            case 'not-allowed':
                message = 'Permisos de micrófono denegados. Habilite el micrófono en la configuración del navegador.';
                break;
            case 'network':
                message = 'Error de red. Verifique su conexión a internet.';
                break;
        }
        
        this.speak(message);
        this.updateStatus('disabled', 'Error en Sistema de Voz');
    }

    // Métodos de utilidad
    speak(text) {
        if (this.isSpeaking) {
            this.synthesis.cancel();
        }
        
        this.isSpeaking = true;
        this.updateStatus('speaking', 'Hablando...');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode();
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
            this.isSpeaking = false;
            if (this.voiceEnabled) {
                this.updateStatus('listening', 'Escuchando...');
            } else {
                this.updateStatus('disabled', 'Sistema de Voz Desactivado');
            }
        };
        
        this.synthesis.speak(utterance);
    }

    updateStatus(status, message) {
        const statusElement = document.querySelector('.voice-status');
        if (statusElement) {
            statusElement.className = `voice-status ${status}`;
            statusElement.textContent = message;
        }
    }

    updateDirectoryDisplay() {
        const directoryElement = document.querySelector('.voice-directory');
        if (directoryElement) {
            const currentDir = this.directoryStructure[this.currentDirectory];
            const displayName = currentDir ? currentDir.name : this.currentDirectory;
            directoryElement.textContent = `Directorio: ${displayName}`;
        }
    }

    updateFeedback(message) {
        const feedbackElement = document.querySelector('.voice-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
        }
    }

    addToHistory(command) {
        this.commandHistory.push(command);
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.shift();
        }
    }

    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
        if (this.recognition) {
            this.recognition.lang = this.getLanguageCode();
        }
        
        // Actualizar interfaz
        this.updateInterfaceLanguage();
        
        // Notificar cambio
        this.speak(this.getResponse('language_changed'));
        
        // Guardar preferencia
        localStorage.setItem('preferred_language', languageCode);
    }

    updateInterfaceLanguage() {
        // Actualizar textos de la interfaz según el idioma
        const elements = {
            'voice-toggle': this.voiceEnabled ? '🔇 Desactivar Voz' : '🎤 Activar Voz',
            'voice-help': '❓ Ayuda'
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
    }

    getLanguageCode() {
        const codes = {
            'es': 'es-ES',
            'en': 'en-US',
            'fr': 'fr-FR'
        };
        return codes[this.currentLanguage] || 'es-ES';
    }

    getResponse(key, params = {}) {
        const responses = this.languageResponses[this.currentLanguage];
        if (responses && responses[key]) {
            let response = responses[key];
            Object.entries(params).forEach(([param, value]) => {
                response = response.replace(`{${param}}`, value);
            });
            return response;
        }
        return 'Respuesta no disponible';
    }

    getDefaultDirectoryStructure() {
        return {
            "/": {
                name: "Editor de Mundos",
                commands: {
                    "navegacion": {
                        triggers: ["navegación", "navigation"],
                        action: "navigate",
                        target: "/navegacion/"
                    }
                }
            }
        };
    }

    getDefaultLanguageResponses() {
        return {
            "es": {
                "welcome": "Bienvenido al Editor de Mundos. Diga 'ayuda' para ver los comandos disponibles.",
                "unknown_command": "Comando no reconocido. Diga 'ayuda' para ver los comandos disponibles.",
                "navigation_back": "Regresando al directorio anterior.",
                "navigation_home": "Navegando al directorio principal.",
                "no_history": "No hay directorios anteriores en el historial.",
                "language_changed": "Idioma cambiado correctamente."
            }
        };
    }
}

// Inicializar sistema cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.voiceNavigationSystem = new VoiceNavigationSystem();
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceNavigationSystem;
}

