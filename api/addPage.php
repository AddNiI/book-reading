<?php
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
?>