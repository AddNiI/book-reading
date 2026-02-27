<?php

$allowed = [
    'http://localhost:3000',
    'http://localhost',
    'https://juniper-fractus-dorethea.ngrok-free.dev',
    'https://book-reading.pp.ua',
    'https://addnii.github.io'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/db.php';
$data = json_decode(file_get_contents("php://input"), true);
$bookId = intval($data['book_id'] ?? 0);
$userId = intval($data['user_id'] ?? 0);
$pagesCount = intval($data['pages_count'] ?? 0);
$date = $data['date'] ?? '';
$time = date("H:i:s");
if ($bookId <= 0 || $userId <= 0 || $pagesCount <= 0 || !$date) {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}
$stmt = $mysqli->prepare(
    "INSERT INTO pages (book_id, user_id, date, time, pages_count)
     VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("iissi", $bookId, $userId, $date, $time, $pagesCount);
$stmt->execute();
echo json_encode([
    "id" => $mysqli->insert_id,
    "date" => $date,
    "time" => $time,
    "pages_count" => $pagesCount
]);
$stmt->close();
$mysqli->close();