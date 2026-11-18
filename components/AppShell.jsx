'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './ui';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const active = pathname.startsWith('/products') ? 'products' : pathname.startsWith('/customers') ? 'customers' : pathname.startsWith('/reports') ? 'reports' : 'orders';
  const title = active === 'products' ? 'Sản phẩm' : active === 'customers' ? 'Khách hàng' : active === 'reports' ? 'Báo cáo doanh thu' : 'Quản lý đơn hàng';
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark"><span /><span /><span /></div><div><strong>orbit</strong><small>ORDER MANAGER</small></div></div><div className="workspace-switch"><div className="workspace-avatar">O</div><div><small>Không gian làm việc</small><strong>Orbit Commerce</strong></div><Icon name="chevron" size={15} /></div><nav className="main-nav"><span className="nav-label">VẬN HÀNH</span><Link className={`nav-item ${active === 'orders' ? 'active' : ''}`} href="/orders"><Icon name="box" />Đơn hàng</Link><Link className={`nav-item ${active === 'products' ? 'active' : ''}`} href="/products"><Icon name="package" />Sản phẩm</Link><Link className={`nav-item ${active === 'customers' ? 'active' : ''}`} href="/customers"><Icon name="users" />Khách hàng</Link><span className="nav-label nav-label-space">BÁO CÁO</span><Link className={`nav-item ${active === 'reports' ? 'active' : ''}`} href="/reports/revenue"><Icon name="chart" />Doanh thu</Link></nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Icon name="zap" size={16} /></div><strong>Cần hỗ trợ?</strong><p>Xem hướng dẫn sử dụng Orbit OMS</p><button>Xem hướng dẫn <Icon name="arrow" size={13} /></button></div><div className="user-profile"><div className="profile-avatar">MA</div><div><strong>Minh Anh</strong><small>Quản trị viên</small></div><span className="more">•••</span></div></div></aside><section className="content"><header className="topbar"><div className="breadcrumbs"><span>Không gian làm việc</span><b>/</b><strong>{title}</strong></div><div className="top-actions"><span className="live-dot"><i /> Hệ thống hoạt động</span><div className="mini-avatar">MA</div></div></header>{children}</section></main>;
}
