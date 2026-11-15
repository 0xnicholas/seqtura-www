import type { APIRequestContext } from '@playwright/test';

export const defaultOrigin = `http://127.0.0.1:${Number(process.env.PORT ?? 4321)}`;

export const validPayload = (overrides: Record<string, unknown> = {}) => ({
  name: '张明',
  company: '序构测试制造有限公司',
  email: 'zhangming@example.com',
  need: '我们有一条客服工单流程，希望评估 Agent 是否适合接入，并给出第一步建议。',
  wechatPhone: '微信：zhangming-work',
  consent: true,
  consentAt: '2026-11-16T08:00:00.000Z',
  privacyVersion: '1.0',
  website: '',
  startedAt: Date.now() - 10_000,
  ...overrides,
});

export interface PostContactOptions {
  readonly baseURL?: string;
  readonly overrides?: Record<string, unknown>;
  readonly headers?: Record<string, string>;
}

export function postContact(request: APIRequestContext, options: PostContactOptions = {}) {
  return request.post(`${options.baseURL ?? ''}/api/contact`, {
    data: validPayload(options.overrides),
    headers: {
      origin: options.baseURL ?? defaultOrigin,
      'content-type': 'application/json',
      ...options.headers,
    },
  });
}
