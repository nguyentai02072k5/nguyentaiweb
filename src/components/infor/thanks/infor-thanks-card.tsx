/**
 * infor-thanks-card.tsx - Card cảm ơn full-screen (client) cho /infor/thanks.
 *
 * Takeover toàn màn (position:fixed z-99999) đè lên NavBar/Footer global → trang
 * cảm ơn "sạch". Lock scroll <body> khi mount (khôi phục khi rời trang). Đẩy event
 * GTM `infor_thanks_view` để theo dõi conversion. Hiệu ứng tách ở use-thanks-effects.
 */

'use client';

import { useEffect, useRef } from 'react';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { useThanksEffects } from './use-thanks-effects';
import styles from './infor-thanks.module.css';

const ZALO_URL = 'https://zalo.me/0345324467';

export function InforThanksCard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // Lock scroll nền (overlay tự cuộn nội bộ) + báo view cho funnel.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    pushToDataLayer({ event: 'infor_thanks_view' });
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useThanksEffects({
    rootRef,
    canvasRef,
    timerRef,
    btnRef,
    confettiClass: styles.confettiPiece,
    rippleClass: styles.ripple,
  });

  return (
    <div ref={rootRef} className={styles.pageRoot}>
      <div className={`${styles.bgOrb} ${styles.bgOrb1}`} />
      <div className={`${styles.bgOrb} ${styles.bgOrb2}`} />
      <div className={`${styles.bgOrb} ${styles.bgOrb3}`} />
      <canvas ref={canvasRef} className={styles.particleCanvas} />

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.iconRing}>
            <svg className={styles.checkmark} viewBox="0 0 52 52">
              <polyline points="14,27 23,37 38,17" />
            </svg>
          </div>
          <div className={styles.headerText}>
            <div className={styles.tag}>🎉 Đã Nhận Thông Tin</div>
            <h1 className={styles.heading}>
              Cảm Ơn Bạn Đã<br />Để Lại <span>Thông Tin!</span>
            </h1>
          </div>
        </div>

        <p className={styles.sub}>
          Mình là <strong style={{ color: '#fff' }}>Tài</strong> 👋 Mình đã nhận được thông tin của bạn rồi nhé.
        </p>

        <div className={styles.giftHero}>
          <div className={styles.giftTag}>🎁 QUÀ TẶNG RIÊNG TỪ TÀI</div>
          <div className={styles.giftTitle}>
            1 Chatbot <span>Bán Hàng Tự Động Bằng AI</span>
          </div>
          <p className={styles.giftDesc}>
            Tự nhắn tin, tư vấn &amp; <strong>chốt đơn thay bạn — 24/7</strong>, kể cả lúc bạn đang ngủ. Mình sẽ
            cài tận tay, <strong className={styles.freeHl}>miễn phí đến khi chạy được</strong>.
          </p>
        </div>

        <div className={styles.valueStrip}>
          <div className={styles.valueRow}>
            <span className={styles.vi}>✓</span>
            <span>
              <strong>Tự động chốt đơn 24/7</strong> — không bỏ lỡ tin nhắn khách
            </span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.vi}>✓</span>
            <span>
              Mình cài tận tay, <span className={styles.freeHl}>MIỄN PHÍ 100%</span> đến khi chatbot chạy ổn
            </span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.vi}>✓</span>
            <span>
              <strong>Setup đúng ngành của bạn</strong> — gắn vào Page là chạy ngay
            </span>
          </div>
        </div>

        <div className={styles.lastStep}>
          <div className={styles.lsNum}>1</div>
          <div className={styles.lsText}>
            Chỉ còn <strong>1 bước cuối cùng</strong>: nhắn Zalo cho mình để mình{' '}
            <strong>bắt tay cài chatbot cho bạn ngay hôm nay</strong>👇
          </div>
        </div>

        <div className={styles.ctaWrap}>
          <div className={styles.freeBadge}>MIỄN PHÍ 100%</div>
          <a ref={btnRef} href={ZALO_URL} target="_blank" rel="noopener noreferrer" className={styles.btnZalo}>
            <div className={styles.shimmer} />
            <svg className={styles.zaloLogo} viewBox="0 0 48 48" fill="none" aria-label="Zalo">
              <rect width="48" height="48" rx="13" fill="#fff" />
              <path
                d="M24 9.5C14.3 9.5 6.5 16.1 6.5 24.2c0 4.6 2.6 8.7 6.6 11.4-.3 1.6-1 3.1-2 4.4-.5.6 0 1.5.8 1.3 2.5-.5 4.6-1.4 6.3-2.6 1.8.5 3.8.7 5.8.7 9.7 0 17.5-6.6 17.5-14.6S33.7 9.5 24 9.5Z"
                fill="#0068FF"
              />
              <text
                x="24"
                y="29"
                textAnchor="middle"
                fontFamily="Arial,Helvetica,sans-serif"
                fontSize="13.5"
                fontWeight="900"
                fill="#fff"
                letterSpacing="-0.4"
              >
                Zalo
              </text>
            </svg>
            <div className={styles.btnStack}>
              <span className={styles.btnLabel}>Nhắn Zalo cho Tài ngay</span>
              <span className={styles.btnSub}>Để Tài cài chatbot AI miễn phí cho bạn 🔥</span>
            </div>
          </a>
        </div>

        <div className={styles.footerRow}>
          <div className={styles.socialProof}>
            <div className={styles.avatars}>
              <div className={styles.avatar}>TH</div>
              <div className={`${styles.avatar} ${styles.a2}`}>LM</div>
              <div className={`${styles.avatar} ${styles.a3}`}>QA</div>
              <div className={`${styles.avatar} ${styles.a4}`}>BN</div>
            </div>
            <p className={styles.proofText}>
              <strong>+230 Chủ Shop</strong> Đã Nhận Chatbot
            </p>
          </div>
          <div className={styles.countdownWrap}>
            ⏳ <span className={styles.timer} ref={timerRef}>14:59</span> Còn Lại
          </div>
        </div>
      </div>
    </div>
  );
}
