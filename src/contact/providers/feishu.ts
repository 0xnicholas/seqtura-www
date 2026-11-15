import { createHmac } from 'node:crypto';
import type { ChannelResult, ContactLead, LeadProvider, NotifyConfig } from '../notify';
import { deliveryTimeoutMs, timeoutReason } from '../transport';

function cardFor(lead: ContactLead): Record<string, unknown> {
  const wechatPhone = lead.wechatPhone ?? '未填写';
  return {
    config: { wide_screen_mode: true },
    header: {
      template: 'red',
      title: { tag: 'plain_text', content: '新的预约线索' },
    },
    elements: [
      {
        tag: 'div',
        fields: [
          { is_short: true, text: { tag: 'lark_md', content: `**姓名**\n${lead.name}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**公司**\n${lead.company}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**邮箱**\n${lead.email}` } },
          { is_short: true, text: { tag: 'lark_md', content: `**微信 / 电话**\n${wechatPhone}` } },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'div',
        text: { tag: 'lark_md', content: `**需求描述**\n${lead.need}` },
      },
      { tag: 'hr' },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: [
            '**同意记录**',
            `consent: ${lead.consent}`,
            `consentAt: ${lead.consentAt}`,
            `privacyVersion: ${lead.privacyVersion}`,
          ].join('\n'),
        },
      },
    ],
  };
}

export class FeishuProvider implements LeadProvider {
  readonly channel = 'feishu' as const;

  constructor(private readonly config: NotifyConfig) {}

  async notify(lead: ContactLead): Promise<ChannelResult> {
    if (!this.config.feishuWebhookUrl) {
      return { channel: 'feishu', ok: false, reason: 'not_configured' };
    }

    try {
      const body: Record<string, unknown> = {
        msg_type: 'interactive',
        card: cardFor(lead),
      };

      if (this.config.feishuWebhookSecret) {
        const timestamp = Math.floor(Date.now() / 1000);
        const sign = createHmac('sha256', `${timestamp}\n${this.config.feishuWebhookSecret}`)
          .update('')
          .digest('base64');
        body.timestamp = timestamp;
        body.sign = sign;
      }

      const response = await fetch(this.config.feishuWebhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(deliveryTimeoutMs),
      });

      if (!response.ok) {
        return { channel: 'feishu', ok: false, status: response.status, reason: 'delivery_error' };
      }

      let accepted = true;
      try {
        const payload: unknown = await response.json();
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const record = payload as Record<string, unknown>;
          const code = record.code ?? record.StatusCode;
          if (code !== undefined && code !== 0 && code !== '0') accepted = false;
        }
      } catch {
        // A 2xx response without a JSON body is treated as accepted.
      }

      return accepted
        ? { channel: 'feishu', ok: true, status: response.status }
        : { channel: 'feishu', ok: false, status: response.status, reason: 'delivery_error' };
    } catch (error) {
      return { channel: 'feishu', ok: false, reason: timeoutReason(error) };
    }
  }
}
