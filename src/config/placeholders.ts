const env = import.meta.env;

interface PlaceholderValue {
  readonly value: string;
  readonly isPlaceholder: boolean;
}

function envValue(key: keyof ImportMetaEnv, fallback: string): PlaceholderValue {
  const value = env[key]?.trim();
  return value ? { value, isPlaceholder: false } : { value: fallback, isPlaceholder: true };
}

export const placeholders = {
  contactEmail: envValue('PUBLIC_CONTACT_EMAIL', 'hello@seqtura.ai'),
  privacyEmail: envValue('PUBLIC_PRIVACY_EMAIL', 'privacy@seqtura.ai'),
  feishuUrl: envValue('PUBLIC_FEISHU_URL', ''),
  wecomQr: envValue('PUBLIC_WECOM_QR', ''),
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
