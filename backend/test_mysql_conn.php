<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    echo "SUCCESS: MySQL Server đang hoạt động tốt trên cổng 3306!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
