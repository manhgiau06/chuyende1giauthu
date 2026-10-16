import "./globals.css";

export const metadata = {
  title: "Thư Viện Tri Thức Số - Next.js & Node.js Backend",
  description: "Hệ thống Quản lý Thư viện Số sử dụng React + Node.js Next.js App Router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
