# Kịch bản demo ngày 18/11/2026

Người trình bày: Quốc Hướng. Bản chính khoảng 7 phút. Trước khi bắt đầu, preview đã chạy, tab Cửa hàng đang mở, mỗi thẻ số lượng 1 và giỏ trống. Không viết/sửa source trước lớp. Bấm **Xem code**, nói ở mức cơ chế, rồi đóng bằng Escape.

## Bản chính 7 phút

| Mốc | Thao tác | Lời dẫn gợi ý |
| --- | --- | --- |
| 0:00–0:30 | Chỉ ba sản phẩm | “Em dùng một cửa hàng nhỏ để nối ba phần nhóm vừa trình bày: props và state, chia sẻ state, rồi quan sát việc render.” |
| 0:30–1:20 | Bấm Tăng Bình nước một lần | “Tên và giá do component cha truyền vào qua props. Số lượng 2 là state của riêng thẻ Bình nước. Thành tiền được tính ngay từ 50.000 nhân 2, nên không cần thêm state cho nó. Hai thẻ khác vẫn là 1.” |
| 1:20–2:10 | Xem code → Props và state; chỉ `useQuantity`, `price * qty`, `onClick`; Escape | “useQuantity gom logic tăng giảm. Mỗi thẻ gọi Hook này có state riêng. Khi bấm, setter đổi state và React tính lại giao diện tương ứng.” |
| 2:10–3:00 | Thêm Bình nước ×2, thêm Trà đào ×1; chỉ huy hiệu 3 và tổng 125.000 đ | “Giỏ hàng và huy hiệu nằm ở hai component khác nhau. Cả hai cùng hiển thị dữ liệu mới vì đọc một nguồn state chung.” |
| 3:00–3:45 | Xem code → Context giỏ hàng; chỉ `useState`, Provider, rồi cuộn đến `useCart` trong CartBadge; Escape | “State thật nằm trong CartProvider. Context mang dữ liệu đó tới các component cần đọc; Context không tự tạo hoặc tự quản lý state. totalQuantity và totalPrice được tính từ items.” |
| 3:45–4:10 | Bấm So sánh render; chờ màn hiện; Bắt đầu phép đo | “Ở ví dụ này, ô ghi chú và hai biểu đồ cùng nằm dưới một component cha. Dữ liệu biểu đồ không phụ thuộc ghi chú.” |
| 4:10–4:55 | Gõ từng ký tự `react`, không dán; chỉ 5 / 0 | “Mỗi ký tự làm state của cha thay đổi. Bản thường cập nhật cùng cha. Bản memo có thể dùng lại kết quả vì dữ liệu truyền xuống vẫn giữ nguyên.” |
| 4:55–5:40 | Xem code; chỉ `SalesChart` và `memo(SalesChart)`; Escape | “Hai bản dùng cùng một thân component. Bản bên phải được bọc memo. Effect trong ví dụ chỉ gửi sự kiện sau commit sang bộ quan sát riêng; nó không đổi state của component cha.” |
| 5:40–6:15 | Đổi dữ liệu; chỉ 6 / 1 | “Dữ liệu đổi thật thì bản memo vẫn phải cập nhật. Memo giúp bỏ qua một số lần tính lại, không chặn mọi cập nhật. Render lại cũng không có nghĩa toàn bộ DOM bị dựng lại.” |
| 6:15–7:00 | Giữ màn so sánh, nhường lời về nhóm | “Ba điều cần nhớ là: props đưa dữ liệu vào và state ghi nhớ thay đổi; Context giúp nhiều component đọc cùng nguồn; tối ưu phải dựa trên cơ chế render và quan sát thực tế.” |

## Bản rút gọn 5 phút

| Thời lượng | Nội dung giữ lại |
| --- | --- |
| 20 giây | Mở bài, nêu ba ý |
| 70 giây | Tăng Bình nước lên 2; mở code và chỉ `price * qty`, `useQuantity`; đóng |
| 80 giây | Thêm hai sản phẩm; chỉ 3 đơn vị và 125.000 đ; mở Context, chỉ state và Provider; đóng |
| 110 giây | Chuyển màn, reset số đo, gõ `react`, mở code chỉ dòng memo, đóng, đổi dữ liệu |
| 20 giây | Nhắc lại ba kết luận và kết thúc |

Đủ **300 giây** theo phân bổ. Hãy tự tập có đồng hồ; đây là thời lượng mục tiêu, không phải cam kết về tốc độ nói của từng người. Bản ngắn không cần giải thích từng hàm hoặc cuộn đọc hết code Context.

## Nếu được 10 phút

Sau bản chính có thể dùng thêm: 1 phút cho state độc lập của hai lần gọi Custom Hook; 45 giây đổi theme, liên hệ slide 23; 45 giây giải thích object/hàm mới làm props khác tham chiếu; 30 giây dự phòng. Tổng tối đa 10 phút. Không thêm tính năng mới vào lượt trình bày.

## Những điều cần nói chính xác

- Huy hiệu 3 là **ba đơn vị**, không phải ba loại sản phẩm.
- Gõ `react` từng ký tự sau mốc đo; dán một lần có thể chỉ tạo một cập nhật.
- Bộ đếm ghi lại Effect theo dõi sau commit. Không gọi số này là số lần sửa DOM hay mọi lần React gọi hàm component.
- `memo` so sánh props; component vẫn có thể cập nhật vì state riêng hoặc Context mà nó đọc.
- Mở code và đóng code không làm cha biểu đồ cập nhật. Đổi dữ liệu thì có.
- Nếu lỡ nhập sai, xóa nội dung trước, bấm Bắt đầu phép đo rồi mới gõ lại. Nút này chỉ reset số đo, không tự xóa ghi chú.

## Khi cần chuyển sang video

Nói ngắn: “Em chuyển sang bản ghi từ chính ứng dụng để tiếp tục cùng luồng minh họa.” Mở `backup/demo-5min.mp4` bằng trình phát local, nói theo nhịp thao tác. Có thể tạm dừng ở đoạn code để giải thích. Video không có âm thanh.
