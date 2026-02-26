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
$input = json_decode(file_get_contents("php://input"), true);
$bookId = isset($input['book_id']) ? intval($input['book_id']) : 0;
if (!$bookId) { http_response_code(400); echo json_encode(['error' => 'INVALID_BOOK_ID']); exit; }
$fields = [];
$types = '';
$values = [];
if (array_key_exists('finished', $input)) {
  $fields[] = 'finished = ?';
  $types .= 'i';
  $values[] = intval($input['finished']);
}
if (array_key_exists('rating', $input)) {
  $fields[] = 'rating = ?';
  $types .= 'i';
  $values[] = intval($input['rating']);
} elseif (array_key_exists('mark', $input)) {
  $fields[] = 'rating = ?';
  $types .= 'i';
  $values[] = intval($input['mark']);
}
if (array_key_exists('review', $input)) {
  $fields[] = 'review = ?';
  $types .= 's';
  $values[] = trim($input['review']);
}
if (empty($fields)) { http_response_code(400); echo json_encode(['error' => 'NO_FIELDS']); exit; }
$setClause = implode(', ', $fields);
$sql = "UPDATE books SET $setClause WHERE id = ?";
$stmt = $mysqli->prepare($sql);
if (!$stmt) { http_response_code(500); echo json_encode(['error' => 'PREPARE_FAILED']); exit; }
$types .= 'i';
$values[] = $bookId;
$bind_names = [];
$bind_names[] = $types;
for ($i=0; $i<count($values); $i++) {
  $bind_name = 'bind' . $i;
  $$bind_name = $values[$i];
  $bind_names[] = &$$bind_name;
}
call_user_func_array([$stmt, 'bind_param'], $bind_names);
$ok = $stmt->execute();
if (!$ok) { http_response_code(500); echo json_encode(['error' => 'EXECUTE_FAILED']); exit; }
echo json_encode(['success' => true, 'affected' => $stmt->affected_rows]);
$mysqli->close();
?>