# Changelog - MundosInfinitos

Todas las mejoras y cambios notables del proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [2.2.0] - 2025-10-22

### ✨ Añadido
- **Sistema híbrido de gestión de claves de API**: Permite guardar claves localmente en el navegador y gestionarlas a través de una interfaz de usuario.
- **Panel de Control del Navegador**: Facilita la interacción con plataformas externas (Veo 3.1, SuperGrok) sin API keys.
- **Acceso directo a generadores web**: Botones para abrir Veo 3.1 (gemini.google.com/app/tools) y SuperGrok (grok.com/imagine) en nuevas ventanas.
- **Funcionalidad de copiar/pegar**: Importación y exportación de contenido entre el editor y el portapapeles.
- **Monitoreo automático del portapapeles**: Importación automática de contenido copiado desde plataformas externas.
- **Integración de Veo 3.1**: Código base para la integración del modelo de video de Google.
- **Integración de SuperGrok (Video)**: Código base para la integración del generador de video de xAI (Imagine v0.9).
- **Integración de Grok4 (xAI)**: Código base para la integración del modelo de lenguaje de xAI.
- **Archivos CSS y JS dedicados** para la gestión de API keys y la integración del navegador.

### 🔧 Cambiado
- **Lógica de integración de APIs**: Adaptada para soportar claves de usuario y gestionar su ausencia (acceso web directo).
- **Actualización de modelos**: Preparación para Grok4 e Imagine v0.9.
- **Interfaz de navegación**: Añadidos botones para el modal de API Keys y el Panel de Control del Navegador.
- **Documentación de APIs (API_SETUP.md)**: Actualizada para reflejar el nuevo sistema híbrido y las nuevas integraciones.
- **README.md**: Actualizado con la versión 2.2.0 y las nuevas características.

### 🛡️ Seguridad
- **Almacenamiento seguro de claves**: Las claves se guardan en el localStorage del navegador, no en el código fuente.
- **Manejo de errores mejorado** para la ausencia de claves de API.

## [2.1.0] - 2025-10-13

### ✨ Añadido
- **Sistema avanzado de modales** con gestión de estado mejorada
- **Mejoras de navegación** con transiciones fluidas entre secciones
- **Documentación completa** del proyecto con guías técnicas
- **Archivos de ejemplo** para configuración de APIs
- **Sistema de notificaciones** en tiempo real
- **Función de cierre universal** para elementos flotantes (Escape key)

### 🔧 Cambiado
- **Modelo Groq actualizado** de `llama3-8b-8192` a `llama-3.1-8b-instant`
- **Mejora del manejo de errores** en todas las integraciones de API
- **Optimización de la interfaz** para mejor experiencia de usuario
- **Estructura de archivos** reorganizada para mejor mantenimiento

### 🐛 Corregido
- **Problemas de cierre de modales** que permanecían en pantalla
- **Errores de navegación** entre secciones
- **Conflictos de z-index** en elementos flotantes
- **Problemas de API** con modelos obsoletos
- **Inconsistencias visuales** en diferentes dispositivos

### 🛡️ Seguridad
- **Gestión mejorada de credenciales** en carpeta `private/`
- **Validación de entrada** en formularios de API
- **Manejo seguro de errores** sin exposición de información sensible

## [2.0.0] - 2025-10-12

### ✨ Añadido
- **Integración con Groq API** para procesamiento de lenguaje natural
- **Integración con Gemini API** para generación de contenido
- **Sistema de generación de mundos 3D** con Hunyuan 3D y Mirage2.org
- **Gemini Storybook** para creación automática de libros
- **Gestión de avatares** con DynamicLabs.ai
- **Integración con TryGenie3.net** para selección de videos
- **Sistema de análisis de URLs** para plataformas externas

### 🔧 Cambiado
- **Arquitectura completamente rediseñada** para soportar múltiples APIs
- **Interfaz de usuario modernizada** con mejor UX
- **Sistema de navegación** basado en hash routing

## [1.0.0] - 2025-10-11

### ✨ Añadido
- **Versión inicial** del Editor de Mundos
- **Funcionalidad básica** de edición de contenido
- **Navegación por voz** multilingüe
- **Editor de eBooks** con plantillas
- **Modo híbrido** online/offline
- **Exportación** a múltiples formatos

---

## Tipos de Cambios

- `✨ Añadido` para nuevas funcionalidades
- `🔧 Cambiado` para cambios en funcionalidades existentes
- `🐛 Corregido` para corrección de errores
- `🗑️ Eliminado` para funcionalidades removidas
- `🛡️ Seguridad` para vulnerabilidades corregidas
- `⚡ Rendimiento` para mejoras de rendimiento

## Enlaces de Versiones

- [2.2.0] - Versión actual con gestión híbrida de APIs y control de navegador.
- [2.1.0] - Versión con optimizaciones avanzadas.
- [2.0.0] - Integración completa con APIs de IA.
- [1.0.0] - Versión inicial del sistema.

---

**Mantenido por**: Manus AI  
**Última actualización**: 22 de octubre de 2025

