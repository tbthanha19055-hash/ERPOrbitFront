import { NextResponse } from 'next/server';
import { getOrder, nowTimestamp, saveOrder } from '../../../../../lib/order-store';

export const runtime = 'nodejs';

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const existing = await getOrder(id);
    if (!existing) return NextResponse.json({ message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    if (existing.status !== 'NEW') return NextResponse.json({ message: 'Đơn đã kết thúc, không thể đổi trạng thái.' }, { status: 409 });

    const { status } = await request.json();
    if (!['delivered', 'cancelled'].includes(status)) return NextResponse.json({ message: 'Trạng thái mới không hợp lệ.' }, { status: 400 });
    const order = await saveOrder(id, { status, updatedAt: nowTimestamp() });
    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể cập nhật trạng thái.', detail: error.message }, { status: 500 });
  }
}
