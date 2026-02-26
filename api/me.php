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
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once __DIR__ . '/db.php';
$userId = intval($_GET['id'] ?? 0);
if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "ID_REQUIRED"]);
    exit;
}
$stmt = $mysqli->prepare("SELECT id, name, email, training, finishDate FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
if ($user) {
    $user["training"] = (int)$user["training"] === 1;
    echo json_encode($user);
} else {
    http_response_code(404);
    echo json_encode(["error" => "USER_NOT_FOUND"]);
}
$mysqli->close();
?>