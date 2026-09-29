<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');

if (empty($name) || empty($phone) || empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны для заполнения']);
    exit;
}

$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$phone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
    exit;
}

$phone = preg_replace('/[^0-9+]/', '', $phone);
if (!preg_match('/^\+[0-9]{7,15}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректный номер телефона']);
    exit;
}

$data = [
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'date' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

$logFile = __DIR__ . '/requests.json';
$entries = [];
if (file_exists($logFile)) {
    $existing = file_get_contents($logFile);
    if (!empty($existing)) {
        $entries = json_decode($existing, true);
        if (!is_array($entries)) $entries = [];
    }
}
$entries[] = $data;
file_put_contents($logFile, json_encode($entries, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

$to = 'prana@neyro-os.ru';
$subject = 'Новая заявка с сайта — ' . $name;
$message = "Новая заявка с сайта Юлии Волчаренко:\n\n";
$message .= "Имя: $name\n";
$message .= "Телефон: $phone\n";
$message .= "Email: $email\n";
$message .= "Дата: {$data['date']}\n";
$message .= "IP: {$data['ip']}\n";

$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($to, $subject, $message, $headers);

echo json_encode(['status' => 'success', 'message' => 'Заявка успешно отправлена']);
?>