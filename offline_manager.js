/**
 * Offline Manager - Gestión avanzada de funcionalidad offline
 * Maneja caché, recuperación de datos y funcionalidades sin conexión
 */

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.cacheVersion = '6.0.1';
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB
        this.syncQueue = [];
        this.offlineCapabilities = {
            voiceNavigation: true,
            textEditing: true,
            templateSelection: true,
            localExport: true,
            projectSaving: true,
            imageProcessing: false, // Requiere conexión
            cloudSync: false // Requiere conexión
        };
        
        this.init();
    }
    
    async init() {
        // Configurar service worker para caché avanzado
        if ('serviceWorker' in navigator) {
            try {
                await this.registerServiceWorker();
            } catch (error) {
                console.warn('Service Worker not available:', error);
            }
        }
        
        // Configurar IndexedDB para almacenamiento local
        await this.initIndexedDB();
        
        // Configurar listeners de conectividad
        this.setupConnectivityListeners();
        
        // Cargar datos offline existentes
        await this.loadOfflineData();
        
        console.log('Offline Manager initialized');
    }
    
    async registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Escuchar mensajes del service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_UPDATED') {
                this.onCacheUpdated(event.data.payload);
            }
        });
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('EditorMundosDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para proyectos
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                    projectStore.createIndex('lastModified', 'lastModified');
                    projectStore.createIndex('type', 'type');
                }
                
                // Store para archivos exportados
                if (!db.objectStoreNames.contains('exports')) {
                    const exportStore = db.createObjectStore('exports', { keyPath: 'id' });
                    exportStore.createIndex('timestamp', 'timestamp');
                    exportStore.createIndex('format', 'format');
                }
                
                // Store para configuraciones de usuario
                if (!db.objectStoreNames.contains('userConfig')) {
                    db.createObjectStore('userConfig', { keyPath: 'key' });
                }
                
                // Store para caché de recursos
                if (!db.objectStoreNames.contains('resourceCache')) {
                    const cacheStore = db.createObjectStore('resourceCache', { keyPath: 'url' });
                    cacheStore.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }
    
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectivityChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectivityChange(false);
        });
    }
    
    async onConnectivityChange(isOnline) {
        console.log('Connectivity changed:', isOnline ? 'Online' : 'Offline');
        
        if (isOnline) {
            // Intentar sincronizar datos pendientes
            await this.syncPendingData();
            
            // Actualizar caché de recursos
            await this.updateResourceCache();
        } else {
            // Preparar para modo offline
            await this.prepareOfflineMode();
        }
        
        // Notificar cambio de capacidades
        this.updateOfflineCapabilities();
        this.notifyCapabilityChange();
    }
    
    async syncPendingData() {
        if (this.syncQueue.length === 0) return;
        
        console.log(`Syncing ${this.syncQueue.length} pending items...`);
        
        const successfulSyncs = [];
        const failedSyncs = [];
        
        for (const item of this.syncQueue) {
            try {
                await this.syncItem(item);
                successfulSyncs.push(item);
            } catch (error) {
                console.warn('Failed to sync item:', item, error);
                failedSyncs.push(item);
            }
        }
        
        // Remover elementos sincronizados exitosamente
        this.syncQueue = failedSyncs;
        
        if (successfulSyncs.length > 0) {
            this.showSyncNotification(`${successfulSyncs.length} elementos sincronizados`);
        }
    }
    
    async syncItem(item) {
        switch (item.type) {
            case 'project':
                return await this.syncProject(item);
            case 'export':
                return await this.syncExport(item);
            case 'userConfig':
                return await this.syncUserConfig(item);
            default:
                throw new Error(`Unknown sync type: ${item.type}`);
        }
    }
    
    async syncProject(item) {
        if (!window.hybridStorage) return;
        
        await window.hybridStorage.save(item.id, item.data, { type: 'project' });
        console.log('Project synced:', item.id);
    }
    
    // Métodos de almacenamiento offline
    async saveProjectOffline(projectData) {
        const transaction = this.db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        
        const project = {
            id: projectData.id || 'project_' + Date.now(),
            data: projectData,
            lastModified: new Date().toISOString(),
            type: 'project',
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };
        
        await store.put(project);
        
        // Añadir a cola de sincronización si estamos offline
        if (!this.isOnline) {
            this.syncQueue.push({
                type: 'project',
                id: project.id,
                data: projectData,
                timestamp: project.lastModified
            });
        }
        
        return project.id;
    }
    
    async loadProjectOffline(projectId) {
        const transaction = this.db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        
        return new Promise((resolve, reject) => {
            const request = store.get(projectId);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async listProjectsOffline() {
        const transaction = this.db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const projects = request.result.map(item => ({
                    id: item.id,
                    title: item.data.title || 'Sin título',
                    lastModified: item.lastModified,
                    syncStatus: item.syncStatus,
                    type: item.type
                }));
                resolve(projects);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    // Gestión de exportaciones offline
    async saveExportOffline(exportData, format) {
        const transaction = this.db.transaction(['exports'], 'readwrite');
        const store = transaction.objectStore('exports');
        
        const exportItem = {
            id: 'export_' + Date.now(),
            data: exportData,
            format: format,
            timestamp: new Date().toISOString(),
            size: new Blob([exportData]).size
        };
        
        await store.put(exportItem);
        
        // Crear cookie de ubicación para recuperación
        this.createLocationCookie(exportItem.id, 'export');
        
        return exportItem.id;
    }
    
    async getExportsOffline() {
        const transaction = this.db.transaction(['exports'], 'readonly');
        const store = transaction.objectStore('exports');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Sistema de cookies de ubicación
    createLocationCookie(itemId, type) {
        const locationData = {
            itemId,
            type,
            deviceId: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            environment: window.environmentDetector?.environment || 'unknown'
        };
        
        // Guardar en localStorage para persistencia
        const existingCookies = JSON.parse(localStorage.getItem('location_cookies') || '[]');
        existingCookies.push(locationData);
        
        // Mantener solo los últimos 100 cookies
        if (existingCookies.length > 100) {
            existingCookies.splice(0, existingCookies.length - 100);
        }
        
        localStorage.setItem('location_cookies', JSON.stringify(existingCookies));
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
    
    async recoverFromLocationCookies() {
        const cookies = JSON.parse(localStorage.getItem('location_cookies') || '[]');
        const recoveredItems = [];
        
        for (const cookie of cookies) {
            try {
                let item = null;
                
                if (cookie.type === 'project') {
                    item = await this.loadProjectOffline(cookie.itemId);
                } else if (cookie.type === 'export') {
                    const transaction = this.db.transaction(['exports'], 'readonly');
                    const store = transaction.objectStore('exports');
                    const request = store.get(cookie.itemId);
                    
                    item = await new Promise((resolve, reject) => {
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    });
                }
                
                if (item) {
                    recoveredItems.push({
                        ...cookie,
                        data: item
                    });
                }
            } catch (error) {
                console.warn('Error recovering item:', cookie.itemId, error);
            }
        }
        
        return recoveredItems;
    }
    
    // Gestión de capacidades offline
    updateOfflineCapabilities() {
        this.offlineCapabilities = {
            voiceNavigation: true,
            textEditing: true,
            templateSelection: true,
            localExport: true,
            projectSaving: true,
            imageProcessing: this.isOnline,
            cloudSync: this.isOnline,
            databaseAccess: this.isOnline && window.environmentDetector?.canUseDatabase()
        };
    }
    
    getCapability(capability) {
        return this.offlineCapabilities[capability] || false;
    }
    
    notifyCapabilityChange() {
        window.dispatchEvent(new CustomEvent('offlineCapabilityChange', {
            detail: {
                capabilities: this.offlineCapabilities,
                isOnline: this.isOnline
            }
        }));
    }
    
    // Utilidades
    async loadOfflineData() {
        try {
            const projects = await this.listProjectsOffline();
            console.log(`Loaded ${projects.length} offline projects`);
            
            const exports = await this.getExportsOffline();
            console.log(`Found ${exports.length} offline exports`);
            
        } catch (error) {
            console.warn('Error loading offline data:', error);
        }
    }
    
    async prepareOfflineMode() {
        // Guardar estado actual para recuperación posterior
        const currentState = {
            timestamp: new Date().toISOString(),
            activeSection: window.appState?.currentSection,
            userPreferences: {
                language: window.appState?.language,
                apiKeys: window.appState?.apiKeys
            }
        };
        
        localStorage.setItem('offline_state', JSON.stringify(currentState));
    }
    
    showSyncNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🔄</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Método para mostrar estado offline al usuario
    showOfflineStatus() {
        const statusElement = document.createElement('div');
        statusElement.className = 'offline-status';
        statusElement.innerHTML = `
            <div class="offline-status-content">
                <h3>📱 Modo Offline Activo</h3>
                <p>Funcionalidades disponibles:</p>
                <ul>
                    ${Object.entries(this.offlineCapabilities)
                        .filter(([_, available]) => available)
                        .map(([capability, _]) => `<li>✅ ${this.getCapabilityDisplayName(capability)}</li>`)
                        .join('')}
                </ul>
                <p>Funcionalidades limitadas:</p>
                <ul>
                    ${Object.entries(this.offlineCapabilities)
                        .filter(([_, available]) => !available)
                        .map(([capability, _]) => `<li>❌ ${this.getCapabilityDisplayName(capability)}</li>`)
                        .join('')}
                </ul>
                <small>Los datos se sincronizarán automáticamente al restaurar la conexión.</small>
            </div>
        `;
        
        return statusElement;
    }
    
    getCapabilityDisplayName(capability) {
        const names = {
            voiceNavigation: 'Navegación por voz',
            textEditing: 'Edición de texto',
            templateSelection: 'Selección de plantillas',
            localExport: 'Exportación local',
            projectSaving: 'Guardado de proyectos',
            imageProcessing: 'Procesamiento de imágenes',
            cloudSync: 'Sincronización en la nube',
            databaseAccess: 'Acceso a base de datos'
        };
        
        return names[capability] || capability;
    }
}

// CSS para notificaciones y estado offline
const offlineStyles = `
<style>
.sync-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease-out;
}

.offline-status {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10001;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
}

.offline-status h3 {
    margin: 0 0 15px 0;
    color: #333;
}

.offline-status ul {
    margin: 10px 0;
    padding-left: 20px;
}

.offline-status li {
    margin: 5px 0;
    font-size: 14px;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.environment-info {
    background: rgba(255,255,255,0.1);
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 10px;
    font-size: 12px;
}

.env-info-content {
    display: flex;
    align-items: center;
    gap: 6px;
    color: white;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', offlineStyles);

// Crear instancia global
window.offlineManager = new OfflineManager();

