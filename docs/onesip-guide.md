# Sử dụng và trình diễn OneSip

OneSip là MVP **React** cho môn SE347: cửa hàng có luồng mua hàng hoàn chỉnh ở frontend, đồng thời giữ React Playground để trình bày props/state, Context và `memo`.

## Mở ứng dụng

```powershell
cd D:\Hoc\HK5\SE347-React-Seminar-Demo
npm ci
npm run build
npm run preview
```

- [Trang chủ OneSip](http://127.0.0.1:4173/).
- [Cửa hàng](http://127.0.0.1:4173/#/shop).
- [React Lab](http://127.0.0.1:4173/#/learn).

Chỉ cần Internet lúc chuẩn bị dependency. Sau khi build, trang, ảnh, font và QR đều chạy local qua preview. Dùng `npm run dev` khi sửa source.

## Kịch bản mua hàng khoảng 3 phút

1. Mở Home, xem hero và bốn món tuyển chọn. Bấm **Chọn món**.
2. Tìm `tra dao` để thấy tìm kiếm không phân biệt dấu. Mở Trà đào, xem mô tả và thêm 1 vào giỏ.
3. Đóng drawer, chọn Bình nước, tăng số lượng lên 2, thêm vào giỏ. Giỏ có 3 đơn vị; tiền hàng 125.000 đ, phí 20.000 đ, tổng **145.000 đ**.
4. Bấm **Tiếp tục đặt hàng**, rồi **Điền thông tin mẫu**.
5. Chọn phương thức MBBank và bấm **Đặt hàng**. Checkout chỉ giải thích bước tiếp theo; chưa hiển thị mã QR hoặc ô số tiền.
6. Trên trang biên nhận, QR mặc định 145000. Đổi thành 250000 để thấy mã thay đổi và cảnh báo khác tổng đơn, rồi đổi lại 145000. Biên nhận ghi **Chờ chuyển khoản · Chưa xác nhận thanh toán**. Giỏ trống; tải lại trang vẫn xem được biên nhận và số tiền QR hợp lệ gần nhất trong cùng phiên.

Thông tin điền mẫu là hư cấu. Không cần chuyển tiền để thực hiện kịch bản. Tạo đơn ở MVP không gọi hệ thống xử lý đơn hàng bên ngoài.

## QR chuyển khoản

- Ngân hàng **MBBank**, tài khoản **0825730557**. Cấu hình ở `src/storefront/checkout/vietqr.js`, giữ số tài khoản dưới dạng chuỗi để không mất số 0 đầu.
- QR theo định dạng NAPAS/VietQR, BIN 970422, currency VND. Số tiền phải là số nguyên từ 1 đến 999.999.999 đ; ô trống/0/số lẻ không hiển thị QR cũ.
- QR chỉ hiện sau khi đặt đơn thành công với phương thức chuyển khoản. Số tiền QR mặc định bằng tổng đơn. Chỉnh số tiền trên biên nhận chỉ chỉnh dữ liệu QR, không đổi giá sản phẩm hay tổng đơn; ứng dụng hiển thị rõ khi hai giá trị lệch nhau. Chọn thanh toán khi nhận hàng không hiện QR.
- Có nút sao chép tài khoản và tải ảnh QR. Tài khoản/số tiền không gửi tới dịch vụ tạo QR: mã và ảnh được tạo ngay trong trình duyệt bằng `qrcode`.
- Đã kiểm bằng parser TLV, checksum và decoder QR độc lập. Chưa có bằng chứng quét bằng ứng dụng ngân hàng thật hoặc xác minh tên chủ tài khoản. Khi dùng để giao dịch, kiểm tra người nhận và số tiền mà ứng dụng ngân hàng hiển thị.
- MVP chưa có backend/webhook ngân hàng. Biên nhận không tự chuyển sang “đã thanh toán”.

## Dữ liệu, giỏ hàng và trạng thái

- 12 sản phẩm mẫu, ba nhóm: thức uống, cà phê, bình/phụ kiện. Cacao sữa tạm hết để thử trạng thái hết hàng.
- Tìm theo tên, lọc nhóm/còn hàng, sắp xếp giá/tên. Trạng thái lọc nằm trong URL.
- Thêm trùng sản phẩm gộp dòng; giới hạn theo tồn mẫu. Badge là tổng đơn vị. Phí giao hàng 20.000 đ, miễn phí từ 150.000 đ.
- Giỏ và theme lưu trong localStorage. Receipt gần nhất không chứa tên/điện thoại/địa chỉ, lưu trong sessionStorage. Thông tin nhận hàng chỉ giữ trong bộ nhớ.
- Nếu browser chặn storage, app tiếp tục chạy trong memory và thông báo giới hạn lưu giỏ.
- Skeleton hiển thị khi route, ảnh và QR thực sự đang tải; không trì hoãn nội dung bằng loading giả. Có phương án reduced motion.
- Dùng `/#/checkout?scenario=error` khi đã có giỏ: lần submit đầu lỗi có chủ đích, retry cùng lần thử thành công. Rời checkout khi đang xử lý hủy yêu cầu và giữ giỏ.

## React Lab và reset

Vào **React Lab** trên header hoặc footer. Bài giảng giữ số liệu ban đầu: P01×2 + P02×1 = **125.000 đ** chưa có phí; gõ `react` sau Bắt đầu phép đo cho **5 / 0**, Đổi dữ liệu cho **6 / 1**.

- **Đặt lại code**: khôi phục source lesson đang mở; không xóa giỏ OneSip.
- **Đặt lại cửa hàng** trong Lab: xóa giỏ/receipt/draft OneSip và về Home; giữ theme.
- Dùng [kịch bản seminar cũ](demo-script.md) khi giảng React; mở URL `/learn` trước khi bắt đầu kịch bản đó.

## Kiểm tra và làm việc tiếp

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

Khi test E2E, preview đang mở phải phục vụ `dist` vừa build. Test dùng production preview tại port4173. Luồng browser kiểm cả mua hàng, QR, retry/abort, skeleton, sáu viewport, dark/reduced motion và hồi quy Playground.

## Gợi ý trình diễn trong 5 phút

| Thời gian | Nội dung |
| --- | --- |
| 0:00–0:45 | Home, ảnh và menu; tìm `tra dao` |
| 0:45–1:45 | Chi tiết Bình nước, chọn 2, thêm Trà đào |
| 1:45–2:30 | Giỏ 125.000đ + phí 20.000đ; giải thích state dùng chung |
| 2:30–3:30 | Điền mẫu → Đặt hàng → QR mới xuất hiện; đổi số tiền và nhấn mạnh chờ xác nhận |
| 3:30–4:45 | React Lab: mở source thật, giải thích Context hoặc đo memo 5/0 → 6/1 |
| 4:45–5:00 | Nêu phạm vi frontend MVP và các phần cần backend |

Đây là phân bổ đề xuất, chưa là thời lượng diễn tập có người nói. Xem [tour thao tác](../backup/storefront-tour.mp4) và [báo cáo kiểm tra](onesip-verification.md). Quay lại tour bằng `node scripts/capture-storefront.mjs --tour-only` khi preview đang chạy.

Mọi thay đổi của MVP nằm trên **`feat/complete-storefront`**. Không push hoặc merge vào `develop`. Không có bước deploy tự động trong đợt triển khai này.
