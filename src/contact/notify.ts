import type { ContactPayload } from './schema';

export type NotifyChannel = 'feishu' | 'email';
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
  readonly emailProvider?: string;
  readonly emailApiKey?: string;
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
    emailProvider: env.EMAIL_PROVIDER,
    emailApiKey: env.EMAIL_API_KEY,
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
    wechatPhone: payload.wechatPhone,
    consent: payload.consent,
    consentAt: payload.consentAt,
    privacyVersion: payload.privacyVersion,
  };
}

export async function notifyLead(
  lead: ContactLead,
  config: NotifyConfig = notifyConfigFromEnv(),
): Promise<NotifyResult> {
  // Feishu and email providers implement LeadProvider and are wired in #23.
  const providers: readonly LeadProvider[] = [];
  const results = await Promise.all(providers.map((provider) => provider.notify(lead)));

  const channels: ChannelResult[] = (['feishu', 'email'] as const).map((channel) => {
    const delivered = results.find((result) => result.channel === channel);
    if (delivered) return delivered;

    const configured =
      channel === 'feishu' ? Boolean(config.feishuWebhookUrl) : Boolean(config.emailProvider);
    return {
      channel,
      ok: false,
      reason: configured ? 'provider_not_available' : 'not_configured',
    };
  });

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
