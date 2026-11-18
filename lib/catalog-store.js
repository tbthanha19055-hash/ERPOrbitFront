import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from './firebase-admin';

function toIso(value) {
  if (!value) return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value._seconds) return new Date(value._seconds * 1000).toISOString();
  return value;
}

function normalize(data, id) {
  return { id, ...data, createdAt: toIso(data.createdAt), updatedAt: toIso(data.updatedAt) };
}

function collection(name) {
  return getFirestoreDb().collection(name);
}

export async function listCollection(name) {
  const snapshot = await collection(name).get();
  return snapshot.docs.map((doc) => normalize(doc.data(), doc.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addDocument(name, id, data) {
  await collection(name).doc(id).set({ ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  const saved = await collection(name).doc(id).get();
  return normalize(saved.data(), saved.id);
}

export function validateProduct(body) {
  const sku = String(body.sku || '').trim();
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const price = Number(body.price);
  const stockQuantity = Number(body.stockQuantity);
  if (!sku || !name) return { error: 'SKU và tên sản phẩm là bắt buộc.' };
  if (!Number.isFinite(price) || price <= 0) return { error: 'Giá sản phẩm phải lớn hơn 0.' };
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) return { error: 'Tồn kho phải là số nguyên không âm.' };
  return { value: { sku, name, description, price, currency: 'VND', status: 'active', stockQuantity } };
}

export function validateCustomer(body) {
  const clientCode = String(body.clientCode || '').trim();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const type = body.type === 'company' ? 'company' : 'individual';
  if (!clientCode || !name) return { error: 'Mã khách hàng và tên là bắt buộc.' };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: 'Email khách hàng không hợp lệ.' };
  return { value: { clientCode, name, email, phone, type, status: 'active' } };
}

export function createCatalogId(prefix, code) {
  return code || `${prefix}-${Date.now()}`;
}
