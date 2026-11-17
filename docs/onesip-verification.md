# Kiểm tra MVP OneSip

Ngày 18/11/2026, Windows, Node 22.17.0. Nhánh `feat/complete-storefront`, baseline `main@57f3fcc`. Kiểm trên production build mới tại `http://127.0.0.1:4173/`.

## Kết quả tự động

| Lệnh | Kết quả |
| --- | --- |
| `npm run lint` | Qua, không lỗi ESLint |
| `npm test` | 8 file, **34 test qua** |
| `npm run build` | Qua, route chia chunk; Learn tải riêng |
| `npm run test:e2e` | **12 test qua**, 36,9 giây; gồm 8 storefront và 4 hồi quy Playground |

Unit/component kiểm cart normalize/merge/giới hạn, phí và tổng tiền; query tiếng Việt; validation; hủy/retry và chống lặp đơn; receipt hỏng; TLV/CRC và giải mã ảnh QR độc lập bằng jsQR ở hai số tiền. Vector CRC `123456789 → 29B1` được kiểm.

Playwright kiểm luồng Home → tìm `tra dao` → giỏ Bình nước ×2 + Trà đào ×1 → checkout → biên nhận **145.000đ**, double submit không tạo hai đơn, reload receipt và lần mua tiếp theo. Checkout chưa có ảnh QR hoặc ô số tiền; sau **Đặt hàng** mới hiện QR, đổi 250000 làm mã thay đổi, nhập 0 ẩn mã, trả lại 145000 tạo mã hợp lệ. Luồng chính chặn request ngoài localhost và không ghi nhận request ngoài hay lỗi JavaScript.

Các kiểm tra khác: form sai focus field đầu, retry lỗi mẫu, rời pending hủy đơn và giữ giỏ; JSON storage hỏng; URL không hợp lệ kể cả khóa `__proto__`; search rỗng/reset; drawer với bàn phím/Escape/focus trả lại; điều hướng từ drawer focus vào heading mới; lazy route có placeholder animation; reduced motion; Learn → shop không nhiễm CSS.

Sáu viewport Home/catalog/detail đã được kiểm tràn ngang: **375×812, 390×844, 768×1024, 1280×720, 1440×900, 1920×1080**. Có ảnh sáng/tối và checkout/payment mobile. Đây là kiểm bằng Chromium, chưa thay thế thử trên điện thoại thật hoặc tất cả browser.

## Đối chiếu phản hồi cuối

- Giữ bản người dùng chọn: header vàng, CTA cam, chữ xanh, hero still life và bố cục hai cột trên desktop. Không bàn giao bản redesign trung gian.
- Ảnh sản phẩm dùng nguyên WebP, không CSS filter/tint/mix-blend màu. Dùng `taste-skill` để soi hình ảnh, đọc chữ và motion; bố cục cuối ưu tiên screenshot do người dùng chọn.
- QR MBBank **0825730557** chỉ hiển thị trên biên nhận sau khi đặt hàng thành công. Sửa số tiền không sửa tổng đơn; có cảnh báo khi lệch. Thanh toán khi nhận hàng không có QR.
- Skeleton cho route, ảnh và tạo QR; không thêm thời gian chờ giả để ép người xem thấy animation.
- React Lab giữ fixture **125.000đ**, phép đo memo **5/0 → 6/1**, live edit, lỗi biên dịch và reset code.

Review mã đã sửa lookup catalog nhận khóa kế thừa, schema receipt/payment hỏng và race focus khi modal đóng. Kiểm hồi quy cho các lỗi này đã qua.

## Ảnh và video

- [Home desktop](images/storefront/home-desktop.png), [Home mobile](images/storefront/home-mobile.png), [dark mode](images/storefront/home-dark.png).
- [Catalog](images/storefront/catalog-desktop.png), [chi tiết](images/storefront/product-desktop.png), [giỏ](images/storefront/cart-desktop.png).
- [Checkout desktop](images/storefront/checkout-desktop.png), [checkout mobile chưa có QR](images/storefront/checkout-mobile.png).
- [Biên nhận và QR](images/storefront/confirmation.png), [QR mobile](images/storefront/payment-mobile.png).
- [Tour storefront MP4](../backup/storefront-tour.mp4), [metadata](../backup/storefront-video-metadata.json). Video không có âm thanh, thể hiện thao tác của MVP hiện tại. Video `demo-5min.mp4` cũ chỉ minh họa Playground phiên bản trước, không là tour storefront mới.

Tạo lại tour và phép đo bằng `node scripts/capture-storefront.mjs` sau khi build và mở preview; chỉ quay lại tour dùng `--tour-only`. Các thời gian giữ màn hình trong script phục vụ video, không nằm trong app.

## Phép đo tải trang trong lab

Ba lần mở Home bằng context mới, cache tắt, Chromium **156.0.8078.4**, viewport 1440×900, CPU chậm 4 lần, RTT 40ms, download 4Mbps/upload 2Mbps. Thu số liệu tới 1,5 giây sau khi hero và font đã sẵn sàng; dùng PerformanceObserver, CLS theo cửa sổ phiên. Nguồn có thể chạy lại: `scripts/capture-storefront.mjs`; [JSON gốc](../backup/storefront-performance.json).

| Lần | LCP | CLS |
| --- | --- | --- |
| 1 | 2.512ms | 0,04850 |
| 2 | 2.396ms | 0,04870 |
| 3 | 2.444ms | 0,04860 |
| Median | **2.444ms** | **0,04860** |

Không tải chunk Learn trong cả ba lần; tổng resource transfer quan sát là khoảng 542KB mỗi lần. Đây là số liệu điều hướng localhost với cấu hình nêu trên; một lần LCP vượt nhẹ mốc 2,5 giây. **Chưa đo INP hoặc field Core Web Vitals**, không suy ra chất lượng trên mọi thiết bị/mạng hoặc sau deploy.

## Giới hạn còn lại

- Đây là frontend MVP; order service mô phỏng, kho mẫu, chưa có backend, đăng nhập, quản trị, webhook hoặc đối soát ngân hàng. Receipt chỉ giữ đơn gần nhất trong phiên, không chứa thông tin nhận hàng.
- QR đã kiểm dữ liệu và giải mã độc lập; **chưa quét bằng ứng dụng ngân hàng thật hoặc xác minh tên chủ tài khoản**. App không tự nhận biết chuyển tiền và không đánh dấu đã thanh toán. Không thực hiện giao dịch trong quá trình kiểm tra.
- npm audit hiện báo **7 cảnh báo high** trong chuỗi picomatch/tinyglobby/Vite/Vitest/Sucrase. Chưa chạy `audit fix --force` vì phương án npm đề xuất đổi major/downgrade stack. Cần xử lý dependency trước triển khai công khai.
- Chưa thực hiện audit accessibility toàn diện, kiểm mọi tổ hợp contrast, thử thiết bị thật hoặc diễn tập có người thuyết trình đủ 5 phút. Không có claim chứng nhận WCAG hay điểm hiệu năng production.
- Không deploy hoặc merge `develop`. Kết quả được push riêng lên nhánh người dùng chỉ định.
