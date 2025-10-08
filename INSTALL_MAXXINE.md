# Instalación de MundosInfinitos en maxxine.net

## 📋 Instrucciones de Instalación

### 1. Preparación del Servidor

1. **Crear la carpeta de destino:**
   ```bash
   mkdir -p /public_html/MundosdeYupi
   cd /public_html/MundosdeYupi
   ```

2. **Extraer el archivo ZIP:**
   ```bash
   unzip MundosInfinitos-optimized-[fecha].zip
   ```

### 2. Configuración del Servidor Web

1. **Verificar que el archivo `.htaccess` esté presente** en la carpeta raíz
2. **Asegurar que mod_rewrite esté habilitado** en Apache
3. **Configurar permisos de archivos:**
   ```bash
   chmod 644 *.html *.css *.js *.json
   chmod 755 .
   ```

### 3. Configuración de Base de Datos (Opcional)

Si deseas habilitar el almacenamiento en servidor:

1. **Crear base de datos MySQL:**
   ```sql
   CREATE DATABASE mundos_infinitos;
   CREATE USER 'mundos_user'@'localhost' IDENTIFIED BY 'password_seguro';
   GRANT ALL PRIVILEGES ON mundos_infinitos.* TO 'mundos_user'@'localhost';
   ```

2. **Configurar conexión en `config_maxxine.js`**

### 4. Verificación de Funcionamiento

1. **Acceder a:** `https://maxxine.net/MundosdeYupi/`
2. **Verificar que carguen todas las secciones:**
   - Analizar URLs ✓
   - Navegación ✓
   - Videos ✓
   - Mundos ✓
   - Editor ✓

3. **Probar funcionalidades clave:**
   - Sistema de voz
   - Navegación entre secciones
   - Importación de contenido
   - Guardado local

### 5. Optimizaciones Adicionales

#### Para mejor rendimiento:

1. **Habilitar compresión GZIP** (ya configurado en .htaccess)
2. **Configurar CDN** para archivos estáticos
3. **Optimizar imágenes** si las hay

#### Para mejor seguridad:

1. **Configurar HTTPS** (recomendado)
2. **Revisar permisos de archivos**
3. **Configurar firewall** si es necesario

## 🔧 Configuración Avanzada

### Variables de Entorno

Editar `config_maxxine.js` para personalizar:

- `BASE_PATH`: Ruta base de la aplicación
- `API_BASE_URL`: URL de APIs del servidor
- `STORAGE.serverEndpoint`: Endpoint de almacenamiento
- `CACHE.maxSize`: Tamaño máximo de caché

### Integración con APIs Externas

La aplicación incluye proxies configurados para:
- Google Gemini
- ElevenLabs
- Luma Labs
- Otras APIs de IA

## 📊 Monitoreo y Mantenimiento

### Logs a Revisar

1. **Logs de Apache/Nginx**
2. **Logs de JavaScript** (consola del navegador)
3. **Logs de APIs externas**

### Actualizaciones Diarias

El sistema está configurado para recibir actualizaciones automáticas diarias a las 15:00 horas con:
- Corrección de errores
- Optimizaciones de rendimiento
- Nuevas funcionalidades
- Mejoras de seguridad

## 🆘 Solución de Problemas

### Problemas Comunes

1. **Error 404 en rutas:**
   - Verificar que mod_rewrite esté habilitado
   - Revisar archivo .htaccess

2. **Funciones no cargan:**
   - Verificar permisos de archivos
   - Revisar consola del navegador

3. **APIs no funcionan:**
   - Verificar configuración de CORS
   - Revisar endpoints en config_maxxine.js

### Contacto de Soporte

Para problemas técnicos o actualizaciones, el sistema genera reportes automáticos diarios con mejoras y correcciones.

---

**Versión:** 6.6.6 Optimizada  
**Última actualización:** Automática diaria a las 15:00h  
**Soporte:** Manus AI
