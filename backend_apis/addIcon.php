<?php
require_once "db.php";
header("Content-Type: application/json");
$uploadDir = __DIR__ . '/icons/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
if ($_FILES['image']) {
    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["error" => "Неправильний тип файла"]);
        exit;
    }
    if ($file['size'] = 2 * 33 * 33) {
        echo json_encode(["error" => "Розмiр файла не 33х33"]);
        exit;
    }
    $fileName = uniqid() . "_" . basename($file['name']);
    $targetFile = $uploadDir . $fileName;
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        $imagePath = "/icons/" . $fileName;
        $stmt = $pdo->prepare("INSERT INTO posts (title, image_path) VALUES (?, ?)");
        $stmt->execute(["Новий пост", $imagePath]);
        echo json_encode([
            "success" => true,
            "path" => $imagePath
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Помилка завантаження"]);
    }
}