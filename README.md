# AI for Math — Kho tài liệu Toán & FL/CL-CV

Bản web tĩnh của bộ tài liệu học tập gồm 50 bài đọc thuộc ba mạch:

- Toán nền tảng cho AI;
- Học máy và thị giác máy tính;
- Học liên kết (Federated Learning) và học liên tục (Continual Learning).

Mỗi bài có công thức, ví dụ, câu hỏi tự kiểm tra và lab tương tác. Toàn bộ 48 lab tương tác chạy bằng JavaScript ngay trên trình duyệt, không cần máy chủ. Tiến độ đọc và trạng thái hoàn thành được lưu trong `localStorage`.

## Xem trực tuyến

https://ktzung.github.io/ai-for-math/

Trang bài mẫu:

https://ktzung.github.io/ai-for-math/vector.html

## Cấu trúc

- `index.html` — ứng dụng đọc chính, đã bao gồm nội dung và mã tương tác.
- `vector.html` — bài mẫu Đại số tuyến tính tương tác.
- `.nojekyll` — tắt xử lý Jekyll của GitHub Pages.

## Chạy cục bộ

```bash
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000/`.
