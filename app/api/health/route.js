import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await getFirestoreDb().collection('orders').limit(1).get();
    return NextResponse.json({ ok: true, database: 'firebase-firestore' });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
