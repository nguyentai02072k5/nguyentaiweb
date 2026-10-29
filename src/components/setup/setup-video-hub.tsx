'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, Check, ExternalLink, Play } from 'lucide-react';
import {
  MOOLY_URL,
  SETUP_STAGES,
  SETUP_VIDEOS,
  ZALO_URL,
} from '@/lib/setup/setup-content';

const WATCHED_KEY = 'setup-watched-v1';
const WATCHED_EVENT = 'setup-watched-change';

/** Snapshot tiến độ dạng chuỗi JSON (so sánh theo giá trị cho useSyncExternalStore). */
function readWatchedRaw(): string {
  try {
    return localStorage.getItem(WATCHED_KEY) ?? '[]';
  } catch {
    return '[]'; // private mode / storage bị chặn → coi như chưa xem
  }
}

function subscribeWatched(onChange: () => void) {
  window.addEventListener(WATCHED_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(WATCHED_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function parseWatched(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveWatched(ids: string[]) {
  try {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(ids));
  } catch {
    /* không lưu được thì thôi, không ảnh hưởng xem video */
  }
  window.dispatchEvent(new Event(WATCHED_EVENT));
}

/** Gọi route ký URL; không đụng state để dùng được trong effect lẫn event handler. */
async function requestVideoUrl(
  id: string,
  signal?: AbortSignal,
): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch(`/api/setup/video-url?id=${id}`, { signal, cache: 'no-store' });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return { error: data.error ?? 'Không tải được video.' };
    return { url: data.url };
  } catch {
    return { error: 'Mất kết nối, kiểm tra mạng rồi bấm thử lại.' };
  }
}

/**
 * Lớp học video: player + danh sách 12 bài chia 3 chặng. Xem tự do, không đăng nhập.
 * Tiến độ lưu localStorage để khách quay lại thấy mình đã tới đâu.
 * URL video ký lazily qua /api/setup/video-url khi chọn bài (key R2 không xuống client).
 */
export function SetupVideoHub() {
  // Server render coi như chưa xem gì ('[]'); client đọc localStorage sau hydrate.
  const watchedRaw = useSyncExternalStore(subscribeWatched, readWatchedRaw, () => '[]');
  const watched = useMemo(() => parseWatched(watchedRaw), [watchedRaw]);

  // Bài do khách chọn; chưa chọn thì tự nhảy tới bài đầu tiên chưa xem.
  const [chosenId, setChosenId] = useState<string | null>(null);
  const activeId =
    chosenId ?? (SETUP_VIDEOS.find((v) => !watched.includes(v.id)) ?? SETUP_VIDEOS[0]).id;
  // Chỉ autoplay khi khách chủ động chọn/chuyển bài, không autoplay lần vào trang.
  const [autoplay, setAutoplay] = useState(false);

  // URL/lỗi gắn kèm id → đổi bài thì kết quả cũ tự vô hiệu, không cần reset trong effect.
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);
  const [failed, setFailed] = useState<{ id: string; message: string } | null>(null);
  const src = loaded?.id === activeId ? loaded.url : null;
  const error = failed?.id === activeId ? failed.message : null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const retriedRef = useRef(false);

  // Nạp URL ký cho `id`; kết quả ghi vào state qua .then (bất đồng bộ, theo id).
  const loadSrc = useCallback((id: string, signal?: AbortSignal) => {
    return requestVideoUrl(id, signal).then((result) => {
      if (signal?.aborted) return;
      if ('url' in result) setLoaded({ id, url: result.url });
      else setFailed({ id, message: result.error });
    });
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    retriedRef.current = false;
    void loadSrc(activeId, ctrl.signal);
    return () => ctrl.abort();
  }, [activeId, loadSrc]);

  const index = SETUP_VIDEOS.findIndex((v) => v.id === activeId);
  const active = SETUP_VIDEOS[index];
  const next = SETUP_VIDEOS[index + 1];
  const done = watched.length;
  const total = SETUP_VIDEOS.length;

  const select = (id: string, withAutoplay: boolean) => {
    setAutoplay(withAutoplay);
    setChosenId(id);
  };

  const markWatched = (id: string) => {
    if (!watched.includes(id)) saveWatched([...watched, id]);
  };

  const handleEnded = () => {
    markWatched(active.id);
    if (next) select(next.id, true);
  };

  const retry = () => {
    setFailed(null);
    void loadSrc(activeId);
  };

  // Link ký hết hạn giữa chừng (tab mở lâu) → xin link mới 1 lần rồi tiếp tục.
  const handleVideoError = () => {
    if (retriedRef.current) {
      setFailed({ id: activeId, message: 'Video bị gián đoạn, bấm thử lại.' });
      return;
    }
    retriedRef.current = true;
    const t = videoRef.current?.currentTime ?? 0;
    setAutoplay(true);
    void loadSrc(activeId).then(() => {
      if (videoRef.current && t > 0) videoRef.current.currentTime = t;
    });
  };

  return (
    <div className="sp-hub">
      <div className="sp-hub-head">
        <div>
          <h2 className="sp-h2">Xem và làm theo từng bước</h2>
          <p className="sp-sub">
            Mở Mooly ở tab bên cạnh, xem một video rồi làm ngay bước đó. Xong bài nào, bài đó được đánh dấu.
          </p>
        </div>
        <div className="sp-progress" aria-label={`Đã xem ${done} trên ${total} video`}>
          <span className="sp-progress-num">
            {done}/{total}
          </span>
          <span className="sp-progress-bar">
            <span style={{ width: `${(done / total) * 100}%` }} />
          </span>
        </div>
      </div>

      <div className="sp-hub-grid">
        <div className="sp-player-col">
          <div className="sp-player">
            {src ? (
              <video
                key={src}
                ref={videoRef}
                src={src}
                controls
                playsInline
                preload="metadata"
                autoPlay={autoplay}
                onEnded={handleEnded}
                onError={handleVideoError}
              />
            ) : (
              <div className="sp-player-state">
                {error ? (
                  <>
                    <p>{error}</p>
                    <button type="button" className="sp-btn sp-btn-ghost" onClick={retry}>
                      Thử lại
                    </button>
                  </>
                ) : (
                  <span className="sp-spinner" aria-label="Đang tải video" />
                )}
              </div>
            )}
          </div>

          <div className="sp-now">
            <p className="sp-eyebrow">
              Video {index + 1}/{total}
            </p>
            <h3 className="sp-now-title">{active.title}</h3>
            <p className="sp-now-outcome">Xem xong bạn sẽ: {active.outcome}</p>
            <div className="sp-now-actions">
              <a className="sp-btn sp-btn-primary" href={MOOLY_URL} target="_blank" rel="noopener noreferrer">
                Mở Mooly: {active.action}
                <ExternalLink size={16} aria-hidden />
              </a>
              {next ? (
                <button type="button" className="sp-btn sp-btn-ghost" onClick={() => { markWatched(active.id); select(next.id, true); }}>
                  Video tiếp theo
                  <ArrowRight size={16} aria-hidden />
                </button>
              ) : (
                <a className="sp-btn sp-btn-ghost" href="#goi-setup">
                  Xong rồi, xem gói Setup
                  <ArrowRight size={16} aria-hidden />
                </a>
              )}
            </div>
            <p className="sp-stuck">
              Làm tới đây bị vướng? <a href={ZALO_URL} target="_blank" rel="noopener noreferrer">Nhắn Zalo cho mình</a>, mình chỉ trực tiếp.
            </p>
          </div>
        </div>

        <nav className="sp-playlist" aria-label="Danh sách video">
          {SETUP_STAGES.map((stage) => (
            <div key={stage.id} className="sp-stage">
              <p className="sp-stage-title">{stage.title}</p>
              <p className="sp-stage-hint">{stage.hint}</p>
              <ol>
                {SETUP_VIDEOS.filter((v) => v.stage === stage.id).map((v) => {
                  const n = SETUP_VIDEOS.indexOf(v) + 1;
                  const isActive = v.id === activeId;
                  const isDone = watched.includes(v.id);
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        className={`sp-item${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => select(v.id, true)}
                      >
                        <span className="sp-item-ico" aria-hidden>
                          {isDone ? <Check size={14} /> : isActive ? <Play size={12} /> : n}
                        </span>
                        <span className="sp-item-title">{v.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </nav>
      </div>

      {done === total && (
        <div className="sp-finish">
          <p>
            Bạn đã xem hết {total} video. Muốn Bot chạy thật trong 3 ngày, có người làm cùng 1-1?
          </p>
          <a className="sp-btn sp-btn-primary" href="#goi-setup">
            Xem gói Setup
          </a>
        </div>
      )}
    </div>
  );
}
