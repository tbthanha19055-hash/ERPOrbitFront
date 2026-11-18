'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import { API_URL, formatMoney, formatShortDate, Icon, normalizeOrderStatus, StatCard, StatusBadge } from '../../components/ui';
import OrderModal from './_components/OrderModal';

function getOrderId(order) {
  return order.id || order.code;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [modalOrder, setModalOrder] = useState(undefined);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/orders`, { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Không thể tải đơn hàng.');
      }

      setOrders(payload.data || []);
      setSelectedOrderIds([]);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();

    return orders.filter((order) => {
      const searchableText = `${order.customer || ''} ${order.item || ''} ${getOrderId(order) || ''}`.toLowerCase();

      return (
        (filter === 'ALL' || normalizeOrderStatus(order.status) === filter) &&
        (!term || searchableText.includes(term))
      );
    });
  }, [orders, filter, query]);

  const deliveredOrders = orders.filter((order) => normalizeOrderStatus(order.status) === 'DELIVERED');
  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0,
  );
  const today = orders.filter(
    (order) => new Date(order.createdAt).toDateString() === new Date().toDateString(),
  ).length;
  const selectableOrders = filteredOrders.filter((order) => normalizeOrderStatus(order.status) === 'NEW');
  const allSelectableSelected = selectableOrders.length > 0 && selectableOrders.every((order) => selectedOrderIds.includes(getOrderId(order)));

  async function updateStatus(order, status) {
    const orderId = getOrderId(order);

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Không thể cập nhật trạng thái.');
      }

      setOrders((current) => current.map((item) => getOrderId(item) === orderId ? payload.data : item));
    } catch (statusError) {
      setError(statusError.message);
    }
  }

  function toggleOrderSelection(orderId) {
    setSelectedOrderIds((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  }

  function toggleAllSelectableOrders() {
    setSelectedOrderIds((current) => {
      const selectableIds = selectableOrders.map(getOrderId);

      if (allSelectableSelected) {
        return current.filter((id) => !selectableIds.includes(id));
      }

      return Array.from(new Set([...current, ...selectableIds]));
    });
  }

  async function bulkUpdateStatus(status) {
    const ids = selectedOrderIds.filter((id) => orders.some((order) => getOrderId(order) === id && normalizeOrderStatus(order.status) === 'NEW'));
    if (ids.length === 0) return;

    if (status === 'CANCELLED' && !window.confirm(`Bạn có chắc muốn hủy ${ids.length} đơn hàng đã chọn?`)) return;

    setBulkUpdating(true);
    setError('');

    try {
      const results = await Promise.all(ids.map(async (id) => {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        const payload = await response.json();
        return { id, ok: response.ok, data: payload.data, message: payload.message };
      }));
      const failed = results.filter((result) => !result.ok);

      setOrders((current) => results.reduce((nextOrders, result) => {
        if (!result.ok) return nextOrders;
        return nextOrders.map((order) => getOrderId(order) === result.id ? result.data : order);
      }, current));
      setSelectedOrderIds([]);

      if (failed.length > 0) {
        setError(`${failed.length} đơn không thể cập nhật. ${failed[0].message || ''}`.trim());
      }
    } catch (bulkError) {
      setError(bulkError.message || 'Không thể cập nhật các đơn đã chọn.');
    } finally {
      setBulkUpdating(false);
    }
  }

  function handleSavedOrder(savedOrder) {
    const savedId = getOrderId(savedOrder);

    setOrders((current) => current.some((item) => getOrderId(item) === savedId)
      ? current.map((item) => getOrderId(item) === savedId ? savedOrder : item)
      : [savedOrder, ...current]);
  }

  return (
    <AppShell>
      <div className="page-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">VẬN HÀNH</span>
            <h1>Quản lý đơn hàng <span>✦</span></h1>
            <p>Tạo, theo dõi và xử lý toàn bộ đơn hàng của bạn.</p>
          </div>
          <button className="button button-primary" onClick={() => setModalOrder(null)}>
            <Icon name="plus" size={17} /> Tạo đơn hàng
          </button>
        </div>

        {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')}><Icon name="x" size={15} /></button></div>}

        <div className="stats-grid">
          <StatCard icon="box" label="Tổng đơn hàng" value={orders.length} helper={`${orders.filter((order) => normalizeOrderStatus(order.status) === 'NEW').length} đơn đang chờ xử lý`} accent="blue" />
          <StatCard icon="chart" label="Doanh thu đã giao" value={formatMoney(revenue)} helper={`${deliveredOrders.length} đơn hoàn tất`} accent="orange" />
          <StatCard icon="calendar" label="Đơn mới hôm nay" value={today} helper="Theo ngày tạo đơn" accent="violet" />
          <StatCard icon="card" label="Đơn đã hủy" value={orders.filter((order) => normalizeOrderStatus(order.status) === 'CANCELLED').length} helper="Theo toàn thời gian" accent="rose" />
        </div>

        <section className="panel orders-panel page-panel">
          <div className="panel-heading">
            <div>
              <h2>Tất cả đơn hàng</h2>
              <p>Chỉ đơn Mới mới có thể chọn để đổi trạng thái</p>
            </div>
            <div className="panel-heading-actions">
              {selectedOrderIds.length > 0 && <div className="bulk-actions"><span className="bulk-count">{selectedOrderIds.length} đã chọn</span><button className="bulk-button bulk-delivered" disabled={bulkUpdating} onClick={() => bulkUpdateStatus('DELIVERED')}><Icon name="check" size={14} /> Đã giao</button><button className="bulk-button bulk-cancel" disabled={bulkUpdating} onClick={() => bulkUpdateStatus('CANCELLED')}><Icon name="x" size={14} /> Hủy</button></div>}
              <button className="icon-button" onClick={loadOrders} aria-label="Tải lại"><Icon name="refresh" size={17} /></button>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-box"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã, tên, sản phẩm..." /></div>
            <select value={filter} onChange={(event) => { setFilter(event.target.value); setSelectedOrderIds([]); }}><option value="ALL">Tất cả trạng thái</option><option value="NEW">Mới</option><option value="DELIVERED">Đã giao</option><option value="CANCELLED">Hủy</option></select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="order-checkbox" checked={allSelectableSelected} onChange={toggleAllSelectableOrders} disabled={selectableOrders.length === 0} aria-label="Chọn các đơn mới" /></th>
                  <th>MÃ ĐƠN / NGÀY TẠO</th><th>KHÁCH HÀNG</th><th>MẶT HÀNG</th><th>THÀNH TIỀN</th><th>TRẠNG THÁI</th><th />
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="7" className="empty-state">Đang tải dữ liệu...</td></tr> : filteredOrders.length === 0 ? <tr><td colSpan="7" className="empty-state">Chưa có đơn hàng phù hợp.</td></tr> : filteredOrders.map((order) => {
                  const orderId = getOrderId(order);
                  return <tr key={orderId}>
                    <td className="checkbox-cell"><input type="checkbox" className="order-checkbox" checked={selectedOrderIds.includes(orderId)} onChange={() => toggleOrderSelection(orderId)} disabled={normalizeOrderStatus(order.status) !== 'NEW'} aria-label={`Chọn đơn ${orderId}`} /></td>
                    <td><Link className="order-link" href={`/orders/${orderId}`}>{order.code || order.id}</Link><span className="cell-sub">{formatShortDate(order.createdAt)}</span></td>
                    <td><strong>{order.customer}</strong><span className="cell-sub">{order.quantity} sản phẩm</span></td>
                    <td><span className="item-name">{order.item}</span></td>
                    <td><strong>{formatMoney(order.totalAmount)}</strong></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div className="row-actions">
                        {normalizeOrderStatus(order.status) === 'NEW' && (
                          <>
                            <button className="order-status-button order-status-delivered" onClick={() => updateStatus(order, 'delivered')}>
                              <Icon name="check" size={13} /> Đã giao
                            </button>
                            <button className="order-status-button order-status-cancel" onClick={() => updateStatus(order, 'cancelled')}>
                              <Icon name="x" size={13} /> Hủy
                            </button>
                            <button title="Chỉnh sửa" className="quick-action edit-action" onClick={() => setModalOrder(order)}>
                              <Icon name="pencil" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer"><span>Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng</span><span>Thành tiền được server tự tính</span></div>
        </section>
      </div>

      {modalOrder !== undefined && <OrderModal order={modalOrder} onClose={() => setModalOrder(undefined)} onSaved={handleSavedOrder} />}
    </AppShell>
  );
}
