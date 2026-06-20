/**
 * infor-landing-flow.tsx - Orchestrator đăng ký ở landing /infor (client).
 *
 * Luồng (rút gọn):
 *   1. Form cơ bản (Họ tên/SĐT/Email) → POST capture (trong InforBasicForm).
 *   2. Capture thành công → điều hướng cứng sang trang cảm ơn /thanks.
 *      Không hiển thị wizard cấu hình tại landing nữa; wizard vẫn được giữ ở
 *      route /infor/[phone] (link riêng theo SĐT).
 *
 * Form cơ bản được bọc trong BOX frame gradient aurora cho nổi bật.
 */

'use client';

import { useState } from 'react';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { trackMetaCustomEvent } from '@/lib/analytics/meta-pixel';
import { InforBasicForm } from './infor-basic-form';

export function InforLandingFlow() {
  const [redirecting, setRedirecting] = useState(false);

  const handleCaptured = () => {
    setRedirecting(true); // giữ trạng thái "đã nhận" trong lúc điều hướng
    pushToDataLayer({ event: 'infor_thanks_redirect' });
    trackMetaCustomEvent('InforThanksRedirect');
    // Host infor.* → '/thanks' (proxy rewrite về /infor/thanks); domain khác → '/infor/thanks'.
    const path = window.location.hostname.startsWith('infor.') ? '/thanks' : '/infor/thanks';
    window.location.assign(path);
  };

  return (
    <section id="dang-ky" className="mx-auto w-full max-w-xl scroll-mt-6 px-4 py-10">
      <header className="mb-5 text-center">
        <h2 className="text-text-primary font-display text-2xl font-bold capitalize tracking-tight sm:text-3xl">
          Đăng ký nhận chatbot
        </h2>
        <p className="text-text-secondary mt-1.5 text-sm">
          Để lại thông tin cơ bản, chúng tôi liên hệ và cấu hình bot cho bạn.
        </p>
      </header>

      {/* BOX nổi bật: frame gradient aurora động bao quanh ô nhập */}
      <div className="from-brand-indigo via-brand-violet to-brand-pink shadow-glow-violet animate-aurora rounded-3xl bg-gradient-to-br bg-[length:200%_200%] p-[2px]">
        <div className="rounded-[calc(1.5rem-2px)] bg-white/95 p-5 backdrop-blur sm:p-6">
          <InforBasicForm onCaptured={handleCaptured} done={redirecting} />
        </div>
      </div>

      <p className="text-text-tertiary mt-6 text-center text-[11px]">
        Thông tin của anh/chị được bảo mật và chỉ dùng để liên hệ hỗ trợ.
      </p>
    </section>
  );
}
