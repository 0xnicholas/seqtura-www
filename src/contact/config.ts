export type FormMode = 'live' | 'test' | 'off';

export function resolveFormMode(value: string | undefined): FormMode {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'live' || normalized === 'test' || normalized === 'off'
    ? normalized
    : 'off';
}
