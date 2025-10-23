// Integración con Grok4 (xAI) y Imagine v0.9 - Modelo de Lenguaje y Generación de Video
// Este archivo reemplaza la integración anterior de Groq con el modelo Llama.

class Grok4Integration {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseURL = 'https://api.x.ai/v1'; // URL base para la API de Grok
        this.imagineIntegration = null; // Instancia de ImagineV09Integration
        this.isInitialized = false;
        this.model = 'grok-4'; // Modelo de lenguaje Grok4

        this.init();
    }

    async init() {
        try {
            if (!this.apiKey) {
                console.warn('Grok4: API key not configured');
                this.showConfigurationMessage();
                return;
            }

            const isConnected = await this.testConnection();
            if (isConnected) {
                this.isInitialized = true;
                console.log('Grok4: Successfully initialized');
                this.updateStatus('ready');
                
                // Inicializar Imagine v0.9 para generación de video
                if (typeof ImagineV09Integration !== 'undefined') {
                    this.imagineIntegration = new ImagineV09Integration();
                    // Asegurarse de que Imagine v0.9 use la misma API key si es compartida o tiene su propia configuración
                    // Por simplicidad, asumimos que Grok4 y Imagine v0.9 pueden compartir la misma clave de xAI
                    if (!this.imagineIntegration.apiKey && this.apiKey) {
                        localStorage.setItem('imagine_v09_api_key', this.apiKey);
                        this.imagineIntegration.apiKey = this.apiKey; // Sincronizar clave
                        await this.imagineIntegration.init(); // Re-inicializar con la clave
                    }
                } else {
                    console.warn('ImagineV09Integration not found. Video generation will be unavailable.');
                }

            } else {
                console.error('Grok4: Failed to connect to API');
                this.updateStatus('error');
            }
        } catch (error) {
            console.error('Grok4 initialization error:', error);
            this.updateStatus('error');
        }
    }

    loadApiKey() {
        try {
            // Cargar desde archivo privado o localStorage
            return localStorage.getItem('grok4_api_key') || localStorage.getItem('xai_api_key') || '';
        } catch (error) {
            console.warn('Could not load Grok4 API key:', error);
            return '';
        }
    }

    async testConnection() {
        if (!this.apiKey) return false;

        try {
            // Endpoint de prueba simple, asumiendo que existe un endpoint de modelos o de salud
            const response = await fetch(`${this.baseURL}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Grok4 connection test failed:', error);
            return false;
        }
    }

    async generateText(prompt, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Grok4 not initialized. Please configure API key.');
        }

        const defaultOptions = {
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
            system_message: 'Eres un asistente de IA útil y creativo.'
        };

        const config = { ...defaultOptions, ...options };

        try {
            const requestBody = {
                model: this.model,
                messages: [
                    { role: 'system', content: config.system_message },
                    { role: 'user', content: prompt }
                ],
                max_tokens: config.max_tokens,
                temperature: config.temperature,
                top_p: config.top_p,
                stream: config.stream
            };

            console.log('Grok4: Starting text generation...', requestBody);

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Grok4 API Error: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            return result.choices[0].message.content;

        } catch (error) {
            console.error('Grok4 text generation error:', error);
            throw error;
        }
    }

    async generateVideoFromText(textContent, options = {}) {
        if (!this.imagineIntegration || !this.imagineIntegration.isInitialized) {
            throw new Error('Imagine v0.9 (video generation) is not initialized or available.');
        }
        return await this.imagineIntegration.generateFromEditorContent(textContent, options);
    }

    async generateVideoFromPrompt(prompt, options = {}) {
        if (!this.imagineIntegration || !this.imagineIntegration.isInitialized) {
            throw new Error('Imagine v0.9 (video generation) is not initialized or available.');
        }
        return await this.imagineIntegration.generateVideo(prompt, options);
    }

    showConfigurationMessage() {
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Grok4 requiere configuración de API key de xAI', 'warning');
        } else {
            console.warn('Grok4: API key configuration required');
        }
    }

    updateStatus(status) {
        const statusElement = document.getElementById('grok4-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-${status}`;
        }
    }
}

// Funciones de interfaz para integración con el sistema principal
async function generateContentWithGrok4() {
    const promptInput = document.getElementById('grok4-prompt');
    const contentType = document.getElementById('grok4-content-type').value; // 'text' o 'video'

    if (!promptInput || !promptInput.value.trim()) {
        alert('Por favor, ingresa un prompt.');
        return;
    }

    try {
        showLoading('Generando contenido con Grok4...');

        if (contentType === 'text') {
            const result = await window.grok4.generateText(promptInput.value);
            displayGrok4TextResult(result);
            showNotification('✅ Texto generado exitosamente con Grok4', 'success');
        } else if (contentType === 'video') {
            const result = await window.grok4.generateVideoFromPrompt(promptInput.value);
            displayGrok4VideoResult(result);
            showNotification('✅ Video generado exitosamente con Grok4 (Imagine v0.9)', 'success');
        }
    } catch (error) {
        console.error('Error generating content with Grok4:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function displayGrok4TextResult(text) {
    const resultContainer = document.getElementById('grok4-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="text-result">
                <h4>Resultado de Grok4 (Texto)</h4>
                <p>${text}</p>
            </div>
        `;
    }
}

function displayGrok4VideoResult(result) {
    const resultContainer = document.getElementById('grok4-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="video-result">
                <h4>Video Generado con Grok4 (Imagine v0.9)</h4>
                <video controls width="100%" poster="${result.thumbnail_url}">
                    <source src="${result.video_url}" type="video/mp4">
                    Tu navegador no soporta el elemento video.
                </video>
                <div class="video-info">
                    <p><strong>Duración:</strong> ${result.duration}s</p>
                    <p><strong>URL:</strong> <a href="${result.video_url}" target="_blank">Descargar Video</a></p>
                </div>
            </div>
        `;
    }
}

// Inicialización global
window.addEventListener('DOMContentLoaded', () => {
    window.grok4 = new Grok4Integration();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grok4Integration;
}
