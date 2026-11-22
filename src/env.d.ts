/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_PRIVACY_EMAIL?: string;
  readonly PUBLIC_FEISHU_URL?: string;
  readonly PUBLIC_FEISHU_QR?: string;
  readonly PUBLIC_WECOM_QR?: string;
  readonly PUBLIC_ICP_NUMBER?: string;
  readonly PUBLIC_PSB_NUMBER?: string;
  readonly PUBLIC_OPERATOR_NAME?: string;
  readonly PUBLIC_REGISTERED_ADDRESS?: string;
  readonly PUBLIC_SITE_DOMAIN?: string;
  readonly PUBLIC_LAUNCH_DATE?: string;
  readonly PUBLIC_LEGAL_UPDATED_AT?: string;
  readonly PUBLIC_EMAIL_PROVIDER?: string;
  readonly PUBLIC_HOSTING_PROVIDER?: string;
  readonly PUBLIC_HOSTING_LOCATION?: string;
  readonly PUBLIC_OPERATOR_LOCATION?: string;
  readonly PUBLIC_PRIVACY_VERSION?: string;
  readonly PUBLIC_SHOW_PLACEHOLDERS?: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
