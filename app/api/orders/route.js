import { NextResponse } from 'next/server';
import { createOrderId, listOrders, nowTimestamp, saveOrder, validateOrder } from '../../../lib/order-store';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ data: await listOrders() });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể tải danh sách đơn hàng.', detail: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const validated = validateOrder(await request.json());
    if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });

    const id = createOrderId();
    const data = { ...validated.value, status: 'NEW', createdAt: nowTimestamp(), updatedAt: nowTimestamp() };
    const order = await saveOrder(id, data);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Không thể tạo đơn hàng.', detail: error.message }, { status: 500 });
  }
}
