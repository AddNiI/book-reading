<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "users";
$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_error) {
  die("База впала з причиною: " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8");
?>