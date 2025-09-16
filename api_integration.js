/**
 * API Integration Module - Navegación entre editores y servicios externos
 * Proporciona funcionalidades para comunicación entre Editor de Mundos y Editor Word General
 * Incluye integración con Lupaupscaler y otros servicios
 */

class APIIntegrationManager {
    constructor() {
        this.apiEndpoints = {
            wordEditor: './api/word-editor.php',
            lupaupscaler: 'https://app.lupaupscaler.com',
            imageUpload: './api/upload.php',
            documentSync: './api/sync.php',
            userPreferences: './api/preferences.php',
            // Endpoints alternativos para hosting sin PHP
            staticFallback: {
                wordEditor: './data/word-editor.json',
                documentSync: './data/sync.json',
                userPreferences: './data/preferences.json'
            }
        };
        this.authToken = null;
        this.currentContext = null;
        this.isConnected = false;
    }

    // Inicialización del sistema de API
    async initialize() {
        try {
            await this.loadCredentials();
            await this.establishConnection();
            this.setupEventListeners();
            console.log('API Integration Manager inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar API Integration Manager:', error);
            return false;
        }
    }

    // Cargar credenciales desde la carpeta private
    async loadCredentials() {
        try {
            // Para hosting HTTP común, usar credenciales locales o variables de entorno
            const credentials = {
                editor_token: localStorage.getItem('editor_token') || null,
                lupaupscaler_key: localStorage.getItem('lupaupscaler_key') || null,
                gemini_key: localStorage.getItem('gemini_api_key') || null
            };
            
            this.authToken = credentials.editor_token;
            
            // Si no hay credenciales locales, mostrar mensaje informativo
            if (!this.authToken) {
                console.warn('No hay token de autenticación disponible');
            }
            
            return credentials;
        } catch (error) {
            console.warn('No se pudieron cargar las credenciales de API:', error);
        }
        return null;
    }

    // Establecer conexión con el Editor Word General
    async establishConnection() {
        if (!this.authToken) {
            console.warn('No hay token de autenticación disponible');
            return false;
        }

        try {
            const response = await fetch(this.apiEndpoints.wordEditor + '/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    editor: 'mundos',
                    version: '6.0',
                    capabilities: ['voice', 'covers', 'layout', 'multimedia']
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.isConnected = true;
                console.log('Conexión establecida con Editor Word General:', result);
                return true;
            }
        } catch (error) {
            console.warn('No se pudo conectar con Editor Word General:', error);
        }
        
        this.isConnected = false;
        return false;
    }

    // Configurar event listeners para comunicación
    setupEventListeners() {
        // Escuchar mensajes del Editor Word General
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'WORD_EDITOR_REQUEST') {
                this.handleWordEditorRequest(event.data);
            }
        });

        // Escuchar cambios en el documento actual
        document.addEventListener('documentChanged', (event) => {
            this.syncDocumentState(event.detail);
        });
    }

    // Manejar solicitudes del Editor Word General
    async handleWordEditorRequest(request) {
        switch (request.action) {
            case 'CREATE_COVER':
                await this.handleCreateCoverRequest(request.data);
                break;
            case 'LAYOUT_DOCUMENT':
                await this.handleLayoutRequest(request.data);
                break;
            case 'ENHANCE_IMAGE':
                await this.handleImageEnhancementRequest(request.data);
                break;
            case 'GET_TEMPLATES':
                await this.handleGetTemplatesRequest(request.data);
                break;
            default:
                console.warn('Acción no reconocida:', request.action);
        }
    }

    // Crear portada desde solicitud externa
    async handleCreateCoverRequest(data) {
        try {
            // Cambiar a la sección de edición
            this.switchToSection('book-editor');
            
            // Seleccionar formato de portada
            this.selectFormat('cover');
            
            // Aplicar datos recibidos
            if (data.title) {
                document.getElementById('cover-title').value = data.title;
            }
            if (data.author) {
                document.getElementById('cover-author').value = data.author;
            }
            if (data.publisher) {
                document.getElementById('cover-publisher').value = data.publisher;
            }
            
            // Aplicar plantilla si se especifica
            if (data.template && window.coverTemplateManager) {
                window.coverTemplateManager.selectTemplate(data.template);
            }
            
            // Actualizar vista previa
            updateCoverPreview();
            
            // Notificar al Editor Word General
            this.sendResponse('CREATE_COVER', {
                success: true,
                message: 'Portada creada exitosamente'
            });
            
        } catch (error) {
            console.error('Error al crear portada:', error);
            this.sendResponse('CREATE_COVER', {
                success: false,
                error: error.message
            });
        }
    }

    // Manejar solicitud de maquetación
    async handleLayoutRequest(data) {
        try {
            // Cambiar a la sección de maquetación
            this.switchToSection('book-editor');
            this.selectFormat('layout');
            
            // Aplicar configuraciones de maquetación
            if (data.template && window.layoutTemplateManager) {
                window.layoutTemplateManager.selectTemplate(data.template);
            }
            
            if (data.pageFormat) {
                document.getElementById('page-format').value = data.pageFormat;
                updatePageFormat();
            }
            
            if (data.margins) {
                Object.keys(data.margins).forEach(key => {
                    const input = document.getElementById(`margin-${key}`);
                    if (input) input.value = data.margins[key];
                });
            }
            
            // Generar vista previa
            if (window.layoutTemplateManager) {
                window.layoutTemplateManager.generatePreview();
            }
            
            this.sendResponse('LAYOUT_DOCUMENT', {
                success: true,
                message: 'Maquetación aplicada exitosamente'
            });
            
        } catch (error) {
            console.error('Error en maquetación:', error);
            this.sendResponse('LAYOUT_DOCUMENT', {
                success: false,
                error: error.message
            });
        }
    }

    // Manejar mejora de imágenes con Lupaupscaler
    async handleImageEnhancementRequest(data) {
        try {
            if (!data.imageUrl && !data.imageData) {
                throw new Error('No se proporcionó imagen para mejorar');
            }
            
            // Abrir Lupaupscaler en nueva ventana/pestaña
            const lupaWindow = window.open(
                this.apiEndpoints.lupaupscaler,
                'lupaupscaler',
                'width=1200,height=800,scrollbars=yes,resizable=yes'
            );
            
            // Intentar cargar la imagen automáticamente si la API lo permite
            if (data.imageData) {
                // Guardar imagen temporalmente para Lupaupscaler
                const tempImageUrl = await this.uploadTempImage(data.imageData);
                
                // Enviar mensaje a Lupaupscaler (si soporta comunicación)
                setTimeout(() => {
                    if (lupaWindow && !lupaWindow.closed) {
                        lupaWindow.postMessage({
                            type: 'LOAD_IMAGE',
                            imageUrl: tempImageUrl
                        }, this.apiEndpoints.lupaupscaler);
                    }
                }, 2000);
            }
            
            // Configurar listener para imagen mejorada
            this.setupLupaupscalerListener(data.callback);
            
            this.sendResponse('ENHANCE_IMAGE', {
                success: true,
                message: 'Lupaupscaler abierto para mejora de imagen'
            });
            
        } catch (error) {
            console.error('Error al abrir Lupaupscaler:', error);
            this.sendResponse('ENHANCE_IMAGE', {
                success: false,
                error: error.message
            });
        }
    }

    // Configurar listener para imagen mejorada de Lupaupscaler
    setupLupaupscalerListener(callback) {
        const listener = (event) => {
            if (event.origin !== this.apiEndpoints.lupaupscaler) return;
            
            if (event.data.type === 'IMAGE_ENHANCED') {
                // Procesar imagen mejorada
                this.processEnhancedImage(event.data.imageUrl, callback);
                window.removeEventListener('message', listener);
            }
        };
        
        window.addEventListener('message', listener);
        
        // Remover listener después de 10 minutos
        setTimeout(() => {
            window.removeEventListener('message', listener);
        }, 600000);
    }

    // Procesar imagen mejorada
    async processEnhancedImage(imageUrl, callback) {
        try {
            // Descargar imagen mejorada
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const enhancedImageData = await this.blobToDataURL(blob);
            
            // Aplicar imagen mejorada al editor
            if (callback) {
                callback(enhancedImageData);
            } else {
                // Aplicar a la imagen de fondo de portada por defecto
                if (window.coverTemplateManager) {
                    window.coverTemplateManager.updateCoverElement('backgroundImage', enhancedImageData);
                }
            }
            
            this.showNotification('Imagen mejorada aplicada exitosamente', 'success');
            
        } catch (error) {
            console.error('Error al procesar imagen mejorada:', error);
            this.showNotification('Error al procesar imagen mejorada', 'error');
        }
    }

    // Subir imagen temporal
    async uploadTempImage(imageData) {
        try {
            const response = await fetch(this.apiEndpoints.imageUpload, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    image: imageData,
                    temporary: true,
                    expires: 3600 // 1 hora
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.url;
            }
        } catch (error) {
            console.error('Error al subir imagen temporal:', error);
        }
        
        return null;
    }

    // Obtener plantillas disponibles
    async handleGetTemplatesRequest(data) {
        try {
            const templates = {
                cover: window.coverTemplateManager ? 
                       window.coverTemplateManager.getTemplatesList() : [],
                layout: window.layoutTemplateManager ? 
                        window.layoutTemplateManager.getTemplatesList() : []
            };
            
            this.sendResponse('GET_TEMPLATES', {
                success: true,
                templates: templates
            });
            
        } catch (error) {
            console.error('Error al obtener plantillas:', error);
            this.sendResponse('GET_TEMPLATES', {
                success: false,
                error: error.message
            });
        }
    }

    // Enviar respuesta al Editor Word General
    sendResponse(action, data) {
        if (this.isConnected) {
            window.parent.postMessage({
                type: 'MUNDOS_EDITOR_RESPONSE',
                action: action,
                data: data,
                timestamp: Date.now()
            }, '*');
        }
    }

    // Sincronizar estado del documento
    async syncDocumentState(documentData) {
        if (!this.isConnected) return;
        
        try {
            const response = await fetch(this.apiEndpoints.documentSync, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    editor: 'mundos',
                    document: documentData,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                console.log('Estado del documento sincronizado');
            }
        } catch (error) {
            console.warn('Error al sincronizar estado del documento:', error);
        }
    }

    // Funciones de utilidad
    switchToSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) {
            section.click();
        }
    }

    selectFormat(format) {
        const formatBtn = document.querySelector(`[onclick="selectFormat('${format}')"]`);
        if (formatBtn) {
            formatBtn.click();
        }
    }

    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `api-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1002;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // API pública para uso desde otros módulos
    async enhanceImageWithLupaupscaler(imageData, callback) {
        return this.handleImageEnhancementRequest({
            imageData: imageData,
            callback: callback
        });
    }

    async requestWordEditorFunction(action, data) {
        if (!this.isConnected) {
            this.showNotification('No hay conexión con Editor Word General', 'error');
            return false;
        }
        
        window.parent.postMessage({
            type: 'MUNDOS_EDITOR_REQUEST',
            action: action,
            data: data,
            timestamp: Date.now()
        }, '*');
        
        return true;
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            hasToken: !!this.authToken,
            endpoints: this.apiEndpoints
        };
    }
}

// Funciones globales para integración con la interfaz
function initializeAPIIntegration() {
    window.apiIntegrationManager = new APIIntegrationManager();
    window.apiIntegrationManager.initialize();
    
    // Añadir botones de integración a la interfaz
    addAPIIntegrationButtons();
}

function addAPIIntegrationButtons() {
    // Añadir botón de Lupaupscaler al menú de imágenes
    addLupaupscalerButton();
    
    // Añadir indicador de conexión
    addConnectionIndicator();
    
    // Añadir controles de API
    addAPIControls();
}

function addLupaupscalerButton() {
    // Buscar el menú de generación de imágenes
    const imageMenu = document.querySelector('.image-generation-menu');
    if (imageMenu) {
        const lupaButton = document.createElement('button');
        lupaButton.className = 'image-option-btn lupaupscaler-btn';
        lupaButton.innerHTML = '🔍 Mejorar Imagen (Lupaupscaler)';
        lupaButton.onclick = openLupaupscalerForCurrentImage;
        
        imageMenu.appendChild(lupaButton);
    }
    
    // También añadir a los controles de portada
    const coverControls = document.querySelector('.cover-controls');
    if (coverControls) {
        const lupaGroup = document.createElement('div');
        lupaGroup.className = 'control-group';
        lupaGroup.innerHTML = `
            <label>Mejora de imagen:</label>
            <button onclick="enhanceCurrentCoverImage()" class="lupaupscaler-btn">
                🔍 Mejorar con Lupaupscaler
            </button>
        `;
        
        coverControls.appendChild(lupaGroup);
    }
}

function addConnectionIndicator() {
    const header = document.querySelector('.header');
    if (header) {
        const indicator = document.createElement('div');
        indicator.id = 'api-connection-indicator';
        indicator.className = 'connection-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            background: #6c757d;
            color: white;
        `;
        indicator.textContent = 'API: Desconectado';
        
        header.style.position = 'relative';
        header.appendChild(indicator);
        
        // Actualizar estado cada 30 segundos
        setInterval(updateConnectionIndicator, 30000);
        updateConnectionIndicator();
    }
}

function updateConnectionIndicator() {
    const indicator = document.getElementById('api-connection-indicator');
    if (indicator && window.apiIntegrationManager) {
        const status = window.apiIntegrationManager.getConnectionStatus();
        
        if (status.connected) {
            indicator.style.background = '#28a745';
            indicator.textContent = 'API: Conectado';
        } else {
            indicator.style.background = '#6c757d';
            indicator.textContent = 'API: Desconectado';
        }
    }
}

function addAPIControls() {
    // Añadir sección de controles API en configuración
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
        const apiControls = document.createElement('div');
        apiControls.className = 'api-controls-section';
        apiControls.innerHTML = `
            <h4>Integración API</h4>
            <div class="api-control-group">
                <button onclick="testAPIConnection()" class="api-btn">Probar Conexión</button>
                <button onclick="syncWithWordEditor()" class="api-btn">Sincronizar con Editor Word</button>
                <button onclick="showAPIStatus()" class="api-btn">Estado de API</button>
            </div>
        `;
        
        settingsSection.appendChild(apiControls);
    }
}

// Funciones de callback para la interfaz
function openLupaupscalerForCurrentImage() {
    // Obtener imagen actual del editor
    const currentImage = getCurrentEditorImage();
    if (currentImage && window.apiIntegrationManager) {
        window.apiIntegrationManager.enhanceImageWithLupaupscaler(
            currentImage,
            (enhancedImage) => {
                // Aplicar imagen mejorada
                applyEnhancedImageToEditor(enhancedImage);
            }
        );
    } else {
        alert('No hay imagen seleccionada para mejorar');
    }
}

function enhanceCurrentCoverImage() {
    const coverBackground = document.getElementById('cover-background');
    if (coverBackground && coverBackground.files && coverBackground.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (window.apiIntegrationManager) {
                window.apiIntegrationManager.enhanceImageWithLupaupscaler(
                    e.target.result,
                    (enhancedImage) => {
                        // Aplicar imagen mejorada a la portada
                        if (window.coverTemplateManager) {
                            window.coverTemplateManager.updateCoverElement('backgroundImage', enhancedImage);
                        }
                    }
                );
            }
        };
        reader.readAsDataURL(coverBackground.files[0]);
    } else {
        alert('No hay imagen de fondo en la portada para mejorar');
    }
}

function getCurrentEditorImage() {
    // Implementar lógica para obtener imagen actual del editor
    // Esto dependerá de cómo esté estructurado el editor
    return null;
}

function applyEnhancedImageToEditor(enhancedImage) {
    // Implementar lógica para aplicar imagen mejorada al editor
    console.log('Aplicando imagen mejorada:', enhancedImage);
}

function testAPIConnection() {
    if (window.apiIntegrationManager) {
        window.apiIntegrationManager.establishConnection().then(connected => {
            const message = connected ? 
                'Conexión API establecida exitosamente' : 
                'No se pudo establecer conexión API';
            const type = connected ? 'success' : 'error';
            
            window.apiIntegrationManager.showNotification(message, type);
            updateConnectionIndicator();
        });
    }
}

function syncWithWordEditor() {
    if (window.apiIntegrationManager) {
        const documentData = {
            title: document.getElementById('cover-title')?.value || '',
            author: document.getElementById('cover-author')?.value || '',
            content: document.getElementById('text-content')?.innerHTML || '',
            timestamp: Date.now()
        };
        
        window.apiIntegrationManager.syncDocumentState(documentData);
        window.apiIntegrationManager.showNotification('Sincronización iniciada', 'info');
    }
}

function showAPIStatus() {
    if (window.apiIntegrationManager) {
        const status = window.apiIntegrationManager.getConnectionStatus();
        
        const modal = document.createElement('div');
        modal.className = 'api-status-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
        `;
        
        modalContent.innerHTML = `
            <h3>Estado de API</h3>
            <div class="status-info">
                <p><strong>Conexión:</strong> ${status.connected ? '✅ Conectado' : '❌ Desconectado'}</p>
                <p><strong>Token:</strong> ${status.hasToken ? '✅ Disponible' : '❌ No disponible'}</p>
                <p><strong>Endpoints:</strong></p>
                <ul>
                    ${Object.entries(status.endpoints).map(([key, url]) => 
                        `<li><strong>${key}:</strong> ${url}</li>`
                    ).join('')}
                </ul>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="this.closest('.api-status-modal').remove()">Cerrar</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que otros módulos estén cargados
    setTimeout(initializeAPIIntegration, 1500);
});

// Exportar para uso global
window.APIIntegrationManager = APIIntegrationManager;

