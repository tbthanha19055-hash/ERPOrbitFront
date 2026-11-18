import { NextResponse } from 'next/server';
import { getOrder, nowTimestamp, saveOrder, validateOrder } from '../../../../lib/order-store';

export const runtime = 'nodejs';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể tải chi tiết đơn hàng.', detail: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const existing = await getOrder(id);
    if (!existing) return NextResponse.json({ message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    if (existing.status !== 'NEW') return NextResponse.json({ message: 'Đơn đã giao hoặc đã hủy không thể chỉnh sửa.' }, { status: 409 });

    const validated = validateOrder(await request.json());
    if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });
    const order = await saveOrder(id, { ...validated.value, updatedAt: nowTimestamp() });
    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể cập nhật đơn hàng.', detail: error.message }, { status: 500 });
  }
}
