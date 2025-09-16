<?php

$config = json_decode(file_get_contents('private/api_keys.json'), true);
$db = $config['database'];

echo 'Probando conexión a: ' . $db['host'] . ':' . $db['port'] . PHP_EOL;
echo 'Base de datos: ' . $db['database'] . PHP_EOL;
echo 'Usuario: ' . $db['username'] . PHP_EOL;

try {
    $dsn = 'mysql:host=' . $db['host'] . ';port=' . $db['port'] . ';dbname=' . $db['database'] . ';charset=' . $db['charset'];
    $pdo = new PDO($dsn, $db['username'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    $stmt = $pdo->query('SELECT VERSION() as version');
    $result = $stmt->fetch();
    echo 'ÉXITO: Conexión establecida! MySQL versión: ' . $result['version'] . PHP_EOL;
    
} catch (PDOException $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}

?>

