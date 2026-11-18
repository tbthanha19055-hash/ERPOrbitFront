'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import { API_URL, formatMoney, formatShortDate, Icon, StatCard } from '../../components/ui';

const emptyProduct = { sku: '', name: '', description: '', price: '', stockQuantity: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadProducts() {
    setLoading(true); setError('');
    try { const response = await fetch(`${API_URL}/products`, { cache: 'no-store' }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'Không thể tải sản phẩm.'); setProducts(payload.data || []); } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  const visibleProducts = useMemo(() => products.filter((product) => { const term = query.trim().toLowerCase(); return !term || product.sku.toLowerCase().includes(term) || product.name.toLowerCase().includes(term); }), [products, query]);

  async function createProduct(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try { const response = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || 'Không thể tạo sản phẩm.'); setProducts((current) => [payload.data, ...current]); setForm(emptyProduct); setSuccess('Đã thêm sản phẩm mới.'); } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  return <AppShell><div className="page-content"><div className="page-heading"><div><span className="eyebrow">DANH MỤC</span><h1>Sản phẩm</h1><p>Quản lý danh mục sản phẩm và số lượng tồn kho.</p></div><button className="button button-primary" onClick={() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' })}><Icon name="plus" size={17} /> Thêm sản phẩm</button></div>{error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}><Icon name="x" size={15} /></button></div>}{success && <div className="success-banner">{success}</div>}<div className="stats-grid"><StatCard icon="package" label="Tổng sản phẩm" value={products.length} helper="Trong danh mục hiện tại" accent="blue" /><StatCard icon="check" label="Đang kinh doanh" value={products.filter((product) => product.status === 'active').length} helper="Trạng thái active" accent="green" /><StatCard icon="box" label="Sắp hết hàng" value={products.filter((product) => Number(product.stockQuantity) <= 5).length} helper="Tồn kho từ 5 trở xuống" accent="orange" /><StatCard icon="chart" label="Giá trị tồn kho" value={formatMoney(products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stockQuantity || 0), 0))} helper="Giá × tồn kho" accent="violet" /></div><div className="catalog-grid"><section className="panel page-panel"><div className="panel-heading"><div><h2>Danh sách sản phẩm</h2><p>SKU là mã định danh duy nhất của sản phẩm.</p></div><button className="icon-button" onClick={loadProducts} aria-label="Tải lại"><Icon name="refresh" size={17} /></button></div><div className="toolbar"><div className="search-box"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo SKU hoặc tên sản phẩm..." /></div></div><div className="table-wrap"><table><thead><tr><th>SKU / SẢN PHẨM</th><th>MÔ TẢ</th><th>ĐƠN GIÁ</th><th>TỒN KHO</th><th>TRẠNG THÁI</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="empty-state">Đang tải sản phẩm...</td></tr> : visibleProducts.length === 0 ? <tr><td colSpan="5" className="empty-state">Chưa có sản phẩm phù hợp.</td></tr> : visibleProducts.map((product) => <tr key={product.id}><td><strong className="order-id">{product.sku}</strong><span className="cell-sub">{product.name}</span></td><td><span className="item-name">{product.description || 'Chưa có mô tả'}</span></td><td><strong>{formatMoney(product.price)}</strong><span className="cell-sub">{product.currency || 'VND'}</span></td><td><strong className={Number(product.stockQuantity) <= 5 ? 'stock-low' : ''}>{product.stockQuantity}</strong><span className="cell-sub">sản phẩm</span></td><td><span className={`status-badge ${product.status === 'active' ? 'status-delivered' : 'status-cancelled'}`}><span className="status-dot" />{product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}</span></td></tr>)}</tbody></table></div></section><section className="panel product-form-panel" id="product-form"><div className="panel-heading"><div><h2>Thêm sản phẩm</h2><p>Thông tin mẫu theo cấu trúc Firestore.</p></div></div><form className="catalog-form" onSubmit={createProduct}><label className="field"><span>SKU</span><input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SP001" /></label><label className="field"><span>Tên sản phẩm</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Laptop Dell" /></label><label className="field"><span>Mô tả</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Laptop văn phòng" rows="3" /></label><div className="catalog-form-row"><label className="field"><span>Giá (VNĐ)</span><input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="15000000" /></label><label className="field"><span>Tồn kho</span><input type="number" min="0" step="1" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} /></label></div><button className="button button-primary form-submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu sản phẩm'} <Icon name="arrow" size={16} /></button></form></section></div></div></AppShell>;
}
