// === NUEVAS EXTENSIONES PARA EDITOR DE MUNDOS v6.6.6 ===

class NewExtensionsManager {
    constructor() {
        this.extensions = {
            voice: new ElevenLabsStudioExtension(),
            ray3: new LumaLabsRay3Extension(),
            sora2: new Sora2Extension(),
            grok: new GrokVideoExtension(),
            gamma: new GammaSlidesExtension(),
            figma: new FigmaExtension(),
            reve: new ReveObjectsExtension(),
            alisa: new HeyGenAlisaExtension(),
            visita3d: new WorldLabsExtension()
        };
        this.init();
    }
    
    init() {
        this.createExtensionButtons();
        this.setupEventListeners();
        this.integrateWithEditor();
    }
    
    createExtensionButtons() {
        // Añadir botones de extensiones a las secciones correspondientes
        this.addToVideoSection();
        this.addToImageSection();
        this.addToAvatarSection();
        this.addToWorldSection();
    }
    
    addToVideoSection() {
        const videoSection = document.querySelector('#videos-section, [data-section="videos"]');
        if (videoSection) {
            // RoboNeoAI para generación de video
            const roboneoContainer = document.createElement('div');
            roboneoContainer.className = 'extension-container roboneo-extension';
            roboneoContainer.innerHTML = `
                <h3>🎨 RoboNeoAI - Generación Creativa</h3>
                <p>Crea contenido visual y videos con IA conversacional de Meitu</p>
                <button class="extension-btn" data-extension="roboneo" data-action="open">
                    Abrir RoboNeoAI
                </button>
                <button class="extension-btn" data-extension="roboneo" data-action="import">
                    Importar Creación
                </button>
                <button class="extension-btn" data-extension="roboneo" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            videoSection.appendChild(roboneoContainer);
            
            // Extensión VOZ con ElevenLabs Studio 3.0
            const voiceContainer = document.createElement('div');
            voiceContainer.className = 'extension-container voice-extension';
            voiceContainer.innerHTML = `
                <h3>🎙️ Generar VOZ - ElevenLabs Studio 3.0</h3>
                <p>Genera voz profesional con IA y comparte creaciones editables</p>
                <button class="extension-btn" data-extension="voice" data-action="open">
                    Abrir ElevenLabs Studio
                </button>
                <button class="extension-btn" data-extension="voice" data-action="import">
                    Importar Audio/Video
                </button>
                <button class="extension-btn" data-extension="voice" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            videoSection.appendChild(voiceContainer);
            
            // Ray 3 con Luma Labs Multi-Fotos
            const ray3Container = document.createElement('div');
            ray3Container.className = 'extension-container ray3-extension';
            ray3Container.innerHTML = `
                <h3>📸 Ray 3 - Luma Labs Multi-Fotos</h3>
                <p>Genera videos desde múltiples fotos con IA avanzada</p>
                <button class="extension-btn" data-extension="ray3" data-action="open">
                    Abrir Luma Labs Ray 3
                </button>
                <button class="extension-btn" data-extension="ray3" data-action="import">
                    Importar Generación
                </button>
                <button class="extension-btn" data-extension="ray3" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            videoSection.appendChild(ray3Container);
            
            // Sora 2 - OpenAI Video Generation
            const sora2Container = document.createElement('div');
            sora2Container.className = 'extension-container sora2-extension';
            sora2Container.innerHTML = `
                <h3>🎬 Sora 2 - OpenAI Video Generation</h3>
                <p>Genera videos realistas desde texto con la IA más avanzada de OpenAI</p>
                <button class="extension-btn" data-extension="sora2" data-action="open">
                    Abrir Sora 2
                </button>
                <button class="extension-btn" data-extension="sora2" data-action="import">
                    Importar Video Generado
                </button>
                <button class="extension-btn" data-extension="sora2" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            videoSection.appendChild(sora2Container);
            
            // Grok.com - Video Generation
            const grokContainer = document.createElement('div');
            grokContainer.className = 'extension-container grok-extension';
            grokContainer.innerHTML = `
                <h3>🤖 Grok - Video Generation</h3>
                <p>Genera videos con IA conversacional y análisis avanzado de contenido</p>
                <button class="extension-btn" data-extension="grok" data-action="open">
                    Abrir Grok Videos
                </button>
                <button class="extension-btn" data-extension="grok" data-action="import">
                    Importar Video de Grok
                </button>
                <button class="extension-btn" data-extension="grok" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            videoSection.appendChild(grokContainer);
            
            // Enlaces de Webs de Videos
            const videoLinksContainer = document.createElement('div');
            videoLinksContainer.className = 'extension-container video-links-extension';
            videoLinksContainer.innerHTML = `
                <h3>🔗 Enlaces de Webs de Videos</h3>
                <p>Acceso rápido a plataformas de video y herramientas de generación</p>
                <div class="video-links-grid">
                    <button class="extension-btn video-link-btn" data-url="https://www.youtube.com">
                        📺 YouTube
                    </button>
                    <button class="extension-btn video-link-btn" data-url="https://vimeo.com">
                        🎥 Vimeo
                    </button>
                    <button class="extension-btn video-link-btn" data-url="https://www.twitch.tv">
                        🎮 Twitch
                    </button>
                    <button class="extension-btn video-link-btn" data-url="https://www.dailymotion.com">
                        📹 Dailymotion
                    </button>
                    <button class="extension-btn video-link-btn" data-url="https://www.tiktok.com">
                        🎵 TikTok
                    </button>
                    <button class="extension-btn video-link-btn" data-url="https://www.instagram.com/reels">
                        📸 Instagram Reels
                    </button>
                </div>
                <div class="custom-video-link">
                    <input type="url" id="custom-video-url" placeholder="Añadir enlace personalizado de video">
                    <button class="extension-btn" onclick="this.addCustomVideoLink()">
                        ➕ Añadir Enlace
                    </button>
                </div>
            `;
            videoSection.appendChild(videoLinksContainer);
        }
    }
    
    addToImageSection() {
        const imageSection = document.querySelector('#images-section, [data-section="images"]');
        if (imageSection) {
            // Gamma para diapositivas
            const gammaContainer = document.createElement('div');
            gammaContainer.className = 'extension-container gamma-extension';
            gammaContainer.innerHTML = `
                <h3>📊 Gamma - Generador de Diapositivas</h3>
                <p>Crea presentaciones profesionales con IA</p>
                <button class="extension-btn" data-extension="gamma" data-action="open">
                    Abrir Gamma
                </button>
                <button class="extension-btn" data-extension="gamma" data-action="import">
                    Importar Presentación
                </button>
                <button class="extension-btn" data-extension="gamma" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            imageSection.appendChild(gammaContainer);
            
            // Figma
            const figmaContainer = document.createElement('div');
            figmaContainer.className = 'extension-container figma-extension';
            figmaContainer.innerHTML = `
                <h3>🎨 Figma - Diseño Colaborativo</h3>
                <p>Diseña interfaces y gráficos profesionales</p>
                <button class="extension-btn" data-extension="figma" data-action="open">
                    Abrir Figma
                </button>
                <button class="extension-btn" data-extension="figma" data-action="import">
                    Importar Diseño
                </button>
                <button class="extension-btn" data-extension="figma" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            imageSection.appendChild(figmaContainer);
            
            // Reve.com para cambiar objetos
            const reveContainer = document.createElement('div');
            reveContainer.className = 'extension-container reve-extension';
            reveContainer.innerHTML = `
                <h3>🔄 Reve - Cambiar Objetos</h3>
                <p>Modifica y transforma objetos en imágenes</p>
                <button class="extension-btn" data-extension="reve" data-action="open">
                    Abrir Reve
                </button>
                <button class="extension-btn" data-extension="reve" data-action="import">
                    Importar Modificación
                </button>
                <button class="extension-btn" data-extension="reve" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            imageSection.appendChild(reveContainer);
        }
    }
    
    addToAvatarSection() {
        const avatarSection = document.querySelector('#avatars-section, [data-section="avatars"]');
        if (avatarSection) {
            // Alisa de HeyGen
            const alisaContainer = document.createElement('div');
            alisaContainer.className = 'extension-container alisa-extension';
            alisaContainer.innerHTML = `
                <h3>🤖 Alisa - HeyGen Hablar IA</h3>
                <p>Conversa con IA avatar y genera contenido interactivo</p>
                <button class="extension-btn" data-extension="alisa" data-action="open">
                    Hablar con Alisa
                </button>
                <button class="extension-btn" data-extension="alisa" data-action="import">
                    Importar Avatar
                </button>
                <button class="extension-btn" data-extension="alisa" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            avatarSection.appendChild(alisaContainer);
        }
    }
    
    addToWorldSection() {
        const worldSection = document.querySelector('#worlds-section, [data-section="worlds"]');
        if (worldSection) {
            // Visita 3D con World Labs
            const visita3dContainer = document.createElement('div');
            visita3dContainer.className = 'extension-container visita3d-extension';
            visita3dContainer.innerHTML = `
                <h3>🌍 Visita 3D - World Labs</h3>
                <p>Genera mundos 3D interactivos y explorables</p>
                <button class="extension-btn" data-extension="visita3d" data-action="open">
                    Abrir World Labs
                </button>
                <button class="extension-btn" data-extension="visita3d" data-action="import">
                    Importar Mundo 3D
                </button>
                <button class="extension-btn" data-extension="visita3d" data-action="custom-url">
                    URL Personalizada
                </button>
            `;
            worldSection.appendChild(visita3dContainer);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('extension-btn')) {
                const extension = e.target.dataset.extension;
                const action = e.target.dataset.action;
                this.handleExtensionAction(extension, action);
            } else if (e.target.classList.contains('video-link-btn')) {
                const url = e.target.dataset.url;
                this.openVideoLink(url);
            }
        });
    }
    
    handleExtensionAction(extension, action) {
        if (action === 'custom-url') {
            this.showCustomUrlModal(extension);
        } else if (this.extensions[extension]) {
            if (action === 'open') {
                this.extensions[extension].open();
            } else if (action === 'import') {
                this.extensions[extension].import();
            }
        } else if (action === 'import') {
            this.showUnifiedImportModal(extension);
        } else if (extension === 'roboneo') {
            this.handleRoboNeoAction(action);
        }
    }
    
    handleRoboNeoAction(action) {
        if (action === 'open') {
            this.openRoboNeo();
        }
    }
    
    openRoboNeo() {
        const roboneoWindow = window.open('https://roboneoai.art', '_blank', 'width=1200,height=800');
        
        this.showInstructions('RoboNeoAI - Generación Creativa', `
            <h4>🎨 Instrucciones para RoboNeoAI:</h4>
            <ol>
                <li>Explora la galería de arte generado por IA</li>
                <li>Usa prompts efectivos de la comunidad</li>
                <li>Crea tus propios diseños con RoboNeo</li>
                <li>Descarga o comparte tus creaciones</li>
                <li>Vuelve aquí para importar al editor</li>
            </ol>
            <p><strong>Estilos disponibles:</strong></p>
            <ul>
                <li>iOS Emoji Style</li>
                <li>Notion Avatar Style</li>
                <li>Pixel Art</li>
                <li>Personajes 3D</li>
            </ul>
        `);
    }
    
    showCustomUrlModal(extension) {
        const extensionNames = {
            'voice': 'ElevenLabs Studio',
            'ray3': 'Luma Labs Ray 3',
            'gamma': 'Gamma Slides',
            'figma': 'Figma',
            'reve': 'Reve Objects',
            'alisa': 'HeyGen Alisa',
            'visita3d': 'World Labs',
            'roboneo': 'RoboNeoAI'
        };
        
        const modal = this.createImportModal(`URL Personalizada - ${extensionNames[extension]}`, `
            <div class="custom-url-form">
                <h4>🔗 Configurar URL Personalizada</h4>
                <p>Añade tu propia URL para ${extensionNames[extension]} o una alternativa similar</p>
                
                <label>URL personalizada:</label>
                <input type="url" id="custom-extension-url" placeholder="https://tu-herramienta-alternativa.com">
                
                <label>Nombre personalizado:</label>
                <input type="text" id="custom-extension-name" placeholder="Mi herramienta personalizada">
                
                <label>Descripción:</label>
                <textarea id="custom-extension-description" placeholder="Describe las funciones de esta herramienta..."></textarea>
                
                <div class="custom-url-actions">
                    <button onclick="this.saveCustomUrl('${extension}')">Guardar URL</button>
                    <button onclick="this.openCustomUrl('${extension}')">Abrir URL Guardada</button>
                    <button onclick="this.clearCustomUrl('${extension}')">Limpiar URL</button>
                </div>
                
                <div class="saved-urls">
                    <h5>URLs Guardadas:</h5>
                    <div id="saved-urls-list-${extension}">
                        ${this.renderSavedUrls(extension)}
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    saveCustomUrl(extension) {
        const url = document.getElementById('custom-extension-url').value;
        const name = document.getElementById('custom-extension-name').value;
        const description = document.getElementById('custom-extension-description').value;
        
        if (url) {
            const customUrls = this.getCustomUrls();
            if (!customUrls[extension]) {
                customUrls[extension] = [];
            }
            
            customUrls[extension].push({
                url: url,
                name: name || 'URL Personalizada',
                description: description,
                created: new Date().toISOString()
            });
            
            localStorage.setItem('extensionCustomUrls', JSON.stringify(customUrls));
            this.showSuccess(`URL guardada para ${extension}`);
            
            // Actualizar lista
            const savedUrlsList = document.getElementById(`saved-urls-list-${extension}`);
            if (savedUrlsList) {
                savedUrlsList.innerHTML = this.renderSavedUrls(extension);
            }
        }
    }
    
    openCustomUrl(extension) {
        const customUrls = this.getCustomUrls();
        if (customUrls[extension] && customUrls[extension].length > 0) {
            const latestUrl = customUrls[extension][customUrls[extension].length - 1];
            window.open(latestUrl.url, '_blank', 'width=1200,height=800');
            this.showSuccess(`Abriendo ${latestUrl.name}`);
        } else {
            alert('No hay URLs guardadas para esta extensión');
        }
    }
    
    clearCustomUrl(extension) {
        if (confirm('¿Estás seguro de que quieres eliminar todas las URLs guardadas para esta extensión?')) {
            const customUrls = this.getCustomUrls();
            delete customUrls[extension];
            localStorage.setItem('extensionCustomUrls', JSON.stringify(customUrls));
            this.showSuccess('URLs eliminadas');
            
            // Actualizar lista
            const savedUrlsList = document.getElementById(`saved-urls-list-${extension}`);
            if (savedUrlsList) {
                savedUrlsList.innerHTML = this.renderSavedUrls(extension);
            }
        }
    }
    
    getCustomUrls() {
        try {
            return JSON.parse(localStorage.getItem('extensionCustomUrls') || '{}');
        } catch (error) {
            return {};
        }
    }
    
    renderSavedUrls(extension) {
        const customUrls = this.getCustomUrls();
        if (!customUrls[extension] || customUrls[extension].length === 0) {
            return '<p class="no-saved-urls">No hay URLs guardadas</p>';
        }
        
        return customUrls[extension].map((urlData, index) => `
            <div class="saved-url-item">
                <strong>${urlData.name}</strong>
                <p>${urlData.description}</p>
                <small>${urlData.url}</small>
                <div class="saved-url-actions">
                    <button onclick="window.open('${urlData.url}', '_blank')">Abrir</button>
                    <button onclick="this.deleteSavedUrl('${extension}', ${index})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }
    
    deleteSavedUrl(extension, index) {
        const customUrls = this.getCustomUrls();
        if (customUrls[extension]) {
            customUrls[extension].splice(index, 1);
            localStorage.setItem('extensionCustomUrls', JSON.stringify(customUrls));
            
            // Actualizar lista
            const savedUrlsList = document.getElementById(`saved-urls-list-${extension}`);
            if (savedUrlsList) {
                savedUrlsList.innerHTML = this.renderSavedUrls(extension);
            }
            
            this.showSuccess('URL eliminada');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess(`Contenido importado desde ${data.source}`);
        }
    }
    
    integrateWithEditor() {
        // Integrar con el editor principal para importar contenido
        if (window.editorMundos) {
            window.editorMundos.extensions = this.extensions;
        }
    }
}

// === EXTENSIÓN ELEVENLABS STUDIO 3.0 ===
class ElevenLabsStudioExtension {
    constructor() {
        this.baseUrl = 'https://elevenlabs.io/es/studio';
        this.apiEndpoint = 'https://maxxine.net/Yupi/api/elevenlabs';
    }
    
    open() {
        // Abrir ElevenLabs Studio en nueva ventana
        const studioWindow = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        // Mostrar instrucciones
        this.showInstructions('ElevenLabs Studio 3.0', `
            <h4>🎙️ Instrucciones para ElevenLabs Studio:</h4>
            <ol>
                <li>Crea tu proyecto de voz en Studio 3.0</li>
                <li>Genera el audio o video con voz</li>
                <li>Copia el enlace de compartir editable</li>
                <li>Vuelve aquí y usa "Importar Audio/Video"</li>
            </ol>
            <p><strong>Funciones disponibles:</strong></p>
            <ul>
                <li>Generación de voz profesional</li>
                <li>Clonación de voz</li>
                <li>Efectos de audio avanzados</li>
                <li>Enlaces compartibles editables</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde ElevenLabs', `
            <div class="import-form">
                <label>URL del proyecto ElevenLabs:</label>
                <input type="url" id="elevenlabs-url" placeholder="https://elevenlabs.io/studio/...">
                
                <label>Tipo de contenido:</label>
                <select id="elevenlabs-type">
                    <option value="audio">Solo Audio</option>
                    <option value="video">Video con Voz</option>
                    <option value="both">Audio y Video</option>
                </select>
                
                <button onclick="this.processElevenLabsImport()">Importar</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processElevenLabsImport() {
        const url = document.getElementById('elevenlabs-url').value;
        const type = document.getElementById('elevenlabs-type').value;
        
        if (url) {
            // Procesar importación
            this.importToEditor({
                source: 'ElevenLabs Studio 3.0',
                url: url,
                type: type,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Contenido importado desde ElevenLabs Studio 3.0');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN LUMA LABS RAY 3 ===
class LumaLabsRay3Extension {
    constructor() {
        this.baseUrl = 'https://lumalabs.ai/ray3';
        this.pressUrl = 'https://lumalabs.ai/press/ray3';
    }
    
    open() {
        const ray3Window = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Luma Labs Ray 3 Multi-Fotos', `
            <h4>📸 Instrucciones para Ray 3:</h4>
            <ol>
                <li>Sube múltiples fotos a Ray 3</li>
                <li>Configura la generación de video</li>
                <li>Procesa la generación</li>
                <li>Descarga o copia el enlace</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Características Ray 3:</strong></p>
            <ul>
                <li>Generación desde múltiples fotos</li>
                <li>Videos de alta calidad</li>
                <li>Transiciones suaves</li>
                <li>Efectos cinematográficos</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde Ray 3', `
            <div class="import-form">
                <label>URL del video generado:</label>
                <input type="url" id="ray3-url" placeholder="https://lumalabs.ai/...">
                
                <label>Archivo local:</label>
                <input type="file" id="ray3-file" accept="video/*">
                
                <label>Descripción:</label>
                <textarea id="ray3-description" placeholder="Describe el contenido generado..."></textarea>
                
                <button onclick="this.processRay3Import()">Importar Video</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processRay3Import() {
        const url = document.getElementById('ray3-url').value;
        const file = document.getElementById('ray3-file').files[0];
        const description = document.getElementById('ray3-description').value;
        
        if (url || file) {
            this.importToEditor({
                source: 'Luma Labs Ray 3',
                url: url,
                file: file,
                description: description,
                type: 'video',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Video importado desde Luma Labs Ray 3');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN GAMMA SLIDES ===
class GammaSlidesExtension {
    constructor() {
        this.baseUrl = 'https://gamma.app';
    }
    
    open() {
        const gammaWindow = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Gamma - Generador de Diapositivas', `
            <h4>📊 Instrucciones para Gamma:</h4>
            <ol>
                <li>Crea tu presentación en Gamma</li>
                <li>Usa IA para generar contenido</li>
                <li>Personaliza diseño y estilo</li>
                <li>Exporta o comparte la presentación</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Funciones Gamma:</strong></p>
            <ul>
                <li>Generación automática de diapositivas</li>
                <li>Diseños profesionales</li>
                <li>Integración con datos</li>
                <li>Exportación múltiple</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde Gamma', `
            <div class="import-form">
                <label>URL de la presentación:</label>
                <input type="url" id="gamma-url" placeholder="https://gamma.app/...">
                
                <label>Archivo de presentación:</label>
                <input type="file" id="gamma-file" accept=".pdf,.pptx,.html">
                
                <label>Título de la presentación:</label>
                <input type="text" id="gamma-title" placeholder="Título de la presentación">
                
                <button onclick="this.processGammaImport()">Importar Presentación</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processGammaImport() {
        const url = document.getElementById('gamma-url').value;
        const file = document.getElementById('gamma-file').files[0];
        const title = document.getElementById('gamma-title').value;
        
        if (url || file) {
            this.importToEditor({
                source: 'Gamma Slides',
                url: url,
                file: file,
                title: title,
                type: 'presentation',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Presentación importada desde Gamma');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN FIGMA ===
class FigmaExtension {
    constructor() {
        this.baseUrl = 'https://www.figma.com';
    }
    
    open() {
        const figmaWindow = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Figma - Diseño Colaborativo', `
            <h4>🎨 Instrucciones para Figma:</h4>
            <ol>
                <li>Crea tu diseño en Figma</li>
                <li>Usa componentes y estilos</li>
                <li>Colabora con tu equipo</li>
                <li>Exporta en el formato deseado</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Funciones Figma:</strong></p>
            <ul>
                <li>Diseño de interfaces</li>
                <li>Prototipado interactivo</li>
                <li>Colaboración en tiempo real</li>
                <li>Sistema de componentes</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde Figma', `
            <div class="import-form">
                <label>URL del proyecto Figma:</label>
                <input type="url" id="figma-url" placeholder="https://www.figma.com/file/...">
                
                <label>Archivo de diseño:</label>
                <input type="file" id="figma-file" accept=".fig,.png,.svg,.pdf">
                
                <label>Nombre del diseño:</label>
                <input type="text" id="figma-name" placeholder="Nombre del diseño">
                
                <button onclick="this.processFigmaImport()">Importar Diseño</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processFigmaImport() {
        const url = document.getElementById('figma-url').value;
        const file = document.getElementById('figma-file').files[0];
        const name = document.getElementById('figma-name').value;
        
        if (url || file) {
            this.importToEditor({
                source: 'Figma',
                url: url,
                file: file,
                name: name,
                type: 'design',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Diseño importado desde Figma');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN REVE OBJECTS ===
class ReveObjectsExtension {
    constructor() {
        this.baseUrl = 'https://reve.com';
    }
    
    open() {
        const reveWindow = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Reve - Cambiar Objetos', `
            <h4>🔄 Instrucciones para Reve:</h4>
            <ol>
                <li>Sube tu imagen a Reve</li>
                <li>Selecciona los objetos a modificar</li>
                <li>Aplica transformaciones</li>
                <li>Descarga la imagen modificada</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Funciones Reve:</strong></p>
            <ul>
                <li>Modificación de objetos</li>
                <li>Cambio de colores</li>
                <li>Transformaciones</li>
                <li>Efectos visuales</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde Reve', `
            <div class="import-form">
                <label>Imagen modificada:</label>
                <input type="file" id="reve-file" accept="image/*">
                
                <label>URL de Reve:</label>
                <input type="url" id="reve-url" placeholder="https://reve.com/...">
                
                <label>Descripción de cambios:</label>
                <textarea id="reve-description" placeholder="Describe los cambios realizados..."></textarea>
                
                <button onclick="this.processReveImport()">Importar Imagen</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processReveImport() {
        const file = document.getElementById('reve-file').files[0];
        const url = document.getElementById('reve-url').value;
        const description = document.getElementById('reve-description').value;
        
        if (file || url) {
            this.importToEditor({
                source: 'Reve Objects',
                file: file,
                url: url,
                description: description,
                type: 'image',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Imagen importada desde Reve');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN HEYGEN ALISA ===
class HeyGenAlisaExtension {
    constructor() {
        this.baseUrl = 'https://app.heygen.com/avatar/alisa';
        this.chatUrl = 'https://app.heygen.com/chat/alisa';
    }
    
    open() {
        const heygenWindow = window.open(this.chatUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Alisa - HeyGen Hablar IA', `
            <h4>🤖 Instrucciones para Alisa:</h4>
            <ol>
                <li>Habla directamente con Alisa IA</li>
                <li>Genera contenido interactivo</li>
                <li>Crea avatares personalizados</li>
                <li>Descarga o comparte el resultado</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Funciones Alisa:</strong></p>
            <ul>
                <li>Conversación con IA</li>
                <li>Generación de avatares</li>
                <li>Contenido interactivo</li>
                <li>Múltiples idiomas</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde Alisa HeyGen', `
            <div class="import-form">
                <label>URL del avatar generado:</label>
                <input type="url" id="alisa-url" placeholder="https://app.heygen.com/...">
                
                <label>Video del avatar:</label>
                <input type="file" id="alisa-file" accept="video/*">
                
                <label>Conversación/Script:</label>
                <textarea id="alisa-script" placeholder="Pega aquí la conversación o script..."></textarea>
                
                <button onclick="this.processAlisaImport()">Importar Avatar</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processAlisaImport() {
        const url = document.getElementById('alisa-url').value;
        const file = document.getElementById('alisa-file').files[0];
        const script = document.getElementById('alisa-script').value;
        
        if (url || file || script) {
            this.importToEditor({
                source: 'HeyGen Alisa',
                url: url,
                file: file,
                script: script,
                type: 'avatar',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Avatar importado desde HeyGen Alisa');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// === EXTENSIÓN WORLD LABS VISITA 3D ===
class WorldLabsExtension {
    constructor() {
        this.baseUrl = 'https://marble.worldlabs.ai';
    }
    
    open() {
        const worldLabsWindow = window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        
        this.showInstructions('Visita 3D - World Labs', `
            <h4>🌍 Instrucciones para World Labs:</h4>
            <ol>
                <li>Crea tu mundo 3D en Marble</li>
                <li>Diseña espacios interactivos</li>
                <li>Configura la experiencia</li>
                <li>Genera el mundo 3D</li>
                <li>Vuelve aquí para importar</li>
            </ol>
            <p><strong>Funciones World Labs:</strong></p>
            <ul>
                <li>Generación de mundos 3D</li>
                <li>Espacios interactivos</li>
                <li>Realidad virtual</li>
                <li>Experiencias inmersivas</li>
            </ul>
        `);
    }
    
    import() {
        const modal = this.createImportModal('Importar desde World Labs', `
            <div class="import-form">
                <label>URL del mundo 3D:</label>
                <input type="url" id="worldlabs-url" placeholder="https://marble.worldlabs.ai/...">
                
                <label>Archivo del mundo:</label>
                <input type="file" id="worldlabs-file" accept=".glb,.gltf,.obj,.fbx">
                
                <label>Nombre del mundo:</label>
                <input type="text" id="worldlabs-name" placeholder="Nombre del mundo 3D">
                
                <label>Descripción:</label>
                <textarea id="worldlabs-description" placeholder="Describe el mundo 3D..."></textarea>
                
                <button onclick="this.processWorldLabsImport()">Importar Mundo 3D</button>
            </div>
        `);
        
        document.body.appendChild(modal);
    }
    
    processWorldLabsImport() {
        const url = document.getElementById('worldlabs-url').value;
        const file = document.getElementById('worldlabs-file').files[0];
        const name = document.getElementById('worldlabs-name').value;
        const description = document.getElementById('worldlabs-description').value;
        
        if (url || file) {
            this.importToEditor({
                source: 'World Labs Visita 3D',
                url: url,
                file: file,
                name: name,
                description: description,
                type: 'world3d',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    importToEditor(data) {
        if (window.editorMundos) {
            window.editorMundos.addImportedContent(data);
            this.showSuccess('Mundo 3D importado desde World Labs');
        }
    }
    
    showInstructions(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal instructions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    createImportModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'extension-modal import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>${title}</h3>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        return modal;
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Inicializar extensiones cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.newExtensionsManager = new NewExtensionsManager();
    });
} else {
    window.newExtensionsManager = new NewExtensionsManager();
}

// Exportar para uso global
window.NewExtensionsManager = NewExtensionsManager;




    // === UNIFIED IMPORT FUNCTIONS ===

    showUnifiedImportModal(extensionKey) {
        const extensionConfig = this.getImportConfig(extensionKey);
        if (!extensionConfig) {
            console.error(`No import config found for ${extensionKey}`);
            return;
        }

        const formFields = extensionConfig.fields.map(field => {
            switch (field.type) {
                case 'url':
                    return `<label>${field.label}:</label><input type="url" id="import-${field.id}" placeholder="${field.placeholder}">`;
                case 'file':
                    return `<label>${field.label}:</label><input type="file" id="import-${field.id}" accept="${field.accept}">`;
                case 'textarea':
                    return `<label>${field.label}:</label><textarea id="import-${field.id}" placeholder="${field.placeholder}"></textarea>`;
                case 'select':
                    const options = field.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
                    return `<label>${field.label}:</label><select id="import-${field.id}">${options}</select>`;
                default:
                    return '';
            }
        }).join('');

        const modal = this.createImportModal(`Importar desde ${extensionConfig.title}`, `
            <div class="import-form" data-extension="${extensionKey}">
                ${formFields}
                <button onclick="newExtensionsManager.processUnifiedImport('${extensionKey}')">Importar Creación</button>
            </div>
        `);

        document.body.appendChild(modal);
    }

    processUnifiedImport(extensionKey) {
        const extensionConfig = this.getImportConfig(extensionKey);
        const importData = {
            source: extensionConfig.title,
            type: extensionConfig.importType,
            timestamp: new Date().toISOString()
        };

        extensionConfig.fields.forEach(field => {
            const element = document.getElementById(`import-${field.id}`);
            if (element) {
                importData[field.id] = field.type === 'file' ? element.files[0] : element.value;
            }
        });

        if (importData.url || importData.file) {
            this.importToEditor(importData);
            const modal = document.querySelector('.import-modal');
            if (modal) {
                modal.parentElement.removeChild(modal);
            }
        } else {
            alert('Por favor, proporciona una URL o un archivo.');
        }
    }

    getImportConfig(extensionKey) {
        const configs = {
            'roboneo': {
                title: 'RoboNeoAI',
                importType: 'creative-art',
                fields: [
                    { id: 'url', type: 'url', label: 'URL de la creación', placeholder: 'https://roboneoai.art/...' },
                    { id: 'file', type: 'file', label: 'Imagen generada', accept: 'image/*' },
                    { id: 'prompt', type: 'textarea', label: 'Prompt utilizado', placeholder: 'Describe el prompt...' },
                    { id: 'style', type: 'select', label: 'Estilo', options: [
                        { value: 'ios-emoji', text: 'iOS Emoji Style' },
                        { value: 'notion-avatar', text: 'Notion Avatar Style' },
                        { value: 'pixel-art', text: 'Pixel Art' },
                        { value: '3d-character', text: 'Personaje 3D' },
                        { value: 'other', text: 'Otro' }
                    ]}
                ]
            },
            'sora2': {
                title: 'Sora 2 - OpenAI',
                importType: 'video-generation',
                fields: [
                    { id: 'url', type: 'url', label: 'URL del video', placeholder: 'https://openai.com/sora/...' },
                    { id: 'file', type: 'file', label: 'Video generado', accept: 'video/*' },
                    { id: 'prompt', type: 'textarea', label: 'Prompt utilizado', placeholder: 'Describe el prompt para el video...' },
                    { id: 'duration', type: 'select', label: 'Duración', options: [
                        { value: 'short', text: 'Corto (hasta 20s)' },
                        { value: 'medium', text: 'Medio (20-60s)' },
                        { value: 'long', text: 'Largo (más de 60s)' }
                    ]},
                    { id: 'resolution', type: 'select', label: 'Resolución', options: [
                        { value: '720p', text: '720p HD' },
                        { value: '1080p', text: '1080p Full HD' },
                        { value: '4k', text: '4K Ultra HD' }
                    ]}
                ]
            },
            'grok': {
                title: 'Grok Video',
                importType: 'video-analysis',
                fields: [
                    { id: 'url', type: 'url', label: 'URL de Grok', placeholder: 'https://grok.com/...' },
                    { id: 'file', type: 'file', label: 'Contenido generado', accept: 'video/*,text/*' },
                    { id: 'analysis', type: 'textarea', label: 'Análisis o descripción', placeholder: 'Describe el análisis o contenido...' },
                    { id: 'type', type: 'select', label: 'Tipo de contenido', options: [
                        { value: 'video', text: 'Video generado' },
                        { value: 'analysis', text: 'Análisis de video' },
                        { value: 'script', text: 'Script para video' },
                        { value: 'other', text: 'Otro' }
                    ]}
                ]
            }
        };
        return configs[extensionKey];
    }


    // === FUNCIONES PARA ENLACES DE VIDEO ===
    
    openVideoLink(url) {
        window.open(url, '_blank', 'width=1200,height=800');
        this.showInstructions('Plataforma de Video Abierta', `
            <h4>🎥 Accediendo a plataforma de video</h4>
            <p>Se ha abierto la plataforma de video en una nueva ventana.</p>
            <p>Una vez que hayas seleccionado o creado tu contenido, puedes volver aquí para importarlo al editor.</p>
        `);
    }
    
    addCustomVideoLink() {
        const urlInput = document.getElementById('custom-video-url');
        const url = urlInput.value.trim();
        
        if (url && this.isValidUrl(url)) {
            const videoLinksGrid = document.querySelector('.video-links-grid');
            const customButton = document.createElement('button');
            customButton.className = 'extension-btn video-link-btn';
            customButton.dataset.url = url;
            customButton.innerHTML = `🔗 ${this.extractDomainName(url)}`;
            
            videoLinksGrid.appendChild(customButton);
            urlInput.value = '';
            
            // Guardar en localStorage
            this.saveCustomVideoLink(url);
            
            this.showSuccess('Enlace personalizado añadido correctamente');
        } else {
            alert('Por favor, ingresa una URL válida');
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    extractDomainName(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '').split('.')[0];
        } catch (_) {
            return 'Enlace Personalizado';
        }
    }
    
    saveCustomVideoLink(url) {
        const customLinks = JSON.parse(localStorage.getItem('customVideoLinks') || '[]');
        if (!customLinks.includes(url)) {
            customLinks.push(url);
            localStorage.setItem('customVideoLinks', JSON.stringify(customLinks));
        }
    }
    
    loadCustomVideoLinks() {
        const customLinks = JSON.parse(localStorage.getItem('customVideoLinks') || '[]');
        const videoLinksGrid = document.querySelector('.video-links-grid');
        
        customLinks.forEach(url => {
            const customButton = document.createElement('button');
            customButton.className = 'extension-btn video-link-btn';
            customButton.dataset.url = url;
            customButton.innerHTML = `🔗 ${this.extractDomainName(url)}`;
            videoLinksGrid.appendChild(customButton);
        });
    }
}

// === CLASES DE EXTENSIONES NUEVAS ===

class Sora2Extension {
    constructor() {
        this.name = 'Sora 2';
        this.baseUrl = 'https://openai.com/sora';
    }
    
    open() {
        window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        this.showInstructions();
    }
    
    import() {
        this.showImportModal();
    }
    
    showInstructions() {
        const modal = document.createElement('div');
        modal.className = 'instruction-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎬 Instrucciones para Sora 2</h3>
                <ol>
                    <li>Accede a OpenAI Sora en la ventana abierta</li>
                    <li>Ingresa tu prompt de texto descriptivo</li>
                    <li>Configura la duración y resolución del video</li>
                    <li>Genera tu video con IA</li>
                    <li>Descarga el video generado</li>
                    <li>Vuelve aquí para importarlo al editor</li>
                </ol>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showImportModal() {
        const modal = document.createElement('div');
        modal.className = 'import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Importar desde Sora 2</h3>
                <div class="import-form">
                    <label>Video generado:</label>
                    <input type="file" id="sora2-video" accept="video/*">
                    
                    <label>Prompt utilizado:</label>
                    <textarea id="sora2-prompt" placeholder="Describe el prompt usado..."></textarea>
                    
                    <label>Duración:</label>
                    <select id="sora2-duration">
                        <option value="short">Corto (hasta 20s)</option>
                        <option value="medium">Medio (20-60s)</option>
                        <option value="long">Largo (más de 60s)</option>
                    </select>
                    
                    <button onclick="this.processSora2Import()">Importar Video</button>
                    <button onclick="this.parentElement.parentElement.remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    processSora2Import() {
        const video = document.getElementById('sora2-video').files[0];
        const prompt = document.getElementById('sora2-prompt').value;
        const duration = document.getElementById('sora2-duration').value;
        
        if (video) {
            // Procesar importación
            console.log('Importing Sora 2 video:', { video, prompt, duration });
            alert('Video de Sora 2 importado correctamente');
            document.querySelector('.import-modal').remove();
        } else {
            alert('Por favor, selecciona un video');
        }
    }
}

class GrokVideoExtension {
    constructor() {
        this.name = 'Grok Video';
        this.baseUrl = 'https://grok.com';
    }
    
    open() {
        window.open(this.baseUrl, '_blank', 'width=1200,height=800');
        this.showInstructions();
    }
    
    import() {
        this.showImportModal();
    }
    
    showInstructions() {
        const modal = document.createElement('div');
        modal.className = 'instruction-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🤖 Instrucciones para Grok Videos</h3>
                <ol>
                    <li>Accede a Grok en la ventana abierta</li>
                    <li>Inicia una conversación sobre generación de videos</li>
                    <li>Describe el tipo de video que necesitas</li>
                    <li>Utiliza las herramientas de análisis de Grok</li>
                    <li>Genera o analiza contenido de video</li>
                    <li>Vuelve aquí para importar los resultados</li>
                </ol>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showImportModal() {
        const modal = document.createElement('div');
        modal.className = 'import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Importar desde Grok</h3>
                <div class="import-form">
                    <label>URL del contenido de Grok:</label>
                    <input type="url" id="grok-url" placeholder="https://grok.com/...">
                    
                    <label>Video o análisis:</label>
                    <input type="file" id="grok-content" accept="video/*,text/*">
                    
                    <label>Descripción del análisis:</label>
                    <textarea id="grok-analysis" placeholder="Describe el análisis o contenido generado..."></textarea>
                    
                    <label>Tipo de contenido:</label>
                    <select id="grok-type">
                        <option value="video">Video generado</option>
                        <option value="analysis">Análisis de video</option>
                        <option value="script">Script para video</option>
                        <option value="other">Otro</option>
                    </select>
                    
                    <button onclick="this.processGrokImport()">Importar Contenido</button>
                    <button onclick="this.parentElement.parentElement.remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    processGrokImport() {
        const url = document.getElementById('grok-url').value;
        const content = document.getElementById('grok-content').files[0];
        const analysis = document.getElementById('grok-analysis').value;
        const type = document.getElementById('grok-type').value;
        
        if (url || content) {
            // Procesar importación
            console.log('Importing Grok content:', { url, content, analysis, type });
            alert('Contenido de Grok importado correctamente');
            document.querySelector('.import-modal').remove();
        } else {
            alert('Por favor, proporciona una URL o selecciona un archivo');
        }
    }
}
