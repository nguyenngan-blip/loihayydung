# Lời Hay Ý Đúng

**Nói lời hay – Chọn ý đúng – Kết nối yêu thương!**

Nền tảng học liệu số rèn kỹ năng giao tiếp cho học sinh lớp 4, dành cho giáo viên và sinh viên Giáo dục tiểu học. Gồm **Kho học liệu**, **7 chủ đề giao tiếp**, **Góc thực hành** (tình huống, đóng vai, tự đánh giá), **Cộng đồng chia sẻ**, khu vực cá nhân và **trang quản trị kiểm duyệt**. Cài được lên điện thoại như ứng dụng (PWA).

Công nghệ: HTML/CSS/JavaScript thuần (không cần build) + Supabase (Auth, Postgres + RLS, Storage).

## Chạy thử ngay (chế độ demo)
Chưa cấu hình Supabase, site vẫn chạy với dữ liệu mẫu (xem học liệu, 7 chủ đề, Góc thực hành, yêu thích lưu trong trình duyệt). Đăng nhập, đăng tải, kiểm duyệt cần Supabase.

```bash
python3 -m http.server 8080   # rồi mở http://localhost:8080
```
(PWA/service worker cần `localhost` hoặc HTTPS.)

## Kết nối Supabase
1. Tạo dự án tại supabase.com.
2. SQL Editor → dán và chạy toàn bộ `supabase/schema.sql` (bảng, RLS, trigger, hàm kiểm duyệt, bucket riêng tư `resources`).
3. Authentication → URL Configuration: thêm địa chỉ site (vd. `https://<user>.github.io/<repo>/`) vào Site URL và Redirect URLs.
4. Điền `SUPABASE_URL` và `SUPABASE_ANON_KEY` vào `js/config.js`. Chỉ dùng khóa **anon**; **không** đưa `service_role` vào mã nguồn.
5. Đăng ký một tài khoản trên site, rồi cấp quyền admin trong SQL Editor:
   ```sql
   update public.profiles set role='admin' where email='email-cua-ban@example.com';
   ```

## Đưa lên GitHub và triển khai
```bash
git init && git add . && git commit -m "Lời Hay Ý Đúng"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
Settings → Pages → Source: **GitHub Actions**. Workflow `.github/workflows/pages.yml` sẽ tự triển khai (GitHub Pages có HTTPS, đủ điều kiện cài PWA).

## Cấu trúc
```
index.html            Khung trang
css/style.css         Giao diện (bảng màu theo thiết kế)
js/config.js          Cấu hình Supabase
js/data.js            7 chủ đề, danh mục, tình huống, dữ liệu demo
js/app.js             Router, các trang, xác thực, đăng tải, kiểm duyệt
manifest.webmanifest  Web App Manifest
sw.js                 Service Worker (cache, ngoại tuyến, cập nhật)
icons/                Biểu tượng PWA
supabase/schema.sql   Cơ sở dữ liệu, RLS, Storage policies
```

## Bảo mật (đã cài ở phía máy chủ)
- RLS cho mọi bảng; khách chỉ thấy học liệu `approved`.
- Người dùng không tự đổi `role`, trạng thái kiểm duyệt, lượt xem/tải (trigger).
- Chỉ admin duyệt/từ chối/ẩn qua hàm `review_resource` (kiểm tra quyền trong DB, ghi lịch sử và gửi thông báo).
- Sửa nội dung quan trọng của bài đã duyệt → tự về `pending` và lưu phiên bản cũ.
- Bucket tệp riêng tư; tệp chưa duyệt chỉ tác giả và admin truy cập; tải qua signed URL.

## Ngoại tuyến
Service Worker lưu giao diện và nội dung đã mở; đăng nhập, đăng tải, đồng bộ yêu thích cần Internet. PWA không phải APK/IPA: muốn lên Google Play/App Store cần đóng gói riêng.

## Lộ trình mở rộng
Thêm nhiều trò chơi tương tác, quản lý danh mục trong giao diện admin, hồ sơ người đóng góp, theo dõi tiến độ học sinh, huy hiệu, tích hợp Google Forms.
