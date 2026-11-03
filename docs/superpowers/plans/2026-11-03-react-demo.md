# React Mini Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Triển khai demo React dễ trình bày trong 5–10 phút, giao diện được trau chuốt, chạy local và có repo public riêng.

**Architecture:** Hai màn Cửa hàng và So sánh render. Context giỏ tách khỏi màn so sánh; kho đo chỉ được component quan sát subscribe. Ba đoạn code giảng lấy từ source thực.

**Tech Stack:** React 19, Vite, JavaScript, CSS, Vitest/Testing Library, Playwright. Node 22.17.0 đã có trên máy.

**Spec:** `docs/superpowers/specs/2026-11-03-react-seminar-demo-design.md`.

## Global Constraints

- Trình bày ngày 18/11/2026; một lượt 5–10 phút, bản chính 7 phút.
- Dữ liệu mẫu cố định: Bình nước 50.000 đ, Trà đào 25.000 đ, Nước suối 10.000 đ; số lượng chọn 1–10.
- Giỏ sau Bình nước ×2 và Trà đào ×1: 3 đơn vị, 2 dòng, 125.000 đ.
- Không backend/API/remote font. Preview ở `127.0.0.1:4173`, strict port. Không bật React Compiler.
- Code/comment/commit tiếng Anh; giao diện, tài liệu và lời dẫn tiếng Việt.
- Nâng gu theo minimalist-ui và emil-design-eng: nền giấy ấm, chữ than, điểm nhấn sage, hình sản phẩm SVG nội bộ; phản hồi bấm ngắn, focus rõ, reduced-motion. Không thêm animation ảnh hưởng phép đo.
- Người dùng đã giao tự chọn các chi tiết và yêu cầu tiếp tục triển khai. Thực hiện inline, một reviewer độc lập cuối lượt. Repo mới ở thư mục độc lập là ranh giới cách ly; không cần worktree từ repo môn học.

## Review Focus

1. Bấm Thêm nhiều lần phải cộng dồn theo state mới nhất; kiểm Task 1.
2. Mở code / cập nhật bộ đếm không tự làm biểu đồ cập nhật; kiểm Task 2 và 3.
3. Ghi chú là local state của đúng cha hai biểu đồ; memo không được vô tình vô hiệu bởi tham chiếu mới; kiểm Task 2.
4. Preview production vẫn có số đo thật; kiểm Task 3.
5. Reset, theme, keyboard, mạng ngoài bị chặn và màn 720 px vẫn dùng được; kiểm Task 3.

## Task 1: Cửa hàng và state

**Files:** `src/data/products.js`, `src/hooks/useQuantity.js`, `src/context/{CartContext,ThemeContext}.jsx`, `src/components/{ProductCard,CartPanel,ShopHeader,ProductArt,Icon}.jsx`, `src/features/shop/ShopView.jsx`, `src/{App,main}.jsx`, `src/styles.css`.

**Interfaces:** `useQuantity(initial=1,max=10) -> {qty,increase,decrease}`. `useCart() -> {items,addItem,removeItem,totalQuantity,totalPrice}`; `addItem(productId,quantity)`; `removeItem(productId)`. `useTheme() -> {theme,toggleTheme}`.

- [x] Viết test số lượng độc lập/giới hạn và giỏ cộng dồn/xóa/tổng, chạy và thấy RED vì chưa có chức năng.
- [x] Dựng cấu trúc tối thiểu rồi app đủ ba sản phẩm, giỏ và theme; test GREEN.
- [x] Áp typography, khoảng cách, artwork và điều khiển có tên truy cập; không viết test màu.
- [x] `npm test` qua; commit `feat(shop): add local quantities and shared cart`.

## Task 2: So sánh render và code viewer

**Files:** `src/features/render/{RenderComparison,SalesChart,RenderStats}.jsx`, `src/features/render/metricsStore.js`, `src/data/sales.js`, `src/components/CodeDialog.jsx`, `src/teaching/{codeExamples,extractRegion}.js`.

**Interfaces:** store `record(id)`, `reset()`, `subscribe(listener)`, `getSnapshot()`. `SalesChart({data,metricId})`; `MemoSalesChart = memo(SalesChart)`. CodeDialog launcher giữ state riêng, `examples` lấy nguồn bằng `?raw`.

- [x] Viết test ghi chú 5 ký tự cho kết quả 5/0, đổi dữ liệu thành 6/1; observer không gây lặp; source marker thiếu/trùng bị phát hiện. Chạy RED.
- [x] Tạo store immutable và Effect theo dõi sau commit; hai chart props ổn định; test GREEN.
- [x] Hoàn thiện ba code region source thật, native dialog, Escape/focus restore; mở code không cập nhật cha biểu đồ.
- [x] `npm test` qua; commit `feat(demo): show isolated memo comparison and source examples`.

## Task 3: Xác minh luồng thực và hoàn thiện trình chiếu

**Files:** `tests/demo.spec.js`, `playwright.config.js`, `scripts/record-demo.mjs`, `backup/`, `.github/workflows/ci.yml`, các CSS/chi tiết UI cần sửa.

- [x] Viết Playwright cho giỏ 125.000 đ, code dialog, so sánh 5/0→6/1, theme, reset và chỉ dùng localhost.
- [x] Chạy trên build preview, sửa lỗi theo bằng chứng. Xem screenshot ở 1280×720, 1366×768 và mobile; kiểm tràn ngang và chiều cao desktop.
- [x] Hoàn thiện code dialog trên máy chiếu, source markers, câu mô tả số đo; `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` đều qua.
- [x] Quay MP4 720p khoảng 5 phút bằng Playwright + ffmpeg local, 3 ảnh dự phòng, xác minh metadata video.
- [x] Commit `test(demo): verify seminar flow and record offline backup`.

## Task 4: Tài liệu, review và repo public

**Files:** `README.md`, `docs/{demo-script,slide-mapping,rehearsal,qa,design-notes,verification,implementation-log}.md`, `LICENSE`.

- [x] Viết hướng dẫn và kịch bản 5/7/10 phút có lời nói/thao tác/giá trị đích; ghi cách chạy video và kiểm tra trước giờ trình bày.
- [x] Reviewer độc lập kiểm toàn nhánh theo spec/plan và các điểm Review Focus; sửa Critical/Important và chạy kiểm tra liên quan.
- [x] Xác minh GitHub user `thqhuong`, repo chưa tồn tại; tạo public `SE347-React-Seminar-Demo`, push bản ổn định main/develop.
- [x] Xác nhận URL repo, visibility, commit và kiểm tra CI. Lưu đường dẫn demo trong tài liệu môn học.

## Self-review

Các yêu cầu của đặc tả có đầu ra tương ứng ở bốn task. Các giao diện store/Context được xác định trước; tài liệu và video được tạo sau khi xác minh số đo thật. Phiên bản jsdom chọn nhánh tương thích Node trên máy thay vì nâng runtime của người dùng.
