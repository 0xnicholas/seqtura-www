import nodemailer from 'nodemailer';
import type { ChannelResult, ContactLead, LeadProvider, NotifyConfig } from '../notify';
import { deliveryTimeoutMs, timeoutReason } from '../transport';

function smtpPort(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : undefined;
}

function messageBody(lead: ContactLead): string {
  return [
    `姓名：${lead.name}`,
    `公司：${lead.company}`,
    `邮箱：${lead.email}`,
    `微信 / 电话：${lead.wechatPhone ?? '未填写'}`,
    '',
    '需求描述：',
    lead.need,
    '',
    '同意记录：',
    `consent: ${lead.consent}`,
    `consentAt: ${lead.consentAt}`,
    `privacyVersion: ${lead.privacyVersion}`,
  ].join('\n');
}

export class EmailProvider implements LeadProvider {
  readonly channel = 'email' as const;

  constructor(private readonly config: NotifyConfig) {}

  async notify(lead: ContactLead): Promise<ChannelResult> {
    const provider = this.config.emailProvider?.trim().toLowerCase();
    if (!provider) {
      return { channel: 'email', ok: false, reason: 'not_configured' };
    }
    if (provider !== 'smtp') {
      return { channel: 'email', ok: false, reason: 'provider_not_available' };
    }

    const port = smtpPort(this.config.smtpPort);
    if (
      !this.config.smtpHost ||
      !port ||
      !this.config.contactToEmail ||
      !this.config.contactFromEmail
    ) {
      return { channel: 'email', ok: false, reason: 'not_configured' };
    }

    try {
      const transport = nodemailer.createTransport({
        host: this.config.smtpHost,
        port,
        secure: this.config.smtpSecure?.trim().toLowerCase() === 'true',
        auth: this.config.smtpUser
          ? { user: this.config.smtpUser, pass: this.config.smtpPass ?? '' }
          : undefined,
        connectionTimeout: deliveryTimeoutMs,
        greetingTimeout: deliveryTimeoutMs,
        socketTimeout: deliveryTimeoutMs,
      });

      try {
        const subject = `新预约：${lead.company} / ${lead.name}`.replace(/[\r\n]+/g, ' ');
        await transport.sendMail({
          from: this.config.contactFromEmail,
          to: this.config.contactToEmail,
          replyTo: lead.email,
          subject,
          text: messageBody(lead),
        });
        return { channel: 'email', ok: true };
      } finally {
        transport.close();
      }
    } catch (error) {
      return { channel: 'email', ok: false, reason: timeoutReason(error) };
    }
  }
}
