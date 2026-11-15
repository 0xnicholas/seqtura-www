export const deliveryTimeoutMs = 5000;

export function timeoutReason(error: unknown): 'timeout' | 'delivery_error' {
  if (!error || typeof error !== 'object') return 'delivery_error';
  const record = error as { name?: unknown; code?: unknown };
  return record.name === 'TimeoutError' ||
    record.name === 'AbortError' ||
    record.code === 'ETIMEDOUT'
    ? 'timeout'
    : 'delivery_error';
}
