const icons = {
  sparkles: '<path d="M9.9 2.4 8.7 5.6 5.5 6.8l3.2 1.2 1.2 3.2 1.2-3.2 3.2-1.2-3.2-1.2-1.2-3.2Z"/><path d="M18 10.5 17.2 13l-2.5.8 2.5.8.8 2.5.8-2.5 2.5-.8-2.5-.8-.8-2.5Z"/><path d="M4.5 14 4 15.5 2.5 16l1.5.5.5 1.5.5-1.5 1.5-.5-1.5-.5-.5-1.5Z"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L21.8 8H5.12"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  'eye-off': '<path d="m15 18-.72-3.25"/><path d="M2 2l20 20"/><path d="M10.58 10.58A2 2 0 0 0 13.42 13.42"/><path d="M9.88 4.24A9.12 9.12 0 0 1 12 4c5 0 9 5 10 8a13.24 13.24 0 0 1-1.67 3.03"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12c1 3 5 8 10 8a9.76 9.76 0 0 0 5.39-1.61"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  tags: '<path d="M12.6 2.6a2 2 0 0 0-2.83 0L2.6 9.77a2 2 0 0 0 0 2.83l8.8 8.8a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.83Z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'
};

const landingFeatures = [
  ['heart', 'Tư vấn tự nhiên như người thật', 'Trả lời mượt, đúng ngữ cảnh, khách khó nhận ra đang chat với bot.'],
  ['cart', 'Chốt đơn & lên đơn tự động', 'Dẫn khách từ hỏi giá đến đặt hàng, không bỏ sót khách nào.'],
  ['user-plus', 'Thu lead tập trung', 'Tự xin tên, SĐT, nhu cầu và gom data khách về một mối.'],
  ['eye-off', 'Auto rep + ẩn bình luận + inbox', 'Tự trả lời bình luận, ẩn comment lộ giá rồi nhắn Messenger riêng.'],
  ['ticket', 'Tự tạo mã khuyến mãi', 'Bot phát mã giảm giá đúng thời điểm để kích khách chốt nhanh.'],
  ['handshake', 'Thương lượng giá có chiến thuật', 'Mặc cả tự nhiên, giữ biên lợi nhuận mà khách vẫn vui vẻ.'],
  ['tags', 'Tự động gắn nhãn bằng AI', 'AI đọc hội thoại, phân loại khách: tiềm năng, ngại giá, VIP…'],
  ['repeat', 'Follow-up theo từng nhãn', 'Mỗi nhãn một kịch bản bám đuổi, chăm sóc đúng người đúng lúc.']
];

function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
}

function hydrateIcons() {
  document.querySelectorAll('[data-icon]').forEach((node) => {
    node.outerHTML = icon(node.dataset.icon, node.dataset.size || 20);
  });
}

function renderFeatures() {
  const grid = document.getElementById('features-grid');
  if (!grid) return;
  grid.innerHTML = landingFeatures.map(([ic, title, benefit]) => `
    <article class="feature-card">
      <span class="feature-icon">${icon(ic, 20)}</span>
      <div><h3>${title}</h3><p>${benefit}</p></div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatures();
  hydrateIcons();
});
