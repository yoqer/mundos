/**
 * Hybrid Storage System - Sistema de almacenamiento híbrido
 * Maneja automáticamente el almacenamiento entre base de datos, localStorage y caché
 */

class HybridStorage {
    constructor() {
        this.env = window.environmentDetector;
        this.cache = new Map();
        this.syncQueue = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Cargar datos del localStorage si existe
            this.loadFromLocalStorage();
            
            // Si estamos online y en entorno web, intentar sincronizar
            if (this.env.canUseDatabase()) {
                await this.syncWithDatabase();
            }
            
            this.isInitialized = true;
            console.log('Hybrid Storage initialized');
            
            // Configurar sincronización automática
            this.setupAutoSync();
            
        } catch (error) {
            console.warn('Error initializing hybrid storage:', error);
            this.isInitialized = true; // Continuar en modo offline
        }
    }
    
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('editorMundos_data');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
                console.log('Data loaded from localStorage');
            }
        } catch (error) {
            console.warn('Error loading from localStorage:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem('editorMundos_data', JSON.stringify(data));
            localStorage.setItem('editorMundos_lastSync', new Date().toISOString());
        } catch (error) {
            console.warn('Error saving to localStorage:', error);
        }
    }
    
    async syncWithDatabase() {
        if (!this.env.canUseDatabase()) {
            console.log('Database not available, skipping sync');
            return;
        }
        
        try {
            // Intentar obtener datos del servidor
            const response = await fetch(`${this.env.apiEndpoint}/sync`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.getAuthToken()
                }
            });
            
            if (response.ok) {
                const serverData = await response.json();
                this.mergeServerData(serverData);
                console.log('Data synced with database');
            }
        } catch (error) {
            console.warn('Database sync failed, using local data:', error);
            this.showSyncError();
        }
    }
    
    mergeServerData(serverData) {
        // Estrategia de merge: servidor gana en caso de conflicto
        // pero preserva datos locales más recientes
        Object.entries(serverData).forEach(([key, serverValue]) => {
            const localValue = this.cache.get(key);
            
            if (!localValue) {
                this.cache.set(key, serverValue);
            } else if (serverValue.lastModified > localValue.lastModified) {
                this.cache.set(key, serverValue);
            }
        });
    }
    
    setupAutoSync() {
        // Sincronizar cada 5 minutos si estamos online
        setInterval(() => {
            if (this.env.isOnline && this.env.canUseDatabase()) {
                this.syncWithDatabase();
            }
        }, 5 * 60 * 1000);
        
        // Sincronizar cuando se recupera la conexión
        window.addEventListener('environmentChange', (event) => {
            if (event.detail.isOnline && this.env.canUseDatabase()) {
                setTimeout(() => this.syncWithDatabase(), 1000);
            }
        });
    }
    
    // Métodos públicos para almacenamiento
    async save(key, data, options = {}) {
        const timestamp = new Date().toISOString();
        const item = {
            data,
            lastModified: timestamp,
            environment: this.env.environment,
            ...options
        };
        
        // Guardar en caché local
        this.cache.set(key, item);
        
        // Guardar en localStorage inmediatamente
        this.saveToLocalStorage();
        
        // Si estamos online, intentar guardar en base de datos
        if (this.env.canUseDatabase()) {
            try {
                await this.saveToDatabase(key, item);
            } catch (error) {
                console.warn('Failed to save to database, queued for later sync:', error);
                this.syncQueue.push({ action: 'save', key, item });
            }
        } else {
            // Agregar a cola de sincronización para cuando esté online
            this.syncQueue.push({ action: 'save', key, item });
        }
        
        return true;
    }
    
    async load(key) {
        // Primero intentar desde caché
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        // Si no está en caché y estamos online, intentar desde base de datos
        if (this.env.canUseDatabase()) {
            try {
                const item = await this.loadFromDatabase(key);
                if (item) {
                    this.cache.set(key, item);
                    return item;
                }
            } catch (error) {
                console.warn('Failed to load from database:', error);
            }
        }
        
        return null;
    }
    
    async delete(key) {
        // Eliminar del caché
        this.cache.delete(key);
        
        // Actualizar localStorage
        this.saveToLocalStorage();
        
        // Si estamos online, eliminar de base de datos
        if (this.env.canUseDatabase()) {
            try {
                await this.deleteFromDatabase(key);
            } catch (error) {
                console.warn('Failed to delete from database:', error);
                this.syncQueue.push({ action: 'delete', key });
            }
        } else {
            this.syncQueue.push({ action: 'delete', key });
        }
        
        return true;
    }
    
    async list(filter = {}) {
        const items = Array.from(this.cache.entries()).map(([key, value]) => ({
            key,
            ...value
        }));
        
        // Aplicar filtros si se especifican
        if (filter.type) {
            return items.filter(item => item.type === filter.type);
        }
        
        return items;
    }
    
    // Métodos de base de datos
    async saveToDatabase(key, item) {
        const response = await fetch(`${this.env.apiEndpoint}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.getAuthToken()
            },
            body: JSON.stringify({ key, item })
        });
        
        if (!response.ok) {
            throw new Error(`Database save failed: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    async loadFromDatabase(key) {
        const response = await fetch(`${this.env.apiEndpoint}/load/${key}`, {
            headers: {
                'Authorization': this.getAuthToken()
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        return null;
    }
    
    async deleteFromDatabase(key) {
        const response = await fetch(`${this.env.apiEndpoint}/delete/${key}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.getAuthToken()
            }
        });
        
        if (!response.ok) {
            throw new Error(`Database delete failed: ${response.statusText}`);
        }
    }
    
    getAuthToken() {
        return localStorage.getItem('auth_token') || 'anonymous';
    }
    
    showSyncError() {
        const notification = document.createElement('div');
        notification.className = 'sync-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-text">
                    Error de sincronización - Revisa tu conexión a internet
                </span>
                <button onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // Métodos de utilidad
    getStorageInfo() {
        return {
            environment: this.env.environment,
            isOnline: this.env.isOnline,
            canUseDatabase: this.env.canUseDatabase(),
            cacheSize: this.cache.size,
            syncQueueSize: this.syncQueue.length,
            lastSync: localStorage.getItem('editorMundos_lastSync')
        };
    }
    
    async exportData() {
        const data = Object.fromEntries(this.cache);
        const exportObj = {
            data,
            metadata: {
                exportDate: new Date().toISOString(),
                environment: this.env.environment,
                version: '6.0'
            }
        };
        
        return JSON.stringify(exportObj, null, 2);
    }
    
    async importData(jsonData) {
        try {
            const importObj = JSON.parse(jsonData);
            
            if (importObj.data) {
                Object.entries(importObj.data).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
                
                this.saveToLocalStorage();
                console.log('Data imported successfully');
                return true;
            }
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// CSS para notificaciones de error de sincronización
const syncErrorStyles = `
<style>
.sync-error-notification {
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
}

.sync-error-notification .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sync-error-notification button {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-left: auto;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', syncErrorStyles);

// Crear instancia global
window.hybridStorage = new HybridStorage();

