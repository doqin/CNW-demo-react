# Quyết định thiết kế và triển khai

Ngày 03/11/2026. Bản [đặc tả gốc](superpowers/specs/2026-11-03-react-seminar-demo-design.md) chốt ba chặng. Người dùng sau đó yêu cầu áp dụng skill thiết kế để làm đẹp và triển khai các bước còn lại. Tài liệu này ghi lựa chọn thực tế thay cho màu/bố cục tạm ở wireframe ban đầu.

## Skill đã áp dụng

- **minimalist-ui:** bảng màu giấy ấm/than, typography có tương phản, bố cục phẳng, một hệ viền/radius, điểm nhấn sage và pastel. Nút chính màu than, hình sản phẩm SVG tự chứa.
- **emil-design-eng:** feedback khi bấm, focus rõ, hover chỉ trên thiết bị phù hợp, tôn trọng reduced-motion, hộp thoại dùng hành vi native.
- **writing-plans / executing-plans:** chia theo phần state, phép so sánh, xác minh và bàn giao; thực hiện inline trong repo mới.
- **test-driven-development / systematic-debugging / verification-before-completion:** test state và bộ đo trước, kiểm nguyên nhân khi sai bố cục, xác minh production trước khi quay và bàn giao.

Đây là app phục vụ trình chiếu; không áp các yêu cầu marketing như nhiều section hero, ảnh nền lớn hoặc animation cuộn. Giao diện không cần ảnh/font từ Internet. Không thêm motion làm thay đổi nhịp giải thích hoặc che kết quả đo.

## Các điểm thay đổi so với phác thảo

| Before | After | Why |
| --- | --- | --- |
| Nút xanh, bố cục chủ yếu là ô trắng giống nhau | Nút than, nền giấy, vùng sản phẩm pastel và tổng tiền như biên nhận | Phân cấp rõ hơn và cùng một ngôn ngữ hình ảnh |
| Biểu tượng nét mảnh làm hình sản phẩm | Ba minh họa SVG có chất liệu/màu riêng | Nhận ra sản phẩm nhanh, không phụ thuộc ảnh mạng |
| Heading sans và nhiều nhãn nhỏ | Heading Cambria, body Segoe UI; bớt eyebrow lặp | Tạo nhịp typography, giữ chữ tiếng Việt ổn định trên máy đã kiểm tra |
| Số lượng/giỏ có thể cần nhìn nhiều vị trí | Số lượng ngay trên thẻ, tổng giỏ lớn, huy hiệu luôn ở header | Khán giả thấy rõ kết quả sau một thao tác |
| Hai biểu đồ có phần chú thích lặp trong mỗi khung | Một câu mô tả chung và dải kết luận; ẩn chú thích lặp ở màn desktop thấp | Vừa 720 px mà vẫn giữ kết luận quan trọng |
| Nút/hộp code chỉ mới được mô tả | Nút có active/focus, dialog native có Escape và trả focus | Giảm thao tác lỗi khi trình bày bằng bàn phím |

## Ranh giới state và đo lường

`CartProvider` giữ giỏ xuyên suốt shell và khi chuyển màn. `RenderComparison` không đọc Cart Context. Theme đổi bằng Provider riêng và CSS trên phần tử gốc; thay theme không làm số đo tăng trong luồng đã kiểm tra.

Ghi chú nằm đúng ở cha của hai biểu đồ. `data` là cùng tham chiếu cho đến lúc bấm Đổi dữ liệu. `metricId` là string ổn định. Hai bản dùng cùng thân SalesChart, một bản bọc memo ở phạm vi module.

Effect trong SalesChart phát sự kiện sau commit tới kho độc lập. Chỉ RenderStats subscribe bằng useSyncExternalStore; nó không đưa số liệu thành state của cha. CodeDialog tự giữ mục code đang chọn và dùng native dialog để mở/đóng. Các thao tác quan sát không trở thành đầu vào của ví dụ được đo.

Kho đo là phần hỗ trợ để quan sát, không phải phần beginner cần tự viết khi thuyết trình. Ba đoạn code giảng chính lấy từ source thực bằng `?raw`, không có editor chạy code trong app.

## Runtime và dependencies

- Node đã kiểm tra: 22.17.0. React 19.3.1, Vite 8.3.5, Vitest 5.1.0; phiên bản cụ thể nằm trong lockfile.
- jsdom 26.1.0 được chọn vì phiên bản mới nhất lúc triển khai đòi Node cao hơn máy hiện có.
- Override minimatch 11.0.4 loại bỏ cảnh báo của chuỗi công cụ ESLint; đã chạy lint thành công và audit không còn mục được báo.
- React Compiler không được bật. StrictMode giữ trong source để dùng khi phát triển; bản trình chiếu là production preview.
- Không có service worker, persistent storage, API hoặc tài khoản. Refresh là reset toàn bộ app.

## Giới hạn có chủ đích

Số đo là lượt Effect theo dõi sau commit trong ví dụ này, không phải thống kê toàn bộ render attempts của React. Không dùng nó để công bố tốc độ hoặc phần trăm hiệu năng. Ba bộ số liệu kiểm tra được là 125.000 đ, 5/0 và 6/1.

Biểu đồ là dữ liệu bán hàng mẫu 1.000 bản ghi theo công thức cố định. Các cột có thể gần nhau về chiều cao; nội dung vẫn đổi thật khi bấm Đổi dữ liệu. App không cố tạo độ trễ giả để làm khác biệt có vẻ lớn hơn.

Tài liệu chính thức: [memo](https://react.dev/reference/react/memo), [StrictMode](https://react.dev/reference/react/StrictMode), [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore), [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/).
