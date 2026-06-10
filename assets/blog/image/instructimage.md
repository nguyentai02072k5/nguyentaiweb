# Bộ prompt ảnh cover — Template Library (9 ngành)

Ảnh cover cho 9 template chatbot instruction trên `/templates`. Mục tiêu: **chân thực, realistic, sắc nét 100%, thể hiện trọn vẹn sản phẩm — không gấp, không che, không blur** — đồng bộ thành một hệ thống thị giác (mỗi ngành đặt trên nền aurora tím→hồng→chàm của thương hiệu AI automation).

## Thông số chung

- **Tỉ lệ:** 16:9 · gợi ý xuất **1600×900** (đủ nét cho card + retina).
- **Đường dẫn lưu:** `public/templates/<slug>/cover.png`, sau đó thêm `cover: /templates/<slug>/cover.png` vào frontmatter template.
- **Model gợi ý:** `--model pro` (cover hero, chất lượng cao); `flash2` nếu cần nhanh/rẻ.
- **Không chữ, không logo, không watermark, không gương mặt người** (title đã render trên card → tránh lỗi text của AI).

## Style block dùng chung (dán kèm MỌI prompt)

```text
STYLE: Premium realistic product photography, ultra sharp, everything in crisp
focus from front to back (deep focus, large depth of field, NO blur, NO bokeh, NO
depth-of-field falloff). Every product shown fully and clearly — completely
visible, front-facing, nothing folded away, cropped, hidden or obscured. Clean,
even, true-to-life studio lighting with soft natural shadows and accurate
reflections. Smooth seamless studio backdrop washed in a gentle aurora gradient
blending violet (#a855f7), pink (#ec4899) and indigo (#6366f1), kept clean and
uncluttered so the products stand out. Realistic materials and textures, true
colors, high dynamic range, tack-sharp detail across the whole frame. No text, no
logos, no watermark, no human faces. 16:9, ultra detailed, photoreal commercial
look.
```

---

## Chín prompt hoàn chỉnh

> Mỗi prompt = **Style block ở trên + đoạn SUBJECT & SCENE dưới đây**.

### 1. `mau-my-pham-chot-don` — Mỹ phẩm / skincare

```text
SUBJECT & SCENE: A full skincare set arranged in a clean row on a polished stone
counter — a frosted-glass serum dropper bottle, a cream jar with lid beside it, a
toner bottle and a tube cleanser — every product upright, fully visible front-on
and tack sharp. A few fresh water droplets and one eucalyptus leaf as tidy accents.
The whole set is evenly lit and crisp from front to back against a clean aurora
backdrop. Luxurious, fresh, trustworthy skincare-counter look.
```

### 2. `mau-thoi-trang-chot-don` — Thời trang

```text
SUBJECT & SCENE: A complete knit sweater laid out flat and fully spread open so the
entire garment is visible — not folded, not bunched — sleeves and body clearly
shown, with a cloth measuring tape laid straight beside it and a couple of fabric
swatches. Everything sharp and evenly lit on a smooth surface against a clean aurora
backdrop. Tactile textile texture, tidy, honest fashion-flatlay look.
```

### 3. `mau-spa-thu-lead` — Spa / thẩm mỹ

```text
SUBJECT & SCENE: A clearly arranged spa set on a clean light surface — a stack of
smooth dark stones, an unlit pillar candle, a neatly rolled white towel, a small
bottle of massage oil and a single orchid stem — each item fully visible, separated
and tack sharp. Even soft studio light, accurate shadows, against a clean aurora
backdrop. Serene, premium, calming wellness look.
```

### 4. `mau-nha-hang-thu-lead` — Nhà hàng

```text
SUBJECT & SCENE: A complete table setting shown clearly from a slight top angle — a
clean white plate, full set of polished cutlery laid out, a folded linen napkin, a
water glass and a small blank reserved-card stand — every piece fully visible and
sharp, nothing cut off. Even bright studio light on a smooth tabletop against a
clean aurora backdrop. Upscale, inviting, honest restaurant look.
```

### 5. `mau-bds-thu-lead` — Bất động sản

```text
SUBJECT & SCENE: A small minimalist white architectural house model shown in full,
a house key on a leather tag laid flat beside it and a neatly rolled blueprint — all
items completely visible, separated and tack sharp on a concrete-and-wood surface.
Even studio light, realistic shadows, against a clean aurora backdrop. Aspirational,
trustworthy, clean real-estate look.
```

### 6. `mau-giao-duc-thu-lead` — Giáo dục

```text
SUBJECT & SCENE: A neat learning set on a clean wooden desk — three hardcover books
fanned so each cover is visible, a sharpened pencil, a small globe and a folded
paper graduation cap — every object fully shown, separated and tack sharp. Even warm
studio light, accurate shadows, against a clean aurora backdrop. Scholarly, hopeful,
inspiring learning look.
```

### 7. `mau-gym-thu-lead` — Phòng gym / fitness

```text
SUBJECT & SCENE: A clearly arranged fitness set on a textured rubber gym floor — one
chrome dumbbell, a kettlebell, a neatly rolled gym towel and a matte black water
bottle — each item fully visible, separated and tack sharp. Even crisp studio light
with clean metallic reflections, against a clean aurora backdrop. Energetic, premium,
honest athletic look.
```

### 8. `mau-nha-khoa-thu-lead` — Nha khoa

```text
SUBJECT & SCENE: A clean dental-care set on a glossy white surface — a clear
transparent aligner tray on a small glass stand, a bamboo toothbrush, a tube of
toothpaste and a folded white cloth — every item fully visible, separated and tack
sharp, with a sprig of mint as a fresh accent. Even bright clinical studio light,
clean reflections, against a clean cool aurora backdrop. Hygienic, fresh, trustworthy
dental look.
```

### 9. `mau-du-lich-thu-lead` — Du lịch / khách sạn

```text
SUBJECT & SCENE: A complete travel set laid out on warm sandy wood — a compact pastel
suitcase shown in full, a vintage film camera, a woven sun hat, sunglasses and a
blank boarding pass — each item completely visible, separated and tack sharp. Even
warm studio light, accurate shadows, against a clean aurora backdrop. Wanderlust,
warm, inviting holiday look.    
```

---

## Lệnh generate mẫu (ai-artist)

```bash
# Ví dụ template mỹ phẩm — ghép STYLE block + SUBJECT vào một chuỗi prompt
python3 scripts/generate.py "<dán STYLE block> SUBJECT & SCENE: A full skincare set arranged in a clean row..." \
  -o public/templates/mau-my-pham-chot-don/cover.png -ar 16:9 --model pro --skip
```

Lặp lại cho 8 slug còn lại, thay `SUBJECT & SCENE` và đường dẫn `-o` tương ứng.
