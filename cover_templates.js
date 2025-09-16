/**
 * Cover Templates Module - Basado en Instant Cover Creator (Ecover)
 * Proporciona plantillas predefinidas y funcionalidades avanzadas para la creación de portadas
 */

class CoverTemplateManager {
    constructor() {
        this.templates = this.initializeTemplates();
        this.currentTemplate = null;
        this.coverElements = {
            title: '',
            author: '',
            publisher: 'Editorial WC',
            backgroundImage: null,
            frontImage: null,
            sideImage: null,
            style: 'classic'
        };
    }

    initializeTemplates() {
        return {
            // Plantillas inspiradas en Ecover
            'ebook_classic': {
                name: 'eBook Clásico',
                type: 'ebook',
                description: 'Diseño tradicional para libros digitales',
                styles: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    titleFont: 'Georgia, serif',
                    titleSize: '2.5em',
                    titleColor: '#ffffff',
                    titlePosition: { top: '20%', left: '50%' },
                    authorFont: 'Arial, sans-serif',
                    authorSize: '1.2em',
                    authorColor: '#f0f0f0',
                    authorPosition: { top: '70%', left: '50%' },
                    publisherPosition: { bottom: '10%', right: '10%' },
                    shadow: '0 10px 30px rgba(0,0,0,0.3)'
                },
                dimensions: { width: 400, height: 600 }
            },
            'ebook_modern': {
                name: 'eBook Moderno',
                type: 'ebook',
                description: 'Diseño contemporáneo con elementos gráficos',
                styles: {
                    background: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)',
                    titleFont: 'Helvetica, sans-serif',
                    titleSize: '2.8em',
                    titleColor: '#ffffff',
                    titlePosition: { top: '25%', left: '50%' },
                    authorFont: 'Helvetica, sans-serif',
                    authorSize: '1.1em',
                    authorColor: '#ffffff',
                    authorPosition: { top: '75%', left: '50%' },
                    publisherPosition: { bottom: '5%', center: true },
                    shadow: '0 15px 35px rgba(0,0,0,0.2)',
                    overlay: 'rgba(0,0,0,0.1)'
                },
                dimensions: { width: 400, height: 600 }
            },
            'book_professional': {
                name: 'Libro Profesional',
                type: 'print',
                description: 'Diseño para libros impresos profesionales',
                styles: {
                    background: '#ffffff',
                    titleFont: 'Times New Roman, serif',
                    titleSize: '2.2em',
                    titleColor: '#2c3e50',
                    titlePosition: { top: '30%', left: '50%' },
                    authorFont: 'Times New Roman, serif',
                    authorSize: '1.3em',
                    authorColor: '#34495e',
                    authorPosition: { top: '80%', left: '50%' },
                    publisherPosition: { bottom: '15%', center: true },
                    border: '2px solid #2c3e50',
                    shadow: '0 5px 15px rgba(0,0,0,0.1)'
                },
                dimensions: { width: 350, height: 550 }
            },
            'software_box': {
                name: 'Caja de Software',
                type: 'software',
                description: 'Estilo caja de software 3D',
                styles: {
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    titleFont: 'Arial Black, sans-serif',
                    titleSize: '2.0em',
                    titleColor: '#ffffff',
                    titlePosition: { top: '15%', left: '50%' },
                    authorFont: 'Arial, sans-serif',
                    authorSize: '1.0em',
                    authorColor: '#e0e0e0',
                    authorPosition: { top: '85%', left: '50%' },
                    publisherPosition: { bottom: '5%', left: '5%' },
                    shadow: '0 20px 40px rgba(0,0,0,0.4)',
                    perspective: true
                },
                dimensions: { width: 300, height: 400 }
            },
            'magazine_cover': {
                name: 'Portada de Revista',
                type: 'magazine',
                description: 'Estilo revista con múltiples elementos',
                styles: {
                    background: '#ffffff',
                    titleFont: 'Impact, sans-serif',
                    titleSize: '3.0em',
                    titleColor: '#e74c3c',
                    titlePosition: { top: '10%', left: '50%' },
                    authorFont: 'Arial, sans-serif',
                    authorSize: '1.1em',
                    authorColor: '#2c3e50',
                    authorPosition: { top: '90%', left: '50%' },
                    publisherPosition: { top: '5%', right: '5%' },
                    border: '3px solid #e74c3c'
                },
                dimensions: { width: 300, height: 450 }
            },
            'minimalist': {
                name: 'Minimalista',
                type: 'minimal',
                description: 'Diseño limpio y minimalista',
                styles: {
                    background: '#f8f9fa',
                    titleFont: 'Helvetica Neue, sans-serif',
                    titleSize: '2.4em',
                    titleColor: '#212529',
                    titlePosition: { top: '40%', left: '50%' },
                    authorFont: 'Helvetica Neue, sans-serif',
                    authorSize: '1.0em',
                    authorColor: '#6c757d',
                    authorPosition: { top: '60%', left: '50%' },
                    publisherPosition: { bottom: '10%', center: true },
                    shadow: 'none',
                    border: '1px solid #dee2e6'
                },
                dimensions: { width: 350, height: 500 }
            }
        };
    }

    getTemplatesList() {
        return Object.keys(this.templates).map(key => ({
            id: key,
            name: this.templates[key].name,
            type: this.templates[key].type,
            description: this.templates[key].description
        }));
    }

    selectTemplate(templateId) {
        if (this.templates[templateId]) {
            this.currentTemplate = this.templates[templateId];
            return this.currentTemplate;
        }
        return null;
    }

    updateCoverElement(element, value) {
        this.coverElements[element] = value;
        this.renderCover();
    }

    renderCover() {
        if (!this.currentTemplate) return;

        const canvas = document.getElementById('cover-canvas');
        if (!canvas) return;

        // Aplicar estilos del template
        const styles = this.currentTemplate.styles;
        const dimensions = this.currentTemplate.dimensions;

        // Configurar dimensiones
        canvas.style.width = dimensions.width + 'px';
        canvas.style.height = dimensions.height + 'px';
        canvas.style.position = 'relative';
        canvas.style.overflow = 'hidden';

        // Aplicar fondo
        if (this.coverElements.backgroundImage) {
            canvas.style.backgroundImage = `url(${this.coverElements.backgroundImage})`;
            canvas.style.backgroundSize = 'cover';
            canvas.style.backgroundPosition = 'center';
        } else {
            canvas.style.background = styles.background;
        }

        // Aplicar sombra y efectos
        if (styles.shadow) {
            canvas.style.boxShadow = styles.shadow;
        }

        if (styles.border) {
            canvas.style.border = styles.border;
        }

        if (styles.perspective) {
            canvas.style.transform = 'perspective(1000px) rotateY(-15deg) rotateX(5deg)';
        }

        // Limpiar contenido anterior
        canvas.innerHTML = '';

        // Crear overlay si existe
        if (styles.overlay) {
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = styles.overlay;
            canvas.appendChild(overlay);
        }

        // Renderizar título
        if (this.coverElements.title) {
            const titleElement = this.createTextElement(
                this.coverElements.title,
                styles.titleFont,
                styles.titleSize,
                styles.titleColor,
                styles.titlePosition
            );
            titleElement.className = 'cover-title';
            canvas.appendChild(titleElement);
        }

        // Renderizar autor
        if (this.coverElements.author) {
            const authorElement = this.createTextElement(
                this.coverElements.author,
                styles.authorFont,
                styles.authorSize,
                styles.authorColor,
                styles.authorPosition
            );
            authorElement.className = 'cover-author';
            canvas.appendChild(authorElement);
        }

        // Renderizar editorial
        if (this.coverElements.publisher) {
            const publisherElement = this.createTextElement(
                this.coverElements.publisher,
                styles.authorFont,
                '0.9em',
                styles.authorColor,
                styles.publisherPosition
            );
            publisherElement.className = 'cover-publisher';
            canvas.appendChild(publisherElement);
        }

        // Renderizar imagen frontal si existe
        if (this.coverElements.frontImage) {
            const frontImg = document.createElement('img');
            frontImg.src = this.coverElements.frontImage;
            frontImg.style.position = 'absolute';
            frontImg.style.top = '50%';
            frontImg.style.left = '50%';
            frontImg.style.transform = 'translate(-50%, -50%)';
            frontImg.style.maxWidth = '80%';
            frontImg.style.maxHeight = '60%';
            frontImg.style.objectFit = 'contain';
            canvas.appendChild(frontImg);
        }
    }

    createTextElement(text, font, size, color, position) {
        const element = document.createElement('div');
        element.textContent = text;
        element.style.position = 'absolute';
        element.style.fontFamily = font;
        element.style.fontSize = size;
        element.style.color = color;
        element.style.fontWeight = 'bold';
        element.style.textAlign = 'center';
        element.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        element.style.zIndex = '10';

        // Posicionamiento
        if (position.top) element.style.top = position.top;
        if (position.bottom) element.style.bottom = position.bottom;
        if (position.left) element.style.left = position.left;
        if (position.right) element.style.right = position.right;
        if (position.center) {
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
        }

        return element;
    }

    generateEcover() {
        // Generar representación 3D de la portada
        if (!this.currentTemplate) return null;

        const canvas = document.getElementById('cover-canvas');
        if (!canvas) return null;

        // Crear canvas 3D
        const ecover3D = document.createElement('div');
        ecover3D.className = 'ecover-3d';
        ecover3D.style.width = '300px';
        ecover3D.style.height = '400px';
        ecover3D.style.position = 'relative';
        ecover3D.style.transformStyle = 'preserve-3d';
        ecover3D.style.transform = 'perspective(1000px) rotateY(-25deg) rotateX(10deg)';

        // Cara frontal
        const front = canvas.cloneNode(true);
        front.style.position = 'absolute';
        front.style.width = '100%';
        front.style.height = '100%';
        front.style.transform = 'translateZ(20px)';

        // Lomo del libro
        const spine = document.createElement('div');
        spine.style.position = 'absolute';
        spine.style.width = '40px';
        spine.style.height = '100%';
        spine.style.background = this.currentTemplate.styles.background;
        spine.style.transform = 'rotateY(-90deg) translateZ(20px)';
        spine.style.left = '0';

        // Título en el lomo
        const spineTitle = document.createElement('div');
        spineTitle.textContent = this.coverElements.title;
        spineTitle.style.transform = 'rotate(-90deg)';
        spineTitle.style.position = 'absolute';
        spineTitle.style.top = '50%';
        spineTitle.style.left = '50%';
        spineTitle.style.transformOrigin = 'center';
        spineTitle.style.color = this.currentTemplate.styles.titleColor;
        spineTitle.style.fontSize = '0.8em';
        spineTitle.style.whiteSpace = 'nowrap';
        spine.appendChild(spineTitle);

        ecover3D.appendChild(front);
        ecover3D.appendChild(spine);

        return ecover3D;
    }

    exportCover(format = 'png') {
        const canvas = document.getElementById('cover-canvas');
        if (!canvas) return null;

        // Crear canvas HTML5 para exportación
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        
        const dimensions = this.currentTemplate.dimensions;
        exportCanvas.width = dimensions.width * 2; // Alta resolución
        exportCanvas.height = dimensions.height * 2;

        // Convertir HTML a imagen usando html2canvas (requiere librería externa)
        if (typeof html2canvas !== 'undefined') {
            return html2canvas(canvas, {
                width: dimensions.width,
                height: dimensions.height,
                scale: 2
            }).then(canvas => {
                if (format === 'png') {
                    return canvas.toDataURL('image/png');
                } else if (format === 'jpg') {
                    return canvas.toDataURL('image/jpeg', 0.9);
                }
            });
        }

        return null;
    }

    saveTemplate(name, customTemplate) {
        // Guardar plantilla personalizada
        const templateId = 'custom_' + Date.now();
        this.templates[templateId] = {
            name: name,
            type: 'custom',
            description: 'Plantilla personalizada',
            ...customTemplate
        };
        return templateId;
    }
}

// Funciones de integración con el Editor de Mundos existente
function initializeCoverTemplates() {
    window.coverTemplateManager = new CoverTemplateManager();
    
    // Crear selector de plantillas
    createTemplateSelector();
    
    // Actualizar controles existentes
    enhanceCoverControls();
}

function createTemplateSelector() {
    const coverControls = document.querySelector('.cover-controls');
    if (!coverControls) return;

    // Crear grupo de control para plantillas
    const templateGroup = document.createElement('div');
    templateGroup.className = 'control-group';
    templateGroup.innerHTML = `
        <label>Plantilla de portada:</label>
        <select id="cover-template" onchange="selectCoverTemplate()">
            <option value="">Seleccionar plantilla...</option>
        </select>
        <button onclick="showTemplatePreview()" class="preview-btn">Vista previa</button>
    `;

    // Insertar al principio de los controles
    coverControls.insertBefore(templateGroup, coverControls.firstChild);

    // Poblar selector con plantillas
    const templateSelect = document.getElementById('cover-template');
    const templates = window.coverTemplateManager.getTemplatesList();
    
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (${template.type})`;
        templateSelect.appendChild(option);
    });
}

function enhanceCoverControls() {
    // Añadir controles adicionales inspirados en Ecover
    const coverControls = document.querySelector('.cover-controls');
    if (!coverControls) return;

    // Control para imagen frontal
    const frontImageGroup = document.createElement('div');
    frontImageGroup.className = 'control-group';
    frontImageGroup.innerHTML = `
        <label>Imagen frontal:</label>
        <input type="file" id="cover-front-image" accept="image/*" onchange="updateFrontImage()">
    `;

    // Control para imagen lateral
    const sideImageGroup = document.createElement('div');
    sideImageGroup.className = 'control-group';
    sideImageGroup.innerHTML = `
        <label>Imagen lateral:</label>
        <input type="file" id="cover-side-image" accept="image/*" onchange="updateSideImage()">
    `;

    // Botón para generar Ecover 3D
    const ecoverGroup = document.createElement('div');
    ecoverGroup.className = 'control-group';
    ecoverGroup.innerHTML = `
        <button onclick="generateEcover3D()" class="ecover-btn">Generar Ecover 3D</button>
        <button onclick="exportCoverImage()" class="export-btn">Exportar Portada</button>
    `;

    coverControls.appendChild(frontImageGroup);
    coverControls.appendChild(sideImageGroup);
    coverControls.appendChild(ecoverGroup);
}

// Funciones de callback para la interfaz
function selectCoverTemplate() {
    const templateId = document.getElementById('cover-template').value;
    if (templateId && window.coverTemplateManager) {
        const template = window.coverTemplateManager.selectTemplate(templateId);
        if (template) {
            // Actualizar vista previa
            window.coverTemplateManager.renderCover();
        }
    }
}

function updateFrontImage() {
    const fileInput = document.getElementById('cover-front-image');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.coverTemplateManager.updateCoverElement('frontImage', e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function updateSideImage() {
    const fileInput = document.getElementById('cover-side-image');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.coverTemplateManager.updateCoverElement('sideImage', e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function generateEcover3D() {
    if (window.coverTemplateManager) {
        const ecover3D = window.coverTemplateManager.generateEcover();
        if (ecover3D) {
            // Mostrar en modal o nueva ventana
            showEcoverModal(ecover3D);
        }
    }
}

function exportCoverImage() {
    if (window.coverTemplateManager) {
        window.coverTemplateManager.exportCover('png').then(dataUrl => {
            if (dataUrl) {
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.download = 'portada.png';
                link.href = dataUrl;
                link.click();
            }
        });
    }
}

function showEcoverModal(ecover3D) {
    // Crear modal para mostrar el Ecover 3D
    const modal = document.createElement('div');
    modal.className = 'ecover-modal';
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
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        max-width: 80%;
        max-height: 80%;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Vista previa Ecover 3D';
    modalContent.appendChild(title);
    modalContent.appendChild(ecover3D);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.onclick = () => document.body.removeChild(modal);
    modalContent.appendChild(closeBtn);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Actualizar funciones existentes del Editor de Mundos
function updateCoverPreview() {
    if (window.coverTemplateManager) {
        const title = document.getElementById('cover-title').value;
        const author = document.getElementById('cover-author').value;
        const publisher = document.getElementById('cover-publisher').value;

        window.coverTemplateManager.updateCoverElement('title', title);
        window.coverTemplateManager.updateCoverElement('author', author);
        window.coverTemplateManager.updateCoverElement('publisher', publisher);
    } else {
        // Funcionalidad original como fallback
        const canvas = document.getElementById('cover-canvas');
        if (canvas) {
            const titleElement = canvas.querySelector('.cover-title');
            const authorElement = canvas.querySelector('.cover-author');
            const publisherElement = canvas.querySelector('.cover-publisher');

            if (titleElement) titleElement.textContent = document.getElementById('cover-title').value;
            if (authorElement) authorElement.textContent = document.getElementById('cover-author').value;
            if (publisherElement) publisherElement.textContent = document.getElementById('cover-publisher').value;
        }
    }
}

function updateCoverBackground() {
    const fileInput = document.getElementById('cover-background');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (window.coverTemplateManager) {
                window.coverTemplateManager.updateCoverElement('backgroundImage', e.target.result);
            } else {
                // Funcionalidad original
                const canvas = document.getElementById('cover-canvas');
                if (canvas) {
                    canvas.style.backgroundImage = `url(${e.target.result})`;
                    canvas.style.backgroundSize = 'cover';
                    canvas.style.backgroundPosition = 'center';
                }
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que el Editor de Mundos esté cargado
    setTimeout(initializeCoverTemplates, 1000);
});

// Exportar para uso global
window.CoverTemplateManager = CoverTemplateManager;

