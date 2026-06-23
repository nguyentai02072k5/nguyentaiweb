import { LANDING_CSS } from './landing-styles';
import { LANDING_HTML } from './landing-markup';
import { LandingInteractions } from './landing-interactions';

/**
 * Landing marketing Mooly — pixel-match từ mooly-landing.html.
 *
 * Chiến lược fidelity 100%: CSS + markup giữ NGUYÊN VĂN (auto-generated từ HTML),
 * inject qua <style>/dangerouslySetInnerHTML → né mọi rủi ro convert HTML→JSX
 * (className, SVG camelCase, style object). Scope #mooly-lp tránh đụng globals.
 * Toàn bộ JS (8 khối) chạy trong LandingInteractions (client), attach theo ID.
 */
export default function LandingPage() {
  return (
    <>
      {/* Safety: gốc `body{overflow-x:hidden}` bị scope thành #mooly-lp → chốt thêm
          ở document-level chống scroll ngang mobile + nền trắng (landing bỏ ThemeProvider). */}
      <style dangerouslySetInnerHTML={{ __html: 'html,body{overflow-x:hidden;background:#fff}' }} />
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div id="mooly-lp" dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
      <LandingInteractions />
    </>
  );
}
