import { SITE_URL, SITE_NAME } from './constants';

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function buildTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`;
}

export function buildDescription(description: string): string {
  return description.slice(0, 155);
}
