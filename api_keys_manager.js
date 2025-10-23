/**
 * API Keys Manager - Sistema de Gestión de Claves de API
 * Permite al usuario introducir y guardar sus claves de API en el caché local
 * para acceso persistente sin exponerlas en el código fuente.
 */

class APIKeysManager {
  constructor() {
    this.storageKey = 'mundosInfinitos_apiKeys';
    this.apiEndpoints = {
      veo31: 'https://gemini.google.com/app/tools',
      supergrok: 'https://grok.com/imagine',
      gemini: 'https://ai.google.dev/gemini-api/docs/api-key',
      grok4: 'https://x.ai/api',
      imagine: 'https://grok.com/imagine'
    };
    this.loadKeys();
  }

  /**
   * Carga las claves de API desde el almacenamiento local
   */
  loadKeys() {
    const stored = localStorage.getItem(this.storageKey);
    this.keys = stored ? JSON.parse(stored) : {};
  }

  /**
   * Guarda las claves de API en el almacenamiento local
   */
  saveKeys() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.keys));
  }

  /**
   * Establece una clave de API
   * @param {string} service - Nombre del servicio (veo31, supergrok, gemini, grok4, imagine)
   * @param {string} key - La clave de API
   */
  setAPIKey(service, key) {
    if (!key || key.trim() === '') {
      delete this.keys[service];
      console.warn(`Clave de API para ${service} eliminada.`);
    } else {
      this.keys[service] = key.trim();
      console.log(`Clave de API para ${service} guardada en caché local.`);
    }
    this.saveKeys();
  }

  /**
   * Obtiene una clave de API
   * @param {string} service - Nombre del servicio
   * @returns {string|null} La clave de API o null si no existe
   */
  getAPIKey(service) {
    return this.keys[service] || null;
  }

  /**
   * Verifica si una clave de API está configurada
   * @param {string} service - Nombre del servicio
   * @returns {boolean}
   */
  hasAPIKey(service) {
    return !!this.keys[service];
  }

  /**
   * Obtiene todas las claves configuradas
   * @returns {object} Objeto con las claves configuradas
   */
  getAllKeys() {
    return { ...this.keys };
  }

  /**
   * Limpia todas las claves de API
   */
  clearAllKeys() {
    this.keys = {};
    localStorage.removeItem(this.storageKey);
    console.log('Todas las claves de API han sido eliminadas.');
  }

  /**
   * Abre el sitio web de generación de video en una nueva pestaña
   * @param {string} service - Nombre del servicio (veo31 o supergrok)
   */
  openGeneratorWebsite(service) {
    const url = this.apiEndpoints[service];
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error(`No se encontró URL para el servicio: ${service}`);
    }
  }

  /**
   * Obtiene la URL del sitio web de generación
   * @param {string} service - Nombre del servicio
   * @returns {string|null}
   */
  getGeneratorURL(service) {
    return this.apiEndpoints[service] || null;
  }
}

// Instancia global del gestor de claves de API
const apiKeysManager = new APIKeysManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIKeysManager;
}

