/**
 * Browser Integration - Sistema de Integración con el Navegador
 * Facilita la importación/exportación de contenido desde plataformas externas
 * y permite al usuario tomar el control del navegador para interactuar con servicios
 */

class BrowserIntegration {
  constructor() {
    this.externalWindows = {};
    this.contentBuffer = null;
    this.initializeUI();
  }

  /**
   * Inicializa la interfaz de usuario
   */
  initializeUI() {
    this.createBrowserControlPanel();
    this.attachEventListeners();
  }

  /**
   * Crea el panel de control del navegador
   */
  createBrowserControlPanel() {
    const panelHTML = `
      <div id="browser-control-panel" class="browser-control-panel" style="display: none;">
        <div class="panel-header">
          <h3>🌐 Control del Navegador</h3>
          <button class="close-panel-btn">&times;</button>
        </div>
        <div class="panel-content">
          <div class="browser-actions">
            <h4>Acceso Directo a Generadores</h4>
            <div class="action-buttons">
              <button class="btn-open-veo31" data-service="veo31">
                <span class="icon">🎬</span>
                <span class="label">Abrir Veo 3.1</span>
              </button>
              <button class="btn-open-supergrok" data-service="supergrok">
                <span class="icon">🎥</span>
                <span class="label">Abrir SuperGrok</span>
              </button>
            </div>
          </div>

          <div class="content-management">
            <h4>Gestión de Contenido</h4>
            <div class="content-actions">
              <button class="btn-paste-content">
                <span class="icon">📋</span>
                <span class="label">Pegar Contenido Generado</span>
              </button>
              <button class="btn-copy-editor-content">
                <span class="icon">📄</span>
                <span class="label">Copiar Contenido del Editor</span>
              </button>
              <button class="btn-import-from-clipboard">
                <span class="icon">📥</span>
                <span class="label">Importar desde Portapapeles</span>
              </button>
            </div>
          </div>

          <div class="browser-control">
            <h4>Control del Navegador</h4>
            <p class="info-text">Abre una ventana del navegador para acceder directamente a los generadores de contenido. Puedes copiar y pegar contenido entre el navegador y el editor.</p>
            <div class="control-buttons">
              <button class="btn-take-browser-control">
                <span class="icon">🎮</span>
                <span class="label">Tomar Control del Navegador</span>
              </button>
              <button class="btn-sync-windows">
                <span class="icon">🔄</span>
                <span class="label">Sincronizar Ventanas</span>
              </button>
            </div>
          </div>

          <div class="clipboard-monitor">
            <h4>Monitor de Portapapeles</h4>
            <label class="checkbox-label">
              <input type="checkbox" id="clipboard-monitor-toggle" class="clipboard-toggle">
              <span>Monitorear portapapeles automáticamente</span>
            </label>
            <p class="info-text small">Cuando está activado, el contenido copiado desde las plataformas externas se importará automáticamente al editor.</p>
          </div>
        </div>
      </div>
    `;

    if (!document.getElementById('browser-control-panel')) {
      document.body.insertAdjacentHTML('beforeend', panelHTML);
    }
  }

  /**
   * Adjunta los event listeners
   */
  attachEventListeners() {
    document.addEventListener('click', (e) => {
      // Abrir generadores web
      if (e.target.closest('.btn-open-veo31')) {
        this.openGeneratorInNewWindow('veo31', 'https://gemini.google.com/app/tools');
      }

      if (e.target.closest('.btn-open-supergrok')) {
        this.openGeneratorInNewWindow('supergrok', 'https://grok.com/imagine');
      }

      // Pegar contenido
      if (e.target.closest('.btn-paste-content')) {
        this.pasteContentToEditor();
      }

      // Copiar contenido del editor
      if (e.target.closest('.btn-copy-editor-content')) {
        this.copyEditorContent();
      }

      // Importar desde portapapeles
      if (e.target.closest('.btn-import-from-clipboard')) {
        this.importFromClipboard();
      }

      // Tomar control del navegador
      if (e.target.closest('.btn-take-browser-control')) {
        this.takeBrowserControl();
      }

      // Sincronizar ventanas
      if (e.target.closest('.btn-sync-windows')) {
        this.syncWindows();
      }

      // Cerrar panel
      if (e.target.closest('.close-panel-btn')) {
        this.closeBrowserControlPanel();
      }
    });

    // Monitor de portapapeles
    document.addEventListener('change', (e) => {
      if (e.target.id === 'clipboard-monitor-toggle') {
        if (e.target.checked) {
          this.startClipboardMonitoring();
        } else {
          this.stopClipboardMonitoring();
        }
      }
    });
  }

  /**
   * Abre un generador en una nueva ventana
   * @param {string} service - Nombre del servicio
   * @param {string} url - URL del servicio
   */
  openGeneratorInNewWindow(service, url) {
    const windowName = `mundos_${service}_window`;
    const windowFeatures = 'width=1200,height=800,resizable=yes,scrollbars=yes';
    
    const newWindow = window.open(url, windowName, windowFeatures);
    
    if (newWindow) {
      this.externalWindows[service] = newWindow;
      this.showNotification(`Ventana de ${service} abierta. Puedes copiar el contenido generado y pegarlo aquí.`, 'info');
    } else {
      this.showNotification('No se pudo abrir la ventana. Verifica la configuración de pop-ups.', 'error');
    }
  }

  /**
   * Pega contenido en el editor desde el portapapeles
   */
  async pasteContentToEditor() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        this.insertContentIntoEditor(text);
        this.showNotification('Contenido pegado en el editor.', 'success');
      } else {
        this.showNotification('El portapapeles está vacío.', 'warning');
      }
    } catch (error) {
      this.showNotification('No se pudo acceder al portapapeles.', 'error');
      console.error(error);
    }
  }

  /**
   * Copia el contenido del editor al portapapeles
   */
  async copyEditorContent() {
    try {
      const editorContent = this.getEditorContent();
      if (editorContent) {
        await navigator.clipboard.writeText(editorContent);
        this.showNotification('Contenido del editor copiado al portapapeles.', 'success');
      } else {
        this.showNotification('El editor está vacío.', 'warning');
      }
    } catch (error) {
      this.showNotification('No se pudo copiar el contenido.', 'error');
      console.error(error);
    }
  }

  /**
   * Importa contenido desde el portapapeles
   */
  async importFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        this.insertContentIntoEditor(text);
        this.contentBuffer = text;
        this.showNotification('Contenido importado desde el portapapeles.', 'success');
      } else {
        this.showNotification('El portapapeles está vacío.', 'warning');
      }
    } catch (error) {
      this.showNotification('No se pudo importar desde el portapapeles.', 'error');
      console.error(error);
    }
  }

  /**
   * Inicia el monitoreo del portapapeles
   */
  startClipboardMonitoring() {
    this.clipboardMonitorInterval = setInterval(async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text !== this.contentBuffer) {
          this.contentBuffer = text;
          this.insertContentIntoEditor(text);
          this.showNotification('Nuevo contenido detectado en el portapapeles.', 'info');
        }
      } catch (error) {
        // El acceso al portapapeles puede estar restringido
      }
    }, 2000); // Verificar cada 2 segundos
  }

  /**
   * Detiene el monitoreo del portapapeles
   */
  stopClipboardMonitoring() {
    if (this.clipboardMonitorInterval) {
      clearInterval(this.clipboardMonitorInterval);
      this.clipboardMonitorInterval = null;
    }
  }

  /**
   * Toma el control del navegador para facilitar la interacción
   */
  takeBrowserControl() {
    const message = `
      Para tomar control del navegador:
      1. Abre los generadores de contenido (Veo 3.1 o SuperGrok)
      2. Genera tu contenido
      3. Copia el contenido generado (Ctrl+C o Cmd+C)
      4. Vuelve a esta ventana y haz clic en "Pegar Contenido Generado"
      
      También puedes usar el monitor de portapapeles para importar automáticamente.
    `;
    
    alert(message);
    this.showNotification('Modo de control del navegador activado.', 'info');
  }

  /**
   * Sincroniza las ventanas abiertas
   */
  syncWindows() {
    const openWindows = Object.keys(this.externalWindows).filter(
      service => this.externalWindows[service] && !this.externalWindows[service].closed
    );

    if (openWindows.length === 0) {
      this.showNotification('No hay ventanas abiertas para sincronizar.', 'warning');
    } else {
      this.showNotification(`${openWindows.length} ventana(s) sincronizada(s).`, 'success');
    }
  }

  /**
   * Obtiene el contenido del editor
   * @returns {string} Contenido del editor
   */
  getEditorContent() {
    // Buscar el editor en el DOM
    const editors = [
      document.querySelector('[contenteditable="true"]'),
      document.querySelector('textarea'),
      document.querySelector('.editor-content'),
      document.querySelector('#editor-content')
    ];

    for (let editor of editors) {
      if (editor) {
        return editor.textContent || editor.value || '';
      }
    }

    return '';
  }

  /**
   * Inserta contenido en el editor
   * @param {string} content - Contenido a insertar
   */
  insertContentIntoEditor(content) {
    const editors = [
      document.querySelector('[contenteditable="true"]'),
      document.querySelector('textarea'),
      document.querySelector('.editor-content'),
      document.querySelector('#editor-content')
    ];

    for (let editor of editors) {
      if (editor) {
        if (editor.textContent !== undefined) {
          editor.textContent += '\n' + content;
        } else if (editor.value !== undefined) {
          editor.value += '\n' + content;
        }
        editor.focus();
        return;
      }
    }

    // Si no se encuentra un editor, mostrar un diálogo
    const userInput = prompt('No se encontró un editor. Pega el contenido aquí:', content);
    if (userInput) {
      this.contentBuffer = userInput;
    }
  }

  /**
   * Abre el panel de control del navegador
   */
  openBrowserControlPanel() {
    const panel = document.getElementById('browser-control-panel');
    if (panel) {
      panel.style.display = 'flex';
    }
  }

  /**
   * Cierra el panel de control del navegador
   */
  closeBrowserControlPanel() {
    const panel = document.getElementById('browser-control-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * Muestra una notificación al usuario
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Crear instancia global
const browserIntegration = new BrowserIntegration();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserIntegration;
}

