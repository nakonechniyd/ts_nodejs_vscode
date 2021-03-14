import { HOST } from './consts';

export function getAbsoluteUrl(relative: string): string {
  return relative.startsWith('/') ? `${HOST}${relative}` : relative;
}
