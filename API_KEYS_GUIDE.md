# Guía de Gestión de Claves de API - MundosInfinitos

## Introducción

MundosInfinitos ahora incluye un sistema híbrido para la gestión de claves de API que permite a los usuarios:

1. **Introducir y guardar sus propias claves de API** en el caché local del navegador
2. **Acceder directamente a los generadores de contenido web** (Veo 3.1 y SuperGrok) sin necesidad de API keys
3. **Importar/exportar contenido** entre el editor y las plataformas externas mediante copiar y pegar

## Características Principales

### 1. Gestor de Claves de API

El **Gestor de Claves de API** permite a los usuarios:

- **Guardar claves de forma segura**: Las claves se almacenan en el almacenamiento local del navegador (localStorage) y no se exponen en el código fuente.
- **Gestionar múltiples servicios**: Soporta claves para Veo 3.1, SuperGrok, Gemini, Grok4 e Imagine v0.9.
- **Exportar/Importar configuración**: Los usuarios pueden hacer backup de sus claves y importarlas en otro navegador o dispositivo.
- **Limpiar claves individuales o todas**: Control total sobre qué claves mantener o eliminar.

### 2. Acceso Directo a Generadores Web

Si el usuario **no proporciona una clave de API**, el sistema ofrece acceso directo a:

- **Veo 3.1**: Abre `https://gemini.google.com/app/tools` en una nueva ventana
- **SuperGrok**: Abre `https://grok.com/imagine` en una nueva ventana

El usuario puede generar contenido en estas plataformas y copiarlo directamente al editor de MundosInfinitos.

### 3. Panel de Control del Navegador

El **Panel de Control del Navegador** facilita:

- **Abrir generadores web**: Acceso rápido a Veo 3.1 y SuperGrok
- **Pegar contenido generado**: Importa contenido desde el portapapeles al editor
- **Copiar contenido del editor**: Exporta contenido del editor al portapapeles
- **Monitoreo automático del portapapeles**: Detecta automáticamente nuevo contenido copiado desde las plataformas externas
- **Sincronización de ventanas**: Mantiene sincronizadas las ventanas abiertas

## Cómo Usar

### Configurar Claves de API

1. Haz clic en el botón **⚙️ API Keys** en la barra de navegación
2. Se abrirá un modal de configuración
3. Para cada servicio:
   - Introduce tu clave de API
   - Haz clic en **Guardar Clave**
   - El sistema confirmará que la clave ha sido guardada

Las claves se guardan automáticamente en el almacenamiento local de tu navegador y se cargarán cada vez que visites la aplicación.

### Usar Generadores Web sin API Keys

1. Haz clic en el botón **🌐 Navegador** en la barra de navegación
2. Se abrirá el Panel de Control del Navegador
3. Haz clic en **Abrir Veo 3.1** o **Abrir SuperGrok**
4. Se abrirá una nueva ventana con el generador
5. Genera tu contenido en la plataforma externa
6. Copia el contenido generado (Ctrl+C o Cmd+C)
7. Vuelve a la ventana de MundosInfinitos
8. Haz clic en **Pegar Contenido Generado** en el Panel de Control del Navegador

### Monitoreo Automático del Portapapeles

1. Abre el Panel de Control del Navegador (🌐 Navegador)
2. Activa la opción **Monitorear portapapeles automáticamente**
3. Cuando copies contenido desde las plataformas externas, se importará automáticamente al editor

## Seguridad

- **Almacenamiento local**: Las claves se guardan en el almacenamiento local del navegador, no en servidores remotos
- **Sin exposición en código**: Las claves nunca aparecen en el código fuente de la aplicación
- **Control del usuario**: El usuario puede limpiar todas las claves en cualquier momento
- **Exportación segura**: Las claves se pueden exportar a un archivo JSON para backup, pero se recomienda mantenerlas en un lugar seguro

## Servicios Soportados

### Veo 3.1 (Google)
- **Descripción**: Generador de video de Google
- **Acceso web**: https://gemini.google.com/app/tools
- **API**: Requiere clave de API de Google
- **Modo sin API**: Acceso directo a la plataforma web

### SuperGrok (xAI)
- **Descripción**: Generador de video de xAI
- **Acceso web**: https://grok.com/imagine
- **API**: Requiere clave de API de xAI
- **Modo sin API**: Acceso directo a la plataforma web

### Gemini (Google)
- **Descripción**: API de Gemini para generación de contenido
- **Obtener clave**: https://ai.google.dev/gemini-api/docs/api-key
- **Modo sin API**: No disponible (requiere API key)

### Grok4 (xAI)
- **Descripción**: API de Grok4 para generación de contenido avanzado
- **Obtener clave**: https://x.ai/api
- **Modo sin API**: No disponible (requiere API key)

### Imagine v0.9 (xAI)
- **Descripción**: Generador de imágenes y videos de xAI
- **Obtener clave**: https://x.ai/api
- **Modo sin API**: No disponible (requiere API key)

## Preguntas Frecuentes

### ¿Dónde se guardan mis claves de API?
Las claves se guardan en el almacenamiento local del navegador (localStorage). No se envían a ningún servidor remoto.

### ¿Puedo usar la aplicación sin proporcionar claves de API?
Sí. Puedes usar Veo 3.1 y SuperGrok a través de sus plataformas web directamente, sin necesidad de API keys. Solo copia y pega el contenido generado.

### ¿Qué pasa si borro mis datos del navegador?
Si limpias el almacenamiento local del navegador, también se eliminarán tus claves de API guardadas. Se recomienda hacer backup exportando tu configuración.

### ¿Cómo exporto mis claves?
En el modal de configuración de API Keys, haz clic en **Exportar Configuración**. Se descargará un archivo JSON con tus claves.

### ¿Cómo importo claves desde otro dispositivo?
En el modal de configuración de API Keys, haz clic en **Importar Configuración** y selecciona el archivo JSON que exportaste previamente.

### ¿Es seguro guardar mis claves en el navegador?
El almacenamiento local del navegador es seguro para uso personal en tu propio dispositivo. Sin embargo, si compartes tu dispositivo con otros, se recomienda limpiar las claves después de usar la aplicación.

## Soporte

Para más información o reportar problemas, visita:
- **carlomaxxine.com/saloon**
- **maxxine.net**

---

**Última actualización**: Octubre 2025

