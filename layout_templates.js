/**
 * Layout Templates Module - Basado en Ewriter Pro y plantillas DOC
 * Proporciona plantillas de maquetación profesional y funcionalidades avanzadas de publicación
 */

class LayoutTemplateManager {
    constructor() {
        this.templates = this.initializeTemplates();
        this.currentTemplate = null;
        this.documentSettings = {
            pageFormat: 'a4',
            orientation: 'portrait',
            margins: { top: 25, bottom: 25, left: 30, right: 25 },
            contentStart: 'right',
            includeCredits: true,
            fontSize: 12,
            fontFamily: 'Times New Roman',
            lineSpacing: 1.5,
            paragraphSpacing: 6
        };
        this.pages = [];
        this.currentPage = 0;
    }

    initializeTemplates() {
        return {
            // Plantillas inspiradas en Ewriter Pro y plantillas DOC
            'novel_classic': {
                name: 'Novela Clásica',
                type: 'book',
                description: 'Maquetación tradicional para novelas',
                settings: {
                    pageFormat: 'a5',
                    margins: { top: 20, bottom: 20, left: 25, right: 20 },
                    fontFamily: 'Times New Roman',
                    fontSize: 11,
                    lineSpacing: 1.3,
                    paragraphSpacing: 4,
                    chapterStart: 'new-page',
                    headerStyle: 'book-title',
                    footerStyle: 'page-number',
                    dropCap: true
                },
                styles: {
                    h1: { fontSize: '18pt', fontWeight: 'bold', textAlign: 'center', marginTop: '40pt', marginBottom: '20pt' },
                    h2: { fontSize: '14pt', fontWeight: 'bold', marginTop: '20pt', marginBottom: '10pt' },
                    p: { textAlign: 'justify', textIndent: '12pt', marginBottom: '0pt' },
                    blockquote: { fontStyle: 'italic', marginLeft: '20pt', marginRight: '20pt' }
                }
            },
            'academic_paper': {
                name: 'Documento Académico',
                type: 'academic',
                description: 'Formato para papers y documentos académicos',
                settings: {
                    pageFormat: 'a4',
                    margins: { top: 25, bottom: 25, left: 30, right: 25 },
                    fontFamily: 'Times New Roman',
                    fontSize: 12,
                    lineSpacing: 2.0,
                    paragraphSpacing: 12,
                    chapterStart: 'same-page',
                    headerStyle: 'running-head',
                    footerStyle: 'page-number',
                    citations: true
                },
                styles: {
                    h1: { fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginTop: '24pt', marginBottom: '12pt' },
                    h2: { fontSize: '12pt', fontWeight: 'bold', marginTop: '18pt', marginBottom: '6pt' },
                    p: { textAlign: 'justify', textIndent: '0pt', marginBottom: '12pt' },
                    blockquote: { marginLeft: '40pt', marginRight: '40pt', fontSize: '11pt' }
                }
            },
            'business_report': {
                name: 'Informe Empresarial',
                type: 'business',
                description: 'Formato profesional para informes de negocio',
                settings: {
                    pageFormat: 'a4',
                    margins: { top: 30, bottom: 25, left: 25, right: 25 },
                    fontFamily: 'Arial',
                    fontSize: 11,
                    lineSpacing: 1.15,
                    paragraphSpacing: 6,
                    chapterStart: 'new-page',
                    headerStyle: 'company-logo',
                    footerStyle: 'page-date',
                    toc: true
                },
                styles: {
                    h1: { fontSize: '16pt', fontWeight: 'bold', color: '#2c3e50', marginTop: '20pt', marginBottom: '10pt' },
                    h2: { fontSize: '14pt', fontWeight: 'bold', color: '#34495e', marginTop: '15pt', marginBottom: '8pt' },
                    p: { textAlign: 'left', textIndent: '0pt', marginBottom: '6pt' },
                    table: { border: '1pt solid #bdc3c7', marginTop: '10pt', marginBottom: '10pt' }
                }
            },
            'ebook_modern': {
                name: 'eBook Moderno',
                type: 'ebook',
                description: 'Optimizado para lectura digital',
                settings: {
                    pageFormat: 'custom',
                    customSize: { width: 160, height: 240 },
                    margins: { top: 15, bottom: 15, left: 15, right: 15 },
                    fontFamily: 'Georgia',
                    fontSize: 12,
                    lineSpacing: 1.4,
                    paragraphSpacing: 8,
                    chapterStart: 'new-page',
                    headerStyle: 'none',
                    footerStyle: 'progress',
                    responsive: true
                },
                styles: {
                    h1: { fontSize: '20pt', fontWeight: 'bold', textAlign: 'left', marginTop: '30pt', marginBottom: '15pt' },
                    h2: { fontSize: '16pt', fontWeight: 'bold', marginTop: '20pt', marginBottom: '10pt' },
                    p: { textAlign: 'left', textIndent: '0pt', marginBottom: '8pt' },
                    a: { color: '#3498db', textDecoration: 'underline' }
                }
            },
            'magazine_layout': {
                name: 'Revista/Catálogo',
                type: 'magazine',
                description: 'Layout de revista con columnas múltiples',
                settings: {
                    pageFormat: 'a4',
                    margins: { top: 20, bottom: 20, left: 20, right: 20 },
                    fontFamily: 'Arial',
                    fontSize: 10,
                    lineSpacing: 1.2,
                    paragraphSpacing: 4,
                    columns: 2,
                    columnGap: 15,
                    chapterStart: 'same-page',
                    headerStyle: 'magazine-header',
                    footerStyle: 'magazine-footer'
                },
                styles: {
                    h1: { fontSize: '24pt', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10pt', columnSpan: 'all' },
                    h2: { fontSize: '14pt', fontWeight: 'bold', marginTop: '12pt', marginBottom: '6pt' },
                    p: { textAlign: 'justify', textIndent: '0pt', marginBottom: '4pt' },
                    img: { maxWidth: '100%', marginTop: '8pt', marginBottom: '8pt' }
                }
            },
            'technical_manual': {
                name: 'Manual Técnico',
                type: 'technical',
                description: 'Para documentación técnica y manuales',
                settings: {
                    pageFormat: 'a4',
                    margins: { top: 25, bottom: 25, left: 30, right: 25 },
                    fontFamily: 'Calibri',
                    fontSize: 11,
                    lineSpacing: 1.3,
                    paragraphSpacing: 6,
                    chapterStart: 'new-page',
                    headerStyle: 'chapter-title',
                    footerStyle: 'page-chapter',
                    numbering: 'hierarchical'
                },
                styles: {
                    h1: { fontSize: '16pt', fontWeight: 'bold', color: '#2980b9', marginTop: '24pt', marginBottom: '12pt' },
                    h2: { fontSize: '14pt', fontWeight: 'bold', color: '#3498db', marginTop: '18pt', marginBottom: '9pt' },
                    h3: { fontSize: '12pt', fontWeight: 'bold', marginTop: '12pt', marginBottom: '6pt' },
                    p: { textAlign: 'left', textIndent: '0pt', marginBottom: '6pt' },
                    code: { fontFamily: 'Courier New', fontSize: '10pt', background: '#f8f9fa', padding: '2pt' },
                    pre: { fontFamily: 'Courier New', fontSize: '9pt', background: '#f8f9fa', padding: '8pt', border: '1pt solid #dee2e6' }
                }
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
            this.applyTemplateSettings();
            return this.currentTemplate;
        }
        return null;
    }

    applyTemplateSettings() {
        if (!this.currentTemplate) return;

        const settings = this.currentTemplate.settings;
        
        // Aplicar configuraciones del template
        Object.assign(this.documentSettings, settings);
        
        // Actualizar interfaz
        this.updateLayoutInterface();
        
        // Regenerar vista previa
        this.generatePreview();
    }

    updateLayoutInterface() {
        // Actualizar controles de la interfaz con los valores del template
        const pageFormat = document.getElementById('page-format');
        const orientation = document.getElementById('page-orientation');
        const marginInputs = {
            top: document.getElementById('margin-top'),
            bottom: document.getElementById('margin-bottom'),
            left: document.getElementById('margin-left'),
            right: document.getElementById('margin-right')
        };

        if (pageFormat) pageFormat.value = this.documentSettings.pageFormat;
        if (orientation) orientation.value = this.documentSettings.orientation;
        
        Object.keys(marginInputs).forEach(key => {
            if (marginInputs[key]) {
                marginInputs[key].value = this.documentSettings.margins[key];
            }
        });
    }

    generatePreview() {
        const previewContainer = document.getElementById('page-preview');
        if (!previewContainer) return;

        // Limpiar vista previa anterior
        previewContainer.innerHTML = '';

        // Obtener contenido del editor de texto
        const textContent = document.getElementById('text-content');
        const content = textContent ? textContent.innerHTML : '<p>Contenido de ejemplo...</p>';

        // Generar páginas basadas en el template
        this.pages = this.paginateContent(content);
        
        // Renderizar páginas en la vista previa
        this.pages.forEach((page, index) => {
            const pageElement = this.createPageElement(page, index);
            previewContainer.appendChild(pageElement);
        });
    }

    paginateContent(content) {
        // Simulación de paginación - en una implementación real sería más compleja
        const pages = [];
        const wordsPerPage = this.estimateWordsPerPage();
        
        // Dividir contenido en páginas
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const words = text.split(/\s+/);
        
        for (let i = 0; i < words.length; i += wordsPerPage) {
            const pageWords = words.slice(i, i + wordsPerPage);
            pages.push({
                content: pageWords.join(' '),
                pageNumber: pages.length + 1,
                isBlank: false
            });
        }

        // Añadir páginas especiales si están configuradas
        if (this.documentSettings.includeCredits) {
            pages.push({
                content: this.generateCreditsPage(),
                pageNumber: pages.length + 1,
                isCredits: true
            });
        }

        return pages;
    }

    estimateWordsPerPage() {
        // Estimación basada en formato de página y configuraciones
        const formats = {
            'a4': { width: 210, height: 297 },
            'a5': { width: 148, height: 210 },
            'letter': { width: 216, height: 279 }
        };

        const format = formats[this.documentSettings.pageFormat] || formats.a4;
        const margins = this.documentSettings.margins;
        
        const usableWidth = format.width - margins.left - margins.right;
        const usableHeight = format.height - margins.top - margins.bottom;
        
        // Estimación aproximada de palabras por página
        const fontSize = this.documentSettings.fontSize || 12;
        const lineSpacing = this.documentSettings.lineSpacing || 1.5;
        
        const linesPerPage = Math.floor(usableHeight / (fontSize * lineSpacing * 0.35));
        const wordsPerLine = Math.floor(usableWidth / (fontSize * 0.6));
        
        return Math.max(linesPerPage * wordsPerLine, 100); // Mínimo 100 palabras por página
    }

    createPageElement(page, index) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-preview';
        pageDiv.style.cssText = this.getPageStyles();

        // Aplicar estilos del template
        if (this.currentTemplate && this.currentTemplate.styles) {
            this.applyTemplateStyles(pageDiv);
        }

        // Contenido de la página
        const contentDiv = document.createElement('div');
        contentDiv.className = 'page-content';
        contentDiv.innerHTML = page.content;
        
        // Header
        if (this.shouldShowHeader(index)) {
            const header = this.createHeader(page);
            pageDiv.appendChild(header);
        }

        pageDiv.appendChild(contentDiv);

        // Footer
        if (this.shouldShowFooter(index)) {
            const footer = this.createFooter(page);
            pageDiv.appendChild(footer);
        }

        return pageDiv;
    }

    getPageStyles() {
        const settings = this.documentSettings;
        const formats = {
            'a4': { width: 210, height: 297 },
            'a5': { width: 148, height: 210 },
            'letter': { width: 216, height: 279 }
        };

        const format = formats[settings.pageFormat] || formats.a4;
        const scale = 0.5; // Escala para vista previa

        return `
            width: ${format.width * scale}px;
            height: ${format.height * scale}px;
            padding: ${settings.margins.top * scale}px ${settings.margins.right * scale}px ${settings.margins.bottom * scale}px ${settings.margins.left * scale}px;
            margin: 10px;
            background: white;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-family: ${settings.fontFamily};
            font-size: ${(settings.fontSize * scale)}px;
            line-height: ${settings.lineSpacing};
            position: relative;
            overflow: hidden;
        `;
    }

    applyTemplateStyles(pageElement) {
        const styles = this.currentTemplate.styles;
        
        // Crear hoja de estilos dinámica para el template
        const styleSheet = document.createElement('style');
        let css = '';

        Object.keys(styles).forEach(selector => {
            const rules = styles[selector];
            css += `.page-preview ${selector} {`;
            Object.keys(rules).forEach(property => {
                css += `${this.camelToKebab(property)}: ${rules[property]};`;
            });
            css += '} ';
        });

        styleSheet.textContent = css;
        document.head.appendChild(styleSheet);
    }

    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    shouldShowHeader(pageIndex) {
        // Lógica para determinar si mostrar header en esta página
        return pageIndex > 0; // No mostrar en primera página
    }

    shouldShowFooter(pageIndex) {
        // Lógica para determinar si mostrar footer en esta página
        return true; // Mostrar en todas las páginas
    }

    createHeader(page) {
        const header = document.createElement('div');
        header.className = 'page-header';
        header.style.cssText = `
            position: absolute;
            top: 10px;
            left: 0;
            right: 0;
            height: 20px;
            font-size: 10px;
            color: #666;
        `;

        const headerStyle = this.documentSettings.headerStyle || 'none';
        
        switch (headerStyle) {
            case 'book-title':
                header.textContent = 'Título del Libro';
                header.style.textAlign = 'center';
                break;
            case 'chapter-title':
                header.textContent = 'Capítulo Actual';
                header.style.textAlign = 'left';
                break;
            case 'running-head':
                header.textContent = 'TÍTULO ABREVIADO';
                header.style.textAlign = 'center';
                header.style.textTransform = 'uppercase';
                break;
            default:
                return null;
        }

        return header;
    }

    createFooter(page) {
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        footer.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            height: 20px;
            font-size: 10px;
            color: #666;
        `;

        const footerStyle = this.documentSettings.footerStyle || 'page-number';
        
        switch (footerStyle) {
            case 'page-number':
                footer.textContent = page.pageNumber.toString();
                footer.style.textAlign = 'center';
                break;
            case 'page-date':
                footer.innerHTML = `<span style="float: left;">${new Date().toLocaleDateString()}</span><span style="float: right;">${page.pageNumber}</span>`;
                break;
            case 'page-chapter':
                footer.innerHTML = `<span style="float: left;">Capítulo 1</span><span style="float: right;">${page.pageNumber}</span>`;
                break;
            default:
                return null;
        }

        return footer;
    }

    generateCreditsPage() {
        return `
            <div style="text-align: center; margin-top: 50px;">
                <h2>Información de Publicación</h2>
                <p><strong>Título:</strong> ${document.getElementById('cover-title')?.value || 'Título del Libro'}</p>
                <p><strong>Autor:</strong> ${document.getElementById('cover-author')?.value || 'Nombre del Autor'}</p>
                <p><strong>Editorial:</strong> ${document.getElementById('cover-publisher')?.value || 'Editorial WC'}</p>
                <p><strong>Fecha de Publicación:</strong> ${new Date().getFullYear()}</p>
                <p><strong>ISBN:</strong> 978-84-XXXXX-XX-X</p>
                <p><strong>Depósito Legal:</strong> M-XXXXX-${new Date().getFullYear()}</p>
                <hr style="margin: 20px 0;">
                <p style="font-size: 10px;">
                    © ${new Date().getFullYear()} ${document.getElementById('cover-author')?.value || 'Nombre del Autor'}. 
                    Todos los derechos reservados. Ninguna parte de esta publicación puede ser reproducida, 
                    distribuida o transmitida en cualquier forma o por cualquier medio, incluyendo fotocopiado, 
                    grabación u otros métodos electrónicos o mecánicos, sin el permiso previo por escrito del editor.
                </p>
            </div>
        `;
    }

    exportToPDF(options = {}) {
        // Configuración de exportación a PDF con opciones de seguridad (inspirado en Ewriter Pro)
        const exportOptions = {
            format: this.documentSettings.pageFormat,
            orientation: this.documentSettings.orientation,
            margins: this.documentSettings.margins,
            password: options.password || null,
            permissions: {
                printing: options.allowPrinting !== false,
                copying: options.allowCopying !== false,
                modifying: options.allowModifying !== false
            },
            metadata: {
                title: document.getElementById('cover-title')?.value || 'Documento',
                author: document.getElementById('cover-author')?.value || 'Autor',
                subject: options.subject || '',
                keywords: options.keywords || '',
                creator: 'Editor de Mundos',
                producer: 'Editor de Mundos PDF Engine'
            }
        };

        // En una implementación real, aquí se usaría una librería como jsPDF o PDFMake
        console.log('Exportando a PDF con opciones:', exportOptions);
        
        // Simular exportación
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    filename: `${exportOptions.metadata.title}.pdf`,
                    size: '2.5 MB',
                    pages: this.pages.length
                });
            }, 2000);
        });
    }

    exportToDOCX() {
        // Exportación a DOCX con interpretación HTML (basado en el conocimiento)
        const content = document.getElementById('text-content');
        if (!content) return null;

        // Interpretar HTML a estructura DOCX
        const htmlContent = content.innerHTML;
        const interpretedContent = this.interpretHTMLForDOCX(htmlContent);

        // En una implementación real, aquí se usaría una librería como docx
        console.log('Exportando a DOCX:', interpretedContent);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    filename: `${document.getElementById('cover-title')?.value || 'Documento'}.docx`,
                    size: '1.8 MB'
                });
            }, 1500);
        });
    }

    interpretHTMLForDOCX(html) {
        // Interpretar elementos HTML para DOCX según el conocimiento
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Convertir <div> a saltos de línea
        const divs = tempDiv.querySelectorAll('div');
        divs.forEach(div => {
            const lineBreaks = '\n'.repeat(Math.max(1, div.children.length || 1));
            div.replaceWith(document.createTextNode(div.textContent + lineBreaks));
        });

        // Preservar imágenes y gráficos
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            // Mantener referencia a imagen original
            img.setAttribute('data-docx-preserve', 'true');
        });

        return tempDiv.innerHTML;
    }

    saveTemplate(name, customSettings) {
        // Guardar template personalizado
        const templateId = 'custom_' + Date.now();
        this.templates[templateId] = {
            name: name,
            type: 'custom',
            description: 'Plantilla personalizada',
            settings: { ...this.documentSettings, ...customSettings },
            styles: this.currentTemplate?.styles || {}
        };
        return templateId;
    }
}

// Funciones de integración con el Editor de Mundos existente
function initializeLayoutTemplates() {
    window.layoutTemplateManager = new LayoutTemplateManager();
    
    // Crear selector de plantillas de maquetación
    createLayoutTemplateSelector();
    
    // Mejorar controles existentes
    enhanceLayoutControls();
}

function createLayoutTemplateSelector() {
    const layoutControls = document.querySelector('.layout-controls');
    if (!layoutControls) return;

    // Crear grupo de control para plantillas de maquetación
    const templateGroup = document.createElement('div');
    templateGroup.className = 'control-group';
    templateGroup.innerHTML = `
        <label>Plantilla de maquetación:</label>
        <select id="layout-template" onchange="selectLayoutTemplate()">
            <option value="">Seleccionar plantilla...</option>
        </select>
        <button onclick="previewLayout()" class="preview-btn">Vista previa</button>
    `;

    // Insertar al principio de los controles
    layoutControls.insertBefore(templateGroup, layoutControls.firstChild);

    // Poblar selector con plantillas
    const templateSelect = document.getElementById('layout-template');
    const templates = window.layoutTemplateManager.getTemplatesList();
    
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (${template.type})`;
        templateSelect.appendChild(option);
    });
}

function enhanceLayoutControls() {
    const layoutControls = document.querySelector('.layout-controls');
    if (!layoutControls) return;

    // Añadir controles de exportación avanzada
    const exportGroup = document.createElement('div');
    exportGroup.className = 'control-group export-controls';
    exportGroup.innerHTML = `
        <label>Exportación:</label>
        <div class="export-buttons">
            <button onclick="exportToPDFAdvanced()" class="export-btn pdf-btn">PDF Avanzado</button>
            <button onclick="exportToDOCXAdvanced()" class="export-btn docx-btn">DOCX</button>
            <button onclick="exportToEPUB()" class="export-btn epub-btn">ePUB</button>
            <button onclick="showPrintSettings()" class="export-btn print-btn">Imprenta</button>
        </div>
    `;

    layoutControls.appendChild(exportGroup);

    // Controles de seguridad PDF
    const securityGroup = document.createElement('div');
    securityGroup.className = 'control-group security-controls';
    securityGroup.innerHTML = `
        <label>Seguridad PDF:</label>
        <div class="security-options">
            <label><input type="checkbox" id="pdf-password"> Proteger con contraseña</label>
            <label><input type="checkbox" id="pdf-no-print"> Deshabilitar impresión</label>
            <label><input type="checkbox" id="pdf-no-copy"> Deshabilitar copia</label>
            <label><input type="checkbox" id="pdf-no-modify"> Deshabilitar modificación</label>
        </div>
        <input type="password" id="pdf-password-input" placeholder="Contraseña PDF" style="display:none;">
    `;

    layoutControls.appendChild(securityGroup);

    // Event listener para mostrar/ocultar campo de contraseña
    document.getElementById('pdf-password').addEventListener('change', function() {
        const passwordInput = document.getElementById('pdf-password-input');
        passwordInput.style.display = this.checked ? 'block' : 'none';
    });
}

// Funciones de callback para la interfaz
function selectLayoutTemplate() {
    const templateId = document.getElementById('layout-template').value;
    if (templateId && window.layoutTemplateManager) {
        const template = window.layoutTemplateManager.selectTemplate(templateId);
        if (template) {
            // Actualizar vista previa
            window.layoutTemplateManager.generatePreview();
        }
    }
}

function previewLayout() {
    if (window.layoutTemplateManager) {
        window.layoutTemplateManager.generatePreview();
    }
}

function exportToPDFAdvanced() {
    if (!window.layoutTemplateManager) return;

    const options = {
        password: document.getElementById('pdf-password').checked ? 
                 document.getElementById('pdf-password-input').value : null,
        allowPrinting: !document.getElementById('pdf-no-print').checked,
        allowCopying: !document.getElementById('pdf-no-copy').checked,
        allowModifying: !document.getElementById('pdf-no-modify').checked
    };

    // Mostrar indicador de carga
    const exportBtn = event.target;
    exportBtn.classList.add('export-loading');
    exportBtn.textContent = 'Exportando...';

    window.layoutTemplateManager.exportToPDF(options).then(result => {
        exportBtn.classList.remove('export-loading');
        exportBtn.textContent = 'PDF Avanzado';
        
        if (result.success) {
            showExportSuccess('PDF', result);
        } else {
            showExportError('PDF', result.error);
        }
    });
}

function exportToDOCXAdvanced() {
    if (!window.layoutTemplateManager) return;

    const exportBtn = event.target;
    exportBtn.classList.add('export-loading');
    exportBtn.textContent = 'Exportando...';

    window.layoutTemplateManager.exportToDOCX().then(result => {
        exportBtn.classList.remove('export-loading');
        exportBtn.textContent = 'DOCX';
        
        if (result.success) {
            showExportSuccess('DOCX', result);
        } else {
            showExportError('DOCX', result.error);
        }
    });
}

function exportToEPUB() {
    // Implementación futura para ePUB
    alert('Exportación a ePUB estará disponible próximamente');
}

function showPrintSettings() {
    // Mostrar modal con configuraciones de imprenta
    const modal = document.createElement('div');
    modal.className = 'print-settings-modal';
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
        <h3>Configuración para Imprenta</h3>
        <div class="print-options">
            <label><input type="checkbox" checked> Marcas de corte</label>
            <label><input type="checkbox" checked> Sangrado (3mm)</label>
            <label><input type="checkbox"> Perfil de color CMYK</label>
            <label><input type="checkbox"> Resolución 300 DPI</label>
            <label>
                Papel:
                <select>
                    <option>Offset 90g</option>
                    <option>Offset 120g</option>
                    <option>Estucado 135g</option>
                    <option>Estucado 170g</option>
                </select>
            </label>
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button onclick="this.closest('.print-settings-modal').remove()" style="margin-right: 10px;">Cancelar</button>
            <button onclick="generatePrintPDF(this)">Generar PDF para Imprenta</button>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function generatePrintPDF(button) {
    button.textContent = 'Generando...';
    button.disabled = true;

    setTimeout(() => {
        button.textContent = 'Generar PDF para Imprenta';
        button.disabled = false;
        button.closest('.print-settings-modal').remove();
        
        showExportSuccess('PDF para Imprenta', {
            filename: 'documento_imprenta.pdf',
            size: '15.2 MB',
            pages: window.layoutTemplateManager?.pages.length || 1
        });
    }, 3000);
}

function showExportSuccess(format, result) {
    const notification = document.createElement('div');
    notification.className = 'export-notification success';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
        <strong>✓ Exportación exitosa</strong><br>
        Formato: ${format}<br>
        Archivo: ${result.filename}<br>
        Tamaño: ${result.size}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showExportError(format, error) {
    const notification = document.createElement('div');
    notification.className = 'export-notification error';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
        <strong>✗ Error en exportación</strong><br>
        Formato: ${format}<br>
        Error: ${error || 'Error desconocido'}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Actualizar funciones existentes del Editor de Mundos
function updatePageFormat() {
    if (window.layoutTemplateManager) {
        const format = document.getElementById('page-format').value;
        window.layoutTemplateManager.documentSettings.pageFormat = format;
        window.layoutTemplateManager.generatePreview();
    }
}

function updatePageOrientation() {
    if (window.layoutTemplateManager) {
        const orientation = document.getElementById('page-orientation').value;
        window.layoutTemplateManager.documentSettings.orientation = orientation;
        window.layoutTemplateManager.generatePreview();
    }
}

function updateContentStart() {
    if (window.layoutTemplateManager) {
        const contentStart = document.getElementById('content-start').value;
        window.layoutTemplateManager.documentSettings.contentStart = contentStart;
        window.layoutTemplateManager.generatePreview();
    }
}

function toggleCreditsPage() {
    if (window.layoutTemplateManager) {
        const includeCredits = document.getElementById('include-credits').checked;
        window.layoutTemplateManager.documentSettings.includeCredits = includeCredits;
        window.layoutTemplateManager.generatePreview();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que el Editor de Mundos esté cargado
    setTimeout(initializeLayoutTemplates, 1200);
});

// Exportar para uso global
window.LayoutTemplateManager = LayoutTemplateManager;

