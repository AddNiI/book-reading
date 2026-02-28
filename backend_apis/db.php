<?php
$servername = "sql308.infinityfree.com";
$username = "if0_41257518";
$password = "ya1ne2znayu";
$dbname = "if0_41257518_users";
$mysqli = new mysqli($servername, $username, $password, $dbname);
mysqli_set_charset($mysqli, "utf8mb4");
if ($mysqli->connect_error) {
    die("Помилка пiдключення: " . $mysqli->connect_error);
}
?>