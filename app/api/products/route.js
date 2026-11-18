import { NextResponse } from 'next/server';
import { addDocument, createCatalogId, listCollection, validateProduct } from '../../../lib/catalog-store';

export const runtime = 'nodejs';

export async function GET() {
  try { return NextResponse.json({ data: await listCollection('products') }); } catch (error) { return NextResponse.json({ message: 'Không thể tải sản phẩm.', detail: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const validated = validateProduct(await request.json());
    if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });
    const data = await addDocument('products', createCatalogId('SP', validated.value.sku), validated.value);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return NextResponse.json({ message: 'Không thể tạo sản phẩm.', detail: error.message }, { status: 500 }); }
}
