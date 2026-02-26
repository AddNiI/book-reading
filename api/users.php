<?php
$stmt = $mysqli->prepare(
    "SELECT id, name, email, training, finishDate, readDays FROM users"
);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $row["training"] = (bool)$row["training"];
    $data[] = $row;
}
echo json_encode($data);
$stmt->close();
$mysqli->close();
?>