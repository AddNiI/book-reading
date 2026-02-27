<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once 'db.php';
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$userId = intval($data['user_id'] ?? 0);
if ($userId > 0) {
    $stmt = $mysqli->prepare("
        UPDATE users 
        SET training = 0,
            finishDate = NULL,
            readDays = 0
        WHERE id = ?
    ");
    $stmt->bind_param("i", $userId);
    $userUpdated = $stmt->execute();
    $stmt->close();
    $stmt2 = $mysqli->prepare("
        DELETE FROM pages 
        WHERE user_id = ?
    ");
    $stmt2->bind_param("i", $userId);
    $pagesDeleted = $stmt2->execute();
    $stmt2->close();
    $stmt3 = $mysqli->prepare("
        UPDATE books 
        SET read_status = 0 
        WHERE user_id = ? AND read_status = 1
    ");
    $stmt3->bind_param("i", $userId);
    $booksUpdated = $stmt3->execute();
    $stmt3->close();
    if ($userUpdated && $pagesDeleted && $booksUpdated) {
        echo json_encode([
            "status" => "success",
            "message" => "Training finished and pages cleared"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Database error"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid user_id"
    ]);
}
?>