# Bằng chứng kiểm tra

Ngày kiểm tra: 03/11/2026, máy Windows, Node 22.17.0/npm 10.9.2. Bản web được build và phục vụ ở `http://127.0.0.1:4173`.

## Kết quả hiện có

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run lint` | Qua, không có lỗi |
| `npm test` | 3 file, 7 kiểm tra qua |
| `npm run build` | Qua, build tĩnh |
| `npm run test:e2e` | 4 kiểm tra qua trên Chromium |
| `npm audit` | 0 vulnerabilities theo registry tại thời điểm kiểm tra |
| Số lượng riêng từng thẻ | Tăng Bình nước lên 2 không đổi Trà đào |
| Giỏ mẫu | 3 đơn vị, 2 dòng, 125.000 đ |
| Gõ năm ký tự sau reset phép đo | Bản thường 5, bản memo 0 |
| Đổi dữ liệu | Bản thường 6, bản memo 1 |
| Mở/đóng code, đổi theme | Không làm tăng số đo biểu đồ |
| Escape và focus | Đóng hộp code, trả focus về nút mở |
| Đặt lại demo | Giỏ 0, thẻ Bình nước 1, theme sáng, màn Cửa hàng |
| Request trình duyệt | Chỉ localhost; chặn mọi origin ngoài không ảnh hưởng luồng |
| Bố cục | Không tràn ngang 1280×720, 1366×768, 390×844; không cuộn dọc ở hai viewport desktop |

Các file test: `src/shop.test.jsx`, `src/features/render/render.test.jsx`, `src/teaching/extractRegion.test.js`, `tests/demo.spec.js`.

## Kiểm tra trực quan

Screenshot được lấy từ preview thực, không phải bản phác thảo: [Cửa hàng](images/shop.png), [So sánh](images/render.png). Kiểm tra desktop và mobile để tìm lỗi chữ/viền/tràn, sau đó điều chỉnh phần chú thích lặp trong màn thấp. Trạng thái giỏ, biểu đồ và theme được kiểm tra bằng thao tác thật.

## Video và giới hạn

Video sẽ được xác nhận bằng `backup/video-metadata.json` do script quay ghi lại sau khi mã hóa thành công. Ba ảnh dự phòng được lấy cùng lượt quay. Kết quả kiểm tra ứng dụng không thay cho việc người trình bày tự tập có bấm giờ và thử trên máy chiếu thực của lớp.

Chưa xác minh trên phần cứng máy chiếu của lớp hoặc trên máy khác. Môi trường dev có StrictMode và có thể có lượt kiểm tra thêm; số đo dùng cho buổi seminar lấy từ production preview.
