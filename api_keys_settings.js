/**
 * API Keys Settings - Interfaz de Usuario para Gestión de Claves de API
 * Proporciona una interfaz para que el usuario configure sus claves de API
 */

class APIKeysSettings {
  constructor(apiKeysManager) {
    this.manager = apiKeysManager;
    this.modalId = 'api-keys-modal';
    this.initializeUI();
  }

  /**
   * Inicializa la interfaz de usuario
   */
  initializeUI() {
    this.createSettingsModal();
    this.attachEventListeners();
  }

  /**
   * Crea el modal de configuración de claves de API
   */
  createSettingsModal() {
    const modalHTML = `
      <div id="${this.modalId}" class="modal api-keys-modal" style="display: none;">
        <div class="modal-content api-keys-modal-content">
          <div class="modal-header">
            <h2>⚙️ Configuración de Claves de API</h2>
            <button class="close-btn" data-action="close-api-keys-modal">&times;</button>
          </div>
          <div class="modal-body api-keys-settings-body">
            <p class="info-text">Introduce tus claves de API para acceso directo a los servicios. Las claves se guardan localmente en tu navegador de forma segura.</p>
            
            <div class="api-key-section">
              <h3>🎬 Veo 3.1 (Google)</h3>
              <p class="service-description">Generador de video de Google. Accede a <a href="https://gemini.google.com/app/tools" target="_blank">gemini.google.com/app/tools</a> para obtener tu clave.</p>
              <div class="input-group">
                <input type="password" id="veo31-key-input" placeholder="Introduce tu clave de API de Veo 3.1" class="api-key-input">
                <button class="btn-toggle-visibility" data-service="veo31">👁️</button>
              </div>
              <div class="button-group">
                <button class="btn-save-key" data-service="veo31">Guardar Clave</button>
                <button class="btn-open-web" data-service="veo31">Abrir Generador Web</button>
                <button class="btn-clear-key" data-service="veo31">Limpiar</button>
              </div>
              <div class="key-status" id="veo31-status"></div>
            </div>

            <div class="api-key-section">
              <h3>🎥 SuperGrok (xAI)</h3>
              <p class="service-description">Generador de video de xAI. Accede a <a href="https://grok.com/imagine" target="_blank">grok.com/imagine</a> para obtener tu clave.</p>
              <div class="input-group">
                <input type="password" id="supergrok-key-input" placeholder="Introduce tu clave de API de SuperGrok" class="api-key-input">
                <button class="btn-toggle-visibility" data-service="supergrok">👁️</button>
              </div>
              <div class="button-group">
                <button class="btn-save-key" data-service="supergrok">Guardar Clave</button>
                <button class="btn-open-web" data-service="supergrok">Abrir Generador Web</button>
                <button class="btn-clear-key" data-service="supergrok">Limpiar</button>
              </div>
              <div class="key-status" id="supergrok-status"></div>
            </div>

            <div class="api-key-section">
              <h3>🤖 Gemini (Google)</h3>
              <p class="service-description">API de Gemini para generación de contenido. Obtén tu clave en <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank">ai.google.dev</a>.</p>
              <div class="input-group">
                <input type="password" id="gemini-key-input" placeholder="Introduce tu clave de API de Gemini" class="api-key-input">
                <button class="btn-toggle-visibility" data-service="gemini">👁️</button>
              </div>
              <div class="button-group">
                <button class="btn-save-key" data-service="gemini">Guardar Clave</button>
                <button class="btn-clear-key" data-service="gemini">Limpiar</button>
              </div>
              <div class="key-status" id="gemini-status"></div>
            </div>

            <div class="api-key-section">
              <h3>⚡ Grok4 (xAI)</h3>
              <p class="service-description">API de Grok4 para generación de contenido avanzado. Obtén tu clave en <a href="https://x.ai/api" target="_blank">x.ai/api</a>.</p>
              <div class="input-group">
                <input type="password" id="grok4-key-input" placeholder="Introduce tu clave de API de Grok4" class="api-key-input">
                <button class="btn-toggle-visibility" data-service="grok4">👁️</button>
              </div>
              <div class="button-group">
                <button class="btn-save-key" data-service="grok4">Guardar Clave</button>
                <button class="btn-clear-key" data-service="grok4">Limpiar</button>
              </div>
              <div class="key-status" id="grok4-status"></div>
            </div>

            <div class="api-key-section">
              <h3>🎨 Imagine v0.9 (xAI)</h3>
              <p class="service-description">Generador de imágenes y videos de xAI. Obtén tu clave en <a href="https://x.ai/api" target="_blank">x.ai/api</a>.</p>
              <div class="input-group">
                <input type="password" id="imagine-key-input" placeholder="Introduce tu clave de API de Imagine v0.9" class="api-key-input">
                <button class="btn-toggle-visibility" data-service="imagine">👁️</button>
              </div>
              <div class="button-group">
                <button class="btn-save-key" data-service="imagine">Guardar Clave</button>
                <button class="btn-clear-key" data-service="imagine">Limpiar</button>
              </div>
              <div class="key-status" id="imagine-status"></div>
            </div>

            <div class="api-keys-actions">
              <button class="btn-clear-all">🗑️ Limpiar Todas las Claves</button>
              <button class="btn-export-settings">💾 Exportar Configuración</button>
              <button class="btn-import-settings">📥 Importar Configuración</button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-close" data-action="close-api-keys-modal">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    // Insertar el modal en el DOM si no existe
    if (!document.getElementById(this.modalId)) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    this.updateStatusIndicators();
  }

  /**
   * Actualiza los indicadores de estado de las claves
   */
  updateStatusIndicators() {
    const services = ['veo31', 'supergrok', 'gemini', 'grok4', 'imagine'];
    services.forEach(service => {
      const statusEl = document.getElementById(`${service}-status`);
      if (statusEl) {
        if (this.manager.hasAPIKey(service)) {
          statusEl.innerHTML = '✅ Clave configurada';
          statusEl.className = 'key-status status-configured';
        } else {
          statusEl.innerHTML = '⚠️ No configurada';
          statusEl.className = 'key-status status-not-configured';
        }
      }
    });
  }

  /**
   * Adjunta los event listeners
   */
  attachEventListeners() {
    // Guardar clave
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-save-key')) {
        const service = e.target.dataset.service;
        const inputEl = document.getElementById(`${service}-key-input`);
        if (inputEl) {
          const key = inputEl.value;
          this.manager.setAPIKey(service, key);
          inputEl.value = '';
          this.updateStatusIndicators();
          this.showNotification(`Clave de ${service} guardada correctamente.`, 'success');
        }
      }

      // Abrir generador web
      if (e.target.classList.contains('btn-open-web')) {
        const service = e.target.dataset.service;
        this.manager.openGeneratorWebsite(service);
      }

      // Limpiar clave individual
      if (e.target.classList.contains('btn-clear-key')) {
        const service = e.target.dataset.service;
        this.manager.setAPIKey(service, '');
        document.getElementById(`${service}-key-input`).value = '';
        this.updateStatusIndicators();
        this.showNotification(`Clave de ${service} eliminada.`, 'info');
      }

      // Limpiar todas las claves
      if (e.target.classList.contains('btn-clear-all')) {
        if (confirm('¿Estás seguro de que deseas eliminar todas las claves de API?')) {
          this.manager.clearAllKeys();
          document.querySelectorAll('.api-key-input').forEach(input => input.value = '');
          this.updateStatusIndicators();
          this.showNotification('Todas las claves han sido eliminadas.', 'warning');
        }
      }

      // Cerrar modal
      if (e.target.dataset.action === 'close-api-keys-modal' || e.target.classList.contains('btn-close')) {
        this.closeModal();
      }

      // Toggle visibilidad de contraseña
      if (e.target.classList.contains('btn-toggle-visibility')) {
        const service = e.target.dataset.service;
        const inputEl = document.getElementById(`${service}-key-input`);
        if (inputEl) {
          inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
        }
      }
    });

    // Exportar configuración
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-export-settings')) {
        this.exportSettings();
      }
    });

    // Importar configuración
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-import-settings')) {
        this.importSettings();
      }
    });
  }

  /**
   * Abre el modal de configuración
   */
  openModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'flex';
      this.loadKeysIntoInputs();
    }
  }

  /**
   * Cierra el modal de configuración
   */
  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Carga las claves guardadas en los campos de entrada
   */
  loadKeysIntoInputs() {
    const services = ['veo31', 'supergrok', 'gemini', 'grok4', 'imagine'];
    services.forEach(service => {
      const inputEl = document.getElementById(`${service}-key-input`);
      const key = this.manager.getAPIKey(service);
      if (inputEl && key) {
        inputEl.value = key;
      }
    });
  }

  /**
   * Muestra una notificación al usuario
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, info, warning)
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

  /**
   * Exporta la configuración de claves a un archivo JSON
   */
  exportSettings() {
    const keys = this.manager.getAllKeys();
    const dataStr = JSON.stringify(keys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mundos-api-keys-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    this.showNotification('Configuración exportada correctamente.', 'success');
  }

  /**
   * Importa la configuración de claves desde un archivo JSON
   */
  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const keys = JSON.parse(event.target.result);
            Object.entries(keys).forEach(([service, key]) => {
              this.manager.setAPIKey(service, key);
            });
            this.updateStatusIndicators();
            this.loadKeysIntoInputs();
            this.showNotification('Configuración importada correctamente.', 'success');
          } catch (error) {
            this.showNotification('Error al importar la configuración.', 'error');
            console.error(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Crear instancia global
const apiKeysSettings = new APIKeysSettings(apiKeysManager);

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIKeysSettings;
}

