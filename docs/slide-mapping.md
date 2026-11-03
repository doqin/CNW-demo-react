# Demo đối chiếu với slide seminar React

Nguồn: `Seminar React SE347.R13.pptx`, 58 slide, bản người dùng cung cấp ngày 31/10/2026. Đã đọc trực tiếp cấu trúc slide; không tự đưa file PowerPoint lên repo public.

SHA-256: `FAFE6CF6AE93402575E33FA9DC724FE526D9281EF8803EEB223B9D1C22B28AB8`.

| Slide | Nội dung | Hành vi demo | Mã nguồn |
| --- | --- | --- | --- |
| 7 | Ghép Component | Ba sản phẩm dùng chung cấu trúc | `src/features/shop/ShopView.jsx`, `src/components/ProductCard.jsx` |
| 15 | Dữ liệu một chiều | Nhận giá/tên qua props, gửi thao tác Thêm | `ProductCard.jsx`, `src/context/CartContext.jsx` |
| 17 | Props, state và giá trị suy ra | Bình nước số lượng 2, thành tiền 100.000 đ | `ProductCard.jsx` |
| 19 | Render danh sách và key | Sản phẩm/giỏ dùng ID ổn định | `ShopView.jsx`, `src/components/CartPanel.jsx` |
| 21 | useState và cập nhật từ state trước | Tăng/giảm, thêm giỏ liên tiếp vẫn đúng | `src/hooks/useQuantity.js`, `CartContext.jsx` |
| 23 | useContext cho theme | Đổi sáng/tối, tùy thời lượng | `src/context/ThemeContext.jsx`, `src/components/ShopHeader.jsx` |
| 26 | Custom Hook dùng lại logic | Thay đổi thẻ này không đổi thẻ khác | `useQuantity.js` |
| 28, 30, 37 | Chọn nơi giữ state, Context | Huy hiệu và giỏ cùng dữ liệu | `CartContext.jsx`, `ShopHeader.jsx`, `CartPanel.jsx` |
| 38, 39 | Cha cập nhật làm con chạy lại | Gõ ghi chú, bản thường cập nhật | `src/features/render/RenderComparison.jsx` |
| 40 | React.memo | Cùng SalesChart, bản bọc memo giữ số đếm 0 | `src/features/render/SalesChart.jsx` |
| 41, 42 | Props, tham chiếu và giới hạn memo | Đổi dữ liệu làm cả hai cập nhật; giải thích khi được hỏi | `RenderComparison.jsx`, `SalesChart.jsx` |

Giỏ hàng bằng Context là ví dụ kết hợp cho quy mô seminar; không nhận nó là bản triển khai Redux Toolkit hoặc Zustand ở slide 31–33. Ghi chú ở màn so sánh cố ý không lọc/đổi dữ liệu biểu đồ để giữ đúng tiền đề của ví dụ slide 39.

Đoạn code trong hộp thoại được lấy bằng Vite `?raw`, cắt giữa comment `demo:start` và `demo:end`; cùng nguồn với app đang chạy. Marker thiếu, trùng hoặc ngược thứ tự sẽ báo lỗi. Không dùng snippet giả lập khác với logic thực.
