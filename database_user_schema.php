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
$config = json_decode(file_get_contents('private/api_keys.json'), true);
$dbConfig = $config['database'];

// Configuración de la base de datos
$host = $dbConfig['host'];
$database = $dbConfig['database'];
$username = $dbConfig['username'];
$password = $dbConfig['password'];
$port = $dbConfig['port'];
$charset = $dbConfig['charset'];

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
        case 'create_user_schema':
            createUserSchema($pdo);
            break;
            
        case 'save_user_project':
            saveUserProject($pdo);
            break;
            
        case 'load_user_projects':
            loadUserProjects($pdo);
            break;
            
        case 'load_user_project':
            loadUserProject($pdo);
            break;
            
        case 'delete_user_project':
            deleteUserProject($pdo);
            break;
            
        case 'save_user_world':
            saveUserWorld($pdo);
            break;
            
        case 'load_user_worlds':
            loadUserWorlds($pdo);
            break;
            
        case 'save_user_settings':
            saveUserSettings($pdo);
            break;
            
        case 'load_user_settings':
            loadUserSettings($pdo);
            break;
            
        case 'list_user_schemas':
            listUserSchemas($pdo);
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

// Función para crear esquema de usuario personalizado (Opción 2)
function createUserSchema($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        
        // Crear tablas con prefijo de usuario (Opción 2: Esquema separado)
        $tables = [
            'book_projects' => "
                CREATE TABLE IF NOT EXISTS {$userPrefix}_book_projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_name VARCHAR(255) NOT NULL,
                    book_data JSON,
                    text_content LONGTEXT,
                    cover_data JSON,
                    layout_settings JSON,
                    credits_data JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    version VARCHAR(10) DEFAULT '1.0'
                )
            ",
            'user_settings' => "
                CREATE TABLE IF NOT EXISTS {$userPrefix}_user_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    setting_key VARCHAR(255) NOT NULL,
                    setting_value JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_setting (setting_key)
                )
            ",
            'world_data' => "
                CREATE TABLE IF NOT EXISTS {$userPrefix}_world_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    world_name VARCHAR(255) NOT NULL,
                    world_type ENUM('hunyuan', 'readyplayer', 'mirage2', 'custom', 'uploaded') NOT NULL,
                    world_data JSON,
                    file_path VARCHAR(500),
                    metadata JSON,
                    share_url VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ",
            'avatars' => "
                CREATE TABLE IF NOT EXISTS {$userPrefix}_avatars (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    avatar_name VARCHAR(255) NOT NULL,
                    avatar_type ENUM('readyplayer', 'custom', 'uploaded') NOT NULL,
                    avatar_data JSON,
                    file_path VARCHAR(500),
                    customization_data JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            "
        ];
        
        $createdTables = [];
        foreach ($tables as $tableName => $sql) {
            $pdo->exec($sql);
            $createdTables[] = $userPrefix . '_' . $tableName;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Esquema de usuario creado exitosamente',
            'user_prefix' => $userPrefix,
            'tables_created' => $createdTables
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al crear esquema de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar proyecto de usuario con esquema personalizado
function saveUserProject($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_book_projects';
        
        $projectName = $input['project_name'];
        $bookData = json_encode($input['book_data']);
        $textContent = $input['text_content'];
        $coverData = json_encode($input['cover_data']);
        $layoutSettings = json_encode($input['layout_settings']);
        $creditsData = json_encode($input['credits_data']);
        $version = $input['version'] ?? '1.0';
        
        // Verificar si el proyecto ya existe
        $stmt = $pdo->prepare("SELECT id FROM `$tableName` WHERE project_name = ?");
        $stmt->execute([$projectName]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Actualizar proyecto existente
            $stmt = $pdo->prepare("
                UPDATE `$tableName` 
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
                INSERT INTO `$tableName` 
                (project_name, book_data, text_content, cover_data, 
                 layout_settings, credits_data, version) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $projectName, $bookData, $textContent, 
                $coverData, $layoutSettings, $creditsData, $version
            ]);
            $projectId = $pdo->lastInsertId();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Proyecto de usuario guardado exitosamente',
            'project_id' => $projectId,
            'user_schema' => $userPrefix
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar el proyecto de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar proyectos de usuario
function loadUserProjects($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_book_projects';
        
        // Verificar si la tabla existe
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$tableName]);
        if (!$stmt->fetch()) {
            echo json_encode([
                'success' => true,
                'projects' => [],
                'message' => 'Esquema de usuario no existe'
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("
            SELECT id, project_name, created_at, updated_at, version 
            FROM `$tableName` 
            ORDER BY updated_at DESC
        ");
        $stmt->execute();
        $projects = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'projects' => $projects,
            'user_schema' => $userPrefix
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar los proyectos de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar un proyecto específico de usuario
function loadUserProject($pdo) {
    try {
        $projectId = $_GET['project_id'];
        $userId = $_GET['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_book_projects';
        
        $stmt = $pdo->prepare("SELECT * FROM `$tableName` WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        
        if ($project) {
            // Decodificar JSON
            $project['book_data'] = json_decode($project['book_data'], true);
            $project['cover_data'] = json_decode($project['cover_data'], true);
            $project['layout_settings'] = json_decode($project['layout_settings'], true);
            $project['credits_data'] = json_decode($project['credits_data'], true);
            
            echo json_encode([
                'success' => true,
                'project' => $project,
                'user_schema' => $userPrefix
            ]);
        } else {
            echo json_encode([
                'error' => 'Proyecto de usuario no encontrado'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar el proyecto de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para eliminar proyecto de usuario
function deleteUserProject($pdo) {
    try {
        $projectId = $_GET['project_id'];
        $userId = $_GET['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_book_projects';
        
        $stmt = $pdo->prepare("DELETE FROM `$tableName` WHERE id = ?");
        $stmt->execute([$projectId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Proyecto de usuario eliminado exitosamente'
            ]);
        } else {
            echo json_encode([
                'error' => 'Proyecto de usuario no encontrado'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al eliminar el proyecto de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar mundo de usuario
function saveUserWorld($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_world_data';
        
        $worldName = $input['world_name'];
        $worldType = $input['world_type'];
        $worldData = json_encode($input['world_data']);
        $filePath = $input['file_path'] ?? null;
        $metadata = json_encode($input['metadata'] ?? []);
        $shareUrl = $input['share_url'] ?? null;
        
        $stmt = $pdo->prepare("
            INSERT INTO `$tableName` 
            (world_name, world_type, world_data, file_path, metadata, share_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$worldName, $worldType, $worldData, $filePath, $metadata, $shareUrl]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Mundo de usuario guardado exitosamente',
            'world_id' => $pdo->lastInsertId(),
            'user_schema' => $userPrefix
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar el mundo de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar mundos de usuario
function loadUserWorlds($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 'default_user';
        $worldType = $_GET['world_type'] ?? null;
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_world_data';
        
        // Verificar si la tabla existe
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$tableName]);
        if (!$stmt->fetch()) {
            echo json_encode([
                'success' => true,
                'worlds' => [],
                'message' => 'Esquema de usuario no existe'
            ]);
            return;
        }
        
        $sql = "SELECT * FROM `$tableName`";
        $params = [];
        
        if ($worldType) {
            $sql .= " WHERE world_type = ?";
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
            'worlds' => $worlds,
            'user_schema' => $userPrefix
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar los mundos de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para guardar configuraciones de usuario
function saveUserSettings($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? 'default_user';
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_user_settings';
        
        $settingKey = $input['setting_key'];
        $settingValue = json_encode($input['setting_value']);
        
        $stmt = $pdo->prepare("
            INSERT INTO `$tableName` (setting_key, setting_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value), 
            updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$settingKey, $settingValue]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Configuración de usuario guardada exitosamente',
            'user_schema' => $userPrefix
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al guardar la configuración de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para cargar configuraciones de usuario
function loadUserSettings($pdo) {
    try {
        $userId = $_GET['user_id'] ?? 'default_user';
        $settingKey = $_GET['setting_key'] ?? null;
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        $tableName = $userPrefix . '_user_settings';
        
        // Verificar si la tabla existe
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$tableName]);
        if (!$stmt->fetch()) {
            echo json_encode([
                'success' => true,
                'settings' => [],
                'message' => 'Esquema de usuario no existe'
            ]);
            return;
        }
        
        if ($settingKey) {
            $stmt = $pdo->prepare("SELECT setting_value FROM `$tableName` WHERE setting_key = ?");
            $stmt->execute([$settingKey]);
            $setting = $stmt->fetch();
            
            echo json_encode([
                'success' => true,
                'setting' => $setting ? json_decode($setting['setting_value'], true) : null,
                'user_schema' => $userPrefix
            ]);
        } else {
            $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM `$tableName`");
            $stmt->execute();
            $settings = $stmt->fetchAll();
            
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting['setting_key']] = json_decode($setting['setting_value'], true);
            }
            
            echo json_encode([
                'success' => true,
                'settings' => $result,
                'user_schema' => $userPrefix
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al cargar las configuraciones de usuario',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para listar esquemas de usuario existentes
function listUserSchemas($pdo) {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'user_%_book_projects'");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $schemas = [];
        foreach ($tables as $table) {
            if (preg_match('/^user_(.+)_book_projects$/', $table, $matches)) {
                $schemas[] = [
                    'user_id' => $matches[1],
                    'user_prefix' => 'user_' . $matches[1],
                    'table_name' => $table
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'schemas' => $schemas,
            'total_schemas' => count($schemas)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al listar esquemas de usuario',
            'message' => $e->getMessage()
        ]);
    }
}
?>

