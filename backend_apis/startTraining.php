<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
require_once 'db.php'; 
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$userId = intval($data['user_id'] ?? $data['userId'] ?? 0);
$bookIds = $data['bookIds'] ?? []; 
$finishDate = $data['finish_date'] ?? $data['finishDate'] ?? '';
$readDays = intval($data['readDays'] ?? 0);
if ($userId > 0 && !empty($bookIds)) {
    $mysqli->begin_transaction();
    try {
        $stmtU = $mysqli->prepare("UPDATE users SET training = 1, finishDate = ?, readDays = ? WHERE id = ?");
        $stmtU->bind_param("sii", $finishDate, $readDays, $userId);
        $stmtU->execute();
        $cleanIds = array_map('intval', $bookIds);
        $placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
        $sqlB = "UPDATE books SET read_status = 1 WHERE id IN ($placeholders) AND user_id = ?";
        $stmtB = $mysqli->prepare($sqlB);
        $types = str_repeat('i', count($cleanIds)) . 'i';
        $params = array_merge($cleanIds, [$userId]);
        $stmtB->bind_param($types, ...$params);
        $stmtB->execute();
        $affectedBooks = $stmtB->affected_rows;
        $mysqli->commit();
        echo json_encode([
            "status" => "success", 
            "updated_books_count" => $affectedBooks
        ]);
    } catch (Exception $e) {
        $mysqli->rollback();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid data", "debug" => $data]);
}