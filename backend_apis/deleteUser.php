<?php
require_once "db.php";
$data = json_decode(file_get_contents("php://input"), true);
$userId = $data["userId"];
$currentPassword = $data["currentPassword"];
$stmt = $mysqli->prepare("SELECT password FROM users WHERE id=?");
$stmt->bind_param("i",$userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
if($currentPassword !== "GOOGLE_AUTH" && !password_verify($currentPassword,$user["password"])){
    echo json_encode(["error"=>"WRONG_PASSWORD"]);
    exit;
}
$stmt = $mysqli->prepare("DELETE FROM users WHERE id=?");
$stmt->bind_param("i",$userId);
$stmt->execute();
echo json_encode(["success"=>true]);
$stmt->close();
$mysqli->close();
?>