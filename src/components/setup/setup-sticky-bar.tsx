'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ZALO_URL } from '@/lib/setup/setup-content';

/**
 * Thanh Zalo cố định đáy màn hình (chỉ mobile, CSS ẩn trên desktop).
 * Chỉ hiện sau khi khách cuộn qua hero, và ẩn khi đã tới khối giá (đã có nút ngay đó)
 * → không che nội dung ở lúc khách đang tập trung xem video.
 */
export function SetupStickyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const pricing = document.getElementById('goi-setup');
    const update = () => {
      const pastHero = window.scrollY > 520;
      const atPricing = pricing ? pricing.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      setShow(pastHero && !atPricing);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className={`sp-sticky${show ? ' is-show' : ''}`} aria-hidden={!show}>
      <div className="sp-sticky-in">
        <a className="sp-sticky-zalo" href={ZALO_URL} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1}>
          <MessageCircle size={18} aria-hidden />
          Zalo
        </a>
        <a className="sp-btn-hot" href="#goi-setup" tabIndex={show ? 0 : -1}>
          Đăng ký cài giúp 1-1
        </a>
      </div>
    </div>
  );
}
