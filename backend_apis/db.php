<?php
$servername = "****";
$username = "****";
$password = "****";
$dbname = "****";
$mysqli = new mysqli($servername, $username, $password, $dbname);
mysqli_set_charset($mysqli, "utf8mb4");
if ($mysqli->connect_error) {
    die("Помилка пiдключення: " . $mysqli->connect_error);
}
?>