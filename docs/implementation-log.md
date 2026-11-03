# Nhật ký triển khai

Plan: `docs/superpowers/plans/2026-11-03-react-demo.md`.

- 03/11/2026: Được giao tự chọn chi tiết, nâng thiết kế và thực hiện bước tiếp theo. Chọn triển khai inline trong repo mới độc lập, review toàn nhánh ở cuối.
- Ruling: Repo mới nằm cạnh repo môn học; đây là vùng làm việc cách ly, không tạo worktree thứ hai hoặc sửa code trong repo môn học.
- Thiết kế: minimalist-ui cho màu/typography và emil-design-eng cho controls/focus; giữ hạn mức chiều cao máy chiếu và ba chặng demo.
- Công cụ: Node 22.17.0/npm 10.9.2; tài khoản GitHub xác minh là thqhuong; tên repo chưa tồn tại.
- Task 1: complete — test viết trước nguồn, quan sát RED vì chưa có module; sau triển khai các kiểm tra qty/giỏ đều GREEN.
- Task 2: complete — bộ quan sát và source extractor kiểm tra RED→GREEN; 7 unit/component tests qua. Đã kiểm chứng production 5/0 khi gõ và 6/1 khi đổi dữ liệu.
- Task 3: đang hoàn thiện — 4 Playwright tests, lint và build qua; đã sửa tràn chiều cao bằng cách bỏ chú thích trùng ở bản desktop gọn. Đang quay video thật.
- Ruling: `CartProvider` bao quanh shell để giữ giỏ khi chuyển màn; màn so sánh không đọc Cart Context, trạng thái số đo và code dialog không đi qua cha biểu đồ. Tác dụng cách ly cần thiết đã kiểm chứng bằng E2E.
- Runtime: khóa jsdom 26.1.0 để tương thích Node 22.17.0; override minimatch 11.0.4 cho công cụ lint. `npm audit`: 0 vulnerabilities, lint qua.
