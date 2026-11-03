# Diễn tập và chuẩn bị trình chiếu

## Một lần khi nhận mã nguồn

- Chạy README trên chính máy dùng để trình bày; cài package và browser kiểm thử khi có Internet.
- Tự đi hết ba chặng, mở từng đoạn code và đọc `docs/qa.md`.
- Hiểu `ProductCard`, `useQuantity`, `CartProvider` và dòng bọc `memo` trước khi học lời dẫn.
- Tập bản 7 phút rồi bản 5 phút, ghi lại thời lượng thực bằng đồng hồ. Điều chỉnh tốc độ nói, không bỏ một trong ba kết luận.
- Mở MP4 trong `backup/` để chắc chắn trình phát local hỗ trợ. Lưu đường dẫn video ở nơi dễ tìm.

## Trước buổi 18/11/2026

- `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` đều qua sau thay đổi cuối.
- Thử rút mạng ngoài; giữ server localhost chạy. Không bật Offline trong DevTools nếu nó chặn cả localhost.
- Tắt thông báo cá nhân, đóng tab không liên quan, cắm nguồn máy.
- Thử trên máy chiếu. Dùng F11 khi cần có viewport đủ cao; chọn mức zoom đọc được và kiểm lại cả hai màn.
- Không thay dependency hoặc chỉnh source sát giờ trình bày.

## Khoảng 5 phút trước lượt demo

1. Mở terminal đúng repo, chạy `npm run preview`.
2. Mở `http://127.0.0.1:4173`, giữ terminal server hoạt động.
3. Bấm Đặt lại demo; kiểm mỗi thẻ là 1, giỏ 0, theme sáng.
4. Thử nhanh ba chặng nếu có thời gian, rồi Đặt lại demo lần nữa.
5. Để sẵn video local, quay lại app trước khi nhận lời từ bạn trình bày slide.

## Các giá trị để tự kiểm

| Mốc | Kết quả |
| --- | --- |
| Tăng Bình nước một lần | Số lượng 2, thành tiền 100.000 đ; thẻ khác là 1 |
| Thêm Bình nước ×2 | Huy hiệu 2, tổng 100.000 đ |
| Thêm Trà đào ×1 | Huy hiệu 3, hai dòng, tổng 125.000 đ |
| Xóa Bình nước | Huy hiệu 1, tổng 25.000 đ |
| Vào so sánh, reset số đo | 0 / 0 |
| Gõ từng ký tự `react` | 5 / 0 |
| Mở/đóng code | Số đo giữ nguyên |
| Bấm Đổi dữ liệu | 6 / 1 |

State giỏ giữ khi chuyển màn. Local state ở màn đã bị gỡ sẽ khởi tạo lại khi trở lại. Bấm Đặt lại demo sẽ tải lại toàn bộ app và đưa về đầu, không cần xóa storage.

## Nếu có gián đoạn

| Tình huống | Cách tiếp tục |
| --- | --- |
| Thao tác nhầm | Đặt lại demo nếu mới bắt đầu; ở màn so sánh có thể xóa ghi chú rồi reset số đo |
| Tab code chưa đóng | Escape hoặc nút Đóng code |
| Không mở được app | Kiểm terminal preview và URL cổng 4173; không tự đổi cổng trong lời dẫn |
| Cổng bị chiếm | Xử lý trước giờ: đóng phiên preview cũ hoặc ứng dụng đang giữ cổng nếu biết rõ đó là gì |
| Lỗi chưa khôi phục sau khoảng 20 giây | Mở MP4 local và tiếp tục thuyết minh; không sửa source trước lớp |
| Video không phát | Dùng ba ảnh `01-local-state.png`, `02-shared-cart.png`, `03-memo-comparison.png` trong backup |

Mục tiêu là giữ mạch giải thích. Không cố sửa một vấn đề môi trường ngay trước lớp khi đã có bản dự phòng.
