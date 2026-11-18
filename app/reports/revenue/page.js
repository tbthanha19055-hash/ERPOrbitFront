'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '../../../components/AppShell';
import { API_URL, formatMoney, Icon, StatCard } from '../../../components/ui';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function RevenueReportPage() {
  const [report, setReport] = useState([]);
  const [days, setDays] = useState('31');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    fetch(`${API_URL}/reports/daily?days=${days}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Không thể tải báo cáo.');
        setReport(payload.data || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [days]);

  const totalRevenue = useMemo(
    () => report.reduce((sum, day) => sum + Number(day.revenue || 0), 0),
    [report],
  );
  const totalOrders = useMemo(
    () => report.reduce((sum, day) => sum + Number(day.orders || 0), 0),
    [report],
  );
  const average = totalOrders ? totalRevenue / totalOrders : 0;
  const totalPages = Math.max(1, Math.ceil(report.length / pageSize));
  const paginatedReport = report.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstItem = report.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, report.length);

  function changePageSize(event) {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <AppShell>
      <div className="page-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">BÁO CÁO</span>
            <h1>Doanh thu theo ngày</h1>
            <p>Chỉ tính các đơn đã giao, theo ngày tạo đơn.</p>
          </div>
          <button className="button button-ghost" onClick={() => window.print()}>
            <Icon name="download" size={16} /> In báo cáo
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="stats-grid">
          <StatCard icon="chart" label="Tổng doanh thu" value={formatMoney(totalRevenue)} helper={`${days} ngày gần nhất`} accent="orange" />
          <StatCard icon="box" label="Đơn đã giao" value={totalOrders} helper="Được tính vào doanh thu" accent="blue" />
          <StatCard icon="calendar" label="Giá trị trung bình" value={formatMoney(average)} helper="Trên mỗi đơn đã giao" accent="violet" />
          <StatCard icon="check" label="Ngày có doanh thu" value={report.filter((day) => day.revenue > 0).length} helper={`Trong ${days} ngày`} accent="green" />
        </div>

        <section className="panel page-panel report-panel">
          <div className="panel-heading">
            <div>
              <h2>Bảng doanh thu</h2>
              <p>Mỗi dòng tương ứng với một ngày trong khoảng thời gian chọn.</p>
            </div>
            <select className="period-select" value={days} onChange={(event) => setDays(event.target.value)}>
              <option value="7">7 ngày gần nhất</option>
              <option value="14">14 ngày gần nhất</option>
              <option value="31">31 ngày gần nhất</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>NGÀY TẠO ĐƠN</th>
                  <th>THỨ</th>
                  <th>SỐ ĐƠN ĐÃ GIAO</th>
                  <th>TỔNG THÀNH TIỀN</th>
                  <th>CHIẾM TỶ TRỌNG</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="empty-state">Đang tải báo cáo...</td></tr>
                ) : paginatedReport.length === 0 ? (
                  <tr><td colSpan="5" className="empty-state">Chưa có dữ liệu báo cáo.</td></tr>
                ) : (
                  paginatedReport.map((day) => (
                    <tr key={day.date}>
                      <td><strong>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${day.date}T12:00:00`))}</strong></td>
                      <td>{day.label}</td>
                      <td><strong>{day.orders}</strong></td>
                      <td><strong className={day.revenue ? 'revenue-emphasis' : ''}>{formatMoney(day.revenue)}</strong></td>
                      <td><div className="share-cell"><div className="share-track"><span style={{ width: `${totalRevenue ? Math.max((day.revenue / totalRevenue) * 100, day.revenue ? 4 : 0) : 0}%` }} /></div><small>{totalRevenue ? `${((day.revenue / totalRevenue) * 100).toFixed(1)}%` : '0%'}</small></div></td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>TỔNG CỘNG</strong></td>
                  <td><strong>{totalOrders}</strong></td>
                  <td><strong className="revenue-emphasis">{formatMoney(totalRevenue)}</strong></td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="report-pagination">
            <div className="pagination-summary">
              Hiển thị <strong>{firstItem}-{lastItem}</strong> trong <strong>{report.length}</strong> ngày
            </div>
            <div className="pagination-controls">
              <label htmlFor="report-page-size">Số dòng</label>
              <select id="report-page-size" value={pageSize} onChange={changePageSize}>
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              <button className="pagination-button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Trang trước">‹</button>
              <span className="pagination-page">{currentPage} / {totalPages}</span>
              <button className="pagination-button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Trang sau">›</button>
            </div>
          </div>

          <div className="report-footnote"><Icon name="calendar" size={15} /><span>Doanh thu được nhóm theo ngày tạo đơn và chỉ bao gồm trạng thái Đã giao.</span></div>
        </section>
      </div>
    </AppShell>
  );
}
