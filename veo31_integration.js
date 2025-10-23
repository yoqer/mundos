// Integración con Veo 3.1 - Generación de Video Avanzada
// Basado en las especificaciones de Google Veo 3.1

class Veo31Integration {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseURL = 'https://api.google.com/veo/v3.1';
        this.maxDuration = 120; // 2 minutos máximo
        this.supportedFormats = ['mp4', 'webm', 'mov'];
        this.supportedResolutions = ['720p', '1080p', '4K'];
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            if (!this.apiKey) {
                console.warn('Veo 3.1: API key not configured');
                this.showConfigurationMessage();
                return;
            }
            
            // Verificar conectividad con la API
            const isConnected = await this.testConnection();
            if (isConnected) {
                this.isInitialized = true;
                console.log('Veo 3.1: Successfully initialized');
                this.updateStatus('ready');
            } else {
                console.error('Veo 3.1: Failed to connect to API');
                this.updateStatus('error');
            }
        } catch (error) {
            console.error('Veo 3.1 initialization error:', error);
            this.updateStatus('error');
        }
    }
    
    loadApiKey() {
        // Intentar cargar desde archivo privado
        try {
            return localStorage.getItem('veo31_api_key') || '';
        } catch (error) {
            console.warn('Could not load Veo 3.1 API key:', error);
            return '';
        }
    }
    
    async testConnection() {
        if (!this.apiKey) return false;
        
        try {
            const response = await fetch(`${this.baseURL}/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Veo 3.1 connection test failed:', error);
            return false;
        }
    }
    
    async generateVideo(prompt, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Veo 3.1 not initialized. Please configure API key.');
        }
        
        const defaultOptions = {
            duration: 30, // segundos
            resolution: '1080p',
            format: 'mp4',
            style: 'realistic',
            aspectRatio: '16:9',
            fps: 30,
            seed: null,
            guidance_scale: 7.5,
            num_inference_steps: 50
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Validar parámetros
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
                guidance_scale: config.guidance_scale,
                num_inference_steps: config.num_inference_steps,
                ...(config.seed && { seed: config.seed })
            };
            
            console.log('Veo 3.1: Starting video generation...', requestBody);
            
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
                throw new Error(`Veo 3.1 API Error: ${errorData.message || response.statusText}`);
            }
            
            const result = await response.json();
            
            // Monitorear el progreso de generación
            if (result.job_id) {
                return await this.monitorGeneration(result.job_id);
            } else {
                return result;
            }
            
        } catch (error) {
            console.error('Veo 3.1 generation error:', error);
            throw error;
        }
    }
    
    async monitorGeneration(jobId) {
        const maxAttempts = 60; // 5 minutos máximo
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
                    console.log('Veo 3.1: Video generation completed');
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
                    // En progreso
                    console.log(`Veo 3.1: Generation progress: ${status.progress || 'Processing'}%`);
                    this.updateProgress(status.progress || 0);
                }
                
                // Esperar 5 segundos antes del siguiente check
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
                
            } catch (error) {
                console.error('Error monitoring generation:', error);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        throw new Error('Video generation timeout');
    }
    
    validateGenerationParams(prompt, config) {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt is required for video generation');
        }
        
        if (prompt.length > 1000) {
            throw new Error('Prompt too long. Maximum 1000 characters.');
        }
        
        if (config.duration > this.maxDuration) {
            throw new Error(`Duration too long. Maximum ${this.maxDuration} seconds.`);
        }
        
        if (!this.supportedResolutions.includes(config.resolution)) {
            throw new Error(`Unsupported resolution: ${config.resolution}`);
        }
        
        if (!this.supportedFormats.includes(config.format)) {
            throw new Error(`Unsupported format: ${config.format}`);
        }
    }
    
    async generateFromText(textContent, options = {}) {
        // Convertir contenido de texto en prompt optimizado para video
        const optimizedPrompt = this.optimizeTextForVideo(textContent);
        
        const videoOptions = {
            duration: Math.min(60, Math.max(10, textContent.length / 10)), // Duración basada en longitud
            style: 'cinematic',
            ...options
        };
        
        return await this.generateVideo(optimizedPrompt, videoOptions);
    }
    
    optimizeTextForVideo(text) {
        // Convertir texto narrativo en prompt visual
        const visualKeywords = this.extractVisualElements(text);
        const mood = this.detectMood(text);
        const setting = this.detectSetting(text);
        
        return `${setting}, ${visualKeywords.join(', ')}, ${mood} atmosphere, cinematic lighting, high quality`;
    }
    
    extractVisualElements(text) {
        const visualWords = [];
        const keywords = ['character', 'landscape', 'building', 'forest', 'city', 'ocean', 'mountain', 'castle', 'dragon', 'magic'];
        
        keywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                visualWords.push(keyword);
            }
        });
        
        return visualWords.length > 0 ? visualWords : ['scenic landscape'];
    }
    
    detectMood(text) {
        const moodKeywords = {
            'epic': ['epic', 'heroic', 'legendary', 'grand'],
            'mysterious': ['mysterious', 'dark', 'shadow', 'secret'],
            'peaceful': ['peaceful', 'calm', 'serene', 'tranquil'],
            'dramatic': ['dramatic', 'intense', 'powerful', 'striking']
        };
        
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return mood;
            }
        }
        
        return 'cinematic';
    }
    
    detectSetting(text) {
        const settings = {
            'fantasy world': ['magic', 'dragon', 'castle', 'kingdom', 'wizard'],
            'futuristic city': ['future', 'technology', 'robot', 'space', 'cyber'],
            'natural landscape': ['forest', 'mountain', 'river', 'nature', 'tree'],
            'urban environment': ['city', 'street', 'building', 'urban', 'downtown']
        };
        
        for (const [setting, keywords] of Object.entries(settings)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return setting;
            }
        }
        
        return 'beautiful landscape';
    }
    
    showConfigurationMessage() {
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Veo 3.1 requiere configuración de API key', 'warning');
        } else {
            console.warn('Veo 3.1: API key configuration required');
        }
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('veo31-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-${status}`;
        }
    }
    
    updateProgress(progress) {
        const progressElement = document.getElementById('veo31-progress');
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
            progressElement.textContent = `${Math.round(progress)}%`;
        }
    }
    
    // Método para integrar con el sistema de mundos
    async generateWorldVideo(worldDescription, duration = 60) {
        const prompt = `Create an immersive virtual world: ${worldDescription}. Cinematic camera movement, detailed environment, atmospheric lighting, 4K quality`;
        
        return await this.generateVideo(prompt, {
            duration: duration,
            resolution: '4K',
            style: 'realistic',
            fps: 60
        });
    }
    
    // Método para generar videos desde libros
    async generateBookTrailer(bookContent, chapterTitle = '') {
        const prompt = this.createBookTrailerPrompt(bookContent, chapterTitle);
        
        return await this.generateVideo(prompt, {
            duration: 30,
            resolution: '1080p',
            style: 'cinematic',
            aspectRatio: '16:9'
        });
    }
    
    createBookTrailerPrompt(content, title) {
        const visualElements = this.extractVisualElements(content);
        const mood = this.detectMood(content);
        
        return `Book trailer for "${title}": ${visualElements.join(', ')}, ${mood} atmosphere, dramatic lighting, cinematic composition, professional quality`;
    }
}

// Funciones de interfaz para integración con el sistema principal
async function generateVideoWithVeo31() {
    const promptInput = document.getElementById('veo31-prompt');
    const durationInput = document.getElementById('veo31-duration');
    const resolutionSelect = document.getElementById('veo31-resolution');
    
    if (!promptInput || !promptInput.value.trim()) {
        alert('Por favor, ingresa una descripción para el video');
        return;
    }
    
    const options = {
        duration: parseInt(durationInput?.value) || 30,
        resolution: resolutionSelect?.value || '1080p'
    };
    
    try {
        showLoading('Generando video con Veo 3.1...');
        
        const result = await window.veo31.generateVideo(promptInput.value, options);
        
        if (result.success) {
            displayVideoResult(result);
            showNotification('✅ Video generado exitosamente con Veo 3.1', 'success');
        } else {
            throw new Error('Error en la generación del video');
        }
    } catch (error) {
        console.error('Error generating video:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function displayVideoResult(result) {
    const resultContainer = document.getElementById('veo31-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="video-result">
                <h4>Video Generado con Veo 3.1</h4>
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
    window.veo31 = new Veo31Integration();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Veo31Integration;
}
