// Estado global de la aplicación
class EditorMundosState {
    constructor() {
        this.language = 'es'; // Idioma por defecto
        this.voiceCommands = {};
        this.directoryStructure = {};
        this.languageResponses = {};
        this.recognition = null;
        this.isListening = false;
        
        // Sistema híbrido de almacenamiento
        this.storage = null;
        this.environment = null;
        this.isInitialized = false;
        
        // Cache local (fallback)
        this.cache = {
            carloMaxxine: new Map(),
            genie3: new Map(),
            odyssey: new Map(),
            videos: new Map(),
            worlds: new Map(),
            avatars: new Map()
        };
        
        this.selectedItems = {
            videos: [],
            worlds: [],
            avatars: []
        };
        
        // Configuración de APIs adaptativa
        this.apiKeys = {
            gemini: localStorage.getItem("gemini_api_key") || ""
        };
        
        this.currentSection = "external-platforms";
        this.systemStatus = {
            connection: "Detectando...",
            cache: "Inicializando...",
            apis: "Configurando...",
            environment: "Desconocido"
        };
        
        // Inicializar sistema híbrido
        this.initializeHybridSystem();
    }

    async initializeHybridSystem() {
        try {
            // Esperar a que el detector de entorno esté listo
            if (window.environmentDetector) {
                this.environment = window.environmentDetector;
                this.updateStatus('environment', this.environment.environment);
                
                // Configurar almacenamiento híbrido
                if (window.hybridStorage) {
                    this.storage = window.hybridStorage;
                    await this.loadStoredData();
                }
                
                // Actualizar configuración según el entorno
                this.configureForEnvironment();
                
                this.isInitialized = true;
                this.updateStatus('connection', this.environment.isOnline ? 'Conectado' : 'Offline');
                this.updateStatus('cache', 'Activo');
                this.updateStatus('apis', this.environment.canUseDatabase() ? 'Listo' : 'Local');
                
                console.log('Editor de Mundos initialized for environment:', this.environment.environment);
            } else {
                // Fallback si no hay detector de entorno
                setTimeout(() => this.initializeHybridSystem(), 100);
            }
        } catch (error) {
            console.warn('Error initializing hybrid system:', error);
            this.fallbackInitialization();
        }
    }
    
    async loadStoredData() {
        if (!this.storage) return;
        
        try {
            // Cargar proyectos guardados
            const projects = await this.storage.list({ type: 'project' });
            if (projects.length > 0) {
                console.log(`Loaded ${projects.length} projects from storage`);
            }
            
            // Cargar configuraciones de usuario
            const userConfig = await this.storage.load('user_config');
            if (userConfig) {
                this.language = userConfig.data.language || this.language;
                this.apiKeys = { ...this.apiKeys, ...userConfig.data.apiKeys };
            }
            
        } catch (error) {
            console.warn('Error loading stored data:', error);
        }
    }
    
    configureForEnvironment() {
        const config = this.environment.getEnvironmentConfig();
        
        // Configurar límites según el entorno
        this.limits = config.limits || {
            maxFileSize: '10MB',
            maxProjects: 50
        };
        
        // Configurar funcionalidades disponibles
        this.features = config.features || {
            database: false,
            fileUpload: false,
            voiceNavigation: true,
            exportFunctions: true,
            cloudSync: false
        };
        
        // Mostrar información del entorno al usuario
        this.showEnvironmentInfo();
    }
    
    showEnvironmentInfo() {
        const envInfo = document.createElement('div');
        envInfo.className = 'environment-info';
        envInfo.innerHTML = `
            <div class="env-info-content">
                <span class="env-icon">${this.getEnvironmentIcon()}</span>
                <span class="env-text">
                    Modo: ${this.getEnvironmentDisplayName()} 
                    ${this.environment.isOnline ? '🌐' : '📱'}
                </span>
            </div>
        `;
        
        // Añadir al header
        const header = document.querySelector('.header');
        if (header && !header.querySelector('.environment-info')) {
            header.appendChild(envInfo);
        }
    }
    
    getEnvironmentIcon() {
        switch (this.environment.environment) {
            case 'codespaces': return '☁️';
            case 'local': return '💻';
            case 'production': return '🌐';
            case 'development': return '🔧';
            default: return '❓';
        }
    }
    
    getEnvironmentDisplayName() {
        switch (this.environment.environment) {
            case 'codespaces': return 'GitHub Codespaces';
            case 'local': return 'Local';
            case 'production': return 'Web';
            case 'development': return 'Desarrollo';
            default: return 'Desconocido';
        }
    }
    
    fallbackInitialization() {
        // Inicialización básica sin sistema híbrido
        this.isInitialized = true;
        this.updateStatus('connection', 'Local');
        this.updateStatus('cache', 'Básico');
        this.updateStatus('apis', 'Limitado');
        this.updateStatus('environment', 'Básico');
        console.log('Editor de Mundos initialized in fallback mode');
    }

    async saveProject(projectData) {
        if (this.storage && this.isInitialized) {
            try {
                const projectId = projectData.id || 'project_' + Date.now();
                await this.storage.save(projectId, projectData, { type: 'project' });
                this.showSaveNotification('Proyecto guardado exitosamente');
                return projectId;
            } catch (error) {
                console.warn('Error saving project:', error);
                this.showSaveNotification('Error al guardar - Revisa tu conexión', 'error');
                return null;
            }
        } else {
            // Fallback a localStorage
            const projectId = projectData.id || 'project_' + Date.now();
            localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
            this.showSaveNotification('Proyecto guardado localmente');
            return projectId;
        }
    }
    
    async loadProject(projectId) {
        if (this.storage && this.isInitialized) {
            try {
                const project = await this.storage.load(projectId);
                return project ? project.data : null;
            } catch (error) {
                console.warn('Error loading project:', error);
                return null;
            }
        } else {
            // Fallback a localStorage
            const stored = localStorage.getItem(`project_${projectId}`);
            return stored ? JSON.parse(stored) : null;
        }
    }
    
    showSaveNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `save-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    updateStatus(key, value) {
        this.systemStatus[key] = value;
        this.updateStatusDisplay();
    }

    updateStatusDisplay() {
        const connectionEl = document.getElementById("connection-status");
        const cacheEl = document.getElementById("cache-status");
        const apiEl = document.getElementById("api-status");
        
        if (connectionEl) connectionEl.textContent = this.systemStatus.connection;
        if (cacheEl) cacheEl.textContent = this.systemStatus.cache;
        if (apiEl) apiEl.textContent = this.systemStatus.apis;
    }
}

// Instancia global del estado
const appState = new EditorMundosState();

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", function() {
    initializeNavigation();
    initializeFileHandlers();
    loadInitialData();
    appState.updateStatusDisplay();
    loadPreferredLanguage();
    
    // Inicializar sistemas de voz con un pequeño retraso para asegurar carga completa
    setTimeout(() => {
        initializeVoiceNavigation();
        initializeCookieConsent();
    }, 1000);
});

// === NAVEGACIÓN ===
function initializeNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".content-section");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetSection = button.getAttribute("data-section");
            switchSection(targetSection);
        });
    });
}

function switchSection(sectionId) {
    // Actualizar botones de navegación
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");

    // Actualizar secciones de contenido
    document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    appState.currentSection = sectionId;
}

// === ANÁLISIS DE URLs ===
function analyzeURL() {
    const urlInput = document.getElementById("url-input");
    const resultsPanel = document.getElementById("url-results");
    const url = urlInput.value.trim();

    if (!url) {
        showError(resultsPanel, "Por favor ingresa una URL válida");
        return;
    }

    showLoading(resultsPanel);

    // Simular análisis de URL
    setTimeout(() => {
        const analysis = performURLAnalysis(url);
        displayURLAnalysis(resultsPanel, analysis);
    }, 1500);
}

function performURLAnalysis(url) {
    const analysis = {
        url: url,
        isValid: isValidURL(url),
        platform: detectPlatform(url),
        contentType: detectContentType(url),
        accessibility: checkAccessibility(url),
        recommendations: generateRecommendations(url)
    };

    return analysis;
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function detectPlatform(url) {
    const platforms = {
        "carlomaxxine.com": "Carlo Maxxine Saloon",
        "genie3.ai": "Genie3 AI",
        "trygenie3.net": "TryGenie3 Videos",
        "experience.odyssey.world": "Odyssey World",
        "youtube.com": "YouTube",
        "vimeo.com": "Vimeo",
        "sketchfab.com": "Sketchfab 3D"
    };

    for (const [domain, platform] of Object.entries(platforms)) {
        if (url.includes(domain)) {
            return platform;
        }
    }
    return "Plataforma Desconocida";
}

function detectContentType(url) {
    if (url.includes("video") || url.includes("watch") || url.includes(".mp4")) {
        return "Video";
    } else if (url.includes("3d") || url.includes("model") || url.includes(".obj") || url.includes(".gltf")) {
        return "Modelo 3D";
    } else if (url.includes("avatar") || url.includes(".vrm")) {
        return "Avatar";
    }
    return "Contenido Web";
}

function checkAccessibility(url) {
    // Simulación de verificación de accesibilidad
    const random = Math.random();
    if (random > 0.8) return "Excelente";
    if (random > 0.5) return "Buena";
    if (random > 0.2) return "Regular";
    return "Necesita Mejoras";
}

function generateRecommendations(url) {
    const recommendations = [];
    const platform = detectPlatform(url);

    if (platform === "Carlo Maxxine Saloon") {
        recommendations.push("Usar navegación con caché para mejor rendimiento");
        recommendations.push("Implementar captura automática de URL");
    } else if (platform === "Genie3 AI") {
        recommendations.push("Configurar selección de contenido automatizada");
        recommendations.push("Activar caché de resultados");
    } else if (platform === "TryGenie3 Videos") {
        recommendations.push("Optimizar carga de biblioteca de videos");
        recommendations.push("Implementar búsqueda avanzada");
    }

    return recommendations;
}

function displayURLAnalysis(container, analysis) {
    container.innerHTML = `
        <div class="analysis-result ${analysis.isValid ? "success" : "error"}">
            <h4>Análisis de URL</h4>
            <p><strong>URL:</strong> ${analysis.url}</p>
            <p><strong>Válida:</strong> ${analysis.isValid ? "Sí" : "No"}</p>
            <p><strong>Plataforma:</strong> ${analysis.platform}</p>
            <p><strong>Tipo de Contenido:</strong> ${analysis.contentType}</p>
            <p><strong>Accesibilidad:</strong> ${analysis.accessibility}</p>
            
            ${analysis.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h5>Recomendaciones:</h5>
                    <ul>
                        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}
        </div>
    `;
}

// === PLATAFORMAS EXTERNAS ===

// Carlo Maxxine
function navigateToCarloMaxxine() {
    const url = "https://carlomaxxine.com/saloon";
    appState.updateStatus("connection", "Navegando...");
    
    // Simular navegación
    setTimeout(() => {
        appState.cache.carloMaxxine.set("lastVisit", new Date().toISOString());
        appState.cache.carloMaxxine.set("currentURL", url);
        updateCarloCache();
        appState.updateStatus("connection", "Conectado");
        showSuccess("Navegación exitosa a Carlo Maxxine Saloon");
    }, 2000);
}

function captureCarloURL() {
    const currentURL = appState.cache.carloMaxxine.get("currentURL") || "https://carlomaxxine.com/saloon";
    const timestamp = new Date().toISOString();
    
    appState.cache.carloMaxxine.set("capturedURL", currentURL);
    appState.cache.carloMaxxine.set("captureTime", timestamp);
    
    updateCarloCache();
    showSuccess("URL capturada exitosamente");
}

function clearCarloCache() {
    appState.cache.carloMaxxine.clear();
    updateCarloCache();
    showSuccess("Caché de Carlo Maxxine limpiado");
}

function updateCarloCache() {
    const cacheDisplay = document.getElementById("carlo-cache");
    const cacheData = Object.fromEntries(appState.cache.carloMaxxine);
    
    cacheDisplay.innerHTML = `
        <h4>Caché de Carlo Maxxine</h4>
        <pre>${JSON.stringify(cacheData, null, 2)}</pre>
    `;
}

// Genie3.ai
function navigateToGenie3() {
    const url = "https://genie3.ai";
    appState.updateStatus("connection", "Navegando...");
    
    setTimeout(() => {
        appState.cache.genie3.set("lastVisit", new Date().toISOString());
        appState.cache.genie3.set("currentURL", url);
        updateGenie3Cache();
        appState.updateStatus("connection", "Conectado");
        showSuccess("Navegación exitosa a Genie3.ai");
    }, 2000);
}

function selectGenie3Content() {
    // Simular selección de contenido
    const mockContent = [
        { id: 1, type: "model", name: "Modelo 3D Futurista", url: "https://genie3.ai/model/1" },
        { id: 2, type: "texture", name: "Textura Metálica", url: "https://genie3.ai/texture/2" },
        { id: 3, type: "animation", name: "Animación de Vuelo", url: "https://genie3.ai/anim/3" }
    ];
    
    appState.cache.genie3.set("selectedContent", mockContent);
    appState.cache.genie3.set("selectionTime", new Date().toISOString());
    
    updateGenie3Cache();
    showSuccess("Contenido seleccionado de Genie3.ai");
}

function clearGenie3Cache() {
    appState.cache.genie3.clear();
    updateGenie3Cache();
    showSuccess("Caché de Genie3 limpiado");
}

function updateGenie3Cache() {
    const cacheDisplay = document.getElementById("genie3-cache");
    const cacheData = Object.fromEntries(appState.cache.genie3);
    
    cacheDisplay.innerHTML = `
        <h4>Caché de Genie3.ai</h4>
        <pre>${JSON.stringify(cacheData, null, 2)}</pre>
    `;
}

// Odyssey World
function navigateToOdyssey() {
    const url = "https://experience.odyssey.world";
    appState.updateStatus("connection", "Navegando...");
    
    setTimeout(() => {
        appState.cache.odyssey.set("lastVisit", new Date().toISOString());
        appState.cache.odyssey.set("currentURL", url);
        appState.cache.odyssey.set("currentChannel", "main");
        updateOdysseyStatus();
        appState.updateStatus("connection", "Conectado");
        showSuccess("Navegación exitosa a Odyssey World");
    }, 2000);
}

function controlOdysseyChannel() {
    const currentChannel = appState.cache.odyssey.get("currentChannel") || "main";
    const statusDisplay = document.getElementById("odyssey-status");
    
    statusDisplay.innerHTML = `
        <div class="channel-status success">
            <h4>Control de Canal Activo</h4>
            <p><strong>Canal Actual:</strong> ${currentChannel}</p>
            <p><strong>Estado:</strong> Controlando</p>
            <p><strong>Última Actualización:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
}

function switchOdysseyChannel() {
    const channelSelect = document.getElementById("odyssey-channel");
    const selectedChannel = channelSelect.value;
    
    appState.cache.odyssey.set("currentChannel", selectedChannel);
    appState.cache.odyssey.set("channelSwitchTime", new Date().toISOString());
    
    updateOdysseyStatus();
    showSuccess(`Canal cambiado a: ${selectedChannel}`);
}

function updateOdysseyStatus() {
    const statusDisplay = document.getElementById("odyssey-status");
    const currentChannel = appState.cache.odyssey.get("currentChannel") || "main";
    
    statusDisplay.innerHTML = `
        <div class="channel-status">
            <h4>Estado de Odyssey World</h4>
            <p><strong>Canal:</strong> ${currentChannel}</p>
            <p><strong>Estado:</strong> Conectado</p>
            <p><strong>Última Visita:</strong> ${appState.cache.odyssey.get("lastVisit") || "Nunca"}</p>
        </div>
    `;
}

// === SELECCIÓN DE VIDEOS ===
function navigateToTryGenie3() {
    appState.updateStatus("connection", "Navegando a TryGenie3...");
    
    setTimeout(() => {
        loadVideoLibrary();
        appState.updateStatus("connection", "Conectado");
        showSuccess("Navegación exitosa a TryGenie3.net");
    }, 1500);
}

function searchVideos() {
    const searchTerm = document.getElementById("video-search").value.trim();
    if (!searchTerm) {
        showError(document.getElementById("video-library"), "Ingresa un término de búsqueda");
        return;
    }
    
    showLoading(document.getElementById("video-library"));
    
    setTimeout(() => {
        const filteredVideos = mockVideoData.filter(video => 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        displayVideoLibrary(filteredVideos);
    }, 1000);
}

function loadVideoLibrary() {
    showLoading(document.getElementById("video-library"));
    
    setTimeout(() => {
        displayVideoLibrary(mockVideoData);
    }, 1500);
}

const mockVideoData = [
    { id: 1, title: "Mundo Futurista", duration: "2:30", tags: ["sci-fi", "3d"], thumbnail: "thumb1.jpg" },
    { id: 2, title: "Bosque Encantado", duration: "3:45", tags: ["fantasy", "nature"], thumbnail: "thumb2.jpg" },
    { id: 3, title: "Ciudad Cyberpunk", duration: "4:12", tags: ["cyberpunk", "urban"], thumbnail: "thumb3.jpg" },
    { id: 4, title: "Océano Profundo", duration: "5:20", tags: ["underwater", "mystery"], thumbnail: "thumb4.jpg" },
    { id: 5, title: "Estación Espacial", duration: "3:15", tags: ["space", "sci-fi"], thumbnail: "thumb5.jpg" }
];

function displayVideoLibrary(videos) {
    const videoLibrary = document.getElementById("video-library");
    
    videoLibrary.innerHTML = videos.map(video => `
        <div class="video-item" onclick="selectVideo(${video.id})">
            <div class="video-thumbnail">
                <div class="placeholder-thumb">${video.title.charAt(0)}</div>
            </div>
            <h4>${video.title}</h4>
            <p>Duración: ${video.duration}</p>
            <div class="video-tags">
                ${video.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
            </div>
        </div>
    `).join("");
}

function selectVideo(videoId) {
    const video = mockVideoData.find(v => v.id === videoId);
    if (!video) return;
    
    if (!appState.selectedItems.videos.find(v => v.id === videoId)) {
        appState.selectedItems.videos.push(video);
        updateSelectedVideos();
        showSuccess(`Video "${video.title}" seleccionado`);
    } else {
        showWarning("El video ya está seleccionado");
    }
}

function updateSelectedVideos() {
    const selectedContainer = document.getElementById("selected-videos");
    
    selectedContainer.innerHTML = appState.selectedItems.videos.map(video => `
        <div class="selected-video-item">
            <span>${video.title}</span>
            <button onclick="removeSelectedVideo(${video.id})" class="remove-btn">×</button>
        </div>
    `).join("");
}

function removeSelectedVideo(videoId) {
    appState.selectedItems.videos = appState.selectedItems.videos.filter(v => v.id !== videoId);
    updateSelectedVideos();
    showSuccess("Video removido de la selección");
}

function exportVideoSelection() {
    if (appState.selectedItems.videos.length === 0) {
        showWarning("No hay videos seleccionados para exportar");
        return;
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        videos: appState.selectedItems.videos,
        totalCount: appState.selectedItems.videos.length
    };
    
    downloadJSON(exportData, "video-selection.json");
    showSuccess("Selección de videos exportada");
}

// === MUNDOS 3D ===
function validateWorldURL() {
    const urlInput = document.getElementById("custom-world-url");
    const url = urlInput.value.trim();
    
    if (!url) {
        showError(urlInput.parentElement, "Ingresa una URL válida");
        return;
    }
    
    if (!isValidURL(url)) {
        showError(urlInput.parentElement, "La URL no es válida");
        return;
    }
    
    // Validar que sea una URL de mundo 3D
    const is3DWorld = url.includes("3d") || url.includes("world") || url.includes("scene") || 
                     url.includes(".gltf") || url.includes(".obj") || url.includes(".fbx");
    
    if (is3DWorld) {
        showSuccess("URL de mundo 3D válida");
        urlInput.classList.add("success");
    } else {
        showWarning("La URL podría no ser un mundo 3D válido");
        urlInput.classList.add("warning");
    }
}

function addCustomWorld() {
    const urlInput = document.getElementById("custom-world-url");
    const url = urlInput.value.trim();
    
    if (!url || !isValidURL(url)) {
        showError(urlInput.parentElement, "Ingresa una URL válida primero");
        return;
    }
    
    const newWorld = {
        id: Date.now(),
        name: `Mundo Personalizado ${appState.selectedItems.worlds.length + 1}`,
        url: url,
        type: "custom",
        addedAt: new Date().toISOString()
    };
    
    appState.selectedItems.worlds.push(newWorld);
    updateSelectedWorlds();
    showSuccess("Mundo personalizado añadido");
}

function updateSelectedWorlds() {
    const selectedContainer = document.getElementById("selected-worlds");
    
    selectedContainer.innerHTML = appState.selectedItems.worlds.map(world => `
        <div class="selected-world-item">
            <span>${world.name}</span>
            <button onclick="removeSelectedWorld(${world.id})" class="remove-btn">×</button>
        </div>
    `).join("");
}

function removeSelectedWorld(worldId) {
    appState.selectedItems.worlds = appState.selectedItems.worlds.filter(w => w.id !== worldId);
    updateSelectedWorlds();
    showSuccess("Mundo removido de la selección");
}

function exportWorldSelection() {
    if (appState.selectedItems.worlds.length === 0) {
        showWarning("No hay mundos seleccionados para exportar");
        return;
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        worlds: appState.selectedItems.worlds,
        totalCount: appState.selectedItems.worlds.length
    };
    
    downloadJSON(exportData, "world-selection.json");
    showSuccess("Selección de mundos exportada");
}

// === AVATARES ===
function loadAvatarLibrary() {
    showLoading(document.getElementById("avatar-library"));
    
    setTimeout(() => {
        displayAvatarLibrary(mockAvatarData);
    }, 1500);
}

const mockAvatarData = [
    { id: 1, name: "Avatar Sci-Fi", source: "ReadyPlayerMe", tags: ["sci-fi", "robot"], thumbnail: "avatar1.jpg" },
    { id: 2, name: "Avatar Fantasía", source: "Custom", tags: ["fantasy", "elf"], thumbnail: "avatar2.jpg" },
    { id: 3, name: "Avatar Cyberpunk", source: "Uploaded", tags: ["cyberpunk", "hacker"], thumbnail: "avatar3.jpg" }
];

function displayAvatarLibrary(avatars) {
    const avatarLibrary = document.getElementById("avatar-library");
    
    avatarLibrary.innerHTML = avatars.map(avatar => `
        <div class="avatar-item" onclick="selectAvatar(${avatar.id})">
            <div class="avatar-thumbnail">
                <div class="placeholder-thumb">${avatar.name.charAt(0)}</div>
            </div>
            <h4>${avatar.name}</h4>
            <p>Fuente: ${avatar.source}</p>
            <div class="avatar-tags">
                ${avatar.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
            </div>
        </div>
    `).join("");
}

function selectAvatar(avatarId) {
    const avatar = mockAvatarData.find(a => a.id === avatarId);
    if (!avatar) return;
    
    if (!appState.selectedItems.avatars.find(a => a.id === avatarId)) {
        appState.selectedItems.avatars.push(avatar);
        updateSelectedAvatars();
        showSuccess(`Avatar "${avatar.name}" seleccionado`);
    } else {
        showWarning("El avatar ya está seleccionado");
    }
}

function updateSelectedAvatars() {
    const selectedContainer = document.getElementById("selected-avatars");
    
    selectedContainer.innerHTML = appState.selectedItems.avatars.map(avatar => `
        <div class="selected-avatar-item">
            <span>${avatar.name}</span>
            <button onclick="removeSelectedAvatar(${avatar.id})" class="remove-btn">×</button>
        </div>
    `).join("");
}

function removeSelectedAvatar(avatarId) {
    appState.selectedItems.avatars = appState.selectedItems.avatars.filter(a => a.id !== avatarId);
    updateSelectedAvatars();
    showSuccess("Avatar removido de la selección");
}

function customizeAvatar() {
    const selectedAvatar = appState.selectedItems.avatars[0];
    if (!selectedAvatar) {
        showWarning("Selecciona un avatar para personalizar");
        return;
    }
    
    // Simular apertura de personalizador
    showSuccess(`Abriendo personalizador para ${selectedAvatar.name}`);
}

// === UTILIDADES ===
function showLoading(element) {
    element.innerHTML = 
        `<div class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>`;
}

function showError(element, message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    
    if (element.parentElement) {
        element.parentElement.insertBefore(errorElement, element.nextSibling);
    } else {
        element.innerHTML = "";
        element.appendChild(errorElement);
    }
    
    setTimeout(() => errorElement.remove(), 5000);
}

function showSuccess(message) {
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    document.body.appendChild(successElement);
    
    setTimeout(() => successElement.remove(), 3000);
}

function showWarning(message) {
    const warningElement = document.createElement("div");
    warningElement.className = "warning-message";
    warningElement.textContent = message;
    document.body.appendChild(warningElement);
    
    setTimeout(() => warningElement.remove(), 4000);
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// === MANEJO DE ARCHIVOS ===
function initializeFileHandlers() {
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("change", handleFileUpload);
}

function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const content = e.target.result;
        // Aquí puedes procesar el contenido del archivo
        showSuccess(`Archivo "${file.name}" cargado exitosamente`);
        // Por ejemplo, mostrarlo en un área de texto
        const contentArea = document.getElementById("file-content-display");
        if (contentArea) {
            contentArea.textContent = content;
        }
    };
    
    reader.readAsText(file);
}

function loadInitialData() {
    // Cargar datos iniciales si es necesario
    // Por ejemplo, cargar configuraciones guardadas o datos de la API
}

function openHelpPage() {
    window.open("https://editormundos.com/ayuda", "_blank");
}




// === INICIALIZACIÓN DE MÓDULOS ADICIONALES ===

// Integración con sistemas de navegación por voz
function initializeVoiceNavigation() {
    // Los scripts ya están cargados desde HTML
    // Inicializar integración con el sistema principal
    if (typeof voiceNavigationSystem !== 'undefined') {
        // Configurar integración con switchSection
        window.switchSection = switchSection;
        
        // Configurar cambio de idioma
        voiceNavigationSystem.changeLanguage(appState.language);
        
        console.log("Sistema de navegación por voz integrado correctamente");
    } else {
        console.warn("Sistema de navegación por voz no disponible");
    }
}

// Integración con sistema de consentimiento de cookies
function initializeCookieConsent() {
    // Los scripts ya están cargados desde HTML
    // Configurar integración con el sistema principal
    if (typeof voiceCookieConsent !== 'undefined') {
        // Configurar idioma
        voiceCookieConsent.changeLanguage(appState.language);
        
        console.log("Sistema de consentimiento de cookies integrado correctamente");
    } else {
        console.warn("Sistema de consentimiento de cookies no disponible");
    }
}

// Función para cambiar idioma globalmente
function changeGlobalLanguage(languageCode) {
    appState.language = languageCode;
    
    // Actualizar sistemas de voz
    if (typeof voiceNavigationSystem !== 'undefined') {
        voiceNavigationSystem.changeLanguage(languageCode);
    }
    
    if (typeof voiceCookieConsent !== 'undefined') {
        voiceCookieConsent.changeLanguage(languageCode);
    }
    
    // Guardar preferencia
    localStorage.setItem('preferred_language', languageCode);
    
    console.log(`Idioma cambiado a: ${languageCode}`);
}

// Cargar idioma preferido al inicializar
function loadPreferredLanguage() {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage) {
        changeGlobalLanguage(savedLanguage);
    }
}

// Función para obtener estado de sistemas de voz
function getVoiceSystemsStatus() {
    return {
        navigation: typeof voiceNavigationSystem !== 'undefined' && voiceNavigationSystem.voiceEnabled,
        cookies: typeof voiceCookieConsent !== 'undefined' && voiceCookieConsent.voiceEnabled,
        language: appState.language
    };
}




// === FUNCIONES DE PLANTILLAS Y PORTADAS ===

// Funciones para el editor de portadas
function updateCoverPreview() {
    const title = document.getElementById('cover-title').value || 'Título del Libro';
    const author = document.getElementById('cover-author').value || 'Autor';
    const publisher = document.getElementById('cover-publisher').value || 'Editorial WC';
    
    const coverCanvas = document.getElementById('cover-canvas');
    if (coverCanvas) {
        const titleElement = coverCanvas.querySelector('.cover-title');
        const authorElement = coverCanvas.querySelector('.cover-author');
        const publisherElement = coverCanvas.querySelector('.cover-publisher');
        
        if (titleElement) titleElement.textContent = title;
        if (authorElement) authorElement.textContent = author;
        if (publisherElement) publisherElement.textContent = publisher;
    }
}

function applyCoverStyle() {
    const style = document.getElementById('cover-style').value;
    const coverCanvas = document.getElementById('cover-canvas');
    
    if (!coverCanvas) return;
    
    // Remover clases de estilo anteriores
    coverCanvas.className = 'cover-canvas';
    
    // Aplicar nuevo estilo
    switch(style) {
        case 'classic':
            coverCanvas.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
            coverCanvas.style.color = '#ecf0f1';
            coverCanvas.style.fontFamily = 'Georgia, serif';
            break;
        case 'modern':
            coverCanvas.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
            coverCanvas.style.color = '#ffffff';
            coverCanvas.style.fontFamily = 'Arial, sans-serif';
            break;
        case 'minimalist':
            coverCanvas.style.background = '#ffffff';
            coverCanvas.style.color = '#2c3e50';
            coverCanvas.style.fontFamily = 'Helvetica, sans-serif';
            coverCanvas.style.border = '2px solid #bdc3c7';
            break;
        case 'artistic':
            coverCanvas.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
            coverCanvas.style.color = '#ffffff';
            coverCanvas.style.fontFamily = 'Impact, sans-serif';
            break;
    }
}

function updateCoverBackground() {
    const fileInput = document.getElementById('cover-background');
    const coverCanvas = document.getElementById('cover-canvas');
    
    if (fileInput.files && fileInput.files[0] && coverCanvas) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverCanvas.style.backgroundImage = `url(${e.target.result})`;
            coverCanvas.style.backgroundSize = 'cover';
            coverCanvas.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Funciones para el editor de texto
function changeFont() {
    const fontFamily = document.getElementById('font-family').value;
    const textContent = document.getElementById('text-content');
    
    if (textContent) {
        textContent.style.fontFamily = fontFamily;
    }
}

function changeFontSize() {
    const fontSize = document.getElementById('font-size').value;
    const textContent = document.getElementById('text-content');
    
    if (textContent) {
        textContent.style.fontSize = fontSize + 'pt';
    }
}

function changeLineSpacing() {
    const lineSpacing = document.getElementById('line-spacing').value;
    const textContent = document.getElementById('text-content');
    
    if (textContent) {
        textContent.style.lineHeight = lineSpacing;
    }
}

// Funciones para el editor de maquetación
function updatePageFormat() {
    const format = document.getElementById('page-format').value;
    const layoutContainer = document.querySelector('.layout-container');
    
    if (!layoutContainer) return;
    
    // Aplicar dimensiones según el formato
    switch(format) {
        case 'a4':
            layoutContainer.style.width = '210mm';
            layoutContainer.style.height = '297mm';
            break;
        case 'a5':
            layoutContainer.style.width = '148mm';
            layoutContainer.style.height = '210mm';
            break;
        case 'letter':
            layoutContainer.style.width = '216mm';
            layoutContainer.style.height = '279mm';
            break;
        case 'legal':
            layoutContainer.style.width = '216mm';
            layoutContainer.style.height = '356mm';
            break;
        case 'custom':
            // Permitir dimensiones personalizadas
            break;
    }
    
    updateLayoutPreview();
}

function updatePageOrientation() {
    const orientation = document.getElementById('page-orientation').value;
    const layoutContainer = document.querySelector('.layout-container');
    
    if (!layoutContainer) return;
    
    if (orientation === 'landscape') {
        const currentWidth = layoutContainer.style.width;
        const currentHeight = layoutContainer.style.height;
        layoutContainer.style.width = currentHeight;
        layoutContainer.style.height = currentWidth;
    }
    
    updateLayoutPreview();
}

function updateContentStart() {
    const contentStart = document.getElementById('content-start').value;
    const layoutContainer = document.querySelector('.layout-container');
    
    if (!layoutContainer) return;
    
    // Aplicar configuración de inicio de contenido
    layoutContainer.setAttribute('data-content-start', contentStart);
    updateLayoutPreview();
}

function updateLayoutPreview() {
    // Actualizar vista previa de la maquetación
    const layoutContainer = document.querySelector('.layout-container');
    if (layoutContainer) {
        // Aplicar cambios visuales para mostrar el formato
        layoutContainer.classList.add('preview-mode');
    }
}

// Funciones de formato de texto
function formatText(command) {
    document.execCommand(command, false, null);
    const textContent = document.getElementById('text-content');
    if (textContent) {
        textContent.focus();
    }
}

function alignText(alignment) {
    const alignmentMap = {
        'left': 'justifyLeft',
        'center': 'justifyCenter',
        'right': 'justifyRight',
        'justify': 'justifyFull'
    };
    
    if (alignmentMap[alignment]) {
        document.execCommand(alignmentMap[alignment], false, null);
    }
}

// Funciones de utilidad para plantillas
function selectFormat(format) {
    // Cambiar entre editores
    const sections = document.querySelectorAll('.editor-section');
    sections.forEach(section => section.classList.remove('active'));
    
    switch(format) {
        case 'cover':
            document.getElementById('cover-editor').classList.add('active');
            break;
        case 'text':
            document.getElementById('text-editor').classList.add('active');
            break;
        case 'layout':
            document.getElementById('layout-editor').classList.add('active');
            break;
    }
}

// Inicializar plantillas al cargar la página
function initializeTemplates() {
    // Inicializar valores por defecto
    updateCoverPreview();
    applyCoverStyle();
    
    // Configurar eventos de los selectores
    const coverStyleSelect = document.getElementById('cover-style');
    if (coverStyleSelect) {
        coverStyleSelect.addEventListener('change', applyCoverStyle);
    }
    
    const pageFormatSelect = document.getElementById('page-format');
    if (pageFormatSelect) {
        pageFormatSelect.addEventListener('change', updatePageFormat);
    }
    
    const pageOrientationSelect = document.getElementById('page-orientation');
    if (pageOrientationSelect) {
        pageOrientationSelect.addEventListener('change', updatePageOrientation);
    }
    
    const contentStartSelect = document.getElementById('content-start');
    if (contentStartSelect) {
        contentStartSelect.addEventListener('change', updateContentStart);
    }
}

// Añadir inicialización de plantillas al DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    // ... código existente ...
    
    // Inicializar plantillas
    setTimeout(() => {
        initializeTemplates();
    }, 500);
});

