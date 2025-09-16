<?php
/**
 * Editor de Mundos v6.0 - Script de Instalación Automática
 * Para hosting HTTP común con soporte PHP y MySQL
 */

header('Content-Type: text/html; charset=utf-8');

// Verificar si ya está instalado
if (file_exists('config/installed.lock')) {
    die('<h1>Editor de Mundos ya está instalado</h1><p>Si necesitas reinstalar, elimina el archivo config/installed.lock</p>');
}

$errors = [];
$success = [];

// Verificar requisitos del sistema
function checkRequirements() {
    global $errors, $success;
    
    // Verificar versión de PHP
    if (version_compare(PHP_VERSION, '7.4.0', '<')) {
        $errors[] = 'PHP 7.4+ requerido. Versión actual: ' . PHP_VERSION;
    } else {
        $success[] = 'PHP ' . PHP_VERSION . ' ✓';
    }
    
    // Verificar extensiones PHP
    $required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            $errors[] = "Extensión PHP '$ext' no encontrada";
        } else {
            $success[] = "Extensión '$ext' ✓";
        }
    }
    
    // Verificar permisos de escritura
    if (!is_writable('.')) {
        $errors[] = 'El directorio actual no tiene permisos de escritura';
    } else {
        $success[] = 'Permisos de escritura ✓';
    }
    
    // Verificar si existe config/
    if (!is_dir('config')) {
        if (!mkdir('config', 0755, true)) {
            $errors[] = 'No se pudo crear el directorio config/';
        }
    }
    
    if (is_dir('config') && is_writable('config')) {
        $success[] = 'Directorio config/ ✓';
    } else {
        $errors[] = 'Directorio config/ no escribible';
    }
}

// Crear esquema de base de datos
function createDatabaseSchema($pdo) {
    $schema = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        project_type ENUM('book', 'cover', 'layout') DEFAULT 'book',
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('cover', 'layout') NOT NULL,
        template_data JSON NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    try {
        $pdo->exec($schema);
        return true;
    } catch (PDOException $e) {
        return 'Error creando esquema: ' . $e->getMessage();
    }
}

// Procesar formulario de instalación
if ($_POST) {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? '';
    $db_user = $_POST['db_user'] ?? '';
    $db_pass = $_POST['db_pass'] ?? '';
    $db_port = $_POST['db_port'] ?? '3306';
    
    $admin_user = $_POST['admin_user'] ?? '';
    $admin_email = $_POST['admin_email'] ?? '';
    $admin_pass = $_POST['admin_pass'] ?? '';
    
    // Validar datos
    if (empty($db_name) || empty($db_user)) {
        $errors[] = 'Datos de base de datos incompletos';
    }
    
    if (empty($admin_user) || empty($admin_email) || empty($admin_pass)) {
        $errors[] = 'Datos de administrador incompletos';
    }
    
    if (empty($errors)) {
        try {
            // Probar conexión a la base de datos
            $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            
            $success[] = 'Conexión a base de datos exitosa ✓';
            
            // Crear esquema
            $schema_result = createDatabaseSchema($pdo);
            if ($schema_result === true) {
                $success[] = 'Esquema de base de datos creado ✓';
                
                // Crear usuario administrador
                $password_hash = password_hash($admin_pass, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
                $stmt->execute([$admin_user, $admin_email, $password_hash]);
                
                $success[] = 'Usuario administrador creado ✓';
                
                // Guardar configuración
                $config = [
                    'database' => [
                        'host' => $db_host,
                        'database' => $db_name,
                        'username' => $db_user,
                        'password' => $db_pass,
                        'port' => $db_port,
                        'charset' => 'utf8mb4'
                    ],
                    'installation' => [
                        'date' => date('Y-m-d H:i:s'),
                        'version' => '6.0',
                        'admin_user' => $admin_user
                    ]
                ];
                
                file_put_contents('config/database.json', json_encode($config, JSON_PRETTY_PRINT));
                file_put_contents('config/installed.lock', date('Y-m-d H:i:s'));
                
                $success[] = 'Configuración guardada ✓';
                $success[] = '<strong>¡Instalación completada exitosamente!</strong>';
                $success[] = '<a href="index.html">Ir al Editor de Mundos</a>';
                
            } else {
                $errors[] = $schema_result;
            }
            
        } catch (PDOException $e) {
            $errors[] = 'Error de base de datos: ' . $e->getMessage();
        }
    }
}

// Verificar requisitos al cargar la página
checkRequirements();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalación - Editor de Mundos v6.0</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
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
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="text"], input[type="email"], input[type="password"] {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus {
            border-color: #667eea;
            outline: none;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            opacity: 0.9;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .requirements {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Editor de Mundos v6.0</h1>
        <h2>Instalación Automática</h2>
        
        <div class="requirements">
            <h3>Verificación de Requisitos</h3>
            <?php foreach ($success as $msg): ?>
                <div class="success"><?= htmlspecialchars($msg) ?></div>
            <?php endforeach; ?>
            
            <?php foreach ($errors as $error): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endforeach; ?>
        </div>
        
        <?php if (empty($errors) && !file_exists('config/installed.lock')): ?>
        <form method="POST">
            <div class="section">
                <h3>Configuración de Base de Datos</h3>
                
                <div class="form-group">
                    <label for="db_host">Host de Base de Datos:</label>
                    <input type="text" id="db_host" name="db_host" value="localhost" required>
                </div>
                
                <div class="form-group">
                    <label for="db_name">Nombre de Base de Datos:</label>
                    <input type="text" id="db_name" name="db_name" placeholder="editor_mundos" required>
                </div>
                
                <div class="form-group">
                    <label for="db_user">Usuario de Base de Datos:</label>
                    <input type="text" id="db_user" name="db_user" required>
                </div>
                
                <div class="form-group">
                    <label for="db_pass">Contraseña de Base de Datos:</label>
                    <input type="password" id="db_pass" name="db_pass">
                </div>
                
                <div class="form-group">
                    <label for="db_port">Puerto (opcional):</label>
                    <input type="text" id="db_port" name="db_port" value="3306">
                </div>
            </div>
            
            <div class="section">
                <h3>Usuario Administrador</h3>
                
                <div class="form-group">
                    <label for="admin_user">Nombre de Usuario:</label>
                    <input type="text" id="admin_user" name="admin_user" required>
                </div>
                
                <div class="form-group">
                    <label for="admin_email">Email:</label>
                    <input type="email" id="admin_email" name="admin_email" required>
                </div>
                
                <div class="form-group">
                    <label for="admin_pass">Contraseña:</label>
                    <input type="password" id="admin_pass" name="admin_pass" required>
                </div>
            </div>
            
            <button type="submit">🚀 Instalar Editor de Mundos</button>
        </form>
        <?php endif; ?>
        
        <?php if (!empty($errors)): ?>
        <div class="section">
            <h3>⚠️ Errores Encontrados</h3>
            <p>Por favor, corrige los errores antes de continuar con la instalación.</p>
            <p>Si necesitas ayuda, consulta el archivo <strong>DESPLIEGUE_HTTP.md</strong> para instrucciones detalladas.</p>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>

