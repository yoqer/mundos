<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Cargar credenciales de la base de datos
// Priorizar variables de entorno para hosting HTTP común
$host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
$database = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'editor_mundos';
$username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 'root';
$password = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?? '';
$port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
$charset = 'utf8mb4';

// Fallback: intentar cargar desde archivo de configuración si existe
if ($host === 'localhost' && file_exists('config/database.json')) {
    $config = json_decode(file_get_contents('config/database.json'), true);
    if ($config && isset($config['database'])) {
        $dbConfig = $config['database'];
        $host = $dbConfig['host'] ?? $host;
        $database = $dbConfig['database'] ?? $database;
        $username = $dbConfig['username'] ?? $username;
        $password = $dbConfig['password'] ?? $password;
        $port = $dbConfig['port'] ?? $port;
        $charset = $dbConfig['charset'] ?? $charset;
    }
}

// DSN para PDO
$dsn = "mysql:host=$host;port=$port;dbname=$database;charset=$charset";

try {
    // Crear conexión PDO
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // Obtener método HTTP y acción
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    
    // Manejar diferentes acciones
    switch ($action) {
        case 'test_connection':
            testConnection($pdo);
            break;
            
        case 'create_tables':
            createTables($pdo);
            break;
            
        case 'save_book_project':
            saveBookProject($pdo);
            break;
            
        case 'load_book_projects':
            loadBookProjects($pdo);
            break;
            
        case 'load_book_project':
            loadBookProject($pdo);
            break;
            
        case 'delete_book_project':
            deleteBookProject($pdo);
            break;
            
        case 'save_user_settings':
            saveUserSettings($pdo);
            break;
            
        case 'load_user_settings':
            loadUserSettings($pdo);
            break;
            
        case 'save_world_data':
            saveWorldData($pdo);
            break;
            
        case 'load_world_data':
            loadWorldData($pdo);
            break;
            
        default:
            echo json_encode(['error' => 'Acción no válida']);
            break;
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Error de conexión a la base de datos',
        'message' => $e->getMessage()
    ]);
}

// Función para probar la conexión
function testConnection($pdo) {
    try {
        $stmt = $pdo->query('SELECT VERSION() as version');
        $result = $stmt->fetch();
        echo json_encode([
            'success' => true,
            'message' => 'Conexión exitosa a la base de datos',
            'mysql_version' => $result['version']
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al probar la conexión',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para crear las tablas necesarias
function createTables($pdo) {
    try {
        // Tabla de usuarios
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ");
        
        // Tabla de proyectos de libros
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS book_projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                project_name VARCHAR(255) NOT NULL,
                book_data JSON,
                text_content LONGTEXT,
                cover_data JSON,
                layout_settings JSON,
                credits_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version VARCHAR(10) DEFAULT '1.0',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        
        // Tabla de configuraciones de usuario
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS user_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                setting_key VARCHAR(255) NOT NULL,
                setting_value JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_setting (user_id, setting_key)
            )
        ");
        
        // Tabla de mundos 3D
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS world_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                world_name VARCHAR(255) NOT NULL,
                world_type ENUM('hunyuan', 'readyplayer', 'custom', 'uploaded') NOT NULL,
                world_data JSON,
                file_path VARCHAR(500),
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        
        // Tabla de avatares
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS avatars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                avatar_name VARCHAR(255) NOT NULL,
                avatar_type ENUM('readyplayer', 'custom', 'uploaded') NOT NULL,
                avatar_data JSON,
                file_path VARCHAR(500),
                customization_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        
        // Tabla de caché de URLs verificadas
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS url_cache (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url_domain VARCHAR(255) NOT NULL,
                verification_result JSON,
                last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                INDEX idx_domain (url_domain),
                INDEX idx_expires (expires_at)
            )
        ");
        
        // Crear usuario por defecto si no existe
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, email) VALUES (?, ?)");
        $stmt->execute(['default_user', 'user@editormundos.com']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Todas las tablas han sido creadas exitosamente',
            'tables_created' => [
                'users',
                'book_projects', 
                'user_settings',
                'world_data',
                'avatars',
                'url_cache'
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al crear las tablas',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar proyecto de libro
function saveBookProject($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 1; // Usuario por defecto
        $projectName = $input['project_name'];
        $bookData = json_encode($input['book_data']);
        $textContent = $input['text_content'];
        $coverData = json_encode($input['cover_data']);
        $layoutSettings = json_encode($input['layout_settings']);
        $creditsData = json_encode($input['credits_data']);
        $version = $input['version'] ?? '1.0';
        
        // Verificar si el proyecto ya existe
        $stmt = $pdo->prepare("SELECT id FROM book_projects WHERE user_id = ? AND project_name = ?");
        $stmt->execute([$userId, $projectName]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Actualizar proyecto existente
            $stmt = $pdo->prepare("
                UPDATE book_projects 
                SET book_data = ?, text_content = ?, cover_data = ?, 
                    layout_settings = ?, credits_data = ?, version = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([
                $bookData, $textContent, $coverData, 
                $layoutSettings, $creditsData, $version, 
                $existing['id']
            ]);
            $projectId = $existing['id'];
        } else {
            // Crear nuevo proyecto
            $stmt = $pdo->prepare("
                INSERT INTO book_projects 
                (user_id, project_name, book_data, text_content, cover_data, 
                 layout_settings, credits_data, version) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId, $projectName, $bookData, $textContent, 
                $coverData, $layoutSettings, $creditsData, $version
            ]);
            $projectId = $pdo->lastInsertId();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Proyecto guardado exitosamente',
            'project_id' => $projectId
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar el proyecto',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar lista de proyectos
function loadBookProjects($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 1;
        
        $stmt = $pdo->prepare("
            SELECT id, project_name, created_at, updated_at, version 
            FROM book_projects 
            WHERE user_id = ? 
            ORDER BY updated_at DESC
        ");
        $stmt->execute([$userId]);
        $projects = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'projects' => $projects
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar los proyectos',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar un proyecto específico
function loadBookProject($pdo) {
    try {
        $projectId = $_GET['project_id'];
        $userId = $_GET['user_id'] ?? 1;
        
        $stmt = $pdo->prepare("
            SELECT * FROM book_projects 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$projectId, $userId]);
        $project = $stmt->fetch();
        
        if ($project) {
            // Decodificar JSON
            $project['book_data'] = json_decode($project['book_data'], true);
            $project['cover_data'] = json_decode($project['cover_data'], true);
            $project['layout_settings'] = json_decode($project['layout_settings'], true);
            $project['credits_data'] = json_decode($project['credits_data'], true);
            
            echo json_encode([
                'success' => true,
                'project' => $project
            ]);
        } else {
            echo json_encode([
                'error' => 'Proyecto no encontrado'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar el proyecto',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para eliminar proyecto
function deleteBookProject($pdo) {
    try {
        $projectId = $_GET['project_id'];
        $userId = $_GET['user_id'] ?? 1;
        
        $stmt = $pdo->prepare("DELETE FROM book_projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$projectId, $userId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Proyecto eliminado exitosamente'
            ]);
        } else {
            echo json_encode([
                'error' => 'Proyecto no encontrado o no autorizado'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al eliminar el proyecto',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar configuraciones de usuario
function saveUserSettings($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 1;
        $settingKey = $input['setting_key'];
        $settingValue = json_encode($input['setting_value']);
        
        $stmt = $pdo->prepare("
            INSERT INTO user_settings (user_id, setting_key, setting_value) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value), 
            updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$userId, $settingKey, $settingValue]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Configuración guardada exitosamente'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar la configuración',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar configuraciones de usuario
function loadUserSettings($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 1;
        $settingKey = $_GET['setting_key'] ?? null;
        
        if ($settingKey) {
            $stmt = $pdo->prepare("
                SELECT setting_value FROM user_settings 
                WHERE user_id = ? AND setting_key = ?
            ");
            $stmt->execute([$userId, $settingKey]);
            $setting = $stmt->fetch();
            
            echo json_encode([
                'success' => true,
                'setting' => $setting ? json_decode($setting['setting_value'], true) : null
            ]);
        } else {
            $stmt = $pdo->prepare("
                SELECT setting_key, setting_value FROM user_settings 
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $settings = $stmt->fetchAll();
            
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting['setting_key']] = json_decode($setting['setting_value'], true);
            }
            
            echo json_encode([
                'success' => true,
                'settings' => $result
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar las configuraciones',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar datos de mundos
function saveWorldData($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 1;
        $worldName = $input['world_name'];
        $worldType = $input['world_type'];
        $worldData = json_encode($input['world_data']);
        $filePath = $input['file_path'] ?? null;
        $metadata = json_encode($input['metadata'] ?? []);
        
        $stmt = $pdo->prepare("
            INSERT INTO world_data 
            (user_id, world_name, world_type, world_data, file_path, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $worldName, $worldType, $worldData, $filePath, $metadata]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Datos de mundo guardados exitosamente',
            'world_id' => $pdo->lastInsertId()
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar los datos del mundo',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar datos de mundos
function loadWorldData($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 1;
        $worldType = $_GET['world_type'] ?? null;
        
        $sql = "SELECT * FROM world_data WHERE user_id = ?";
        $params = [$userId];
        
        if ($worldType) {
            $sql .= " AND world_type = ?";
            $params[] = $worldType;
        }
        
        $sql .= " ORDER BY updated_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $worlds = $stmt->fetchAll();
        
        // Decodificar JSON
        foreach ($worlds as &$world) {
            $world['world_data'] = json_decode($world['world_data'], true);
            $world['metadata'] = json_decode($world['metadata'], true);
        }
        
        echo json_encode([
            'success' => true,
            'worlds' => $worlds
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar los datos de mundos',
            'message' => $e->getMessage()
        ]);
    }
}
?>

