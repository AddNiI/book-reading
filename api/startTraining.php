<?php
$mysqli->begin_transaction();
$stmtUser = $mysqli->prepare(
    "UPDATE users SET training = 1, finishDate = ? WHERE id = ?"
);
$stmtUser->bind_param("si", $fDate, $userId);
$stmtUser->execute();
$stmtUser->close();
$placeholders = implode(',', array_fill(0, count($bookIds), '?'));
$types = str_repeat('i', count($bookIds)) . 'i';
$sql = "UPDATE books SET read_status = 1
        WHERE id IN ($placeholders) AND user_id = ?";
$stmtBooks = $mysqli->prepare($sql);
$params = array_merge($bookIds, [$userId]);
$stmtBooks->bind_param($types, ...$params);
$stmtBooks->execute();
$stmtBooks->close();
$mysqli->commit();
echo json_encode(["status" => "success"]);
$mysqli->close();
?>