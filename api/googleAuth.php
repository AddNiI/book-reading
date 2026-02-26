<?php
require_once 'google_config.php';
require_once __DIR__ . '/db.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
function sendError($message, $status = 400) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}
function sendSuccess($user) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Only POST allowed', 405);
}
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST ?? [];
}
$token = null;
if (!empty($input['id_token'])) {
    $token = trim($input['id_token']);
} elseif (!empty($input['access_token'])) {
    $token = trim($input['access_token']);
}
$action = isset($input['action']) ? strtolower(trim($input['action'])) : 'login';
if (!$token) {
    sendError('Потрібен id_token або access_token від Google', 400);
}
$parts = explode('.', $token);
$is_access_token = false;
if (count($parts) !== 3) {
    $payload = null;
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token);
    $resp = @file_get_contents($url);
    if ($resp !== false) {
        $info = json_decode($resp, true);
        if (is_array($info) && !empty($info['email'])) {
            $payload = $info;
        }
    }
    if (!is_array($payload)) {
        $ctx = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Authorization: Bearer " . $token . "\r\n",
                'timeout' => 5,
            ]
        ]);
        $url = 'https://www.googleapis.com/oauth2/v3/userinfo';
        $resp = @file_get_contents($url, false, $ctx);
        if ($resp !== false) {
            $info = json_decode($resp, true);
            if (is_array($info) && !empty($info['email'])) {
                $payload = $info;
                $is_access_token = true;
            }
        }
    }
    if (!is_array($payload)) {
        sendError('Невірний формат або недійсний токен. Переконайтеся, що фронтенд надсилає дійсний id_token або access_token Google, і що GOOGLE_CLIENT_ID правильно налаштований.', 400);
    }
} else {
    $payload_b64 = $parts[1];
    $payload_b64 = strtr($payload_b64, '-_', '+/');
    $pad = strlen($payload_b64) % 4;
    if ($pad) $payload_b64 .= str_repeat('=', 4 - $pad);
    $payload_json = base64_decode($payload_b64);
    if (!$payload_json) {
        sendError('Не вдалося розібрати payload токена', 400);
    }
    $payload = json_decode($payload_json, true);
    if (!is_array($payload)) {
        sendError('Неправильний JSON у payload', 400);
    }
}
$now = time();
if (isset($payload['exp']) && $payload['exp'] < $now) {
    sendError('Токен закінчив дію', 400);
}
if (empty($payload['email'])) {
    sendError('Email відсутній у токені', 400);
}
$aud_ok = false;
if (!$is_access_token) {
    if (isset($payload['aud']) && $payload['aud'] === GOOGLE_CLIENT_ID) $aud_ok = true;
    if (!$aud_ok && isset($payload['azp']) && $payload['azp'] === GOOGLE_CLIENT_ID) $aud_ok = true;
    if (!$aud_ok) {
        sendError('Неправильна аудиторія токена', 400);
    }
} else {
    if (empty($payload['email'])) {
        sendError('Не вдалося підтвердити email з access_token', 400);
    }
}
$email = strtolower(trim($payload['email']));
$name = $payload['name'] ?? ($payload['given_name'] ?? $email);
$stmt = $mysqli->prepare('SELECT id, name, email, training, finishDate, readDays FROM users WHERE email = ?');
if (!$stmt) sendError('Помилка БД', 500);
$stmt->bind_param('s', $email);
if (!$stmt->execute()) sendError('Помилка БД', 500);
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();
if ($user) {
    $user['training'] = (bool)$user['training'];
    sendSuccess($user);
}

if ($action !== 'register') {
    sendError('Користувача з такою поштою не знайдено', 404);
}
$generated = bin2hex(random_bytes(6));
$hashed = password_hash($generated, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare('INSERT INTO users (name, email, password, training, finishDate, readDays) VALUES (?, ?, ?, 0, "", "")');
if (!$stmt) sendError('Помилка БД при вставці', 500);
$stmt->bind_param('sss', $name, $email, $hashed);
if (!$stmt->execute()) sendError('Не вдалося створити користувача', 500);
$id = $mysqli->insert_id;
$stmt->close();
$stmt = $mysqli->prepare('SELECT id, name, email, training, finishDate, readDays FROM users WHERE id = ?');
if (!$stmt) sendError('Помилка БД при отриманні користувача', 500);
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
$newUser = $res->fetch_assoc();
$stmt->close();
if (!$newUser) sendError('Не вдалося отримати новоствореного користувача', 500);
$newUser['training'] = (bool)$newUser['training'];
sendSuccess($newUser);
$mysqli->close();
?>