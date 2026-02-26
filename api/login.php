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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
require_once __DIR__ . '/db.php';
$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");
$password = trim($input["password"] ?? "");
$stmt = $mysqli->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
if (!$user) {
  $stmt->close();
  $mysqli->close();
  http_response_code(401);
  echo json_encode(["error" => "USER_NOT_FOUND"]);
  exit;
}
if (!password_verify($password, $user["password"])) {
  $stmt->close();
  $mysqli->close();
  http_response_code(401);
  echo json_encode(["error" => "WRONG_PASSWORD"]);
  exit;
}
unset($user["password"]);
$user["training"] = (bool)$user["training"];
echo json_encode($user);
$stmt->close();
$mysqli->close();
?>