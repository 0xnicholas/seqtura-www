import { contactLimits } from './schema';

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function isPayloadTooLarge(request: Request, body?: string): boolean {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > contactLimits.bodyBytes) return true;
  return body !== undefined && byteLength(body) > contactLimits.bodyBytes;
}

export function isSameOrigin(origin: string, request: Request): boolean {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }
  if (origin === requestUrl.origin) return true;
  const host = request.headers.get('host');
  return Boolean(host && origin === `${requestUrl.protocol}//${host}`);
}

export function isOriginAllowed(
  origin: string | null,
  request: Request,
  configuredEndpoint?: string,
): boolean {
  if (!origin) return true;

  const allowed = new Set<string>();
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }
  allowed.add(requestUrl.origin);

  const host = request.headers.get('host');
  if (host) allowed.add(`${requestUrl.protocol}//${host}`);

  if (configuredEndpoint) {
    try {
      allowed.add(new URL(configuredEndpoint, requestUrl).origin);
    } catch {
      // A malformed public endpoint must not widen the allowlist.
    }
  }

  return allowed.has(origin);
}

export function isSubmissionTooFast(startedAt: number, now = Date.now()): boolean {
  return now - startedAt < contactLimits.minFillMs;
}
