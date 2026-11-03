# Nhật ký triển khai

Plan: `docs/superpowers/plans/2026-11-03-react-demo.md`.

- 03/11/2026: Được giao tự chọn chi tiết, nâng thiết kế và thực hiện bước tiếp theo. Chọn triển khai inline trong repo mới độc lập, review toàn nhánh ở cuối.
- Ruling: Repo mới nằm cạnh repo môn học; đây là vùng làm việc cách ly, không tạo worktree thứ hai hoặc sửa code trong repo môn học.
- Thiết kế: minimalist-ui cho màu/typography và emil-design-eng cho controls/focus; giữ hạn mức chiều cao máy chiếu và ba chặng demo.
- Công cụ: Node 22.17.0/npm 10.9.2; tài khoản GitHub xác minh là thqhuong; tên repo chưa tồn tại.
- Task 1: complete — test viết trước nguồn, quan sát RED vì chưa có module; sau triển khai các kiểm tra qty/giỏ đều GREEN.
- Task 2: complete — bộ quan sát và source extractor kiểm tra RED→GREEN; 7 unit/component tests qua. Đã kiểm chứng production 5/0 khi gõ và 6/1 khi đổi dữ liệu.
- Task 3: complete — video thật 5:06.12, H.264 1280×720, ba ảnh dự phòng. Đã sửa tràn chiều cao dựa trên box measurements, bộ đếm production đúng.
- Ruling: `CartProvider` bao quanh shell để giữ giỏ khi chuyển màn; màn so sánh không đọc Cart Context, trạng thái số đo và code dialog không đi qua cha biểu đồ. Tác dụng cách ly cần thiết đã kiểm chứng bằng E2E.
- Runtime: khóa jsdom 26.1.0 để tương thích Node 22.17.0; override minimatch 11.0.4 cho công cụ lint. `npm audit`: 0 vulnerabilities, lint qua.
- Final review: reviewer độc lập xác nhận giỏ/phép đo/luồng trình bày đúng; phát hiện reset mobile mất tên truy cập. Ruling: xem đây là lỗi sử dụng với trình đọc màn hình cần sửa, không trì hoãn dù reviewer gọi Minor. Test tái hiện RED trước khi thêm aria-label, rồi xác minh lại.
- Final review, phạm vi còn xác minh: video được agent kiểm riêng bằng metadata/khung hình; GitHub/CI kiểm sau khi push. Khả năng đọc trên máy chiếu thật và tốc độ nói vẫn do người trình bày diễn tập, đã ghi trong checklist.
- Task 4: complete — repo public https://github.com/thqhuong/SE347-React-Seminar-Demo đã xác minh visibility và main; GitHub Actions run 41579057987 thành công. Có README bàn giao trong thư mục seminar của repo môn học. Không còn phát hiện review phải trì hoãn.
- Final verification: lint, 7 unit/component tests, build và 5 Playwright tests đều qua; audit production không báo mục; toàn bộ link tài liệu nội bộ tồn tại; MP4 được decode một khung thật để kiểm tra hình.
