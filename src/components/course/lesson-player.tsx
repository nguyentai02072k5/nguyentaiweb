'use client';

/**
 * lesson-player.tsx — Trình phát video khu học (RT-7).
 *
 * Load đầu: nhận `initialVideoUrl` (mint SERVER-SIDE ở page.tsx) → <video src>
 * có sẵn HTML đầu, KHÔNG waterfall on-mount (RT2-13).
 *
 * Refresh giữ vị trí (RT-7): khi timer trước hạn HOẶC video `onError` (403 hết
 * hạn), POST /api/course/video-url lấy URL mới → capture currentTime → set src →
 * chờ loadedmetadata → restore currentTime → resume-play. KHÔNG reset về 0.
 *
 * Phân biệt buffering vs 403: HTMLMediaElement bắn `waiting`/`stalled` khi
 * buffering (KHÔNG phải `error`) → chỉ `onError` mới kích refresh. Debounce 5s
 * chống storm khi error lặp.
 *
 * Playback R2: <video> không set crossOrigin → không lệ thuộc CORS để phát;
 * R2 hỗ trợ range request nên seek mượt (MP4 +faststart).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface LessonPlayerProps {
  initialVideoUrl: string | null;
  courseSlug: string;
  lessonSlug: string;
  title: string;
}

// TTL signed URL = 4h. Refresh chủ động ở ~3h30 để luôn còn hạn khi user xem lâu.
const REFRESH_BEFORE_EXPIRY_MS = 3.5 * 60 * 60 * 1000;
// Debounce refresh: bỏ qua nếu vừa refresh < 5s trước (chống onError storm).
const REFRESH_DEBOUNCE_MS = 5000;
// Cap số lần lỗi LIÊN TIẾP trước khi dừng auto-refresh (fail CỨNG: object R2 thiếu /
// videoKey sai / 403 dai dẳng). Reset khi phát lại được → fatal nhanh cho fail cứng.
const MAX_CONSECUTIVE_ERRORS = 3;
// Cap theo CỬA SỔ thời gian — chống FLAPPING (video bật↔rớt liên tục: mạng chập chờn,
// 403 giữa chừng). handleRecovered KHÔNG reset cap này → dù xen kẽ playing, refresh
// dồn > ngưỡng trong cửa sổ vẫn → fatal. Không có nó, cap-liên-tiếp bị recovered xoá
// giữa chừng = loop vô hạn ~1 refresh/5s (H-1).
const REFRESH_WINDOW_MS = 60_000;
const MAX_REFRESH_PER_WINDOW = 6;

export function LessonPlayer({
  initialVideoUrl,
  courseSlug,
  lessonSlug,
  title,
}: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(initialVideoUrl);
  const refreshingRef = useRef(false);
  const lastRefreshRef = useRef(0);
  // Đếm lỗi liên tiếp (không reset qua re-render → dùng ref). Vượt cap → fatal.
  const errorCountRef = useRef(0);
  // Mốc thời gian các lần refresh gần đây (cửa sổ) — cap flapping, KHÔNG bị recovered xoá.
  const refreshTimesRef = useRef<number[]>([]);
  const [fatal, setFatal] = useState(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_DEBOUNCE_MS) return;

    // Cap cửa sổ (H-1 flapping): đếm refresh trong REFRESH_WINDOW_MS gần nhất.
    // Recovered KHÔNG xoá mảng này → bật↔rớt liên tục vẫn dồn tới ngưỡng → fatal.
    refreshTimesRef.current = refreshTimesRef.current.filter(
      (t) => now - t < REFRESH_WINDOW_MS,
    );
    if (refreshTimesRef.current.length >= MAX_REFRESH_PER_WINDOW) {
      setFatal(true);
      toast.error('Video phát không ổn định. Vui lòng tải lại trang.');
      return;
    }
    refreshTimesRef.current.push(now);

    refreshingRef.current = true;
    // H1: đánh dấu MỌI lần THỬ (kể cả fail) để debounce chặn spam khi onError lặp
    // (src mới 403 / thiếu env R2). Không chỉ đánh dấu khi thành công.
    lastRefreshRef.current = now;

    const video = videoRef.current;
    const resumeTime = video?.currentTime ?? 0;
    const wasPlaying = video ? !video.paused && !video.ended : false;

    try {
      const res = await fetch('/api/course/video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, lessonSlug }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
        } else if (res.status === 429) {
          toast.error('Thao tác quá nhanh. Thử lại sau giây lát.');
        } else {
          toast.error('Không tải lại được video. Thử lại sau.');
        }
        return;
      }

      const data: { url?: string } = await res.json();
      if (!data?.url) return;

      // Restore vị trí + resume sau khi metadata của src mới sẵn sàng.
      // { once: true } → tự gỡ listener, không rò dù metadata bắn nhiều lần (M1).
      const el = videoRef.current;
      if (el) {
        el.addEventListener(
          'loadedmetadata',
          () => {
            try {
              el.currentTime = resumeTime;
            } catch {
              /* seek ngoài range — bỏ qua, phát từ đầu */
            }
            if (wasPlaying) el.play().catch(() => {});
          },
          { once: true },
        );
      }
      setSrc(data.url);
    } catch {
      toast.error('Lỗi mạng khi tải video.');
    } finally {
      refreshingRef.current = false;
    }
  }, [courseSlug, lessonSlug]);

  // Refresh chủ động trước hạn (RT-7). Guard `fatal` (M-1): không arm timer khi đã
  // dừng — tránh mint thừa mỗi 3.5h lúc tab mở lâu ở trạng thái lỗi.
  useEffect(() => {
    if (!src || fatal) return;
    const timer = setTimeout(() => {
      void refresh();
    }, REFRESH_BEFORE_EXPIRY_MS);
    return () => clearTimeout(timer);
  }, [src, fatal, refresh]);

  const handleError = useCallback(() => {
    const code = videoRef.current?.error?.code;
    // Bỏ qua ABORTED (code 1 — sinh ra do chính việc swap src khi refresh) và DECODE
    // (code 3 — lỗi codec, re-sign không cứu). Chỉ NETWORK (2) / SRC_NOT_SUPPORTED (4)
    // mới đáng refresh (403 hết hạn thường rơi vào 2/4).
    if (code === 1 || code === 3) return;

    errorCountRef.current += 1;
    // Cap chống loop: vượt ngưỡng lỗi LIÊN TIẾP → dừng auto-refresh, hiện UI fatal.
    // Không có cap → video hỏng vĩnh viễn (object thiếu / key sai) sẽ retry mãi mỗi 5s.
    if (errorCountRef.current > MAX_CONSECUTIVE_ERRORS) {
      setFatal(true);
      toast.error('Không phát được video sau nhiều lần thử. Vui lòng tải lại trang.');
      return;
    }
    void refresh();
  }, [refresh]);

  // Phát/nạp lại được → reset CHỈ bộ đếm lỗi liên tiếp (fail cứng). CỐ Ý không đụng
  // refreshTimesRef: flapping (playing↔error) vẫn phải dồn tới cap cửa sổ → fatal (H-1).
  const handleRecovered = useCallback(() => {
    errorCountRef.current = 0;
  }, []);

  // "Thử lại" thủ công từ fatal — reset toàn bộ counter + cửa sổ + bỏ debounce 1 lần.
  const handleManualRetry = useCallback(() => {
    errorCountRef.current = 0;
    refreshTimesRef.current = [];
    lastRefreshRef.current = 0;
    setFatal(false);
    void refresh();
  }, [refresh]);

  // Đổi bài: call site đặt key={lesson.slug} → LessonPlayer remount, useState
  // khởi tạo lại từ initialVideoUrl mới. Không cần effect sync (tránh cascading render).

  if (!src) {
    return (
      <StatusCard>
        Video chưa sẵn sàng. Kiểm tra cấu hình R2 (R2_ACCOUNT_ID / R2_BUCKET / key).
      </StatusCard>
    );
  }

  if (fatal) {
    return (
      <StatusCard>
        <p style={{ marginBottom: 14 }}>
          Không phát được video. Có thể do mạng hoặc phiên đăng nhập hết hạn.
        </p>
        <button
          type="button"
          onClick={handleManualRetry}
          className="c-btn c-btn-primary"
          style={{ padding: '9px 18px', fontSize: 'var(--fs-sm)' }}
        >
          Thử lại
        </button>
      </StatusCard>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      playsInline
      preload="metadata"
      onError={handleError}
      onLoadedData={handleRecovered}
      onPlaying={handleRecovered}
      aria-label={`Video bài học: ${title}`}
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        display: 'block',
        background: '#000',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
    />
  );
}

/** Card trạng thái non-video (chưa sẵn sàng / lỗi fatal) — DRY 2 nhánh. */
function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        aspectRatio: '16 / 9',
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--muted)',
        fontSize: 'var(--fs-sm)',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div>{children}</div>
    </div>
  );
}
