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
$input = json_decode(file_get_contents("php://input"), true);
$title = trim($input["title"] ?? "");
$author = trim($input["author"] ?? "");
$year = isset($input["year"]) ? intval($input["year"]) : 0;
$pages = isset($input["pages"]) ? intval($input["pages"]) : 0;
$userId = isset($input["user_id"]) ? intval($input["user_id"]) : 0;
if (!$title || !$author || !$userId) {
	http_response_code(400);
	echo json_encode(["error" => "INVALID_INPUT"]);
	exit;
}
$check = $mysqli->prepare("SELECT id FROM books WHERE user_id = ? AND title = ? AND author = ? AND year = ? AND pages = ? LIMIT 1");
$check->bind_param("issii", $userId, $title, $author, $year, $pages);
$check->execute();
$res = $check->get_result();
if ($res && $res->fetch_assoc()) {
	http_response_code(409);
	echo json_encode(["error" => "BOOK_EXISTS"]);
	exit;
}
$stmt = $mysqli->prepare("INSERT INTO books (user_id, title, author, year, pages) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issii", $userId, $title, $author, $year, $pages);
$stmt->execute();
echo json_encode(["id" => $mysqli->insert_id]);
$mysqli->close();
?>