const env = import.meta.env;

interface PlaceholderValue {
  readonly value: string;
  readonly isPlaceholder: boolean;
}

function envValue(
  key: keyof ImportMetaEnv,
  fallback: string,
  fallbackIsPlaceholder = true,
): PlaceholderValue {
  const value = env[key]?.trim();
  return value
    ? { value, isPlaceholder: false }
    : { value: fallback, isPlaceholder: fallbackIsPlaceholder };
}

export const placeholders = {
  contactEmail: envValue('PUBLIC_CONTACT_EMAIL', 'hello@seqtura.ai'),
  privacyEmail: envValue('PUBLIC_PRIVACY_EMAIL', 'privacy@seqtura.ai'),
  // Public desktop entry: opening this link in a browser adds the contact
  // without scanning (verified on desktop Chrome). Defaults to the URL embedded
  // in public/feishu-qr.png — keep the two in sync when the QR is re-shot.
  feishuUrl: envValue(
    'PUBLIC_FEISHU_URL',
    'https://www.feishu.cn/invitation/page/add_contact/?token=1e2j28b8-c51b-4693-b3c6-95c0ddca7fac&unique_id=0ASq0ziZODi0WAl_nNQFKQ==',
    false,
  ),
  // Feishu falls back to a committed QR (public/feishu-qr.png) when no public
  // link is configured; set PUBLIC_FEISHU_QR to swap the image.
  feishuQr: envValue('PUBLIC_FEISHU_QR', '/feishu-qr.png', false),
  // Committed asset (public/wecom-qr.png), so the QR renders without extra
  // configuration; set PUBLIC_WECOM_QR to swap in a different image.
  wecomQr: envValue('PUBLIC_WECOM_QR', '/wecom-qr.png', false),
  icpNumber: { value: env.PUBLIC_ICP_NUMBER?.trim() ?? '', isPlaceholder: false },
  psbNumber: { value: env.PUBLIC_PSB_NUMBER?.trim() ?? '', isPlaceholder: false },
  operatorName: envValue('PUBLIC_OPERATOR_NAME', ''),
  registeredAddress: envValue('PUBLIC_REGISTERED_ADDRESS', ''),
  siteDomain: envValue('PUBLIC_SITE_DOMAIN', ''),
  launchDate: envValue('PUBLIC_LAUNCH_DATE', ''),
  legalUpdatedAt: envValue('PUBLIC_LEGAL_UPDATED_AT', ''),
  emailProvider: envValue('PUBLIC_EMAIL_PROVIDER', ''),
  hostingProvider: envValue('PUBLIC_HOSTING_PROVIDER', ''),
  hostingLocation: envValue('PUBLIC_HOSTING_LOCATION', ''),
  operatorLocation: envValue('PUBLIC_OPERATOR_LOCATION', ''),
  privacyVersion: envValue('PUBLIC_PRIVACY_VERSION', '1.0'),
} as const satisfies Record<string, PlaceholderValue>;

export type PlaceholderKey = keyof typeof placeholders;

export const showPlaceholderMarks = Boolean(env.DEV) || env.PUBLIC_SHOW_PLACEHOLDERS === 'true';
