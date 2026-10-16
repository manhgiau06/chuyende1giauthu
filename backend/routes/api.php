<?php

use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookReservationController;
use App\Http\Controllers\Api\BookReviewController;
use App\Http\Controllers\Api\BorrowTicketController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SystemConfigController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/books/{id}/reviews', [BookReviewController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/deliveries/track/{trackingNumber}', [DeliveryController::class, 'track']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->name('api.payments.webhook');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']);

    // Admin create librarian & trigger schedule
    Route::post('/admin/librarians', [AuthController::class, 'storeLibrarian']);
    Route::post('/admin/trigger-schedule', [AdminReportController::class, 'triggerSchedule']);

    // Admin User & RBAC Management
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::put('/admin/users/{id}/status', [AdminUserController::class, 'toggleStatus']);
    Route::post('/admin/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);

    // Book Management (Librarian/Admin)
    Route::post('/books', [BookController::class, 'store']);
    Route::post('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
    Route::post('/books/{id}/reviews', [BookReviewController::class, 'store']);

    // Category Management
    Route::post('/categories', [CategoryController::class, 'store']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/{id}/toggle', [WishlistController::class, 'toggle']);

    // Notification Email Logs & Sending
    Route::get('/notifications/my-emails', [NotificationController::class, 'myEmails']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/admin/notifications', [NotificationController::class, 'allNotifications']);
    Route::post('/admin/notifications/send', [NotificationController::class, 'send']);

    // Borrowing Workflow
    Route::get('/borrow-tickets', [BorrowTicketController::class, 'index']);
    Route::get('/borrow-tickets/{id}', [BorrowTicketController::class, 'show']);
    Route::post('/borrow-tickets', [BorrowTicketController::class, 'store']);
    Route::post('/borrow-tickets/{id}/renew', [BorrowTicketController::class, 'renew']);
    Route::post('/borrow-tickets/{id}/approve', [BorrowTicketController::class, 'approve']);
    Route::post('/borrow-tickets/{id}/return', [BorrowTicketController::class, 'returnBooks']);
    Route::post('/borrow-tickets/{id}/remind', [NotificationController::class, 'remindBorrowTicket']);

    // Order & Purchasing Workflow
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Online Payments & Bank Transfer Approval
    Route::get('/bank-config', [PaymentController::class, 'getBankConfig']);
    Route::post('/librarian/bank-config', [PaymentController::class, 'updateBankConfig']);
    Route::post('/payments/create', [PaymentController::class, 'createPayment']);
    Route::post('/payments/{id}/confirm-transfer', [PaymentController::class, 'confirmTransfer']);
    Route::get('/admin/payments', [PaymentController::class, 'index']);
    Route::post('/admin/payments/{id}/approve', [PaymentController::class, 'approve']);
    Route::post('/admin/payments/{id}/reject', [PaymentController::class, 'reject']);

    // Admin Reports & Analytics
    Route::get('/admin/monthly-stats', [AdminReportController::class, 'monthlyStats']);
    Route::get('/admin/export-csv', [AdminReportController::class, 'exportCsv']);

    // System Configs
    Route::get('/admin/system-configs', [SystemConfigController::class, 'index']);
    Route::post('/admin/system-configs', [SystemConfigController::class, 'update']);

    // Book Reservations (Queue)
    Route::get('/reservations', [BookReservationController::class, 'index']);
    Route::post('/reservations', [BookReservationController::class, 'store']);
    Route::delete('/reservations/{id}', [BookReservationController::class, 'cancel']);
    Route::post('/reservations/{id}/notify', [BookReservationController::class, 'notifyManually']);
});
