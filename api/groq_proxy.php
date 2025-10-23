<?php
header('Content-Type: application/json');

try {
    // Verificar si existe el archivo de clave API
    $keyFile = '../private/groq_api_key.txt';
    if (!file_exists($keyFile)) {
        throw new Exception('API key file not found. Please create ' . $keyFile . ' with your Groq API key.');
    }
    
    $apiKey = trim(file_get_contents($keyFile));
    if (empty($apiKey) || strpos($apiKey, 'XXXX') !== false) {
        throw new Exception('Invalid API key. Please set a valid Groq API key in ' . $keyFile);
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['prompt'])) {
        throw new Exception('Invalid request data. Prompt is required.');
    }
    
    $prompt = $data['prompt'];
    
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, 'https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'llama-3.1-8b-instant',
        'messages' => [['role' => 'user', 'content' => $prompt]],
        'max_tokens' => 1000,
        'temperature' => 0.7
    ]));
    
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('cURL Error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('API Error: HTTP ' . $httpCode . ' - ' . $result);
    }
    
    $response = json_decode($result, true);
    
    if (!$response || !isset($response['choices'][0]['message']['content'])) {
        throw new Exception('Invalid API response format');
    }
    
    $completion = $response['choices'][0]['message']['content'];
    
    echo json_encode([
        'success' => true,
        'completion' => $completion
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

