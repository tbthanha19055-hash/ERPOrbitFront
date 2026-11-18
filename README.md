# Orbit OMS

Ứng dụng quản lý đơn hàng bằng Next.js và Firebase Firestore. Next.js Route Handlers đóng vai trò controller/server API, không cần chạy Express riêng.

## Chạy local

```bash
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

- Next.js: http://localhost:3001
- API controller: http://localhost:3001/api

## Cấu hình Firebase Firestore

1. Vào Firebase Console, tạo project và bật Firestore Database.
2. Vào `Project settings` → `Service accounts` → `Generate new private key`.
3. Mở `.env`, điền một trong hai cách cấu hình Firebase Admin:

```env
NEXT_PUBLIC_API_URL=/api

# Cách khuyến nghị khi chạy local: dán service account JSON trên một dòng
FIREBASE_SERVICE_ACCOUNT_JSON={...}

# Hoặc dùng các trường riêng lẻ
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Không thêm tiền tố `NEXT_PUBLIC_` vào credential Firebase. Các biến này chỉ được đọc ở phía server của Next.js.

Collection `orders` sẽ được tạo tự động khi tạo đơn đầu tiên.

## Controller API trong Next.js

- `GET /api/orders` — danh sách đơn hàng
- `POST /api/orders` — tạo đơn, server tự tính `totalAmount`
- `PUT /api/orders/:id` — sửa đơn khi còn trạng thái `NEW`
- `PATCH /api/orders/:id/status` — chuyển `NEW` sang `DELIVERED` hoặc `CANCELLED`
- `GET /api/reports/daily?days=7` — báo cáo số đơn và doanh thu theo ngày của đơn đã giao
- `GET /api/health` — kiểm tra kết nối Firestore
