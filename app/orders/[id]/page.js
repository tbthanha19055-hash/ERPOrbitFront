'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from '../../../components/AppShell';
import { API_URL, formatLongDate, formatMoney, Icon, normalizeOrderStatus, StatusBadge } from '../../../components/ui';
import OrderModal from '../_components/OrderModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  async function loadOrder() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Không thể tải đơn hàng.');
      setOrder(payload.data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  async function updateStatus(status) {
    if (status === 'CANCELLED' && !window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Không thể cập nhật trạng thái.');
      setOrder(payload.data);
    } catch (statusError) {
      setError(statusError.message);
    }
  }

  if (loading) {
    return <AppShell><div className="page-content"><div className="detail-loading">Đang tải chi tiết đơn hàng...</div></div></AppShell>;
  }

  if (!order) {
    return <AppShell><div className="page-content"><div className="error-panel"><h2>Không tìm thấy đơn hàng</h2><p>{error || 'Đơn hàng có thể đã bị xóa hoặc mã đơn không đúng.'}</p><Link className="button button-primary" href="/orders"><Icon name="back" size={16} /> Về quản lý đơn</Link></div></div></AppShell>;
  }

  const orderLabel = order.code || order.id;
  const orderStatus = normalizeOrderStatus(order.status);

  return (
    <AppShell>
      <div className="page-content">
        <div className="detail-back"><Link href="/orders"><Icon name="back" size={15} /> Quản lý đơn hàng</Link><span>/</span><strong>{orderLabel}</strong></div>

        <div className="page-heading detail-heading">
          <div>
            <span className="eyebrow">CHI TIẾT ĐƠN HÀNG</span>
            <h1>{orderLabel}</h1>
            <p>Tạo lúc {formatLongDate(order.createdAt)}</p>
          </div>

          {orderStatus === 'NEW' && (
            <div className="detail-actions">
              <button className="button button-ghost" onClick={() => setEditing(true)}><Icon name="pencil" size={15} /> Chỉnh sửa</button>
              <button className="button button-primary" onClick={() => updateStatus('DELIVERED')}><Icon name="check" size={15} /> Đã giao</button>
              <button className="button button-danger" onClick={() => updateStatus('CANCELLED')}><Icon name="x" size={15} /> Hủy đơn</button>
            </div>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="detail-layout">
          <section className="panel detail-main">
            <div className="detail-card-head"><div><h2>Thông tin đơn hàng</h2><p>Thông tin mặt hàng và người nhận</p></div><StatusBadge status={orderStatus} /></div>
            <div className="detail-fields"><div><span>Khách hàng</span><strong>{order.customer}</strong></div><div><span>Mặt hàng</span><strong>{order.item}</strong></div><div><span>Số lượng</span><strong>{order.quantity}</strong></div><div><span>Đơn giá</span><strong>{formatMoney(order.unitPrice)}</strong></div></div>
            <div className="detail-total"><span>Thành tiền</span><strong>{formatMoney(order.totalAmount)}</strong><small>Được tính tự động bởi server</small></div>
          </section>

          <aside className="panel detail-side">
            <h2>Vòng đời đơn hàng</h2>
            <div className="timeline"><div className="timeline-item complete"><i><Icon name="check" size={13} /></i><div><strong>Đơn hàng được tạo</strong><span>{formatLongDate(order.createdAt)}</span></div></div><div className={`timeline-item ${orderStatus !== 'NEW' ? 'complete' : 'current'}`}><i>{orderStatus !== 'NEW' ? <Icon name="check" size={13} /> : <span />}</i><div><strong>{orderStatus === 'CANCELLED' ? 'Đơn hàng đã hủy' : 'Xử lý giao hàng'}</strong><span>{orderStatus === 'NEW' ? 'Đang chờ xử lý' : 'Đã cập nhật trạng thái'}</span></div></div></div>
          </aside>
        </div>
      </div>

      {editing && <OrderModal order={order} onClose={() => setEditing(false)} onSaved={(saved) => { setOrder(saved); setEditing(false); }} />}
    </AppShell>
  );
}
