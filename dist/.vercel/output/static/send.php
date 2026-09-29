<?php
header('Content-Type: application/json');

$response = ['status' => 'error', 'message' => 'Серверная ошибка'];

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

$name = preg_replace('/\s+/', ' ', $name);
$phone = preg_replace('/[^+\d\s\-]/', '', $phone);
$email = strtolower($email);

$nameRegex = '/^[А-Яа-яЁёA-Za-z\s\-]{2,100}$/';
$phoneRegex = '/^\+[0-9\s\-]{9,18}$/';
$emailRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

if (!preg_match($nameRegex, $name)) {
    $response = ['status' => 'error', 'message' => 'Проверьте имя'];
    echo json_encode($response);
    exit;
}

if (!preg_match($phoneRegex, $phone)) {
    $response = ['status' => 'error', 'message' => 'Проверьте телефон'];
    echo json_encode($response);
    exit;
}

if (!preg_match($emailRegex, $email) || strpos($email, '..') !== false) {
    $response = ['status' => 'error', 'message' => 'Проверьте email'];
    echo json_encode($response);
    exit;
}

$force = isset($_POST['force_write']) ? '1' : '0';
$requestsFile = __DIR__ . '/requests.json';
$lock = fopen($requestsFile, 'c+');
if (!$lock) {
    $response = ['status' => 'error', 'message' => 'Не удалось сохранить заявку'];
    echo json_encode($response);
    exit;
}

flock($lock, LOCK_EX);
$requests = [];
if (is_file($requestsFile) && filesize($requestsFile) > 0) {
    $decoded = json_decode(file_get_contents($requestsFile), true);
    if (is_array($decoded)) {
        $requests = $decoded;
    }
}

$existing = array_values(array_filter($requests, function ($row) use ($name, $phone, $email) {
    return ($row['name'] === $name && $row['phone'] === $phone && $row['email'] === $email) ||
           ($row['name'] === $name && $row['phone'] === $phone);
}));

if (!empty($existing) && $force !== '1') {
    flock($lock, LOCK_UN);
    fclose($lock);
    $response = [
        'status' => 'duplicate_full',
        'message' => 'Заявка с такими данными уже отправлена. Если это повторная заявка, подтвердите повторную отправку.'
    ];
    echo json_encode($response);
    exit;
}

$now = date('Y-m-d H:i:s');
$requests[] = [
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'created_at' => $now,
    'agreed_policy' => '1',
    'agreed_pd' => '1'
];

file_put_contents($requestsFile, json_encode($requests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
flock($lock, LOCK_UN);
fclose($lock);

$subject = 'Новая заявка с сайта';
$body = "Новая заявка\n\nИмя: {$name}\nТелефон: {$phone}\nEmail: {$email}\nДата: {$now}\n\nЮридическое согласие (ПЭП): подтверждено.\n";

$to = 'yulia@volchenko.example';
mail($to, $subject, $body, "Content-Type: text/plain; charset=UTF-8\r\n");

$response = ['status' => 'success', 'message' => 'Заявка отправлена'];
echo json_encode($response);
