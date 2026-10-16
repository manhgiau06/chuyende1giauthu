<?php
try {
    $host = '127.0.0.1';
    $port = '3306';
    $user = 'root';
    $pass = '';

    $pdo = new PDO("mysql:host={$host};port={$port}", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `chuyende1` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    echo "SUCCESS: MySQL database `chuyende1` ready!\n";
} catch (Exception $e) {
    echo "NOTE: " . $e->getMessage() . "\n";
}
