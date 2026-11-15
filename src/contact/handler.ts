import { isOriginAllowed, isPayloadTooLarge, isSameOrigin, isSubmissionTooFast } from './anti-spam';
import { resolveFormMode } from './config';
import {
  failedNotifyResult,
  logDeliveryFailure,
  notifyConfigFromEnv,
  notifyLead,
  toContactLead,
} from './notify';
import { resolveRateLimiter, type RateLimiter } from './rate-limit';
import {
  contactFieldErrors,
  contactMessages,
  contactPayloadSchema,
  type ContactPayload,
} from './schema';

type ContactError =
  'validation' | 'origin' | 'payload_too_large' | 'rate_limited' | 'delivery_failed' | 'form_off';

type ContactResponseBody =
  | { ok: true }
  | { ok: false; error: Exclude<ContactError, 'validation'> }
  | { ok: false; error: 'validation'; fields: Record<string, string> };

export interface ContactRequestOptions {
  readonly clientAddress?: string;
  readonly env?: Record<string, string | undefined>;
}

let limiterCache:
  { readonly signature: string; readonly limiter: RateLimiter | undefined } | undefined;

function getRateLimiter(
  env: Record<string, string | undefined>,
  mode: 'live' | 'test' | 'off',
): RateLimiter | undefined {
  const signature = [mode, env.CONTACT_RATE_LIMIT_MAX, env.CONTACT_RATE_LIMIT_WINDOW_MS].join('|');
  if (limiterCache?.signature !== signature) {
    limiterCache = { signature, limiter: resolveRateLimiter(env, mode) };
  }
  return limiterCache.limiter;
}

function configuredEndpoint(env: Record<string, string | undefined>): string | undefined {
  return env.PUBLIC_CONTACT_ENDPOINT || import.meta.env.PUBLIC_CONTACT_ENDPOINT;
}

function corsHeaders(
  origin: string | null,
  request: Request,
  endpoint: string | undefined,
): Record<string, string> {
  if (!origin || isSameOrigin(origin, request)) return {};
  if (!isOriginAllowed(origin, request, endpoint)) return {};
  return { 'access-control-allow-origin': origin, vary: 'Origin' };
}

function jsonResponse(
  body: ContactResponseBody,
  status: number,
  requestId: string,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-content-type-options': 'nosniff',
      'x-request-id': requestId,
      ...headers,
    },
  });
}

function validationResponse(
  fields: Record<string, string>,
  requestId: string,
  headers: Record<string, string>,
): Response {
  return jsonResponse({ ok: false, error: 'validation', fields }, 400, requestId, headers);
}

function clientKey(request: Request, clientAddress: string | undefined): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return clientAddress ?? forwarded ?? 'unknown';
}

async function runDelivery(
  payload: ContactPayload,
  env: Record<string, string | undefined>,
  requestId: string,
): Promise<Response> {
  try {
    const result = await notifyLead(toContactLead(payload), notifyConfigFromEnv(env));
    if (result.ok) return jsonResponse({ ok: true }, 200, requestId);
    logDeliveryFailure(requestId, result);
  } catch {
    logDeliveryFailure(requestId, failedNotifyResult('delivery_error'));
  }
  return jsonResponse({ ok: false, error: 'delivery_failed' }, 502, requestId);
}

export async function handleContactRequest(
  request: Request,
  options: ContactRequestOptions = {},
): Promise<Response> {
  const env = options.env ?? process.env;
  const requestId = crypto.randomUUID();
  const origin = request.headers.get('origin');
  const endpoint = configuredEndpoint(env);
  const cors = corsHeaders(origin, request, endpoint);

  if (!isOriginAllowed(origin, request, endpoint)) {
    return jsonResponse({ ok: false, error: 'origin' }, 403, requestId);
  }

  const mode = resolveFormMode(env.FORM_MODE);
  if (mode === 'off') {
    return jsonResponse({ ok: false, error: 'form_off' }, 503, requestId, cors);
  }

  if (isPayloadTooLarge(request)) {
    return jsonResponse({ ok: false, error: 'payload_too_large' }, 413, requestId, cors);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return validationResponse({ form: contactMessages.submitFailed }, requestId, cors);
  }

  if (isPayloadTooLarge(request, rawBody)) {
    return jsonResponse({ ok: false, error: 'payload_too_large' }, 413, requestId, cors);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(rawBody);
  } catch {
    return validationResponse({ form: contactMessages.submitFailed }, requestId, cors);
  }

  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
    return validationResponse({ form: contactMessages.submitFailed }, requestId, cors);
  }

  const limiter = getRateLimiter(env, mode);
  if (limiter) {
    const decision = limiter.check(clientKey(request, options.clientAddress));
    if (!decision.allowed) {
      return jsonResponse({ ok: false, error: 'rate_limited' }, 429, requestId, {
        ...cors,
        'retry-after': String(decision.retryAfterSeconds ?? 3600),
      });
    }
  }

  const candidate = decoded as Record<string, unknown>;
  if (candidate.website !== undefined && candidate.website !== '') {
    return jsonResponse({ ok: true }, 200, requestId, cors);
  }

  const parsed = contactPayloadSchema.safeParse(candidate);
  if (!parsed.success) {
    return validationResponse(contactFieldErrors(parsed.error), requestId, cors);
  }

  if (isSubmissionTooFast(parsed.data.startedAt)) {
    return validationResponse({ form: contactMessages.submitFailed }, requestId, cors);
  }

  if (mode === 'test') {
    return jsonResponse({ ok: true }, 200, requestId, cors);
  }

  const response = await runDelivery(parsed.data, env, requestId);
  for (const [key, value] of Object.entries(cors)) response.headers.set(key, value);
  return response;
}

export function handleContactOptions(
  request: Request,
  options: ContactRequestOptions = {},
): Response {
  const env = options.env ?? process.env;
  const origin = request.headers.get('origin');
  const endpoint = configuredEndpoint(env);
  if (!isOriginAllowed(origin, request, endpoint)) {
    return new Response(null, { status: 403 });
  }

  const headers = new Headers({
    'cache-control': 'no-store',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    ...corsHeaders(origin, request, endpoint),
  });
  return new Response(null, { status: 204, headers });
}
