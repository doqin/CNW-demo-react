# OneSip MVP — nhật ký triển khai

Ngày 18/11/2026. Nhánh `feat/complete-storefront`, baseline `main@57f3fcc`.

- Người dùng chốt OneSip và dựng một MVP trực tiếp; không làm vòng chọn draft.
- Người dùng yêu cầu màu tươi và nổi bật hơn trong lúc triển khai: áp dụng bản citrus orange/sunshine yellow/leaf green trực tiếp, thay palette sage trầm ban đầu. Nhiều màu thương hiệu ở đây là yêu cầu trực tiếp, không áp giới hạn một màu nhấn của dashboard.
- Dùng checkout hiện tại trên nhánh tính năng theo yêu cầu người dùng; không tạo worktree thứ hai, không sửa hoặc push `develop`.
- Giữ React/JavaScript/Vite/CSS; chọn React Router 7.18.5 vì bản 8 yêu cầu Node mới hơn 22.17.0 của repo. Motion 14.14.0; thêm qrcode 1.5.4 theo yêu cầu mới về QR.
- Ảnh cuối gồm hero và 12 packshot, tạo riêng bằng built-in imagegen. File WebP local 11–121KB, thumbnail 400px. Hai font được self-host, kèm OFL.
- Tách code lesson và CSS vào `features/learn`; dữ liệu lesson P01/P02/P03 và compiler allowlist giữ nguyên.
- Test logic cart/checkout đã thấy đỏ trước implementation, rồi xanh 9/9. Test VietQR đã thấy đỏ, rồi xanh 3/3; kiểm TLV ngân hàng, tài khoản, số tiền, CRC với check vector chuẩn.
- Lượt kiểm cuối: lint và production build qua; 34 unit/component tests và 12 Playwright tests qua. Phạm vi và giới hạn ghi trong [báo cáo kiểm tra](onesip-verification.md).
- npm audit phát hiện 7 cảnh báo high trong chuỗi picomatch/tinyglobby/Vite/Vitest/Sucrase hiện có. npm gợi ý thay major hoặc downgrade toàn stack; chưa chạy audit fix --force. Sẽ ghi kết quả cuối và giới hạn triển khai trong verification.

## Quyết định kỹ thuật cần biết

- QR được tạo local để tài khoản không đi qua dịch vụ tạo ảnh QR; MBBank BIN 970422 đối chiếu [VietQR bank directory](https://www.vietqr.io/api-bank/demo). Mã dùng NAPAS AID A000000727, QRIBFTTA, currency704, CRC16-CCITT-FALSE.
- Cho chỉnh số tiền QR độc lập tổng đơn, hiển thị cảnh báo khi lệch; việc đổi số tiền QR không sửa giá hàng.
- Tạo đơn không xác nhận tiền. Chưa có backend/webhook ngân hàng; màn xác nhận ghi chờ chuyển khoản/chờ xác nhận. Không thu thập thông tin thẻ hoặc tự thực hiện giao dịch.
- Skeleton hiển thị trong khi route lazy-load, ảnh chưa tải hoặc QR chưa tạo xong; không giữ loading giả để trì hoãn nội dung.

## Các điều chỉnh cuối theo phản hồi

- Dùng `taste-skill` để soi bố cục, typography, ảnh và motion. Người dùng sau đó chọn lại bản sáng trong screenshot: giữ hero hai cột, header vàng, CTA cam, chữ xanh và ảnh still life ban đầu. Quyết định này ưu tiên hơn các quy tắc hình thức của skill; không bàn giao bản redesign hoặc bộ draft.
- Bỏ tone class và các lớp phủ màu của ảnh sản phẩm. Packshot hiển thị nguyên ảnh, không filter hoặc blend màu; nền khung ảnh trung tính.
- Chuyển toàn bộ BankQR khỏi checkout sang trang biên nhận sau **Đặt hàng**. Số tiền vẫn chỉnh được, giá trị hợp lệ lưu cùng receipt; giá trị không hợp lệ ẩn QR cũ.
- Review phát hiện lookup catalog nhận khóa kế thừa và receipt hỏng có thể gây lỗi: sửa bằng index không có prototype, kiểm own-property và kiểm schema payment trước khi hydrate.
- Kiểm browser tái hiện lỗi focus khi rời drawer đang đóng; sửa điều hướng đóng modal ngay và chỉ focus heading sau khi modal đã đóng. Kiểm hồi quy đã qua.
- Nút mua trên mobile được thu gọn để không tràn ở 375px. Giữ reduced motion và các loading placeholder có sẵn.
- Người dùng cho phép push kết quả lên `feat/complete-storefront`; không merge hoặc push `develop`.
