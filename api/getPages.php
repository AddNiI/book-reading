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
$bookId = intval($_GET['book_id'] ?? 0);
if ($bookId <= 0) { echo json_encode([]); exit; }
$stmt = $mysqli->prepare("SELECT * FROM pages WHERE book_id = ? ORDER BY date ASC, time ASC");
$stmt->bind_param("i", $bookId);
$stmt->execute();
$result = $stmt->get_result();
$pages = [];
while ($row = $result->fetch_assoc()) {
  $pages[] = $row;
}
echo json_encode($pages);
$mysqli->close();
?>