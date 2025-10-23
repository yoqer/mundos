// Integración con vr.decart.ai - Mundos VR en Tiempo Real
// Sistema de generación de mundos virtuales inmersivos

class VRDecartIntegration {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseURL = 'https://api.vr.decart.ai/v1';
        this.websocketURL = 'wss://ws.vr.decart.ai/realtime';
        this.isInitialized = false;
        this.activeSession = null;
        this.websocket = null;
        
        // Configuraciones de mundos VR
        this.worldTypes = {
            'immersive': 'Mundo Inmersivo Completo',
            'interactive': 'Mundo Interactivo',
            'narrative': 'Mundo Narrativo',
            'sandbox': 'Mundo Sandbox',
            'social': 'Mundo Social Multijugador'
        };
        
        this.qualityLevels = {
            'low': { resolution: '1080p', fps: 60, polygons: 'medium' },
            'medium': { resolution: '1440p', fps: 90, polygons: 'high' },
            'high': { resolution: '4K', fps: 120, polygons: 'ultra' },
            'ultra': { resolution: '8K', fps: 144, polygons: 'maximum' }
        };
        
        this.init();
    }
    
    async init() {
        try {
            if (!this.apiKey) {
                console.warn('VR Decart: API key not configured');
                this.showConfigurationMessage();
                return;
            }
            
            // Verificar conectividad
            const isConnected = await this.testConnection();
            if (isConnected) {
                this.isInitialized = true;
                console.log('VR Decart: Successfully initialized');
                this.updateStatus('ready');
                await this.initializeWebSocket();
            } else {
                console.error('VR Decart: Failed to connect to API');
                this.updateStatus('error');
            }
        } catch (error) {
            console.error('VR Decart initialization error:', error);
            this.updateStatus('error');
        }
    }
    
    loadApiKey() {
        try {
            return localStorage.getItem('vr_decart_api_key') || '';
        } catch (error) {
            console.warn('Could not load VR Decart API key:', error);
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
            console.error('VR Decart connection test failed:', error);
            return false;
        }
    }
    
    async initializeWebSocket() {
        try {
            this.websocket = new WebSocket(`${this.websocketURL}?token=${this.apiKey}`);
            
            this.websocket.onopen = () => {
                console.log('VR Decart: WebSocket connected for real-time updates');
            };
            
            this.websocket.onmessage = (event) => {
                this.handleRealtimeUpdate(JSON.parse(event.data));
            };
            
            this.websocket.onclose = () => {
                console.log('VR Decart: WebSocket disconnected');
                // Intentar reconectar después de 5 segundos
                setTimeout(() => this.initializeWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('VR Decart WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }
    
    async generateVRWorld(description, options = {}) {
        if (!this.isInitialized) {
            throw new Error('VR Decart not initialized. Please configure API key.');
        }
        
        const defaultOptions = {
            worldType: 'immersive',
            quality: 'medium',
            size: 'large', // small, medium, large, massive
            physics: true,
            lighting: 'dynamic',
            weather: 'clear',
            timeOfDay: 'day',
            interactivity: 'high',
            multiplayer: false,
            maxUsers: 1,
            vrOptimized: true,
            realTimeGeneration: true
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const requestBody = {
                description: description,
                world_type: config.worldType,
                quality_settings: this.qualityLevels[config.quality],
                world_size: config.size,
                physics_enabled: config.physics,
                lighting_type: config.lighting,
                weather_conditions: config.weather,
                time_of_day: config.timeOfDay,
                interactivity_level: config.interactivity,
                multiplayer_enabled: config.multiplayer,
                max_concurrent_users: config.maxUsers,
                vr_optimized: config.vrOptimized,
                real_time_generation: config.realTimeGeneration,
                timestamp: Date.now()
            };
            
            console.log('VR Decart: Starting VR world generation...', requestBody);
            
            const response = await fetch(`${this.baseURL}/worlds/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`VR Decart API Error: ${errorData.message || response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.session_id) {
                this.activeSession = result.session_id;
                return await this.monitorWorldGeneration(result.session_id);
            } else {
                return result;
            }
            
        } catch (error) {
            console.error('VR Decart world generation error:', error);
            throw error;
        }
    }
    
    async monitorWorldGeneration(sessionId) {
        const maxAttempts = 120; // 10 minutos máximo
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.baseURL}/worlds/status/${sessionId}`, {
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
                    console.log('VR Decart: VR world generation completed');
                    return {
                        success: true,
                        world_url: status.world_url,
                        vr_url: status.vr_url,
                        preview_url: status.preview_url,
                        session_id: sessionId,
                        world_data: status.world_data,
                        access_code: status.access_code,
                        metadata: status.metadata
                    };
                } else if (status.status === 'failed') {
                    throw new Error(`World generation failed: ${status.error || 'Unknown error'}`);
                } else {
                    // En progreso
                    console.log(`VR Decart: Generation progress: ${status.progress || 'Processing'}%`);
                    this.updateProgress(status.progress || 0, status.current_stage || 'Generating');
                }
                
                // Esperar 5 segundos antes del siguiente check
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
                
            } catch (error) {
                console.error('Error monitoring world generation:', error);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        throw new Error('VR world generation timeout');
    }
    
    handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'generation_progress':
                this.updateProgress(data.progress, data.stage);
                break;
            case 'world_ready':
                this.onWorldReady(data);
                break;
            case 'user_joined':
                this.onUserJoined(data);
                break;
            case 'world_updated':
                this.onWorldUpdated(data);
                break;
            default:
                console.log('VR Decart realtime update:', data);
        }
    }
    
    onWorldReady(data) {
        console.log('VR World is ready:', data);
        if (typeof showNotification === 'function') {
            showNotification('🌍 Mundo VR listo para explorar!', 'success');
        }
        this.displayWorldResult(data);
    }
    
    onUserJoined(data) {
        console.log('User joined VR world:', data);
        this.updateUserCount(data.user_count);
    }
    
    onWorldUpdated(data) {
        console.log('VR World updated:', data);
        this.refreshWorldView(data);
    }
    
    async generateFromStory(storyContent, options = {}) {
        // Convertir historia en mundo VR inmersivo
        const worldDescription = this.convertStoryToWorldDescription(storyContent);
        
        const vrOptions = {
            worldType: 'narrative',
            interactivity: 'high',
            lighting: 'cinematic',
            ...options
        };
        
        return await this.generateVRWorld(worldDescription, vrOptions);
    }
    
    convertStoryToWorldDescription(story) {
        const settings = this.extractSettings(story);
        const characters = this.extractCharacters(story);
        const atmosphere = this.extractAtmosphere(story);
        
        return `Immersive VR world based on story: ${settings.join(', ')}. Characters: ${characters.join(', ')}. Atmosphere: ${atmosphere}. Interactive narrative elements, explorable environments, cinematic lighting.`;
    }
    
    extractSettings(text) {
        const settingKeywords = ['castle', 'forest', 'city', 'mountain', 'ocean', 'desert', 'village', 'palace', 'cave', 'island'];
        const found = [];
        
        settingKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                found.push(keyword);
            }
        });
        
        return found.length > 0 ? found : ['fantasy landscape'];
    }
    
    extractCharacters(text) {
        const characterKeywords = ['hero', 'princess', 'knight', 'wizard', 'dragon', 'warrior', 'mage', 'king', 'queen'];
        const found = [];
        
        characterKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                found.push(keyword);
            }
        });
        
        return found.length > 0 ? found : ['adventurer'];
    }
    
    extractAtmosphere(text) {
        const atmosphereKeywords = {
            'mystical': ['magic', 'mystical', 'enchanted', 'mysterious'],
            'epic': ['epic', 'grand', 'legendary', 'heroic'],
            'dark': ['dark', 'shadow', 'evil', 'sinister'],
            'peaceful': ['peaceful', 'serene', 'calm', 'tranquil']
        };
        
        for (const [atmosphere, keywords] of Object.entries(atmosphereKeywords)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return atmosphere;
            }
        }
        
        return 'immersive';
    }
    
    async joinVRWorld(worldId, userOptions = {}) {
        if (!this.isInitialized) {
            throw new Error('VR Decart not initialized');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/worlds/${worldId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_preferences: userOptions,
                    device_type: this.detectVRDevice(),
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to join VR world: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Error joining VR world:', error);
            throw error;
        }
    }
    
    detectVRDevice() {
        // Detectar dispositivo VR del usuario
        if (navigator.xr) {
            return 'webxr';
        } else if (navigator.getVRDisplays) {
            return 'webvr';
        } else {
            return 'desktop';
        }
    }
    
    async updateWorldInRealTime(worldId, updates) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'update_world',
                world_id: worldId,
                updates: updates,
                timestamp: Date.now()
            };
            
            this.websocket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected for real-time updates');
        }
    }
    
    showConfigurationMessage() {
        if (typeof showNotification === 'function') {
            showNotification('⚠️ VR Decart requiere configuración de API key', 'warning');
        } else {
            console.warn('VR Decart: API key configuration required');
        }
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('vr-decart-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-${status}`;
        }
    }
    
    updateProgress(progress, stage = 'Processing') {
        const progressElement = document.getElementById('vr-decart-progress');
        const stageElement = document.getElementById('vr-decart-stage');
        
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
            progressElement.textContent = `${Math.round(progress)}%`;
        }
        
        if (stageElement) {
            stageElement.textContent = stage;
        }
    }
    
    updateUserCount(count) {
        const userCountElement = document.getElementById('vr-world-users');
        if (userCountElement) {
            userCountElement.textContent = `${count} usuario(s) conectado(s)`;
        }
    }
    
    displayWorldResult(result) {
        const resultContainer = document.getElementById('vr-decart-result');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="vr-world-result">
                    <h4>Mundo VR Generado</h4>
                    <div class="world-preview">
                        <img src="${result.preview_url}" alt="Vista previa del mundo VR" style="width: 100%; border-radius: 8px;">
                    </div>
                    <div class="world-actions">
                        <a href="${result.vr_url}" target="_blank" class="btn btn-primary">🥽 Entrar en VR</a>
                        <a href="${result.world_url}" target="_blank" class="btn btn-secondary">🌐 Ver en Navegador</a>
                        <button onclick="shareVRWorld('${result.session_id}')" class="btn btn-info">📤 Compartir</button>
                    </div>
                    <div class="world-info">
                        <p><strong>Código de Acceso:</strong> ${result.access_code}</p>
                        <p><strong>Sesión ID:</strong> ${result.session_id}</p>
                        <p id="vr-world-users">1 usuario(s) conectado(s)</p>
                    </div>
                </div>
            `;
        }
    }
    
    refreshWorldView(data) {
        // Actualizar vista del mundo en tiempo real
        const previewImg = document.querySelector('.world-preview img');
        if (previewImg && data.updated_preview_url) {
            previewImg.src = data.updated_preview_url;
        }
    }
}

// Funciones de interfaz para integración con el sistema principal
async function generateVRWorldWithDecart() {
    const descriptionInput = document.getElementById('vr-decart-description');
    const worldTypeSelect = document.getElementById('vr-decart-type');
    const qualitySelect = document.getElementById('vr-decart-quality');
    
    if (!descriptionInput || !descriptionInput.value.trim()) {
        alert('Por favor, ingresa una descripción para el mundo VR');
        return;
    }
    
    const options = {
        worldType: worldTypeSelect?.value || 'immersive',
        quality: qualitySelect?.value || 'medium',
        multiplayer: document.getElementById('vr-multiplayer')?.checked || false
    };
    
    try {
        showLoading('Generando mundo VR en tiempo real...');
        
        const result = await window.vrDecart.generateVRWorld(descriptionInput.value, options);
        
        if (result.success) {
            showNotification('✅ Mundo VR generado exitosamente', 'success');
        } else {
            throw new Error('Error en la generación del mundo VR');
        }
    } catch (error) {
        console.error('Error generating VR world:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function shareVRWorld(sessionId) {
    const shareUrl = `${window.location.origin}/vr-world/${sessionId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mundo VR Generado',
            text: 'Explora este increíble mundo VR generado con IA',
            url: shareUrl
        });
    } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('🔗 Enlace copiado al portapapeles', 'success');
        });
    }
}

// Inicialización global
window.addEventListener('DOMContentLoaded', () => {
    window.vrDecart = new VRDecartIntegration();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VRDecartIntegration;
}
