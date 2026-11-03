# Câu hỏi đáp dự phòng

| Câu hỏi | Trả lời ngắn theo đúng demo |
| --- | --- |
| Props khác state ở đây thế nào? | Tên và giá nhận từ cha qua props; số lượng là state mà từng thẻ tự ghi nhớ. |
| Vì sao thành tiền không có useState? | Nó tính trực tiếp được từ giá × số lượng. Lưu thêm state sẽ tạo thêm dữ liệu cần giữ đồng bộ. |
| Custom Hook có chia sẻ state không? | Không. Hai thẻ gọi useQuantity có hai state riêng; chúng chỉ dùng lại cách tăng/giảm. |
| Gọi setter có đổi biến ngay không? | Không đổi giá trị đang đọc trong lần render hiện tại; nó yêu cầu React cập nhật tiếp. |
| Vì sao dùng dạng q => q + 1? | Cập nhật dựa vào giá trị trước, phù hợp khi thao tác liên tiếp và React gộp các cập nhật. |
| Context có tự quản lý state không? | Không. Trong demo, useState trong CartProvider giữ state; Context truyền giá trị đến component cần đọc. |
| Vì sao không dùng Redux hoặc Zustand? | Phạm vi demo nhỏ, Context đủ minh họa nguồn state chung và bám phần lý thuyết. Không kết luận mọi dự án nên chọn Context. |
| Tại sao huy hiệu là 3 nhưng chỉ có hai dòng? | Huy hiệu đếm tổng đơn vị: hai Bình nước và một Trà đào. Hai dòng là hai loại sản phẩm. |
| Render lại có thay hết DOM không? | Không. React tính mô tả UI rồi commit các thay đổi cần thiết. |
| Vì sao memo giữ số 0 khi gõ? | Props data và metricId không đổi; ghi chú là state ở cha và không truyền xuống biểu đồ. |
| Vì sao bấm Đổi dữ liệu thì memo vẫn cập nhật? | Prop data có nội dung và tham chiếu mới, nên cần tính lại để hiển thị đúng. |
| Memo có chặn Context hoặc state riêng không? | Không. Component vẫn có thể cập nhật khi state riêng hoặc Context mà nó đọc đổi. |
| React.memo khác useMemo? | memo bọc component để có thể bỏ qua render do props không đổi; useMemo ghi nhớ kết quả tính bên trong component. |
| Có nên memo mọi component? | Không. So sánh props cũng có chi phí; cần hiểu đầu vào và quan sát trước khi tối ưu. |
| Hàm/object tạo mới ảnh hưởng gì? | Tham chiếu mới được coi là prop đổi. Khi phù hợp có thể ổn định bằng useCallback/useMemo hoặc tổ chức lại component. |
| Các số 5 và 0 đo chính xác cái gì? | Effect theo dõi chạy sau commit của từng component; không đếm các render thử hoặc số nút DOM đổi. |
| Tại sao bộ đếm không tự khiến biểu đồ chạy lại? | Chỉ RenderStats subscribe kho đo. Nó tự cập nhật; không chuyển số đo thành state của cha hoặc props của biểu đồ. |
| Có nên tin số mount ở dev? | StrictMode có thêm lượt kiểm tra trong dev. Buổi demo dùng production preview đã kiểm tra, reset sau khi màn ổn định. |
| Có React Compiler thì sao? | Compiler có thể tự thêm memoization. Repo này không bật để thấy riêng tác dụng của memo. |
| Demo có chứng minh tăng tốc bao nhiêu không? | Không. Nó minh họa số cập nhật có thể bỏ qua trong cùng điều kiện, không công bố benchmark thời gian. |

Ôn nguồn chính thức khi cần giải thích sâu: [memo](https://react.dev/reference/react/memo), [StrictMode](https://react.dev/reference/react/StrictMode), [chia sẻ state](https://react.dev/learn/sharing-state-between-components), [Context](https://react.dev/learn/passing-data-deeply-with-context).
