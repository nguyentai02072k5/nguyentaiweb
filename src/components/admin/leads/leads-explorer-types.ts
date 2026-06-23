/** leads-explorer-types.ts - Kiểu state lọc/sắp xếp/chế độ xem dùng chung CMS leads. */

export type StatusFilter =
  | 'all' | 'opened' | 'submitted' | 'contacted' | 'converted' | 'spam' | 'archived';

/**
 * Nhãn trạng thái hiển thị trong CMS. DB vẫn lưu 'submitted' (khách gửi form
 * = điền đủ mục bắt buộc), nhưng hiển thị 'Done' cho owner dễ đọc vòng đời lead.
 */
export const STATUS_LABELS: Record<string, string> = {
  opened: 'Đã mở',
  submitted: 'Done',
  contacted: 'Đã liên hệ',
  converted: 'Đã chốt',
  spam: 'Spam',
  archived: 'Lưu trữ',
};

export type TimeRange = 'all' | 'today' | '7d' | '30d';
export type SortOrder = 'newest' | 'oldest';
export type ViewMode = 'card' | 'list';

/** Nhóm nguồn lead - tách CMS list infor (wizard) vs form Mooly. */
export type SourceGroup = 'infor' | 'mooly';
