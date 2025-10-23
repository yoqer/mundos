# Configuración de APIs para MundosInfinitos

## Introducción al Sistema Híbrido de Gestión de Claves de API

MundosInfinitos ahora incorpora un sistema híbrido avanzado para la gestión de claves de API, diseñado para ofrecer flexibilidad y seguridad. Este sistema permite:

1.  **Almacenamiento Local de Claves**: Los usuarios pueden introducir y guardar sus claves de API directamente en el almacenamiento local de su navegador. Esto permite un acceso persistente a los servicios de IA sin exponer las claves en el código fuente o en el servidor.
2.  **Acceso Directo a Generadores Web**: Para servicios como Veo 3.1 y SuperGrok, si no se proporciona una clave de API, el sistema facilita el acceso directo a sus plataformas web. Esto permite a los usuarios generar contenido y luego copiar/pegar los resultados en el editor de MundosInfinitos.
3.  **Integración Mejorada del Navegador**: Un nuevo panel de control del navegador facilita la interacción con plataformas externas, incluyendo la importación/exportación de contenido y el monitoreo del portapapeles.

## 1. Configuración de API Keys (Método Recomendado)

Para configurar tus claves de API de forma segura y persistente, utiliza el nuevo **Modal de Configuración de Claves de API**:

1.  Haz clic en el botón **⚙️ API Keys** en la barra de navegación principal de MundosInfinitos.
2.  Se abrirá un modal donde podrás ver una lista de servicios de IA compatibles.
3.  Para cada servicio que desees utilizar con tu propia clave de API:
    *   Introduce tu clave de API en el campo correspondiente.
    *   Haz clic en el botón **Guardar Clave**.
    *   La clave se guardará en el almacenamiento local de tu navegador y el estado del servicio se actualizará a "✅ Clave configurada".

**Ventajas de este método:**
*   **Persistencia**: Las claves se mantienen guardadas entre sesiones del navegador.
*   **Seguridad**: Las claves no se exponen en el código fuente ni se envían a ningún servidor.
*   **Control de Usuario**: Puedes exportar, importar o limpiar tus claves en cualquier momento.

### Servicios de API Soportados y Cómo Obtener sus Claves:

*   **Gemini (Google)**:
    *   **Descripción**: API de Google para generación de contenido multimodal.
    *   **Obtener clave**: Visita [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key) para generar tu clave.
*   **Grok4 (xAI)**:
    *   **Descripción**: Modelo de lenguaje avanzado de xAI con capacidades de razonamiento y procesamiento visual.
    *   **Obtener clave**: Visita [https://x.ai/api](https://x.ai/api) para obtener tu clave de API de xAI.
*   **Imagine v0.9 (xAI)**:
    *   **Descripción**: Generador de imágenes y videos de xAI, a menudo parte de la suite Grok/Aurora.
    *   **Obtener clave**: Generalmente, la misma clave de API de xAI que para Grok4 es válida. Visita [https://x.ai/api](https://x.ai/api).
*   **Veo 3.1 (Google)**:
    *   **Descripción**: Modelo de generación de video de alta calidad de Google.
    *   **Obtener clave**: Requiere una clave de API de Google Cloud con permisos para Veo 3.1. Visita la consola de Google Cloud.
*   **vr.decart.ai**:
    *   **Descripción**: Plataforma para la generación de mundos de Realidad Virtual interactivos.
    *   **Obtener clave**: Regístrate en vr.decart.ai y obtén tu clave de API.

## 2. Acceso a Generadores Web sin Clave de API (para Veo 3.1 y SuperGrok)

Si prefieres no usar claves de API o aún no las tienes, MundosInfinitos te permite acceder directamente a las plataformas web de algunos generadores de video para copiar y pegar contenido:

1.  Haz clic en el botón **🌐 Navegador** en la barra de navegación principal.
2.  Se abrirá el **Panel de Control del Navegador**.
3.  Haz clic en **Abrir Veo 3.1** o **Abrir SuperGrok**.
4.  Se abrirá una nueva ventana o pestaña del navegador con la plataforma correspondiente:
    *   **Veo 3.1**: [https://gemini.google.com/app/tools](https://gemini.google.com/app/tools)
    *   **SuperGrok**: [https://grok.com/imagine](https://grok.com/imagine)
5.  Genera tu contenido directamente en estas plataformas.
6.  **Copia** el contenido generado (Ctrl+C o Cmd+C).
7.  Vuelve a la ventana de MundosInfinitos y utiliza las opciones del **Panel de Control del Navegador** para:
    *   **Pegar Contenido Generado**: Inserta el contenido del portapapeles directamente en el editor.
    *   **Monitorear portapapeles automáticamente**: Activa esta opción para que el contenido copiado se importe de forma automática.

## 3. Estructura de Archivos para Proxies PHP (si aplica)

Para APIs que requieren un proxy PHP (como Groq y Gemini en algunas configuraciones), la estructura de archivos sigue siendo relevante para la seguridad de las claves en el servidor:

```
mundos/
├── private/
│   ├── groq_api_key.txt          # Tu clave API de Groq (para proxy PHP)
│   ├── gemini_api_key.txt        # Tu clave API de Gemini (para proxy PHP)
│   └── ... (otros archivos de claves si se usan proxies)
├── api/
│   ├── groq_proxy.php            # Proxy para API de Groq
│   └── gemini_proxy.php          # Proxy para API de Gemini
└── ...
```

**Importante**: La carpeta `private/` debe estar configurada para no ser accesible desde el navegador web. Consulta la sección "Configuración del servidor web" para más detalles.

## 4. Configuración del Servidor Web

Asegúrate de que la carpeta `private/` no sea accesible desde el navegador web. Si usas Apache, el archivo `.htaccess` ya incluye las reglas necesarias:

```apache
<Directory "private">
    Order deny,allow
    Deny from all
</Directory>
```

## 5. Verificación y Solución de Problemas

### Verificación
1.  Abre la aplicación en tu navegador.
2.  Accede al modal **⚙️ API Keys** y verifica el estado de tus claves.
3.  Intenta usar las funcionalidades de IA. Si las claves están configuradas, deberían funcionar directamente. Si no, usa el **Panel de Control del Navegador** para acceder a las plataformas web.

### Solución de Problemas
*   **Clave no reconocida**: Asegúrate de que no hay espacios en blanco al inicio o final de las claves. Verifica que la clave sea la correcta para el servicio.
*   **Errores de conexión**: Si utilizas proxies PHP, verifica la conectividad a internet del servidor y que cURL esté habilitado.
*   **Acceso a plataformas web**: Si las ventanas no se abren, verifica la configuración de pop-ups de tu navegador.

## 6. Seguridad

*   **Almacenamiento Local**: Las claves guardadas en el navegador son para uso personal. No se sincronizan entre dispositivos a menos que uses la función de exportar/importar.
*   **No Compartir**: Nunca compartas tus claves de API.
*   **Variables de Entorno**: Para entornos de producción o si usas proxies PHP, considera usar variables de entorno para las claves de API en lugar de archivos de texto plano.

## 7. Modelos Disponibles

*   **Groq**: `llama3-8b-8192` (actualizado)
*   **Gemini**: `gemini-pro`
*   **Veo 3.1**: Última versión de Google (vía API o web)
*   **SuperGrok**: Última versión de xAI (vía API o web)
*   **Hunyuan 3D**: Generación de escenas 3D
*   **Mirage2.org**: Generación de mundos inmersivos

---

**Última actualización**: Octubre 2025

