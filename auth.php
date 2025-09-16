<?php
session_start();
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
        case 'register_with_web':
            registerWithWeb($pdo);
            break;
            
        case 'login':
            loginUser($pdo);
            break;
            
        case 'logout':
            logoutUser();
            break;
            
        case 'check_session':
            checkSession($pdo);
            break;
            
        case 'get_user_info':
            getUserInfo($pdo);
            break;
            
        case 'update_user_info':
            updateUserInfo($pdo);
            break;
            
        case 'list_existing_users':
            listExistingUsers($pdo);
            break;
            
        case 'verify_existing_user':
            verifyExistingUser($pdo);
            break;
            
        case 'create_user_tables':
            createUserTables($pdo);
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

// Función para "Registrarse con WéB" - Permite usar usuarios existentes en la base de datos
function registerWithWeb($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $registrationType = $input['registration_type'] ?? 'new'; // 'new' o 'existing'
        $username = $input['username'];
        $email = $input['email'] ?? '';
        $password = $input['password'];
        $existingUserId = $input['existing_user_id'] ?? null;
        
        // Verificar si la tabla de usuarios web existe, si no, crearla
        createWebUsersTable($pdo);
        
        if ($registrationType === 'existing' && $existingUserId) {
            // Registrarse usando un usuario existente de otras tablas
            $existingUser = verifyExistingUserById($pdo, $existingUserId);
            
            if (!$existingUser) {
                echo json_encode([
                    'error' => 'Usuario existente no encontrado',
                    'message' => 'El ID de usuario proporcionado no existe en las tablas de la base de datos'
                ]);
                return;
            }
            
            // Crear entrada en web_users vinculada al usuario existente
            $stmt = $pdo->prepare("
                INSERT INTO web_users 
                (username, email, password_hash, existing_user_id, user_type, created_at) 
                VALUES (?, ?, ?, ?, 'existing', NOW())
            ");
            $stmt->execute([
                $username,
                $email,
                password_hash($password, PASSWORD_DEFAULT),
                $existingUserId
            ]);
            
            $webUserId = $pdo->lastInsertId();
            
            // Crear sesión
            $_SESSION['user_id'] = $webUserId;
            $_SESSION['username'] = $username;
            $_SESSION['user_type'] = 'existing';
            $_SESSION['existing_user_id'] = $existingUserId;
            
            echo json_encode([
                'success' => true,
                'message' => 'Registro con WéB exitoso usando usuario existente',
                'user_id' => $webUserId,
                'username' => $username,
                'user_type' => 'existing',
                'existing_user_id' => $existingUserId,
                'existing_user_data' => $existingUser
            ]);
            
        } else {
            // Registrarse como nuevo usuario web
            
            // Verificar si el usuario ya existe
            $stmt = $pdo->prepare("SELECT id FROM web_users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                echo json_encode([
                    'error' => 'Usuario ya existe',
                    'message' => 'El nombre de usuario o email ya están registrados'
                ]);
                return;
            }
            
            // Crear nuevo usuario web
            $stmt = $pdo->prepare("
                INSERT INTO web_users 
                (username, email, password_hash, user_type, created_at) 
                VALUES (?, ?, ?, 'new', NOW())
            ");
            $stmt->execute([
                $username,
                $email,
                password_hash($password, PASSWORD_DEFAULT)
            ]);
            
            $webUserId = $pdo->lastInsertId();
            
            // Crear esquema personalizado para el nuevo usuario
            createUserSchema($pdo, $webUserId);
            
            // Crear sesión
            $_SESSION['user_id'] = $webUserId;
            $_SESSION['username'] = $username;
            $_SESSION['user_type'] = 'new';
            
            echo json_encode([
                'success' => true,
                'message' => 'Registro con WéB exitoso como nuevo usuario',
                'user_id' => $webUserId,
                'username' => $username,
                'user_type' => 'new'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error en el registro con WéB',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para crear la tabla de usuarios web
function createWebUsersTable($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS web_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255),
            password_hash VARCHAR(255) NOT NULL,
            existing_user_id INT NULL,
            user_type ENUM('new', 'existing') NOT NULL DEFAULT 'new',
            profile_data JSON,
            preferences JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            is_active BOOLEAN DEFAULT TRUE,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_existing_user (existing_user_id)
        )
    ";
    $pdo->exec($sql);
}

// Función para verificar usuario existente por ID
function verifyExistingUserById($pdo, $userId) {
    // Buscar en diferentes tablas que podrían contener usuarios
    $tables = ['users', 'book_projects', 'user_settings'];
    
    foreach ($tables as $table) {
        try {
            // Verificar si la tabla existe
            $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if (!$stmt->fetch()) {
                continue;
            }
            
            // Buscar el usuario en la tabla
            if ($table === 'users') {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            } elseif ($table === 'book_projects') {
                $stmt = $pdo->prepare("SELECT DISTINCT user_id as id, 'book_user' as type FROM book_projects WHERE user_id = ?");
            } elseif ($table === 'user_settings') {
                $stmt = $pdo->prepare("SELECT DISTINCT user_id as id, 'settings_user' as type FROM user_settings WHERE user_id = ?");
            }
            
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if ($user) {
                $user['source_table'] = $table;
                return $user;
            }
        } catch (Exception $e) {
            // Continuar con la siguiente tabla si hay error
            continue;
        }
    }
    
    return null;
}

// Función para login de usuario
function loginUser($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $username = $input['username'];
        $password = $input['password'];
        
        // Buscar usuario en web_users
        $stmt = $pdo->prepare("
            SELECT id, username, email, password_hash, existing_user_id, user_type, profile_data 
            FROM web_users 
            WHERE username = ? AND is_active = TRUE
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            echo json_encode([
                'error' => 'Credenciales inválidas',
                'message' => 'Usuario o contraseña incorrectos'
            ]);
            return;
        }
        
        // Actualizar último login
        $stmt = $pdo->prepare("UPDATE web_users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Crear sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['existing_user_id'] = $user['existing_user_id'];
        
        // Obtener datos del usuario existente si aplica
        $existingUserData = null;
        if ($user['existing_user_id']) {
            $existingUserData = verifyExistingUserById($pdo, $user['existing_user_id']);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso',
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'user_type' => $user['user_type'],
            'existing_user_id' => $user['existing_user_id'],
            'existing_user_data' => $existingUserData,
            'profile_data' => json_decode($user['profile_data'], true)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error en el login',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para logout
function logoutUser() {
    session_destroy();
    echo json_encode([
        'success' => true,
        'message' => 'Logout exitoso'
    ]);
}

// Función para verificar sesión
function checkSession($pdo) {
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
        
        // Obtener información actualizada del usuario
        $stmt = $pdo->prepare("
            SELECT id, username, email, user_type, existing_user_id, profile_data 
            FROM web_users 
            WHERE id = ? AND is_active = TRUE
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            $existingUserData = null;
            if ($user['existing_user_id']) {
                $existingUserData = verifyExistingUserById($pdo, $user['existing_user_id']);
            }
            
            echo json_encode([
                'success' => true,
                'logged_in' => true,
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'user_type' => $user['user_type'],
                'existing_user_id' => $user['existing_user_id'],
                'existing_user_data' => $existingUserData,
                'profile_data' => json_decode($user['profile_data'], true)
            ]);
        } else {
            session_destroy();
            echo json_encode([
                'success' => true,
                'logged_in' => false
            ]);
        }
    } else {
        echo json_encode([
            'success' => true,
            'logged_in' => false
        ]);
    }
}

// Función para obtener información del usuario
function getUserInfo($pdo) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'No hay sesión activa']);
        return;
    }
    
    $userId = $_SESSION['user_id'];
    
    $stmt = $pdo->prepare("
        SELECT id, username, email, user_type, existing_user_id, profile_data, created_at, last_login 
        FROM web_users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if ($user) {
        $existingUserData = null;
        if ($user['existing_user_id']) {
            $existingUserData = verifyExistingUserById($pdo, $user['existing_user_id']);
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'existing_user_data' => $existingUserData
        ]);
    } else {
        echo json_encode(['error' => 'Usuario no encontrado']);
    }
}

// Función para actualizar información del usuario
function updateUserInfo($pdo) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'No hay sesión activa']);
        return;
    }
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'];
        
        $email = $input['email'] ?? null;
        $profileData = $input['profile_data'] ?? null;
        
        $updates = [];
        $params = [];
        
        if ($email !== null) {
            $updates[] = "email = ?";
            $params[] = $email;
        }
        
        if ($profileData !== null) {
            $updates[] = "profile_data = ?";
            $params[] = json_encode($profileData);
        }
        
        if (!empty($updates)) {
            $params[] = $userId;
            $sql = "UPDATE web_users SET " . implode(", ", $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Información actualizada exitosamente'
            ]);
        } else {
            echo json_encode([
                'error' => 'No hay datos para actualizar'
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al actualizar información',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para listar usuarios existentes en la base de datos
function listExistingUsers($pdo) {
    try {
        $users = [];
        $tables = ['users', 'book_projects', 'user_settings'];
        
        foreach ($tables as $table) {
            try {
                // Verificar si la tabla existe
                $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
                $stmt->execute([$table]);
                if (!$stmt->fetch()) {
                    continue;
                }
                
                // Obtener usuarios de la tabla
                if ($table === 'users') {
                    $stmt = $pdo->query("SELECT id, username, email, created_at FROM users LIMIT 50");
                    while ($row = $stmt->fetch()) {
                        $users[] = [
                            'id' => $row['id'],
                            'username' => $row['username'] ?? 'Usuario ' . $row['id'],
                            'email' => $row['email'] ?? '',
                            'source_table' => $table,
                            'created_at' => $row['created_at'] ?? null
                        ];
                    }
                } elseif ($table === 'book_projects') {
                    $stmt = $pdo->query("SELECT DISTINCT user_id, MIN(created_at) as created_at FROM book_projects GROUP BY user_id LIMIT 50");
                    while ($row = $stmt->fetch()) {
                        $users[] = [
                            'id' => $row['user_id'],
                            'username' => 'Usuario Libros ' . $row['user_id'],
                            'email' => '',
                            'source_table' => $table,
                            'created_at' => $row['created_at']
                        ];
                    }
                } elseif ($table === 'user_settings') {
                    $stmt = $pdo->query("SELECT DISTINCT user_id, MIN(created_at) as created_at FROM user_settings GROUP BY user_id LIMIT 50");
                    while ($row = $stmt->fetch()) {
                        $users[] = [
                            'id' => $row['user_id'],
                            'username' => 'Usuario Config ' . $row['user_id'],
                            'email' => '',
                            'source_table' => $table,
                            'created_at' => $row['created_at']
                        ];
                    }
                }
            } catch (Exception $e) {
                // Continuar con la siguiente tabla si hay error
                continue;
            }
        }
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'total_users' => count($users)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al listar usuarios existentes',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para verificar usuario existente
function verifyExistingUser($pdo) {
    try {
        $userId = $_GET['user_id'];
        $user = verifyExistingUserById($pdo, $userId);
        
        if ($user) {
            echo json_encode([
                'success' => true,
                'user_exists' => true,
                'user_data' => $user
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'user_exists' => false
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'Error al verificar usuario existente',
            'message' => $e->getMessage()
        ]);
    }
}

// Función para crear esquema de usuario (reutilizada del archivo anterior)
function createUserSchema($pdo, $userId) {
    try {
        $userPrefix = 'user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $userId);
        
        // Crear tablas con prefijo de usuario
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
        
        foreach ($tables as $tableName => $sql) {
            $pdo->exec($sql);
        }
        
        return true;
        
    } catch (Exception $e) {
        return false;
    }
}

// Función para crear tablas de usuario
function createUserTables($pdo) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'No hay sesión activa']);
        return;
    }
    
    $userId = $_SESSION['user_id'];
    $success = createUserSchema($pdo, $userId);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Tablas de usuario creadas exitosamente'
        ]);
    } else {
        echo json_encode([
            'error' => 'Error al crear tablas de usuario'
        ]);
    }
}
?>

