import { z } from 'zod';

export const contactLimits = {
  name: 40,
  company: 80,
  email: 254,
  needMin: 10,
  needMax: 2000,
  wechatPhone: 40,
  bodyBytes: 16 * 1024,
  minFillMs: 3000,
} as const;

export const contactMessages = {
  nameRequired: '请输入姓名。',
  nameTooLong: `姓名不超过 ${contactLimits.name} 个字符。`,
  companyRequired: '请输入公司名称。',
  companyTooLong: `公司名称不超过 ${contactLimits.company} 个字符。`,
  emailRequired: '请输入邮箱。',
  emailTooLong: `邮箱不超过 ${contactLimits.email} 个字符。`,
  emailInvalid: '请输入有效的邮箱地址。',
  needRequired: '请描述你的需求。',
  needTooShort: `需求描述至少 ${contactLimits.needMin} 个字符。`,
  needTooLong: `需求描述不超过 ${contactLimits.needMax} 个字符。`,
  wechatPhoneTooLong: `微信 / 电话不超过 ${contactLimits.wechatPhone} 个字符。`,
  consentRequired: '请阅读并同意隐私政策。',
  consentAtInvalid: '提交时间格式不正确。',
  privacyVersionRequired: '缺少隐私政策版本。',
  startedAtInvalid: '提交时间格式不正确。',
  submitFailed: '提交未成功，请重新提交。',
} as const;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: contactMessages.nameRequired })
    .max(contactLimits.name, { error: contactMessages.nameTooLong }),
  company: z
    .string()
    .trim()
    .min(1, { error: contactMessages.companyRequired })
    .max(contactLimits.company, { error: contactMessages.companyTooLong }),
  email: z
    .string()
    .trim()
    .min(1, { error: contactMessages.emailRequired })
    .max(contactLimits.email, { error: contactMessages.emailTooLong })
    .pipe(z.email({ error: contactMessages.emailInvalid })),
  need: z
    .string()
    .trim()
    .min(contactLimits.needMin, { error: contactMessages.needTooShort })
    .max(contactLimits.needMax, { error: contactMessages.needTooLong }),
  wechatPhone: z
    .string()
    .trim()
    .max(contactLimits.wechatPhone, { error: contactMessages.wechatPhoneTooLong })
    .optional()
    .transform((value) => value || undefined),
  consent: z.literal(true, { error: contactMessages.consentRequired }),
});

export const contactPayloadSchema = contactFormSchema.extend({
  consentAt: z.iso.datetime({ offset: true, error: contactMessages.consentAtInvalid }),
  privacyVersion: z
    .string()
    .trim()
    .min(1, { error: contactMessages.privacyVersionRequired })
    .max(32),
  website: z.string().optional(),
  startedAt: z
    .number({ error: contactMessages.startedAtInvalid })
    .refine((value) => Number.isFinite(value), { error: contactMessages.startedAtInvalid }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ContactPayload = z.infer<typeof contactPayloadSchema>;
export type ContactField = keyof ContactFormValues;

export const contactFields = [
  'name',
  'company',
  'email',
  'need',
  'wechatPhone',
  'consent',
] as const satisfies readonly ContactField[];

export function contactFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !fields[field]) fields[field] = issue.message;
  }
  return fields;
}
