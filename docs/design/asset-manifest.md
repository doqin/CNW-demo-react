# Ảnh và font OneSip

Ngày chuẩn bị: 18/11/2026. Ảnh tạo riêng bằng công cụ imagegen tích hợp, không lấy ảnh từ thương hiệu hoặc cửa hàng khác. Đây là ảnh AI minh họa sản phẩm mẫu; không là ảnh chứng minh hàng hóa thực tế. Không gán giấy phép stock bên thứ ba cho các ảnh này.

## Bộ ảnh local

Thư mục `public/images/storefront/`. Hero là WebP 1536×1024; ảnh sản phẩm có bản 800px và thumbnail 400px (`Pxx-small.webp`). Mỗi ảnh chính khoảng 11–121KB. Ảnh sản phẩm không áp CSS tint, filter màu hoặc blend màu.

Prompt chung cho packshot: “Premium single centered ecommerce product packshot, warm ivory seamless studio, soft light from upper left, gentle ground shadow, consistent sage and cream palette. No logo, label, person, text or watermark.” Mỗi prompt bổ sung chủ thể tương ứng dưới đây.

| Tệp | Chủ thể và hướng ảnh |
| --- | --- |
| `hero.webp` | Warm ivory travertine still life: sage reusable bottle, iced peach tea, espresso cup, fresh peach, morning sunlight and leaf shadows; no text or logo. |
| `P01.webp` | Matte sage reusable water bottle, loop handle, subtle condensation. |
| `P02.webp` | Clear tall glass of iced peach tea with peach slices. |
| `P03.webp` | Clear water bottle with a blue cap, unbranded. |
| `P04.webp` | Glass of Vietnamese iced milk coffee with visible coffee and milk layers. |
| `P05.webp` | Glass of cold brew coffee with ice. |
| `P06.webp` | Glass of iced matcha latte, green matcha over milk. |
| `P07.webp` | Glass of iced lychee tea with lychee fruit. |
| `P08.webp` | Glass of iced lemon tea with fresh lemon. |
| `P09.webp` | Cream ceramic mug of warm cocoa. |
| `P10.webp` | Ivory reusable tumbler with lid. |
| `P11.webp` | Stainless steel reusable straws and cleaning brush. |
| `P12.webp` | Sage canvas bottle carrier with handles. |

`scripts/prepare-onesip-assets.py` chuyển các ảnh nguồn thành WebP và chuẩn bị font. Danh sách đường dẫn ảnh nguồn của phiên tạo nằm trong scratch được ignore, không cần để chạy hoặc build ứng dụng. Các ảnh WebP thành phẩm đã được đưa vào repository.

## Font tự lưu trữ

`public/fonts/fonts.css` khai báo `font-display: swap`, các subset Latin/Vietnamese cần thiết. App không gọi Google Fonts lúc chạy.

| Font | Vai trò | Giấy phép đi kèm |
| --- | --- | --- |
| Be Vietnam Pro | Nội dung, control, giá và nhãn | `public/fonts/BeVietnamPro-OFL.txt` |
| Lora | Heading, wordmark và các điểm nhấn chữ nghiêng | `public/fonts/Lora-OFL.txt` |

Font lấy từ Google Fonts và giữ nguyên giấy phép SIL Open Font License trong thư mục. Mã nguồn ứng dụng tiếp tục theo MIT của repository; không thay thế điều khoản riêng của font.
