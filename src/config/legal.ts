import { placeholders } from './placeholders';

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (
    dateOnly &&
    (date.getUTCFullYear() !== Number(dateOnly[1]) ||
      date.getUTCMonth() !== Number(dateOnly[2]) - 1 ||
      date.getUTCDate() !== Number(dateOnly[3]))
  ) {
    return undefined;
  }
  return date;
}

const launchDate = parseDate(placeholders.launchDate.value);
const operatorName = placeholders.operatorName.value || 'Seqtura AI';
const hostingProvider = placeholders.hostingProvider.value || '站点托管服务商';
const emailProvider = placeholders.emailProvider.value
  ? `${placeholders.emailProvider.value}（境内）`
  : '境内企业邮箱 / 邮件服务';

export const legal = {
  privacyPath: '/legal/privacy',
  termsPath: '/legal/terms',
  privacyVersion: placeholders.privacyVersion.value,
  privacyEmail: placeholders.privacyEmail.value,
  contactEmail: placeholders.contactEmail.value,
  operatorName,
  registeredAddress: placeholders.registeredAddress.value,
  siteDomain: placeholders.siteDomain.value,
  emailProvider,
  hostingProviderLine: placeholders.hostingLocation.value
    ? `${hostingProvider}（${placeholders.hostingLocation.value}）`
    : hostingProvider,
  operatorLocation: placeholders.operatorLocation.value || '运营主体所在地',
  effectiveAt: launchDate,
  updatedAt: launchDate,
} as const;

export const missingLegalPlaceholders: readonly string[] = [
  !placeholders.operatorName.value && '运营主体名称',
  !placeholders.registeredAddress.value && '注册地址',
  !placeholders.siteDomain.value && '官网域名',
  !launchDate && '上线日期',
  !placeholders.emailProvider.value && '邮件服务商',
  !placeholders.hostingProvider.value && '托管服务商',
  !placeholders.hostingLocation.value && '托管所在地',
  !placeholders.operatorLocation.value && '运营主体所在地',
].filter((value): value is string => Boolean(value));

export const privacyConsentPath = legal.privacyPath;
export const privacyConsentVersion = legal.privacyVersion;
