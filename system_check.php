<?php
/**
 * Editor de Mundos v6.0 - Verificación del Sistema
 * Diagnóstico completo para hosting HTTP
 */

header('Content-Type: text/html; charset=utf-8');

function checkPHPVersion() {
    $version = PHP_VERSION;
    $required = '7.4.0';
    $status = version_compare($version, $required, '>=');
    
    return [
        'name' => 'Versión de PHP',
        'status' => $status,
        'message' => "Actual: $version" . ($status ? ' ✓' : " (Requerido: $required+)"),
        'critical' => true
    ];
}

function checkPHPExtensions() {
    $required = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'fileinfo'];
    $optional = ['gd', 'curl', 'openssl', 'zip'];
    $results = [];
    
    foreach ($required as $ext) {
        $loaded = extension_loaded($ext);
        $results[] = [
            'name' => "Extensión PHP: $ext",
            'status' => $loaded,
            'message' => $loaded ? '✓ Cargada' : '✗ Faltante (REQUERIDA)',
            'critical' => true
        ];
    }
    
    foreach ($optional as $ext) {
        $loaded = extension_loaded($ext);
        $results[] = [
            'name' => "Extensión PHP: $ext",
            'status' => $loaded,
            'message' => $loaded ? '✓ Cargada' : '⚠ Opcional (recomendada)',
            'critical' => false
        ];
    }
    
    return $results;
}

function checkFilePermissions() {
    $paths = [
        '.' => 'Directorio raíz',
        'config' => 'Directorio config',
        'config/database.example.json' => 'Archivo de ejemplo'
    ];
    
    $results = [];
    
    foreach ($paths as $path => $description) {
        if (file_exists($path)) {
            $readable = is_readable($path);
            $writable = is_writable($path);
            
            $results[] = [
                'name' => $description,
                'status' => $readable && (is_dir($path) ? $writable : true),
                'message' => sprintf(
                    '%s - Lectura: %s, Escritura: %s',
                    $path,
                    $readable ? '✓' : '✗',
                    $writable ? '✓' : '✗'
                ),
                'critical' => is_dir($path)
            ];
        } else {
            $results[] = [
                'name' => $description,
                'status' => false,
                'message' => "$path - No existe",
                'critical' => $path === 'config'
            ];
        }
    }
    
    return $results;
}

function checkDatabaseConnection() {
    $config_file = 'config/database.json';
    
    if (!file_exists($config_file)) {
        return [
            'name' => 'Conexión a Base de Datos',
            'status' => false,
            'message' => 'Archivo de configuración no encontrado. Ejecutar install.php primero.',
            'critical' => true
        ];
    }
    
    try {
        $config = json_decode(file_get_contents($config_file), true);
        $db = $config['database'];
        
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $db['host'],
            $db['port'],
            $db['database'],
            $db['charset']
        );
        
        $pdo = new PDO($dsn, $db['username'], $db['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        // Verificar tablas
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $expected_tables = ['users', 'projects', 'templates', 'settings'];
        $missing_tables = array_diff($expected_tables, $tables);
        
        if (empty($missing_tables)) {
            return [
                'name' => 'Conexión a Base de Datos',
                'status' => true,
                'message' => '✓ Conectado - Todas las tablas presentes',
                'critical' => true
            ];
        } else {
            return [
                'name' => 'Conexión a Base de Datos',
                'status' => false,
                'message' => '⚠ Conectado pero faltan tablas: ' . implode(', ', $missing_tables),
                'critical' => true
            ];
        }
        
    } catch (Exception $e) {
        return [
            'name' => 'Conexión a Base de Datos',
            'status' => false,
            'message' => '✗ Error: ' . $e->getMessage(),
            'critical' => true
        ];
    }
}

function checkWebServerConfig() {
    $results = [];
    
    // Verificar mod_rewrite
    $rewrite_enabled = function_exists('apache_get_modules') ? 
        in_array('mod_rewrite', apache_get_modules()) : 
        (isset($_SERVER['HTTP_MOD_REWRITE']) && $_SERVER['HTTP_MOD_REWRITE'] == 'On');
    
    $results[] = [
        'name' => 'mod_rewrite (Apache)',
        'status' => $rewrite_enabled,
        'message' => $rewrite_enabled ? '✓ Habilitado' : '⚠ No detectado (puede funcionar sin él)',
        'critical' => false
    ];
    
    // Verificar HTTPS
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || 
             $_SERVER['SERVER_PORT'] == 443 ||
             (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https');
    
    $results[] = [
        'name' => 'HTTPS/SSL',
        'status' => $https,
        'message' => $https ? '✓ Habilitado' : '⚠ No detectado (recomendado para producción)',
        'critical' => false
    ];
    
    // Verificar límites de PHP
    $upload_limit = ini_get('upload_max_filesize');
    $post_limit = ini_get('post_max_size');
    $memory_limit = ini_get('memory_limit');
    
    $results[] = [
        'name' => 'Límites de PHP',
        'status' => true,
        'message' => "Upload: $upload_limit, Post: $post_limit, Memoria: $memory_limit",
        'critical' => false
    ];
    
    return $results;
}

function checkCoreFiles() {
    $required_files = [
        'index.html' => 'Página principal',
        'script.js' => 'Script principal',
        'styles.css' => 'Estilos principales',
        'voice_navigation.js' => 'Navegación por voz',
        'database.php' => 'API de base de datos',
        '.htaccess' => 'Configuración Apache'
    ];
    
    $results = [];
    
    foreach ($required_files as $file => $description) {
        $exists = file_exists($file);
        $results[] = [
            'name' => $description,
            'status' => $exists,
            'message' => $exists ? "✓ $file" : "✗ $file faltante",
            'critical' => in_array($file, ['index.html', 'script.js', 'database.php'])
        ];
    }
    
    return $results;
}

// Ejecutar todas las verificaciones
$checks = [
    'PHP' => [checkPHPVersion()],
    'Extensiones PHP' => checkPHPExtensions(),
    'Permisos de Archivos' => checkFilePermissions(),
    'Base de Datos' => [checkDatabaseConnection()],
    'Servidor Web' => checkWebServerConfig(),
    'Archivos del Sistema' => checkCoreFiles()
];

$total_checks = 0;
$passed_checks = 0;
$critical_failed = 0;

foreach ($checks as $category => $category_checks) {
    foreach ($category_checks as $check) {
        $total_checks++;
        if ($check['status']) {
            $passed_checks++;
        } elseif ($check['critical']) {
            $critical_failed++;
        }
    }
}

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación del Sistema - Editor de Mundos v6.0</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .summary.success {
            background: #d4edda;
            color: #155724;
        }
        .summary.warning {
            background: #fff3cd;
            color: #856404;
        }
        .summary.error {
            background: #f8d7da;
            color: #721c24;
        }
        .category {
            margin: 30px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .category-header {
            background: #f8f9fa;
            padding: 15px 20px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
        }
        .check-item {
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .check-item:last-child {
            border-bottom: none;
        }
        .check-item.success {
            background: #f8fff8;
        }
        .check-item.warning {
            background: #fffdf8;
        }
        .check-item.error {
            background: #fff8f8;
        }
        .check-name {
            font-weight: 500;
        }
        .check-message {
            font-family: monospace;
            font-size: 14px;
        }
        .actions {
            margin-top: 30px;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .system-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Verificación del Sistema</h1>
        <h2>Editor de Mundos v6.0</h2>
        
        <div class="summary <?= $critical_failed > 0 ? 'error' : ($passed_checks == $total_checks ? 'success' : 'warning') ?>">
            <h3>Resumen de Verificación</h3>
            <p><strong><?= $passed_checks ?>/<?= $total_checks ?></strong> verificaciones pasaron</p>
            <?php if ($critical_failed > 0): ?>
                <p><strong><?= $critical_failed ?></strong> verificaciones críticas fallaron</p>
                <p>⚠️ Se requiere atención antes de usar el sistema</p>
            <?php elseif ($passed_checks == $total_checks): ?>
                <p>✅ ¡Sistema listo para usar!</p>
            <?php else: ?>
                <p>⚠️ Algunas verificaciones opcionales fallaron</p>
                <p>El sistema debería funcionar, pero se recomienda revisar</p>
            <?php endif; ?>
        </div>
        
        <?php foreach ($checks as $category => $category_checks): ?>
        <div class="category">
            <div class="category-header"><?= htmlspecialchars($category) ?></div>
            <?php foreach ($category_checks as $check): ?>
            <div class="check-item <?= $check['status'] ? 'success' : ($check['critical'] ? 'error' : 'warning') ?>">
                <div class="check-name"><?= htmlspecialchars($check['name']) ?></div>
                <div class="check-message"><?= htmlspecialchars($check['message']) ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endforeach; ?>
        
        <div class="actions">
            <?php if ($critical_failed == 0): ?>
                <a href="index.html" class="btn btn-primary">🚀 Ir al Editor de Mundos</a>
            <?php else: ?>
                <a href="install.php" class="btn btn-primary">🔧 Ejecutar Instalación</a>
            <?php endif; ?>
            <a href="DESPLIEGUE_HTTP.md" class="btn btn-secondary">📖 Ver Documentación</a>
        </div>
        
        <div class="system-info">
            <strong>Información del Sistema:</strong><br>
            PHP: <?= PHP_VERSION ?><br>
            Servidor: <?= $_SERVER['SERVER_SOFTWARE'] ?? 'Desconocido' ?><br>
            OS: <?= PHP_OS ?><br>
            Fecha: <?= date('Y-m-d H:i:s') ?><br>
            Zona horaria: <?= date_default_timezone_get() ?>
        </div>
    </div>
</body>
</html>

