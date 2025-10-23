# Guía de Despliegue - MundosInfinitos v2.1.0

Esta guía proporciona instrucciones detalladas para desplegar **MundosInfinitos** en diferentes plataformas y entornos.

## 📋 Requisitos Previos

### Sistema Operativo
- **Linux/Unix**: Ubuntu 18.04+, CentOS 7+, Debian 9+
- **Windows**: Windows 10+ con WSL2 (recomendado)
- **macOS**: macOS 10.15+

### Software Requerido
- **PHP**: Versión 7.4 o superior
- **Extensiones PHP**: cURL, JSON, OpenSSL
- **Servidor Web**: Apache, Nginx, o servidor PHP integrado
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🚀 Despliegue en Hosting Web

### Hosting Compartido (cPanel, Plesk)

**Paso 1: Preparación de archivos**
```bash
# Descomprimir el proyecto
tar -xzf mundosinfinitos-v2.1.0.tar.gz
cd mundos/
```

**Paso 2: Subida de archivos**
1. Acceder al panel de control del hosting
2. Navegar al administrador de archivos
3. Subir todos los archivos a `public_html/` o directorio raíz
4. Asegurar permisos correctos (644 para archivos, 755 para directorios)

**Paso 3: Configuración de seguridad**
```apache
# Crear .htaccess en la carpeta private/
<Files "*">
    Order Allow,Deny
    Deny from all
</Files>
```

**Paso 4: Configuración de APIs (opcional)**
```bash
# Crear archivos de configuración
echo "tu_clave_groq_aqui" > private/groq_api_key.txt
echo "tu_clave_gemini_aqui" > private/gemini_api_key.txt
```

### VPS/Servidor Dedicado

**Configuración con Apache**
```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/mundosinfinitos
    
    <Directory /var/www/mundosinfinitos>
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/mundosinfinitos/private>
        Require all denied
    </Directory>
</VirtualHost>
```

**Configuración con Nginx**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/mundosinfinitos;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
    
    location /private/ {
        deny all;
        return 403;
    }
}
```

## 🐳 Despliegue con Docker

**Dockerfile**
```dockerfile
FROM php:7.4-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install curl json

# Copiar archivos del proyecto
COPY . /var/www/html/

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 755 /var/www/html/

# Proteger directorio private
RUN echo "Deny from all" > /var/www/html/private/.htaccess

EXPOSE 80
```

**docker-compose.yml**
```yaml
version: '3.8'
services:
  mundosinfinitos:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./private:/var/www/html/private
    environment:
      - PHP_DISPLAY_ERRORS=Off
      - PHP_LOG_ERRORS=On
```

**Comandos de despliegue**
```bash
# Construir y ejecutar
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f
```

## ☁️ Despliegue en la Nube

### GitHub Pages (Solo frontend)

**Limitaciones**: No soporta PHP, solo funcionalidades frontend

```bash
# Configurar repositorio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/usuario/mundosinfinitos.git
git push -u origin main

# Habilitar GitHub Pages en configuración del repositorio
```

### Netlify

**netlify.toml**
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[build.environment]
  PHP_VERSION = "7.4"
```

### Vercel

**vercel.json**
```json
{
  "functions": {
    "api/*.php": {
      "runtime": "vercel-php@0.4.0"
    }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1.php" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### Heroku

**composer.json**
```json
{
  "require": {
    "php": "^7.4.0"
  }
}
```

**Procfile**
```
web: vendor/bin/heroku-php-apache2
```

## 🔧 Configuración Post-Despliegue

### Verificación de Funcionalidad

**Script de verificación**
```bash
#!/bin/bash
echo "Verificando MundosInfinitos..."

# Verificar acceso web
curl -I http://tu-dominio.com/ | head -n 1

# Verificar PHP
php -v

# Verificar extensiones
php -m | grep -E "(curl|json)"

# Verificar permisos
ls -la private/

echo "Verificación completada"
```

### Optimización de Rendimiento

**Configuración PHP (php.ini)**
```ini
; Optimizaciones de memoria
memory_limit = 256M
max_execution_time = 60

; Optimizaciones de caché
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 4000

; Configuración de errores
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
```

**Compresión Apache (.htaccess)**
```apache
# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caché del navegador
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🔒 Configuración de Seguridad

### Protección de Archivos Sensibles

**Configuración Apache**
```apache
# Proteger archivos de configuración
<Files "*.txt">
    <RequireAll>
        Require all denied
    </RequireAll>
</Files>

# Proteger directorio private
<Directory "private">
    Require all denied
</Directory>
```

### HTTPS/SSL

**Configuración Let's Encrypt**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache

# Obtener certificado
sudo certbot --apache -d tu-dominio.com

# Renovación automática
sudo crontab -e
# Añadir: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Mantenimiento

### Logs de Sistema

**Ubicaciones comunes de logs**
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- PHP: `/var/log/php_errors.log`

### Backup Automático

**Script de backup**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mundosinfinitos"
SOURCE_DIR="/var/www/mundosinfinitos"

# Crear backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$SOURCE_DIR"

# Limpiar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completado: backup_$DATE.tar.gz"
```

## 🆘 Solución de Problemas

### Problemas Comunes

**Error 500 - Internal Server Error**
- Verificar logs de error del servidor
- Comprobar permisos de archivos (644/755)
- Validar sintaxis PHP con `php -l archivo.php`

**APIs no funcionan**
- Verificar que los archivos de clave existen en `private/`
- Comprobar conectividad a internet
- Validar formato de las claves API

**Modales no se cierran**
- Verificar que JavaScript está habilitado
- Comprobar consola del navegador para errores
- Limpiar caché del navegador

### Comandos de Diagnóstico

```bash
# Verificar estado del servidor web
sudo systemctl status apache2  # o nginx

# Verificar configuración PHP
php -i | grep -E "(curl|json|version)"

# Probar conectividad API
curl -I https://api.groq.com/

# Verificar permisos
find . -type f -not -perm 644
find . -type d -not -perm 755
```

## 📞 Soporte

Para problemas específicos de despliegue:

1. **Revisar logs** del servidor web y PHP
2. **Verificar configuración** según esta guía
3. **Consultar documentación** del hosting/plataforma
4. **Crear issue** en el repositorio del proyecto

---

**Guía actualizada**: 13 de octubre de 2025  
**Versión del sistema**: MundosInfinitos v2.1.0  
**Mantenido por**: Manus AI
