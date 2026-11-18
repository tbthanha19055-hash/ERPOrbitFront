import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from './firebase-admin';

const collection = () => getFirestoreDb().collection('orders');

function toIso(value) {
  if (!value) return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value._seconds) return new Date(value._seconds * 1000).toISOString();
  return value;
}

export function normalizeOrder(data, id) {
  return {
    id,
    ...data,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    quantity: Number(data.quantity || 0),
    unitPrice: Number(data.unitPrice || 0),
    totalAmount: Number(data.totalAmount || 0),
  };
}

export async function listOrders() {
  const snapshot = await collection().get();
  return snapshot.docs
    .map((doc) => normalizeOrder(doc.data(), doc.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getOrder(id) {
  const document = await collection().doc(id).get();
  return document.exists ? normalizeOrder(document.data(), document.id) : null;
}

export async function saveOrder(id, data) {
  await collection().doc(id).set(data, { merge: true });
  return getOrder(id);
}

export function validateOrder(body) {
  const customer = String(body.customer || '').trim();
  const item = String(body.item || '').trim();
  const quantity = Number(body.quantity);
  const unitPrice = Number(body.unitPrice);

  if (!customer || !item) return { error: 'Khách hàng và mặt hàng là bắt buộc.' };
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) return { error: 'Số lượng phải là số nguyên lớn hơn 0.' };
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return { error: 'Đơn giá phải lớn hơn 0.' };

  return { value: { customer, item, quantity, unitPrice, totalAmount: quantity * unitPrice } };
}

export function createOrderId() {
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('-', '');
  return `ORD-${stamp}-${String(Date.now()).slice(-5)}`;
}

export function nowTimestamp() {
  return FieldValue.serverTimestamp();
}

export function dateKeyInVietnam(value) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const part = (type) => parts.find((entry) => entry.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
