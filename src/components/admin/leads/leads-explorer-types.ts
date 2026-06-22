/** leads-explorer-types.ts - Kiểu state lọc/sắp xếp/chế độ xem dùng chung CMS leads. */

export type StatusFilter =
  | 'all' | 'opened' | 'submitted' | 'contacted' | 'converted' | 'spam' | 'archived';

export type TimeRange = 'all' | 'today' | '7d' | '30d';
export type SortOrder = 'newest' | 'oldest';
export type ViewMode = 'card' | 'list';

/** Nhóm nguồn lead - tách CMS list infor (wizard) vs form Mooly. */
export type SourceGroup = 'infor' | 'mooly';
