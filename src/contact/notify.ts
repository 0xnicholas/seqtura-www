import { EmailProvider } from './providers/email';
import { FeishuProvider } from './providers/feishu';
import type { ContactPayload } from './schema';
import { deliveryTimeoutMs } from './transport';

export const notifyChannels = ['feishu', 'email'] as const;

export type NotifyChannel = (typeof notifyChannels)[number];
export type NotifyFailureReason =
  'not_configured' | 'provider_not_available' | 'timeout' | 'delivery_error';

export interface ContactLead {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly need: string;
  readonly wechatPhone?: string;
  readonly consent: true;
  readonly consentAt: string;
  readonly privacyVersion: string;
}

export interface ChannelResult {
  readonly channel: NotifyChannel;
  readonly ok: boolean;
  readonly status?: number;
  readonly reason?: NotifyFailureReason;
}

export interface NotifyResult {
  readonly ok: boolean;
  readonly channels: readonly ChannelResult[];
}

export interface NotifyConfig {
  readonly feishuWebhookUrl?: string;
  readonly feishuWebhookSecret?: string;
  readonly emailProvider?: string;
  readonly emailApiKey?: string;
  readonly smtpHost?: string;
  readonly smtpPort?: string;
  readonly smtpSecure?: string;
  readonly smtpUser?: string;
  readonly smtpPass?: string;
  readonly contactToEmail?: string;
  readonly contactFromEmail?: string;
}

export interface LeadProvider {
  readonly channel: NotifyChannel;
  notify(lead: ContactLead): Promise<ChannelResult>;
}

export function notifyConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): NotifyConfig {
  return {
    feishuWebhookUrl: env.FEISHU_WEBHOOK_URL,
    feishuWebhookSecret: env.FEISHU_WEBHOOK_SECRET,
    emailProvider: env.EMAIL_PROVIDER,
    emailApiKey: env.EMAIL_API_KEY,
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpSecure: env.SMTP_SECURE,
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    contactToEmail: env.CONTACT_TO_EMAIL,
    contactFromEmail: env.CONTACT_FROM_EMAIL,
  };
}

export function toContactLead(payload: ContactPayload): ContactLead {
  return {
    name: payload.name,
    company: payload.company,
    email: payload.email,
    need: payload.need,
    wechatPhone: payload.wechatPhone || undefined,
    consent: payload.consent,
    consentAt: payload.consentAt,
    privacyVersion: payload.privacyVersion,
  };
}

function runProvider(provider: LeadProvider, lead: ContactLead): Promise<ChannelResult> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ channel: provider.channel, ok: false, reason: 'timeout' });
    }, deliveryTimeoutMs);

    provider.notify(lead).then(
      (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ channel: provider.channel, ok: false, reason: 'delivery_error' });
      },
    );
  });
}

const providerFactories: Record<NotifyChannel, (config: NotifyConfig) => LeadProvider> = {
  feishu: (config) => new FeishuProvider(config),
  email: (config) => new EmailProvider(config),
};

export function failedNotifyResult(reason: NotifyFailureReason): NotifyResult {
  return {
    ok: false,
    channels: notifyChannels.map((channel) => ({ channel, ok: false, reason })),
  };
}

export async function notifyLead(
  lead: ContactLead,
  config: NotifyConfig = notifyConfigFromEnv(),
): Promise<NotifyResult> {
  const providers = notifyChannels.map((channel) => providerFactories[channel](config));
  const channels = await Promise.all(providers.map((provider) => runProvider(provider, lead)));

  return { ok: channels.some((channel) => channel.ok), channels };
}

export function logDeliveryFailure(requestId: string, result: NotifyResult): void {
  console.warn(
    JSON.stringify({
      event: 'contact.delivery_failed',
      requestId,
      status: 502,
      channels: result.channels.map(({ channel, ok, status, reason }) => ({
        channel,
        ok,
        status,
        reason,
      })),
    }),
  );
}
