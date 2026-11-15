export type FormMode = 'live' | 'test' | 'off';

export function resolveFormMode(value: string | undefined): FormMode {
  return value === 'live' || value === 'off' ? value : 'test';
}
