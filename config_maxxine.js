// Configuración específica para maxxine.net/MundosdeYupi

const MAXXINE_CONFIG = {
    // Configuración de rutas base
    BASE_PATH: '/MundosdeYupi/',
    API_BASE_URL: 'https://maxxine.net/MundosdeYupi/api/',
    ASSETS_PATH: '/MundosdeYupi/assets/',
    
    // Configuración de almacenamiento
    STORAGE: {
        type: 'hybrid', // local + server
        serverEndpoint: 'https://maxxine.net/MundosdeYupi/api/storage/',
        localFallback: true
    },
    
    // Configuración de APIs externas
    EXTERNAL_APIS: {
        gemini: {
            enabled: true,
            proxy: 'https://maxxine.net/MundosdeYupi/api/proxy/gemini'
        },
        elevenlabs: {
            enabled: true,
            proxy: 'https://maxxine.net/MundosdeYupi/api/proxy/elevenlabs'
        }
    },
    
    // Configuración de caché
    CACHE: {
        enabled: true,
        maxSize: 50, // MB
        ttl: 3600000 // 1 hora en ms
    },
    
    // Configuración de funcionalidades
    FEATURES: {
        voiceNavigation: true,
        offlineMode: true,
        autoSave: true,
        cloudSync: true
    },
    
    // Configuración de entorno
    ENVIRONMENT: 'production',
    DEBUG: false,
    VERSION: '6.6.6-optimized'
};

// Aplicar configuración al objeto global
if (typeof window !== 'undefined') {
    window.MAXXINE_CONFIG = MAXXINE_CONFIG;
    
    // Actualizar rutas base en el sistema
    if (window.appState) {
        window.appState.basePath = MAXXINE_CONFIG.BASE_PATH;
        window.appState.apiBaseUrl = MAXXINE_CONFIG.API_BASE_URL;
    }
}

// Exportar para uso en Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MAXXINE_CONFIG;
}
