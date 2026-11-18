import { NextResponse } from 'next/server';
import { addDocument, createCatalogId, listCollection, validateCustomer } from '../../../lib/catalog-store';

export const runtime = 'nodejs';

export async function GET() {
  try { return NextResponse.json({ data: await listCollection('customers') }); } catch (error) { return NextResponse.json({ message: 'Không thể tải khách hàng.', detail: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const validated = validateCustomer(await request.json());
    if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });
    const data = await addDocument('customers', createCatalogId('CUS', validated.value.clientCode), validated.value);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Không thể tạo khách hàng.', detail: error.message }, { status: 500 }); }
}
