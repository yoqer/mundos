// === SISTEMA DE CONSENTIMIENTO DE COOKIES CON VOZ ===

class VoiceCookieConsent {
    constructor() {
        this.consentGiven = false;
        this.consentType = null; // 'accepted', 'declined', 'custom'
        this.customPreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        this.voiceEnabled = false;
        this.currentLanguage = 'es';
        this.synthesis = window.speechSynthesis;
        
        this.loadLanguageResponses();
        this.checkExistingConsent();
        this.setupCookieInterface();
    }

    async loadLanguageResponses() {
        try {
            const response = await fetch('language_responses.json');
            this.languageResponses = await response.json();
        } catch (error) {
            console.error('Error al cargar respuestas de idioma:', error);
            this.setupDefaultResponses();
        }
    }

    setupDefaultResponses() {
        this.languageResponses = {
            "es": {
                "cookie_consent": {
                    "request": "¿Desea aceptar las cookies para mejorar su experiencia?",
                    "accepted": "Cookies aceptadas. Gracias por su consentimiento.",
                    "declined": "Cookies rechazadas. Funcionalidad limitada disponible.",
                    "customization": "Puede personalizar sus preferencias de cookies.",
                    "policy": "Consulte nuestra política de privacidad para más información."
                }
            }
        };
    }

    checkExistingConsent() {
        const consent = localStorage.getItem('cookie_consent');
        if (consent) {
            const consentData = JSON.parse(consent);
            this.consentGiven = true;
            this.consentType = consentData.type;
            this.customPreferences = consentData.preferences || this.customPreferences;
        } else {
            // Mostrar banner de consentimiento si no existe
            setTimeout(() => this.showConsentBanner(), 2000);
        }
    }

    setupCookieInterface() {
        // Crear interfaz de gestión de cookies
        const cookieInterface = document.createElement('div');
        cookieInterface.id = 'cookie-interface';
        cookieInterface.className = 'cookie-interface';
        cookieInterface.innerHTML = `
            <div class="cookie-controls">
                <button id="cookie-settings" class="cookie-btn">🍪 Configurar Cookies</button>
                <button id="cookie-voice-toggle" class="cookie-btn">🎤 Voz Cookies</button>
            </div>
            <div id="cookie-status" class="cookie-status">
                Estado: ${this.consentGiven ? 'Configurado' : 'Pendiente'}
            </div>
        `;
        
        document.body.appendChild(cookieInterface);
        
        // Configurar eventos
        document.getElementById('cookie-settings').addEventListener('click', () => this.showCookieSettings());
        document.getElementById('cookie-voice-toggle').addEventListener('click', () => this.toggleVoiceForCookies());
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <h3>🍪 Gestión de Cookies</h3>
                <p>Utilizamos cookies para mejorar su experiencia. ¿Desea aceptar todas las cookies?</p>
                <div class="cookie-banner-buttons">
                    <button id="accept-all-cookies" class="cookie-accept-btn">Aceptar Todas</button>
                    <button id="decline-all-cookies" class="cookie-decline-btn">Rechazar Todas</button>
                    <button id="customize-cookies" class="cookie-custom-btn">Personalizar</button>
                    <button id="voice-cookie-help" class="cookie-voice-btn">🎤 Ayuda por Voz</button>
                </div>
                <p class="cookie-policy-link">
                    <a href="#" onclick="showPrivacyPolicy()">Ver Política de Privacidad</a>
                </p>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Configurar eventos del banner
        document.getElementById('accept-all-cookies').addEventListener('click', () => this.acceptAllCookies());
        document.getElementById('decline-all-cookies').addEventListener('click', () => this.declineAllCookies());
        document.getElementById('customize-cookies').addEventListener('click', () => this.showCustomizationModal());
        document.getElementById('voice-cookie-help').addEventListener('click', () => this.startVoiceCookieHelp());
        
        // Anunciar por voz si está habilitado
        if (this.voiceEnabled) {
            this.speak(this.getResponse('cookie_consent.request'));
        }
    }

    acceptAllCookies() {
        this.consentType = 'accepted';
        this.customPreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true
        };
        this.saveConsent();
        this.hideBanner();
        this.speak(this.getResponse('cookie_consent.accepted'));
        this.updateCookieStatus();
    }

    declineAllCookies() {
        this.consentType = 'declined';
        this.customPreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false
        };
        this.saveConsent();
        this.hideBanner();
        this.speak(this.getResponse('cookie_consent.declined'));
        this.updateCookieStatus();
    }

    showCustomizationModal() {
        const modal = document.createElement('div');
        modal.id = 'cookie-customization-modal';
        modal.className = 'cookie-modal';
        modal.innerHTML = `
            <div class="cookie-modal-content">
                <h3>Personalizar Cookies</h3>
                <div class="cookie-categories">
                    <div class="cookie-category">
                        <label>
                            <input type="checkbox" id="necessary-cookies" checked disabled>
                            <strong>Cookies Necesarias</strong> (Siempre activas)
                        </label>
                        <p>Esenciales para el funcionamiento del sitio web.</p>
                    </div>
                    <div class="cookie-category">
                        <label>
                            <input type="checkbox" id="analytics-cookies" ${this.customPreferences.analytics ? 'checked' : ''}>
                            <strong>Cookies de Análisis</strong>
                        </label>
                        <p>Nos ayudan a entender cómo usa el sitio web.</p>
                    </div>
                    <div class="cookie-category">
                        <label>
                            <input type="checkbox" id="marketing-cookies" ${this.customPreferences.marketing ? 'checked' : ''}>
                            <strong>Cookies de Marketing</strong>
                        </label>
                        <p>Utilizadas para mostrar anuncios relevantes.</p>
                    </div>
                    <div class="cookie-category">
                        <label>
                            <input type="checkbox" id="preferences-cookies" ${this.customPreferences.preferences ? 'checked' : ''}>
                            <strong>Cookies de Preferencias</strong>
                        </label>
                        <p>Recuerdan sus preferencias y configuraciones.</p>
                    </div>
                </div>
                <div class="cookie-modal-buttons">
                    <button id="save-cookie-preferences" class="cookie-save-btn">Guardar Preferencias</button>
                    <button id="cancel-cookie-customization" class="cookie-cancel-btn">Cancelar</button>
                    <button id="voice-cookie-guide" class="cookie-voice-btn">🎤 Guía por Voz</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        document.getElementById('save-cookie-preferences').addEventListener('click', () => this.saveCustomPreferences());
        document.getElementById('cancel-cookie-customization').addEventListener('click', () => this.closeCustomizationModal());
        document.getElementById('voice-cookie-guide').addEventListener('click', () => this.startVoiceCookieGuide());
        
        // Anunciar opciones por voz
        if (this.voiceEnabled) {
            this.speak(this.getResponse('cookie_consent.customization'));
        }
    }

    saveCustomPreferences() {
        this.customPreferences = {
            necessary: true,
            analytics: document.getElementById('analytics-cookies').checked,
            marketing: document.getElementById('marketing-cookies').checked,
            preferences: document.getElementById('preferences-cookies').checked
        };
        
        this.consentType = 'custom';
        this.saveConsent();
        this.closeCustomizationModal();
        this.hideBanner();
        this.speak('Preferencias de cookies guardadas correctamente');
        this.updateCookieStatus();
    }

    closeCustomizationModal() {
        const modal = document.getElementById('cookie-customization-modal');
        if (modal) {
            modal.remove();
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.remove();
        }
    }

    saveConsent() {
        const consentData = {
            type: this.consentType,
            preferences: this.customPreferences,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('cookie_consent', JSON.stringify(consentData));
        this.consentGiven = true;
        
        // Aplicar configuración de cookies
        this.applyCookieSettings();
    }

    applyCookieSettings() {
        // Aplicar configuración según las preferencias
        if (this.customPreferences.analytics) {
            this.enableAnalyticsCookies();
        }
        
        if (this.customPreferences.marketing) {
            this.enableMarketingCookies();
        }
        
        if (this.customPreferences.preferences) {
            this.enablePreferencesCookies();
        }
        
        console.log('Configuración de cookies aplicada:', this.customPreferences);
    }

    enableAnalyticsCookies() {
        // Implementar lógica para cookies de análisis
        console.log('Cookies de análisis habilitadas');
    }

    enableMarketingCookies() {
        // Implementar lógica para cookies de marketing
        console.log('Cookies de marketing habilitadas');
    }

    enablePreferencesCookies() {
        // Implementar lógica para cookies de preferencias
        console.log('Cookies de preferencias habilitadas');
    }

    toggleVoiceForCookies() {
        this.voiceEnabled = !this.voiceEnabled;
        const button = document.getElementById('cookie-voice-toggle');
        if (button) {
            button.textContent = this.voiceEnabled ? '🔇 Desactivar Voz' : '🎤 Activar Voz';
        }
        
        if (this.voiceEnabled) {
            this.speak('Sistema de voz para cookies activado');
        }
    }

    startVoiceCookieHelp() {
        this.voiceEnabled = true;
        this.speak('Ayuda por voz para cookies activada. Puede decir: aceptar todas, rechazar todas, personalizar, o política de privacidad.');
        
        // Configurar reconocimiento de voz específico para cookies
        this.setupVoiceRecognitionForCookies();
    }

    startVoiceCookieGuide() {
        this.voiceEnabled = true;
        const guideText = `
            Guía de personalización de cookies por voz. 
            Puede decir: activar análisis, desactivar marketing, 
            activar preferencias, guardar configuración, o cancelar.
        `;
        this.speak(guideText);
        
        this.setupVoiceRecognitionForCustomization();
    }

    setupVoiceRecognitionForCookies() {
        if (!('webkitSpeechRecognition' in window)) {
            this.speak('Reconocimiento de voz no disponible');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processCookieVoiceCommand(command);
        };
        
        recognition.start();
    }

    setupVoiceRecognitionForCustomization() {
        if (!('webkitSpeechRecognition' in window)) {
            this.speak('Reconocimiento de voz no disponible');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processCustomizationVoiceCommand(command);
        };
        
        recognition.start();
    }

    processCookieVoiceCommand(command) {
        console.log('Comando de voz para cookies:', command);
        
        if (command.includes('aceptar todas') || command.includes('accept all')) {
            this.acceptAllCookies();
        } else if (command.includes('rechazar todas') || command.includes('decline all')) {
            this.declineAllCookies();
        } else if (command.includes('personalizar') || command.includes('customize')) {
            this.showCustomizationModal();
        } else if (command.includes('política') || command.includes('policy')) {
            this.speak(this.getResponse('cookie_consent.policy'));
            showPrivacyPolicy();
        } else {
            this.speak('Comando no reconocido. Diga: aceptar todas, rechazar todas, personalizar, o política.');
        }
    }

    processCustomizationVoiceCommand(command) {
        console.log('Comando de personalización por voz:', command);
        
        if (command.includes('activar análisis') || command.includes('enable analytics')) {
            document.getElementById('analytics-cookies').checked = true;
            this.speak('Cookies de análisis activadas');
        } else if (command.includes('desactivar análisis') || command.includes('disable analytics')) {
            document.getElementById('analytics-cookies').checked = false;
            this.speak('Cookies de análisis desactivadas');
        } else if (command.includes('activar marketing') || command.includes('enable marketing')) {
            document.getElementById('marketing-cookies').checked = true;
            this.speak('Cookies de marketing activadas');
        } else if (command.includes('desactivar marketing') || command.includes('disable marketing')) {
            document.getElementById('marketing-cookies').checked = false;
            this.speak('Cookies de marketing desactivadas');
        } else if (command.includes('activar preferencias') || command.includes('enable preferences')) {
            document.getElementById('preferences-cookies').checked = true;
            this.speak('Cookies de preferencias activadas');
        } else if (command.includes('desactivar preferencias') || command.includes('disable preferences')) {
            document.getElementById('preferences-cookies').checked = false;
            this.speak('Cookies de preferencias desactivadas');
        } else if (command.includes('guardar') || command.includes('save')) {
            this.saveCustomPreferences();
        } else if (command.includes('cancelar') || command.includes('cancel')) {
            this.closeCustomizationModal();
            this.speak('Personalización cancelada');
        } else {
            this.speak('Comando no reconocido. Diga activar o desactivar seguido del tipo de cookie, guardar, o cancelar.');
        }
    }

    showCookieSettings() {
        if (this.consentGiven) {
            this.showCustomizationModal();
        } else {
            this.showConsentBanner();
        }
    }

    updateCookieStatus() {
        const statusElement = document.getElementById('cookie-status');
        if (statusElement) {
            let statusText = 'Estado: ';
            switch (this.consentType) {
                case 'accepted':
                    statusText += 'Todas aceptadas';
                    break;
                case 'declined':
                    statusText += 'Todas rechazadas';
                    break;
                case 'custom':
                    statusText += 'Personalizado';
                    break;
                default:
                    statusText += 'Pendiente';
            }
            statusElement.textContent = statusText;
        }
    }

    getResponse(key) {
        const langCode = this.currentLanguage;
        const responses = this.languageResponses[langCode] || this.languageResponses['es'];
        
        // Navegar por la estructura anidada
        const keys = key.split('.');
        let response = responses;
        for (const k of keys) {
            response = response[k];
            if (!response) break;
        }
        
        return response || key;
    }

    speak(text) {
        if (this.synthesis && this.voiceEnabled) {
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            this.synthesis.speak(utterance);
        }
    }

    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
    }

    // Método para integración con el sistema principal
    getCookiePreferences() {
        return {
            consentGiven: this.consentGiven,
            consentType: this.consentType,
            preferences: this.customPreferences
        };
    }
}

// Función para mostrar política de privacidad
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.id = 'privacy-policy-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
        <div class="cookie-modal-content">
            <h3>Política de Privacidad</h3>
            <div class="privacy-content">
                <h4>Uso de Cookies</h4>
                <p>Utilizamos cookies para mejorar su experiencia en nuestro Editor de Mundos:</p>
                <ul>
                    <li><strong>Cookies Necesarias:</strong> Esenciales para el funcionamiento del sitio</li>
                    <li><strong>Cookies de Análisis:</strong> Nos ayudan a entender el uso del sitio</li>
                    <li><strong>Cookies de Marketing:</strong> Para mostrar contenido relevante</li>
                    <li><strong>Cookies de Preferencias:</strong> Recuerdan sus configuraciones</li>
                </ul>
                <h4>Sus Derechos</h4>
                <p>Puede cambiar sus preferencias de cookies en cualquier momento desde la configuración.</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Inicializar el sistema de consentimiento de cookies con voz
let voiceCookieConsent;

function initializeVoiceCookieConsent() {
    voiceCookieConsent = new VoiceCookieConsent();
    console.log('Sistema de consentimiento de cookies con voz inicializado');
}

// Auto-inicializar si el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVoiceCookieConsent);
} else {
    initializeVoiceCookieConsent();
}

