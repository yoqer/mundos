/**
 * Environment Detector - Detección automática de entorno
 * Determina si la aplicación está ejecutándose en:
 * - GitHub Codespaces
 * - Servidor web (HTTP/HTTPS)
 * - Local (file://)
 */

class EnvironmentDetector {
    constructor() {
        this.environment = this.detectEnvironment();
        this.isOnline = navigator.onLine;
        this.baseURL = this.getBaseURL();
        this.apiEndpoint = this.getAPIEndpoint();
        
        // Configurar listeners para cambios de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectivityChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectivityChange(false);
        });
        
        console.log('Environment detected:', this.environment);
        console.log('Base URL:', this.baseURL);
        console.log('API Endpoint:', this.apiEndpoint);
    }
    
    detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        // Detectar GitHub Codespaces
        if (hostname.includes('github.dev') || 
            hostname.includes('githubpreview.dev') ||
            hostname.includes('app.github.dev')) {
            return 'codespaces';
        }
        
        // Detectar archivo local
        if (protocol === 'file:') {
            return 'local';
        }
        
        // Detectar servidor de desarrollo local
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') ||
            port === '3000' || port === '8000' || port === '5000') {
            return 'development';
        }
        
        // Detectar producción web
        if (protocol === 'https:' || protocol === 'http:') {
            return 'production';
        }
        
        return 'unknown';
    }
    
    getBaseURL() {
        switch (this.environment) {
            case 'codespaces':
                return window.location.origin;
            case 'local':
                return window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            case 'development':
                return window.location.origin;
            case 'production':
                return window.location.origin;
            default:
                return window.location.origin || '';
        }
    }
    
    getAPIEndpoint() {
        switch (this.environment) {
            case 'codespaces':
                return 'https://maxxine.net/Yupi/api';
            case 'local':
                // Para local, usar maxxine.net como fallback
                return 'https://maxxine.net/Yupi/api';
            case 'development':
                return 'https://maxxine.net/Yupi/api';
            case 'production':
                return this.baseURL + '/api';
            default:
                return 'https://maxxine.net/Yupi/api';
        }
    }
    
    isLocalEnvironment() {
        return this.environment === 'local';
    }
    
    isCodespacesEnvironment() {
        return this.environment === 'codespaces';
    }
    
    isWebEnvironment() {
        return ['codespaces', 'development', 'production'].includes(this.environment);
    }
    
    canUseDatabase() {
        return this.isOnline && this.isWebEnvironment();
    }
    
    shouldUseLocalStorage() {
        return this.environment === 'local' || !this.canUseDatabase();
    }
    
    getStorageStrategy() {
        if (this.canUseDatabase()) {
            return 'database';
        } else if (this.isOnline) {
            return 'cloud_fallback';
        } else {
            return 'local_storage';
        }
    }
    
    onConnectivityChange(isOnline) {
        console.log('Connectivity changed:', isOnline ? 'Online' : 'Offline');
        
        // Mostrar notificación al usuario
        this.showConnectivityNotification(isOnline);
        
        // Actualizar estrategia de almacenamiento
        const newStrategy = this.getStorageStrategy();
        console.log('Storage strategy updated:', newStrategy);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('environmentChange', {
            detail: {
                isOnline,
                environment: this.environment,
                storageStrategy: newStrategy
            }
        }));
    }
    
    showConnectivityNotification(isOnline) {
        const notification = document.createElement('div');
        notification.className = `connectivity-notification ${isOnline ? 'online' : 'offline'}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${isOnline ? '🌐' : '📱'}</span>
                <span class="notification-text">
                    ${isOnline ? 
                        'Conexión restaurada - Funciones web disponibles' : 
                        'Sin conexión - Modo offline activado'
                    }
                </span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Método para obtener configuración específica del entorno
    getEnvironmentConfig() {
        const baseConfig = {
            environment: this.environment,
            isOnline: this.isOnline,
            baseURL: this.baseURL,
            apiEndpoint: this.apiEndpoint,
            storageStrategy: this.getStorageStrategy()
        };
        
        switch (this.environment) {
            case 'codespaces':
                return {
                    ...baseConfig,
                    features: {
                        database: true,
                        fileUpload: true,
                        voiceNavigation: true,
                        exportFunctions: true,
                        cloudSync: true
                    },
                    limits: {
                        maxFileSize: '50MB',
                        maxProjects: 100
                    }
                };
                
            case 'local':
                return {
                    ...baseConfig,
                    features: {
                        database: false,
                        fileUpload: false,
                        voiceNavigation: true,
                        exportFunctions: true,
                        cloudSync: this.isOnline
                    },
                    limits: {
                        maxFileSize: '10MB',
                        maxProjects: 50
                    },
                    fallbackAPI: 'https://maxxine.net/editor-mundos/api'
                };
                
            case 'production':
                return {
                    ...baseConfig,
                    features: {
                        database: true,
                        fileUpload: true,
                        voiceNavigation: true,
                        exportFunctions: true,
                        cloudSync: true
                    },
                    limits: {
                        maxFileSize: '100MB',
                        maxProjects: 1000
                    }
                };
                
            default:
                return baseConfig;
        }
    }
}

// Crear instancia global
window.environmentDetector = new EnvironmentDetector();

// CSS para notificaciones de conectividad
const notificationStyles = `
<style>
.connectivity-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
}

.connectivity-notification.online {
    background: linear-gradient(135deg, #4CAF50, #45a049);
}

.connectivity-notification.offline {
    background: linear-gradient(135deg, #f44336, #d32f2f);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.notification-icon {
    font-size: 16px;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', notificationStyles);

