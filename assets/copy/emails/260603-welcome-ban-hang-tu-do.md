# Email Welcome - Bán Hàng Tự Do (Nền tảng Chatbot AI bán hàng)

- **Type:** welcome / onboarding (SaaS subscription)
- **Sản phẩm:** Chatbot AI tư vấn bán hàng, CSKH, follow-up vớt khách, chốt đơn, quản lý đơn/khách, đa kênh, đăng bài & reply comment tự động
- **Tone:** truyền cảm hứng nhưng chuyên nghiệp, dễ hiểu, không sáo rỗng
- **Brand color:** xanh dương tin cậy (#1D4ED8 → #1E40AF)
- **CTA chính:** Thiết lập chatbot ngay (kích hoạt) - **CTA phụ:** Tham gia cộng đồng
- **File HTML:** `260603-welcome-ban-hang-tu-do.html`

---

## Subject lines (chọn 1 - đã né từ khóa spam "Chúc mừng/Miễn phí")

1. `Trợ lý bán hàng AI của bạn đã sẵn sàng 🎉`  ← khuyến nghị
2. `[Tên], kết nối kênh đầu tiên để chatbot bắt đầu chốt đơn`
3. `Xong rồi! Bật chatbot tư vấn & chốt đơn trong 5 phút`
4. `Tài khoản Bán Hàng Tự Do đã kích hoạt - bắt đầu thôi`
5. `Để chatbot tư vấn & chốt đơn cho bạn 24/7`

> Lưu ý deliverability: tránh để chữ **"Chúc mừng"**, **"Miễn phí"**, **"Winner"**, viết HOA toàn bộ, hay nhiều dấu `!!!` trong subject - đây là các trigger spam high-risk.

## Preview text (preheader, 40–90 ký tự)
`Kết nối kênh đầu tiên và để chatbot tư vấn, chốt đơn 24/7 - chỉ mất 5 phút.`

---

## Bản Plain-text (bắt buộc gửi kèm để chống Junk Mail)

```
Xin chào [Tên thành viên],

Cảm ơn bạn đã đăng ký Bán Hàng Tự Do - nền tảng chatbot AI giúp bạn
tư vấn, chăm sóc khách và chốt đơn tự động trên mọi kênh.

Từ giờ, không tin nhắn nào bị bỏ lỡ và không khách tiềm năng nào rơi rớt.
Chỉ cần 3 bước để chatbot bắt đầu làm việc cho bạn:

1. Kết nối kênh bán hàng - Facebook, Zalo, TikTok, Website... về một nơi.
2. Huấn luyện chatbot - nhập sản phẩm, giá, kịch bản đúng giọng thương hiệu.
3. Bật follow-up tự động - nhắc khách chưa chốt, vớt đơn bỏ quên, chăm sau bán.

>> Thiết lập chatbot ngay: [LINK_THIET_LAP_CHATBOT]

Hoặc tham gia cộng đồng người bán: [LINK_NHOM_CONG_DONG]

Tất cả trong một nền tảng: tư vấn bán hàng, CSKH 24/7, follow-up & vớt khách,
chốt đơn & quản lý đơn hàng, quản lý khách & đa kênh, đăng bài & reply comment.

Cần hỗ trợ thiết lập? Trả lời thẳng email này, chúng tôi đọc từng tin nhắn.

Chúc bạn bán hàng bứt phá,
Đội ngũ Bán Hàng Tự Do

---
Bạn nhận email này vì đã đăng ký tại Bán Hàng Tự Do.
[Tên đơn vị] · [Địa chỉ]
Hủy đăng ký: [LINK_HUY_DANG_KY]
```

---

## Các placeholder cần thay trước khi gửi

| Placeholder | Thay bằng |
|---|---|
| `[Tên thành viên]` / `[Tên]` | Merge tag họ tên (vd `{{first_name}}`) |
| `[LINK_THIET_LAP_CHATBOT]` | Link vào dashboard thiết lập/kích hoạt chatbot |
| `[LINK_NHOM_CONG_DONG]` | Link nhóm Zalo/Facebook cộng đồng |
| `[LINK_HUY_DANG_KY]` | Link hủy đăng ký 1-click (bắt buộc) |
| `[LINK_TUY_CHON]` | Trang quản lý tùy chọn email |
| `[LINK_WEBSITE]` | Website chính |
| `[Tên công ty/Đơn vị]` + `[Địa chỉ đầy đủ]` | Pháp nhân + địa chỉ thật (bắt buộc theo luật anti-spam) |

---

## Checklist chống Junk Mail (làm trước khi gửi thật)

**Kỹ thuật (quan trọng nhất - quyết định >70% deliverability):**
- [ ] Cấu hình **SPF, DKIM, DMARC** cho domain gửi
- [ ] Gửi từ **domain riêng** (vd `no-reply@banhangtudo.vn`), KHÔNG dùng Gmail/Yahoo free
- [ ] Đặt **Reply-To** là hộp thư có người đọc (tăng tương tác → tăng uy tín)

**Nội dung (file này đã xử lý sẵn):**
- [x] Có bản **plain-text** kèm HTML (multipart)
- [x] Có **preheader** + **alt text** ý nghĩa
- [x] Link **hủy đăng ký** hiển thị rõ ở footer
- [x] Có **pháp nhân + địa chỉ** ở footer
- [x] Tỷ lệ text/ảnh cân bằng (email thuần HTML/CSS, không nhúng ảnh nặng)
- [x] Subject né từ khóa spam high-risk
- [ ] Thay hết placeholder `[...]` (đừng để sót → tránh trông như mail mẫu/spam)

**Khi gửi:**
- [ ] Test trước qua **mail-tester.com** (mục tiêu ≥ 8/10 điểm)
- [ ] Gửi thử tới Gmail + Outlook + điện thoại để kiểm tra hiển thị
- [ ] Với list mới: **warm-up** từ từ, không bắn volume lớn đột ngột

---

## Cách dùng nhanh

1. Mở `260603-welcome-ban-hang-tu-do.html`, copy toàn bộ.
2. Dán vào ESP (Mailchimp / Brevo / GetResponse / SendGrid…) ở chế độ "Paste HTML / Code your own".
3. Dán bản plain-text ở trên vào ô plain-text version của ESP.
4. Thay hết placeholder `[...]` bằng merge tag/giá trị thật.
5. Gửi test qua mail-tester.com → chỉnh nếu < 8 điểm → gửi thật.
