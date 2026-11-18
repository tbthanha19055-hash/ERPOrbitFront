import './globals.css';

export const metadata = {
  title: 'Orbit OMS — Quản lý đơn hàng',
  description: 'Dashboard quản lý đơn hàng và báo cáo doanh thu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
