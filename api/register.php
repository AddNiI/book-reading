<?php
$allowed = [
    'http://localhost:3000',
    'http://localhost',
    'https://juniper-fractus-dorethea.ngrok-free.dev',
    'https://addnii.github.io'
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$passwordRepeat = trim($input['passwordRepeat'] ?? '');
if (strlen($name) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'INVALID_NAME']);
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'INVALID_EMAIL']);
    exit();
}
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'INVALID_PASSWORD']);
    exit();
}
if ($password !== $passwordRepeat) {
    http_response_code(400);
    echo json_encode(['error' => 'PASSWORD_MISMATCH']);
    exit();
}
$stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    $mysqli->close();
    echo json_encode(["error" => "USER_EXISTS"]);
    exit;
}
$stmt->close();
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $mysqli->prepare('INSERT INTO users (name, email, password, training, finishDate, readDays) VALUES (?, ?, ?, 0, "", "")');
$stmt->bind_param('sss', $name, $email, $hashedPassword);
$stmt->execute();
echo json_encode(['success' => true]);
$mysqli->close();
?>