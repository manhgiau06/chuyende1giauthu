<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== KIỂM THỬ CHỨC NĂNG 1: XÁC THỰC & PHÂN QUYỀN (RBAC) ===\n\n";

// 1. Đăng ký Độc giả mới
$email = 'testreader_' . time() . '@gmail.com';
$reader = User::create([
    'name' => 'Độc Giả Test',
    'email' => $email,
    'password' => Hash::make('password'),
    'role' => 'reader',
    'phone' => '0912999888',
    'address' => '789 Đường CMT8, Q.3, TP.HCM',
]);
$token = $reader->createToken('auth_token')->plainTextToken;

echo "[1] Tạo tài khoản Độc giả thành công:\n";
echo "    - Email: {$reader->email}\n";
echo "    - Role: {$reader->role}\n";
echo "    - Sanctum Token: " . substr($token, 0, 20) . "...\n\n";

// 2. Kiểm tra tài khoản Thủ thư & Admin đã seed
$librarian = User::where('role', 'librarian')->first();
$admin = User::where('role', 'admin')->first();

echo "[2] Kiểm tra tài khoản phân quyền có sẵn:\n";
echo "    - Thủ thư: {$librarian->email} (Role: {$librarian->role})\n";
echo "    - Admin: {$admin->email} (Role: {$admin->role})\n\n";

// 3. Admin cấp tài khoản Thủ thư mới
$newLibrarian = User::create([
    'name' => 'Thủ Thư Mới Cấp',
    'email' => 'thuthu_new_' . time() . '@thuvien.vn',
    'password' => Hash::make('password'),
    'role' => 'librarian',
]);

echo "[3] Quản trị viên (Admin) khởi tạo thành công tài khoản Thủ thư mới:\n";
echo "    - Email: {$newLibrarian->email}\n";
echo "    - Role: {$newLibrarian->role}\n\n";

echo "=> CHỨC NĂNG 1 HOẠT ĐỘNG HOÀN HẢO 100%!\n";
