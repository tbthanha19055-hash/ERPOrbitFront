'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(value || 0)) + ' đ';
}

export function formatShortDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function formatLongDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function normalizeOrderStatus(status) {
  const value = String(status || '').trim().toLowerCase();

  if (['new', 'mới', 'moi', 'pending', 'created'].includes(value)) return 'NEW';
  if (['delivered', 'đã giao', 'da giao', 'completed', 'complete'].includes(value)) return 'DELIVERED';
  if (['cancelled', 'canceled', 'hủy', 'huy', 'cancel'].includes(value)) return 'CANCELLED';

  return String(status || '').trim().toUpperCase();
}

export function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, refresh: <><path d="M20 11a8 8 0 0 0-14.7-4L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14.7 4L20 15" /><path d="M20 20v-5h-5" /></>, box: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></>, package: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>, users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.2a5.9 5.9 0 0 1 3 5" /></>, chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-5 3 2 5-7" /></>, calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>, pencil: <><path d="m4 16-.7 4.7L8 20l11.5-11.5a2.1 2.1 0 0 0-3-3L5 17" /><path d="m14.5 7.5 2 2" /></>, x: <><path d="m6 6 12 12M18 6 6 18" /></>, check: <path d="m5 12 4 4L19 6" />, chevron: <path d="m6 9 6 6 6-6" />, zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />, card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>, back: <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function StatusBadge({ status }) {
  const normalizedStatus = normalizeOrderStatus(status);
  const meta = { NEW: ['Mới', 'status-new'], DELIVERED: ['Đã giao', 'status-delivered'], CANCELLED: ['Hủy', 'status-cancelled'] }[normalizedStatus] || ['Mới', 'status-new'];
  return <span className={`status-badge ${meta[1]}`}><span className="status-dot" />{meta[0]}</span>;
}

export function StatCard({ icon, label, value, helper, accent }) {
  return <div className="stat-card"><div className={`stat-icon ${accent}`}><Icon name={icon} size={19} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div><span className="stat-spark" aria-hidden="true"><i /><i /><i /><i /><i /></span></div>;
}
