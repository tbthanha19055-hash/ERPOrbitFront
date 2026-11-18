import { NextResponse } from 'next/server';
import { dateKeyInVietnam, listOrders } from '../../../../lib/order-store';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('days') || 7), 1), 31);
    const orders = (await listOrders()).filter((order) => order.status === 'delivered');
    const output = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(Date.now() - (offset * 24 * 60 * 60 * 1000));
      const key = dateKeyInVietnam(date);
      const sameDay = orders.filter((order) => dateKeyInVietnam(order.createdAt) === key);
      output.push({
        date: key,
        label: new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short' }).format(date).replace('.', ''),
        orders: sameDay.length,
        revenue: sameDay.reduce((sum, order) => sum + order.totalAmount, 0),
      });
    }

    return NextResponse.json({ data: output });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể tải báo cáo doanh thu.', detail: error.message }, { status: 500 });
  }
}
