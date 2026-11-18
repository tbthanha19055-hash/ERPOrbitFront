'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import { API_URL, Icon, StatCard } from '../../components/ui';

const emptyCustomer = { clientCode: '', name: '', email: '', phone: '', type: 'individual' };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadCustomers() {
    setLoading(true); setError('');
    try { const response = await fetch(`${API_URL}/customers`, { cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'Không thể tải khách hàng.'); setCustomers(payload.data || []); } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadCustomers(); }, []);
  const visibleCustomers = useMemo(() => customers.filter((customer) => { const term = query.trim().toLowerCase(); return !term || customer.clientCode.toLowerCase().includes(term) || customer.name.toLowerCase().includes(term) || customer.phone.includes(term); }), [customers, query]);

  async function createCustomer(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try { const response = await fetch(`${API_URL}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'Không thể tạo khách hàng.'); setCustomers((current) => [payload.data, ...current]); setForm(emptyCustomer); setSuccess('Đã thêm khách hàng mới.'); } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  return <AppShell><div className="page-content"><div className="page-heading"><div><span className="eyebrow">DANH BẠ</span><h1>Khách hàng</h1><p>Quản lý thông tin liên hệ và nhóm khách hàng.</p></div><button className="button button-primary" onClick={() => document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' })}><Icon name="plus" size={17} /> Thêm khách hàng</button></div>{error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}><Icon name="x" size={15} /></button></div>}{success && <div className="success-banner">{success}</div>}<div className="stats-grid"><StatCard icon="users" label="Tổng khách hàng" value={customers.length} helper="Trong danh bạ hiện tại" accent="blue" /><StatCard icon="check" label="Đang hoạt động" value={customers.filter((customer) => customer.status === 'active').length} helper="Trạng thái active" accent="green" /><StatCard icon="users" label="Cá nhân" value={customers.filter((customer) => customer.type === 'individual').length} helper="Khách hàng cá nhân" accent="violet" /><StatCard icon="package" label="Doanh nghiệp" value={customers.filter((customer) => customer.type === 'company').length} helper="Khách hàng tổ chức" accent="orange" /></div><div className="catalog-grid"><section className="panel page-panel"><div className="panel-heading"><div><h2>Danh sách khách hàng</h2><p>Mã khách hàng dùng để tra cứu nhanh.</p></div><button className="icon-button" onClick={loadCustomers} aria-label="Tải lại"><Icon name="refresh" size={17} /></button></div><div className="toolbar"><div className="search-box"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã, tên hoặc số điện thoại..." /></div></div><div className="table-wrap"><table><thead><tr><th>MÃ KHÁCH HÀNG</th><th>KHÁCH HÀNG</th><th>LIÊN HỆ</th><th>LOẠI</th><th>TRẠNG THÁI</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="empty-state">Đang tải khách hàng...</td></tr> : visibleCustomers.length === 0 ? <tr><td colSpan="5" className="empty-state">Chưa có khách hàng phù hợp.</td></tr> : visibleCustomers.map((customer) => <tr key={customer.id}><td><strong className="order-id">{customer.clientCode}</strong></td><td><strong>{customer.name}</strong><span className="cell-sub">{customer.phone || 'Chưa có số điện thoại'}</span></td><td><span className="item-name">{customer.email || 'Chưa có email'}</span></td><td><span className="type-chip">{customer.type === 'company' ? 'Doanh nghiệp' : 'Cá nhân'}</span></td><td><span className={`status-badge ${customer.status === 'active' ? 'status-delivered' : 'status-cancelled'}`}><span className="status-dot" />{customer.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td></tr>)}</tbody></table></div></section><section className="panel product-form-panel" id="customer-form"><div className="panel-heading"><div><h2>Thêm khách hàng</h2><p>Thông tin mẫu theo cấu trúc Firestore.</p></div></div><form className="catalog-form" onSubmit={createCustomer}><label className="field"><span>Mã khách hàng</span><input value={form.clientCode} onChange={(event) => setForm({ ...form, clientCode: event.target.value })} placeholder="CUS001" /></label><label className="field"><span>Họ và tên</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nguyen Van B" /></label><label className="field"><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="customer1@example.com" /></label><label className="field"><span>Số điện thoại</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0901234567" /></label><label className="field"><span>Loại khách hàng</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="individual">Cá nhân</option><option value="company">Doanh nghiệp</option></select></label><button className="button button-primary form-submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu khách hàng'} <Icon name="arrow" size={16} /></button></form></section></div></div></AppShell>;
}
