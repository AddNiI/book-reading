<?php
require_once "db.php";
header("Content-Type: application/json");
if (!isset($_FILES['image']) || !isset($_POST['userId'])) {
    http_response_code(400);
    echo json_encode(["error" => "INVALID_DATA"]);
    exit;
}
$userId = intval($_POST['userId']);
$oldIcon = $_POST['oldIcon'] ?? null;
$uploadDir = __DIR__ . '/icons/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "Неправильний тип файла"]);
    exit;
}
if ($file['size'] > 2 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["error" => "Файл занадто великий"]);
    exit;
}
$fileName = uniqid() . ".jpg";
$targetFile = $uploadDir . $fileName;
if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(["error" => "Помилка завантаження"]);
    exit;
}
$imagePath = "/icons/" . $fileName;
if ($oldIcon && strpos($oldIcon, "/icons/") !== false) {
    $oldFile = basename($oldIcon);
    $oldPath = $uploadDir . $oldFile;
    if (file_exists($oldPath)) {
        unlink($oldPath);
    }
}
$stmt = $mysqli->prepare("UPDATE users SET Icon = ? WHERE id = ?");
$stmt->bind_param("si", $imagePath, $userId);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "DB_ERROR"]);
    exit;
}
$stmt->close();
echo json_encode([
    "success" => true,
    "Icon" => "https://book-reading.pp.ua" . $imagePath
]);