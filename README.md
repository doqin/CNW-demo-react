# React Mini Shop — SE347.R13

Một cửa hàng nhỏ để minh họa **props/state, Context và React.memo** trong một lượt demo 5–10 phút. Chuẩn bị cho seminar ngày **18/11/2026**, người phụ trách demo: **Trần Hữu Quốc Hướng**.

![Màn cửa hàng](docs/images/shop.png)

## Chạy demo

Máy đã xác minh: **Node 22.17.0**, npm 10.9.2. Dùng Node 22.17 trở lên trong nhánh 22 hoặc Node 24+.

```powershell
cd D:\Hoc\HK5\SE347-React-Seminar-Demo
npm ci
npm run build
npm run preview
```

Mở **[http://127.0.0.1:4173](http://127.0.0.1:4173)**. Giữ terminal chạy. Chuẩn bị trước giờ lên trình bày; đến lượt demo chỉ cần chạy `npm run preview` và mở trình duyệt.

`npm ci` cần Internet trong lần chuẩn bị. Sau khi đã cài và build, app chỉ dùng file local, không cần mạng ngoài, tài khoản, API hoặc extension trình duyệt. Nếu cổng 4173 đang được sử dụng, preview báo lỗi để bạn xử lý trước khi trình bày.

Để phát triển và sửa code: `npm run dev`, mở cổng 5173. **Lúc trình bày dùng preview**, vì số đếm được xác minh trên production build. Không mở `dist/index.html` bằng `file://`.

## Một lượt trình bày

1. **Props và state:** tăng Bình nước lên 2. Thành tiền là 100.000 đ; hai thẻ còn lại vẫn giữ số lượng 1. Bấm **Xem code** để giải thích dữ liệu đầu vào, Custom Hook và phép nhân giá × số lượng.
2. **Context:** thêm Bình nước ×2 và Trà đào ×1. Huy hiệu là **3**, giỏ có **2 dòng**, tổng **125.000 đ**. Trong hộp code chọn **Context giỏ hàng**.
3. **memo:** chuyển sang **So sánh render**, bấm **Bắt đầu phép đo**, gõ từng ký tự `react`. Kết quả **5 / 0**. Mở và đóng code; số đo giữ nguyên. Bấm **Đổi dữ liệu**, kết quả **6 / 1**.

**Đặt lại demo** đưa toàn bộ về đầu. Nút sáng/tối dùng Context riêng. Ghi chú không ảnh hưởng dữ liệu biểu đồ; bộ đếm ghi lại Effect theo dõi sau commit, không đếm mọi lần gọi hàm render hoặc số nút DOM bị sửa.

## Tài liệu để tập trước buổi seminar

| Tài liệu | Dùng khi |
| --- | --- |
| [Kịch bản 5 / 7 / 10 phút](docs/demo-script.md) | Tập lời nói và từng thao tác |
| [Đối chiếu slide với mã nguồn](docs/slide-mapping.md) | Nối phần demo với nội dung nhóm trình bày |
| [Checklist diễn tập và xử lý sự cố](docs/rehearsal.md) | Chuẩn bị trước ngày và trước giờ lên demo |
| [Câu hỏi đáp](docs/qa.md) | Ôn các câu hỏi dễ được hỏi |
| [Quyết định thiết kế](docs/design-notes.md) | Hiểu giao diện và phần đo được tổ chức ra sao |
| [Bằng chứng kiểm tra](docs/verification.md) | Xem số liệu, môi trường và giới hạn đã xác minh |
| [Video dự phòng khoảng 5 phút](backup/demo-5min.mp4) | Phát file local và tự thuyết minh khi app gián đoạn |

Video không có lời, để bạn nói theo kịch bản. Tải về hoặc mở file local để phát, không phụ thuộc khả năng preview MP4 của GitHub. Ba ảnh dự phòng cũng nằm trong thư mục [backup](backup/).

## Kiểm tra và quay lại video

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Unit/component tests kiểm state, giỏ và bộ đo. Playwright chạy luồng thật trên preview, kiểm cả focus/Escape, theme, reset, request chỉ về localhost và các kích thước 1280×720, 1366×768, 390×844. Cấu hình tự khởi động preview nếu chưa chạy.

Để quay lại video: khởi động preview ở một terminal, rồi chạy `npm run record` ở terminal khác. Script điều khiển app thật khoảng 5 phút, xác nhận số đo và tạo MP4 bằng ffmpeg. Phần quay dùng Playwright và ffmpeg-static trong dev dependencies; các gói này không được gửi vào bản web build.

## Cấu trúc cần biết

```text
src/components/ProductCard.jsx           props và local state
src/hooks/useQuantity.js                 logic tăng/giảm, mỗi thẻ độc lập
src/context/CartContext.jsx              nguồn state chung của giỏ
src/features/render/RenderComparison.jsx cha giữ ghi chú và dữ liệu
src/features/render/SalesChart.jsx       một component, hai cách sử dụng
src/features/render/metricsStore.js      kho số liệu quan sát tách riêng
src/teaching/codeExamples.js             trích code từ file thật bằng ?raw
src/tokens.css                          màu và font của cả hai theme
```

Không bật React Compiler để minh họa riêng tác dụng của `memo`. Không dùng Redux/Zustand/Next.js cho demo nhỏ này. Đây là ví dụ giảng dạy; dữ liệu chỉ giữ trong bộ nhớ và được xóa khi tải lại trang.

Nhánh `main` là bản diễn tập ổn định, `develop` dành cho tích hợp, thay đổi mới làm qua nhánh `feat/...`. Code mới được phát hành theo [MIT](LICENSE). Slide nguồn không nằm trong repo public; chỉ đối chiếu tên và số slide.
