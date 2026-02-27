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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
require_once __DIR__ . '/db.php';
$userId = intval($_GET['user_id'] ?? 0);
$query = $_GET['query'] ?? '';
if ($userId <= 0) {
    echo json_encode([]);
    exit;
}
$books = [];
if (!empty($query)) {
    $stmt = $mysqli->prepare("SELECT * FROM books WHERE user_id = ? AND title LIKE ?");
    $searchTerm = "%$query%";
    $stmt->bind_param("is", $userId, $searchTerm);
} else {
    $stmt = $mysqli->prepare("SELECT * FROM books WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
}
if ($stmt) {
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $books[] = $row;
    }
    $stmt->close();
}
if (isset($_GET['debug'])) {
    echo json_encode(['origin' => $_SERVER['HTTP_ORIGIN'] ?? null, 'count' => count($books), 'books' => $books]);
    exit;
}
$logLine = date('c') . "\t" . ($_SERVER['HTTP_ORIGIN'] ?? 'NO_ORIGIN') . "\tuser_id=" . ($userId) . "\tcount=" . count($books) . "\n";
@file_put_contents(__DIR__ . '/debug.log', $logLine, FILE_APPEND | LOCK_EX);
echo json_encode($books);
$mysqli->close();
?>