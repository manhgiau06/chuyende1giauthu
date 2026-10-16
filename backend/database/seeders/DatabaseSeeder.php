<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookInventory;
use App\Models\SystemConfig;
use App\Models\BorrowTicket;
use App\Models\BorrowItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\DeliveryHistory;
use App\Models\BookReview;
use App\Models\Wishlist;
use App\Models\EmailLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. System Configs
        $configs = [
            ['key' => 'max_borrow_limit', 'value' => '3', 'description' => 'Số cuốn sách tối đa mượn cùng lúc'],
            ['key' => 'max_borrow_days', 'value' => '14', 'description' => 'Số ngày mượn sách mặc định'],
            ['key' => 'late_fee_per_day', 'value' => '5000', 'description' => 'Phí phạt trễ hạn mỗi ngày (VND)'],
            ['key' => 'max_renew_count', 'value' => '1', 'description' => 'Số lần tự gia hạn tối đa'],
            ['key' => 'renew_days', 'value' => '7', 'description' => 'Số ngày cộng thêm mỗi lần gia hạn'],
        ];

        foreach ($configs as $config) {
            SystemConfig::create($config);
        }

        // 2. Users (Admin, Librarian, Readers)
        $admin = User::create([
            'name' => 'Quản trị viên Hệ thống',
            'email' => 'admin@thuvien.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '0901234567',
            'address' => 'Thành phố Hồ Chí Minh',
        ]);

        $librarian = User::create([
            'name' => 'Thủ thư Nguyễn Văn A',
            'email' => 'thuthu@thuvien.vn',
            'password' => Hash::make('password'),
            'role' => 'librarian',
            'phone' => '0912345678',
            'address' => 'Quận 1, TP. Hồ Chí Minh',
        ]);

        $reader1 = User::create([
            'name' => 'Trần Thị Độc Giả',
            'email' => 'docgia1@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'reader',
            'phone' => '0987654321',
            'address' => '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        ]);

        $reader2 = User::create([
            'name' => 'Lê Minh Tuấn',
            'email' => 'docgia2@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'reader',
            'phone' => '0977112233',
            'address' => '456 Đường Nguyễn Huệ, Quận 3, TP. Hồ Chí Minh',
        ]);

        $reader3 = User::create([
            'name' => 'Phạm Hoàng Nam',
            'email' => 'nam.pham@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'reader',
            'phone' => '0933445566',
            'address' => '789 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh',
        ]);

        // 3. Categories
        $catIT = Category::create(['name' => 'Công nghệ thông tin', 'slug' => 'cong-nghe-thong-tin', 'description' => 'Sách Lập trình, Cơ sở dữ liệu và AI']);
        $catLit = Category::create(['name' => 'Văn học & Nghệ thuật', 'slug' => 'van-hoc-nghe-thuat', 'description' => 'Các tác phẩm văn học kinh điển và hiện đại']);
        $catEcon = Category::create(['name' => 'Kinh tế & Quản trị', 'slug' => 'kinh-te-quan-tri', 'description' => 'Quản trị kinh doanh, tài chính và khởi nghiệp']);
        $catSkill = Category::create(['name' => 'Tâm lý & Kỹ năng sống', 'slug' => 'tam-ly-ky-nang-song', 'description' => 'Phát triển bản thân, tư duy và giao tiếp']);
        $catHistory = Category::create(['name' => 'Lịch sử & Lược sử', 'slug' => 'lich-su-luoc-su', 'description' => 'Lịch sử văn minh nhân loại và thế giới']);

        // 4. Sample Books (12 Đầu Sách Hỗn Hợp Mượn & Bán)
        $booksData = [
            [
                'category_id' => $catIT->id,
                'title' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
                'author' => 'Robert C. Martin',
                'isbn' => '9780132350884',
                'publisher' => 'Prentice Hall',
                'publish_year' => 2008,
                'description' => 'Cuốn sách kinh điển về quy chuẩn mã sạch, refactoring và nguyên lý lập trình phần mềm vững chắc.',
                'cover_image' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 250000,
                'borrow_copies' => 5,
                'stock' => 15,
            ],
            [
                'category_id' => $catIT->id,
                'title' => 'Design Patterns: Elements of Reusable Object-Oriented Software',
                'author' => 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
                'isbn' => '9780201633610',
                'publisher' => 'Addison-Wesley',
                'publish_year' => 1994,
                'description' => 'Tài liệu gối đầu giường về 23 thiết kế mẫu Gang of Four dành cho lập trình viên hướng đối tượng.',
                'cover_image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 320000,
                'borrow_copies' => 3,
                'stock' => 10,
            ],
            [
                'category_id' => $catIT->id,
                'title' => 'The Pragmatic Programmer: Your Journey to Mastery',
                'author' => 'David Thomas, Andrew Hunt',
                'isbn' => '9780135957059',
                'publisher' => 'Addison-Wesley',
                'publish_year' => 2019,
                'description' => 'Các tư duy thực tế và trải nghiệm quý báu giúp nâng tầm kỹ năng kỹ sư phần mềm chuyên nghiệp.',
                'cover_image' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 290000,
                'borrow_copies' => 4,
                'stock' => 12,
            ],
            [
                'category_id' => $catLit->id,
                'title' => 'Dế Mèn Phiêu Lưu Ký',
                'author' => 'Tô Hoài',
                'isbn' => '9786042123456',
                'publisher' => 'NXB Kim Đồng',
                'publish_year' => 2019,
                'description' => 'Kiệt tác truyện thiếu nhi nổi tiếng của nhà văn Tô Hoài về tình bạn và tinh thần phiêu lưu kiên cường.',
                'cover_image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 65000,
                'borrow_copies' => 6,
                'stock' => 25,
            ],
            [
                'category_id' => $catLit->id,
                'title' => 'Nhà Giả Kim (The Alchemist)',
                'author' => 'Paulo Coelho',
                'isbn' => '9786045638891',
                'publisher' => 'NXB Hội Nhà Văn',
                'publish_year' => 2020,
                'description' => 'Hành trình đuổi theo ước mơ và lắng nghe nhịp đập trái tim của chàng chăn cừu Santiago.',
                'cover_image' => 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 79000,
                'borrow_copies' => 5,
                'stock' => 30,
            ],
            [
                'category_id' => $catLit->id,
                'title' => 'Mắt Biếc',
                'author' => 'Nguyễn Nhật Ánh',
                'isbn' => '9786041088892',
                'publisher' => 'NXB Trẻ',
                'publish_year' => 2019,
                'description' => 'Câu chuyện tình cảm trong sáng đầy hoài niệm của Ngạn và Hà Lan tại làng Đo Đo.',
                'cover_image' => 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 110000,
                'borrow_copies' => 4,
                'stock' => 18,
            ],
            [
                'category_id' => $catSkill->id,
                'title' => 'Đắc Nhân Tâm',
                'author' => 'Dale Carnegie',
                'isbn' => '9786045678901',
                'publisher' => 'NXB Tổng hợp TP.HCM',
                'publish_year' => 2021,
                'description' => 'Nghệ thuật thu phục lòng người và phát triển kỹ năng giao tiếp thành công nhất mọi thời đại.',
                'cover_image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 95000,
                'borrow_copies' => 6,
                'stock' => 30,
            ],
            [
                'category_id' => $catSkill->id,
                'title' => 'Tuổi Trẻ Đáng Giá Bao Nhiêu?',
                'author' => 'Rosie Nguyễn',
                'isbn' => '9786045638823',
                'publisher' => 'NXB Hội Nhà Văn',
                'publish_year' => 2018,
                'description' => 'Cuốn sách khơi dậy cảm hứng tự học, khám phá bản thân và sống trọn vẹn từng khoảnh khắc tuổi trẻ.',
                'cover_image' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 88000,
                'borrow_copies' => 4,
                'stock' => 20,
            ],
            [
                'category_id' => $catEcon->id,
                'title' => 'Cha Giàu Cha Nghèo (Rich Dad Poor Dad)',
                'author' => 'Robert T. Kiyosaki',
                'isbn' => '9786045648831',
                'publisher' => 'NXB Trẻ',
                'publish_year' => 2020,
                'description' => 'Bài học tư duy quản lý tài chính cá nhân và bí quyết để tiền bạc tự làm việc cho bạn.',
                'cover_image' => 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 125000,
                'borrow_copies' => 5,
                'stock' => 22,
            ],
            [
                'category_id' => $catEcon->id,
                'title' => 'Khởi Nghiệp Tinh Gọn (The Lean Startup)',
                'author' => 'Eric Ries',
                'isbn' => '9786045622114',
                'publisher' => 'NXB Thế Giới',
                'publish_year' => 2019,
                'description' => 'Phương pháp luận đột phá giúp xây dựng sản phẩm và doanh nghiệp thành công nhanh chóng.',
                'cover_image' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 145000,
                'borrow_copies' => 3,
                'stock' => 15,
            ],
            [
                'category_id' => $catHistory->id,
                'title' => 'Sapiens: Lược Sử Loài Người',
                'author' => 'Yuval Noah Harari',
                'isbn' => '9786045641123',
                'publisher' => 'NXB Tri Thức',
                'publish_year' => 2017,
                'description' => 'Góc nhìn sâu sắc về lịch sử tiến hóa của loài Homo Sapiens từ thời đồ đá đến kỷ nguyên trí tuệ nhân tạo.',
                'cover_image' => 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 195000,
                'borrow_copies' => 4,
                'stock' => 16,
            ],
            [
                'category_id' => $catHistory->id,
                'title' => 'Súng, Vi Trùng Và Thép',
                'author' => 'Jared Diamond',
                'isbn' => '9786045688912',
                'publisher' => 'NXB Thế Giới',
                'publish_year' => 2019,
                'description' => 'Giải mã nguồn gốc sự chênh lệch phát triển giữa các nền văn minh trong lịch sử loài người.',
                'cover_image' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
                'sale_price' => 210000,
                'borrow_copies' => 3,
                'stock' => 10,
            ],
        ];

        $createdBooks = [];
        foreach ($booksData as $bData) {
            $book = Book::create([
                'category_id' => $bData['category_id'],
                'title' => $bData['title'],
                'author' => $bData['author'],
                'isbn' => $bData['isbn'],
                'publisher' => $bData['publisher'],
                'publish_year' => $bData['publish_year'],
                'description' => $bData['description'],
                'cover_image' => $bData['cover_image'],
                'sale_price' => $bData['sale_price'],
                'is_borrowable' => true,
                'is_salable' => true,
            ]);

            $createdBooks[] = $book;

            // Create Borrow Copies
            for ($i = 1; $i <= $bData['borrow_copies']; $i++) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'barcode' => 'BC-' . $book->id . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'condition' => 'good',
                    'status' => 'available',
                ]);
            }

            // Create Inventory
            BookInventory::create([
                'book_id' => $book->id,
                'stock_quantity' => $bData['stock'],
                'reserved_quantity' => 0,
            ]);
        }

        // 5. Sample Borrow Tickets (Đang mượn, Quá hạn & Chờ duyệt)
        // Ticket 1: Borrowed Active
        $copy1 = BookCopy::where('status', 'available')->first();
        if ($copy1) {
            $copy1->update(['status' => 'borrowed']);

            $ticket1 = BorrowTicket::create([
                'reader_id' => $reader1->id,
                'librarian_id' => $librarian->id,
                'status' => 'borrowed',
                'borrow_date' => now()->subDays(5)->toDateString(),
                'due_date' => now()->addDays(9)->toDateString(),
                'renewed_count' => 0,
                'total_late_fee' => 0,
                'notes' => 'Đã duyệt tại quầy dịch vụ',
            ]);

            BorrowItem::create([
                'borrow_ticket_id' => $ticket1->id,
                'book_copy_id' => $copy1->id,
                'due_date' => now()->addDays(9)->toDateString(),
                'status' => 'borrowed',
            ]);
        }

        // Ticket 2: Overdue with Fine
        $copy2 = BookCopy::where('status', 'available')->skip(1)->first();
        if ($copy2) {
            $copy2->update(['status' => 'borrowed']);

            $ticket2 = BorrowTicket::create([
                'reader_id' => $reader2->id,
                'librarian_id' => $librarian->id,
                'status' => 'overdue',
                'borrow_date' => now()->subDays(18)->toDateString(),
                'due_date' => now()->subDays(4)->toDateString(),
                'renewed_count' => 0,
                'total_late_fee' => 20000,
                'notes' => 'Quá hạn 4 ngày (Phí phạt 20,000 đ)',
            ]);

            BorrowItem::create([
                'borrow_ticket_id' => $ticket2->id,
                'book_copy_id' => $copy2->id,
                'due_date' => now()->subDays(4)->toDateString(),
                'status' => 'borrowed',
            ]);
        }

        // 6. Sample Orders & Deliveries
        $bookOrder1 = $createdBooks[0];
        if ($bookOrder1) {
            $order1 = Order::create([
                'reader_id' => $reader1->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'total_amount' => $bookOrder1->sale_price + 30000,
                'shipping_fee' => 30000,
                'payment_status' => 'paid',
                'order_status' => 'shipping',
                'shipping_address' => '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
                'recipient_name' => 'Trần Thị Độc Giả',
                'recipient_phone' => '0987654321',
                'notes' => 'Giao vào giờ hành chính',
            ]);

            OrderItem::create([
                'order_id' => $order1->id,
                'book_id' => $bookOrder1->id,
                'quantity' => 1,
                'unit_price' => $bookOrder1->sale_price,
                'subtotal' => $bookOrder1->sale_price,
            ]);

            $delivery1 = Delivery::create([
                'order_id' => $order1->id,
                'tracking_number' => 'VNPOST-' . rand(10000000, 99999999),
                'carrier' => 'VNPost Express',
                'status' => 'shipping',
                'shipped_at' => now()->subHours(12),
            ]);

            DeliveryHistory::create([
                'delivery_id' => $delivery1->id,
                'status' => 'picking',
                'note' => 'Đã tiếp nhận đơn hàng từ người gửi',
                'location' => 'Kho Bưu điện TP.HCM',
            ]);

            DeliveryHistory::create([
                'delivery_id' => $delivery1->id,
                'status' => 'shipping',
                'note' => 'Đang trên đường vận chuyển đến người nhận',
                'location' => 'Bưu cục Quận 1',
            ]);
        }

        // 7. Sample Book Reviews & Ratings
        BookReview::create([
            'book_id' => $createdBooks[0]->id,
            'reader_id' => $reader1->id,
            'rating' => 5,
            'comment' => 'Sách cực kỳ chất lượng, giải thích rất chi tiết về mã sạch!',
        ]);

        BookReview::create([
            'book_id' => $createdBooks[0]->id,
            'reader_id' => $reader2->id,
            'rating' => 5,
            'comment' => 'Cuốn sách gối đầu giường không thể thiếu cho dân dev!',
        ]);

        BookReview::create([
            'book_id' => $createdBooks[3]->id,
            'reader_id' => $reader1->id,
            'rating' => 5,
            'comment' => 'Tác phẩm thiếu nhi tuyệt vời, đọc lại vẫn rất giàu cảm xúc!',
        ]);

        BookReview::create([
            'book_id' => $createdBooks[6]->id,
            'reader_id' => $reader3->id,
            'rating' => 5,
            'comment' => 'Bài học ứng xử và giao tiếp rất thiết thực trong cuộc sống.',
        ]);

        // 8. Sample Wishlists
        Wishlist::create(['reader_id' => $reader1->id, 'book_id' => $createdBooks[1]->id]);
        Wishlist::create(['reader_id' => $reader1->id, 'book_id' => $createdBooks[4]->id]);
        Wishlist::create(['reader_id' => $reader2->id, 'book_id' => $createdBooks[0]->id]);

        // 9. Sample Notification Email Logs
        EmailLog::create([
            'reader_id' => $reader1->id,
            'type' => 'due_soon',
            'subject' => '[THƯ VIỆN ONLINE] Nhắc nhở hạn trả sách mượn trước 2 ngày',
            'content' => "Kính gửi độc giả Trần Thị Độc Giả,\n\nBạn có 1 phiếu mượn sách sắp đến hạn trả vào ngày " . now()->addDays(9)->format('d/m/Y') . ".\nVui lòng tự gia hạn online 01 lần (+7 ngày) hoặc trả sách tại quầy trước hạn để tránh phát sinh phí phạt.",
        ]);

        EmailLog::create([
            'reader_id' => $reader2->id,
            'type' => 'overdue',
            'subject' => '[CẢNH BÁO QUÁ HẠN] Nhắc nợ phí phạt trễ hạn mượn sách',
            'content' => "Kính gửi độc giả Lê Minh Tuấn,\n\nPhiếu mượn #" . ($ticket2->id ?? '2') . " của bạn đã quá hạn 4 ngày.\nTổng phí phạt phát sinh hiện tại: 20,000 VND.\nVui lòng thanh toán trực tuyến qua MoMo hoặc đến quầy hoàn trả sách.",
        ]);
    }
}
