# 🌍 MundosInfinitos v2.2.0 - Sistema Integrado Optimizado y Flexible

## 🚀 Plataforma Multimedia con IA + Gestión Híbrida de APIs

Sistema integral de contenido multimedia con integraciones de IA, optimizaciones de rendimiento y un **innovador sistema híbrido para la gestión de claves de API**.

### ✨ Características Principales

-   **🌐 Análisis de URLs**: Integración con plataformas externas (Carlo Maxxine Saloon)
-   **🎥 Gestión de Videos**: Selección multimedia con TryGenie3.net
-   **🌍 Mundos 3D**: Generación con IA (Hunyuan 3D, Mirage2.org)
-   **📚 Gemini Storybook**: Creación automática de libros con IA
-   **🎭 Avatares**: Integración con DynamicLabs.ai y NFTs
-   **🤖 APIs de IA**: Groq, Gemini, Veo 3.1, SuperGrok, Grok4, Imagine v0.9
-   **⚙️ Gestión de API Keys**: Interfaz de usuario para guardar claves localmente, exportar/importar configuración.
-   **🌐 Integración de Navegador**: Acceso directo a generadores web (Veo 3.1, SuperGrok) sin API keys, con funciones de copiar/pegar y monitoreo de portapapeles.

### ⚡ Optimizaciones v2.2.0

-   **🔧 APIs Actualizadas**: Groq con modelo `llama-3.1-8b-instant`. Preparado para Grok4 e Imagine v0.9.
-   **🎨 Sistema de Modales**: Gestión avanzada con cierre automático.
-   **🧭 Navegación Mejorada**: Transiciones fluidas entre secciones.
-   **🛡️ Manejo de Errores**: Mensajes informativos y resolución automática.
-   **📱 Interfaz Responsive**: Optimizada para múltiples dispositivos.

### 🚀 Instalación y Uso

#### Opción 1: Servidor Local
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/mundosinfinitos.git
cd mundosinfinitos

# Iniciar servidor PHP
php -S localhost:8080

# Abrir en navegador
open http://localhost:8080
```

#### Opción 2: Hosting Web
1.  **Subir archivos** al directorio raíz del hosting.
2.  **Configurar APIs** (opcional): Utiliza el nuevo modal **⚙️ API Keys** en la aplicación para guardar tus claves.
3.  **Acceder** desde navegador web.

### 🔧 Configuración de APIs

**¡Novedad!** Ahora puedes gestionar tus claves de API directamente desde la interfaz de usuario de MundosInfinitos. Haz clic en el botón **⚙️ API Keys** en la barra de navegación para abrir el modal de configuración. Allí podrás:

-   **Guardar tus claves de API** para servicios como Gemini, Grok4, Imagine v0.9, Veo 3.1 y vr.decart.ai.
-   **Exportar e importar** tu configuración de claves para backup o transferencia.
-   **Acceder directamente a los generadores web** de Veo 3.1 y SuperGrok si no deseas usar API keys, utilizando las funciones de copiar y pegar.

Para más detalles sobre cómo configurar cada API y cómo usar el nuevo sistema, consulta la `API_KEYS_GUIDE.md`.

#### APIs Soportadas
| Servicio         | Estado                               | Gestión de Claves                                    |
| :--------------- | :----------------------------------- | :--------------------------------------------------- |
| **Groq**         | ✅ Operativo                         | `private/groq_api_key.txt` (para proxy) / UI         |
| **Gemini**       | ⚠️ Requiere configuración            | UI / `private/gemini_api_key.txt` (para proxy)       |
| **Veo 3.1**      | ⚠️ Requiere configuración            | UI / Acceso Directo Web                              |
| **SuperGrok**    | ⚠️ Requiere configuración            | UI / Acceso Directo Web                              |
| **Grok4 (xAI)**  | ⚠️ Requiere configuración            | UI                                                   |
| **Imagine v0.9** | ⚠️ Requiere configuración            | UI                                                   |
| **vr.decart.ai** | ⚠️ Requiere configuración            | UI                                                   |

### 🛠️ Tecnologías

-   **Frontend**: HTML5, CSS3, JavaScript ES6+
-   **Backend**: PHP 7.4+ con cURL (para proxies de API)
-   **APIs**: Groq, Gemini, Hunyuan 3D, Mirage2.org, Veo 3.1, SuperGrok, Grok4, Imagine v0.9
-   **Integración**: DynamicLabs.ai, TryGenie3.net

### 📚 Documentación

-   **[Documentación Completa](DOCUMENTACION_COMPLETA.md)** - Guía técnica detallada.
-   **[Guía de Gestión de API Keys](API_KEYS_GUIDE.md)** - Información esencial sobre el nuevo sistema híbrido de API keys.
-   **[Configuración de APIs](API_SETUP.md)** - Setup de integraciones (método tradicional y proxies).
-   **[Registro de Cambios](CHANGELOG.md)** - Historial de versiones y mejoras.
-   **[Instrucciones de Despliegue](DEPLOYMENT.md)** - Guía para la puesta en marcha del proyecto.

### 🆘 Soporte

#### Problemas Comunes
-   **APIs no funcionan**: Verificar claves en el modal **⚙️ API Keys** o en `private/`.
-   **Modales no se cierran**: Presionar tecla `Escape`.
-   **Navegación falló**: Recargar página.

#### Recursos
-   **Issues**: GitHub Issues del proyecto
-   **Actualizaciones**: Seguir repositorio
-   **Documentación**: Ver archivos incluidos

---

**Versión**: 2.2.0 | **Desarrollado por**: Manus AI | **Fecha**: 22 de Octubre de 2025

**Enlaces Importantes:**
-   [carlomaxxine.com](http://carlomaxxine.com)
-   [maxxine.net](http://maxxine.net)

