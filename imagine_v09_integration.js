// Integración con Imagine v0.9 (xAI) - Generación de Video
// Parte de la familia Grok / Aurora de xAI

class ImagineV09Integration {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseURL = 'https://api.x.ai/imagine/v0.9'; // URL hipotética basada en la convención
        this.isInitialized = false;
        this.maxVideoDuration = 60; // Max 60 seconds for Imagine v0.9
        this.supportedFormats = ['mp4', 'webm'];
        this.supportedResolutions = ['720p', '1080p'];
        
        this.init();
    }
    
    async init() {
        try {
            if (!this.apiKey) {
                console.warn('Imagine v0.9: API key not configured');
                this.showConfigurationMessage();
                return;
            }
            
            const isConnected = await this.testConnection();
            if (isConnected) {
                this.isInitialized = true;
                console.log('Imagine v0.9: Successfully initialized');
                this.updateStatus('ready');
            } else {
                console.error('Imagine v0.9: Failed to connect to API');
                this.updateStatus('error');
            }
        } catch (error) {
            console.error('Imagine v0.9 initialization error:', error);
            this.updateStatus('error');
        }
    }
    
    loadApiKey() {
        try {
            return localStorage.getItem('imagine_v09_api_key') || '';
        } catch (error) {
            console.warn('Could not load Imagine v0.9 API key:', error);
            return '';
        }
    }
    
    async testConnection() {
        if (!this.apiKey) return false;
        
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Imagine v0.9 connection test failed:', error);
            return false;
        }
    }
    
    async generateVideo(prompt, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Imagine v0.9 not initialized. Please configure API key.');
        }
        
        const defaultOptions = {
            duration: 15, // segundos
            resolution: '1080p',
            format: 'mp4',
            style: 'cinematic',
            aspectRatio: '16:9',
            fps: 24,
            mood: 'neutral',
            cameraMovement: 'none',
            seed: null
        };
        
        const config = { ...defaultOptions, ...options };
        
        this.validateGenerationParams(prompt, config);
        
        try {
            const requestBody = {
                prompt: prompt,
                duration: config.duration,
                resolution: config.resolution,
                format: config.format,
                style: config.style,
                aspect_ratio: config.aspectRatio,
                fps: config.fps,
                mood: config.mood,
                camera_movement: config.cameraMovement,
                ...(config.seed && { seed: config.seed })
            };
            
            console.log('Imagine v0.9: Starting video generation...', requestBody);
            
            const response = await fetch(`${this.baseURL}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Imagine v0.9 API Error: ${errorData.message || response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.job_id) {
                return await this.monitorGeneration(result.job_id);
            } else {
                return result;
            }
            
        } catch (error) {
            console.error('Imagine v0.9 generation error:', error);
            throw error;
        }
    }
    
    async monitorGeneration(jobId) {
        const maxAttempts = 40; // Aproximadamente 3 minutos
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.baseURL}/status/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Status check failed: ${response.statusText}`);
                }
                
                const status = await response.json();
                
                if (status.status === 'completed') {
                    console.log('Imagine v0.9: Video generation completed');
                    return {
                        success: true,
                        video_url: status.video_url,
                        thumbnail_url: status.thumbnail_url,
                        duration: status.duration,
                        metadata: status.metadata
                    };
                } else if (status.status === 'failed') {
                    throw new Error(`Generation failed: ${status.error || 'Unknown error'}`);
                } else {
                    console.log(`Imagine v0.9: Generation progress: ${status.progress || 'Processing'}%`);
                    this.updateProgress(status.progress || 0);
                }
                
                await new Promise(resolve => setTimeout(resolve, 4500)); // Esperar 4.5 segundos
                attempts++;
                
            } catch (error) {
                console.error('Error monitoring generation:', error);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 4500));
            }
        }
        
        throw new Error('Video generation timeout');
    }
    
    validateGenerationParams(prompt, config) {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt is required for video generation');
        }
        if (prompt.length > 500) {
            throw new Error('Prompt too long. Maximum 500 characters.');
        }
        if (config.duration > this.maxVideoDuration) {
            throw new Error(`Duration too long. Maximum ${this.maxVideoDuration} seconds.`);
        }
        if (!this.supportedResolutions.includes(config.resolution)) {
            throw new Error(`Unsupported resolution: ${config.resolution}`);
        }
        if (!this.supportedFormats.includes(config.format)) {
            throw new Error(`Unsupported format: ${config.format}`);
        }
    }
    
    async generateFromEditorContent(textContent, options = {}) {
        // Extraer elementos clave del texto del editor para el prompt de video
        const videoPrompt = this.createVideoPromptFromText(textContent);
        
        const videoOptions = {
            duration: Math.min(this.maxVideoDuration, Math.max(5, textContent.length / 20)), 
            style: 'documentary',
            ...options
        };
        
        return await this.generateVideo(videoPrompt, videoOptions);
    }
    
    createVideoPromptFromText(text) {
        // Lógica para transformar texto libre en un prompt estructurado para video
        const keywords = this.extractKeywords(text);
        const mood = this.detectMood(text);
        const setting = this.detectSetting(text);
        
        let prompt = `Video about: ${keywords.join(', ')}. Setting: ${setting}. Mood: ${mood}.`;
        
        if (text.length > 200) {
            prompt += ` Detailed narrative, dynamic camera, high quality.`;
        }
        
        return prompt;
    }
    
    extractKeywords(text) {
        const commonWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'es', 'está', 'en', 'con', 'para', 'de', 'a', 'que', 'se', 'del', 'al']);
        const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !commonWords.has(word));
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        return Object.entries(wordCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5) 
            .map(([word]) => word);
    }
    
    detectMood(text) {
        const moodKeywords = {
            'epic': ['épico', 'heroico', 'legendario'],
            'mysterious': ['misterioso', 'oscuro', 'secreto'],
            'peaceful': ['pacífico', 'calmo', 'sereno'],
            'dramatic': ['dramático', 'intenso', 'poderoso'],
            'futuristic': ['futurista', 'tecnología', 'ciencia ficción']
        };
        
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return mood;
            }
        }
        return 'neutral';
    }
    
    detectSetting(text) {
        const settings = {
            'fantasy world': ['castillo', 'bosque', 'dragón', 'reino', 'mago'],
            'futuristic city': ['ciudad futurista', 'rascacielos', 'vehículos voladores'],
            'natural landscape': ['montaña', 'río', 'océano', 'naturaleza'],
            'urban environment': ['ciudad', 'calle', 'edificio']
        };
        
        for (const [setting, keywords] of Object.entries(settings)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return setting;
            }
        }
        return 'diverse landscape';
    }
    
    showConfigurationMessage() {
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Imagine v0.9 requiere configuración de API key', 'warning');
        } else {
            console.warn('Imagine v0.9: API key configuration required');
        }
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('imagine-v09-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-${status}`;
        }
    }
    
    updateProgress(progress) {
        const progressElement = document.getElementById('imagine-v09-progress');
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
            progressElement.textContent = `${Math.round(progress)}%`;
        }
    }
}

// Funciones de interfaz para integración con el sistema principal
async function generateVideoWithImagineV09() {
    const promptInput = document.getElementById('imagine-v09-prompt');
    const durationInput = document.getElementById('imagine-v09-duration');
    const resolutionSelect = document.getElementById('imagine-v09-resolution');
    
    if (!promptInput || !promptInput.value.trim()) {
        alert('Por favor, ingresa una descripción para el video');
        return;
    }
    
    const options = {
        duration: parseInt(durationInput?.value) || 15,
        resolution: resolutionSelect?.value || '1080p'
    };
    
    try {
        showLoading('Generando video con Imagine v0.9...');
        
        const result = await window.imagineV09.generateVideo(promptInput.value, options);
        
        if (result.success) {
            displayVideoResultImagineV09(result);
            showNotification('✅ Video generado exitosamente con Imagine v0.9', 'success');
        } else {
            throw new Error('Error en la generación del video');
        }
    } catch (error) {
        console.error('Error generating video with Imagine v0.9:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function displayVideoResultImagineV09(result) {
    const resultContainer = document.getElementById('imagine-v09-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="video-result">
                <h4>Video Generado con Imagine v0.9</h4>
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
    window.imagineV09 = new ImagineV09Integration();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImagineV09Integration;
}
