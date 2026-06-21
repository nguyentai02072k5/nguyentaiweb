// Template mẫu: kịch bản kết bạn → chào → chờ gần giờ hẹn (n8n) → bắn link Meet.

import type { FlowStep } from './flow-types';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'step-' + Math.random().toString(36).slice(2);

export function makeSampleSteps(): FlowStep[] {
  return [
    {
      id: uid(),
      type: 'send_friend_request',
      config: {
        message:
          'Xin chào sếp {{ten}}, em là trợ lý lịch hẹn bên mình. Kết bạn để em gửi link Meet nhé!',
      },
    },
    {
      id: uid(),
      type: 'send_message',
      config: {
        message:
          '<b><red>📨 À, em vừa gửi sếp lời mời kết bạn Zalo</red></b> — sếp <u><i>bấm accept</i></u> giúp em với nha. Để lúc gần tới giờ hẹn, hệ thống bên em sẽ <b><orange>tự động bắn link Meet</orange></b> qua Zalo cho sếp join thẳng luôn🔗\n\n🎯<b> <green>Để cho buổi Meet hiệu quả nhất,</green></b> sếp cho em hỏi xíu là — bên mình đang <b><orange>kinh doanh trong mảng nào</orange></b> vậy ạ?\n\nEm hỏi vậy để chuẩn bị <i>bot demo phù hợp với ngành của sếp</i> 💡\n\nEm chờ phản hồi của sếp nhé! 😊',
      },
    },
    {
      id: uid(),
      type: 'delay_webhook',
      config: {
        url: 'https://webhook.mooly.vn/zalo-delay',
        label: 'Chờ tới gần giờ hẹn (n8n giữ thời gian rồi callback)',
      },
    },
    {
      id: uid(),
      type: 'check_form',
      config: {
        source: '',
        messageFilled:
          'Sếp {{ten}} ơi, em nhận được thông tin của mình rồi nha, cảm ơn sếp nhiều 🙏 Sắp tới giờ hẹn rồi, đây là <b><green>link Meet</green></b> để sếp join thẳng: {{link_meet}}\n\nHẹn gặp sếp! 😊',
        messageNotFilled:
          'Sếp {{ten}} ơi, em <b><orange>chưa thấy thông tin form</orange></b> của mình ạ 🥺 Sếp điền nhanh giúp em để buổi demo đúng ngành của sếp nha. Sắp tới giờ rồi, link Meet đây ạ: {{link_meet}} 🔗',
      },
    },
  ];
}
