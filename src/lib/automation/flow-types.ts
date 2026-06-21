// Kiểu dữ liệu dùng chung cho flow automation (builder + lưu Supabase).
// Tương ứng schema worker (zalo-worker/src/flow-runner.js).

export type StepType =
  | 'send_friend_request'
  | 'send_message'
  | 'delay_webhook'
  | 'check_form';

export interface FlowStep {
  id: string;
  type: StepType;
  config: {
    message?: string; // send_friend_request | send_message (có tag format + {{biến}})
    url?: string; // delay_webhook: URL webhook n8n
    label?: string; // delay_webhook: nhãn mô tả (vd "chờ tới gần giờ hẹn")
    source?: string; // check_form: lọc nguồn lead ('' | 'mooly' | 'infor')
    messageFilled?: string; // check_form: tin gửi khi ĐÃ điền form
    messageNotFilled?: string; // check_form: tin gửi khi CHƯA điền form
  };
}

export interface AutomationFlow {
  id: string;
  name: string;
  enabled: boolean;
  trigger_source: string | null; // null = mọi nguồn; 'mooly' | 'infor'
  steps: FlowStep[];
  created_at?: string;
  updated_at?: string;
}

export const STEP_META: Record<StepType, { label: string; icon: string; hint: string }> = {
  send_friend_request: {
    label: 'Gửi lời mời kết bạn',
    icon: '🤝',
    hint: 'findUser theo SĐT rồi gửi lời mời kết bạn (nội dung sửa được).',
  },
  send_message: {
    label: 'Gửi tin nhắn',
    icon: '✉️',
    hint: 'Gửi tin nhắn có format (đậm/màu/...) và biến động.',
  },
  delay_webhook: {
    label: 'Hẹn giờ (chờ n8n)',
    icon: '⏰',
    hint: 'Gọi webhook n8n giữ thời gian; n8n callback để chạy tiếp.',
  },
  check_form: {
    label: 'Kiểm tra form đã điền',
    icon: '🔎',
    hint: 'Check lead theo SĐT; gửi tin tương ứng (đã điền / chưa điền).',
  },
};

// Biến động có thể chèn vào nội dung tin nhắn.
export const FLOW_VARIABLES: { key: string; label: string }[] = [
  { key: 'ten', label: 'Tên khách' },
  { key: 'sdt', label: 'Số điện thoại' },
  { key: 'link_meet', label: 'Link Meet' },
  { key: 'trang_thai', label: 'Trạng thái form (sau khi check)' },
];

export const TRIGGER_SOURCES: { value: string; label: string }[] = [
  { value: '', label: 'Mọi nguồn' },
  { value: 'mooly', label: 'Form Mooly' },
  { value: 'infor', label: 'Infor' },
];
