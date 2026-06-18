import { clsx, type ClassValue } from 'clsx';
import { customAlphabet } from 'nanoid';
import getSymbolFromCurrency from 'currency-symbol-map';
import { twMerge } from 'tailwind-merge';
import * as crypto from 'crypto';

export function generateRandomKey(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function nameLetters(name: string) {
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return names.map((n) => n.charAt(0).toUpperCase()).join('');
}

export const secondsToDateTime = (secs: number) => {
  const t = new Date(+0);
  t.setSeconds(secs);

  return t;
};

export function generateId(length = 20) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const getCurrencySymbol = (currency?: string | null) => {
  const symbol = getSymbolFromCurrency(currency || 'USD');

  return symbol ? symbol : currency ? currency : 'USD';
};

export function formatPrice(value: number | string, precision = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(precision);
}

export function formatProviderAmount(amount: number, currency: string, provider: string) {
  const symbol = getCurrencySymbol(currency);
  if (provider === 'stripe') {
    return `${symbol}${formatPrice(amount / 100)}`;
  }
  return `${symbol}${formatPrice(amount)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export function downloadImage(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `image-${generateId(8)}.jpg`;
  a.click();
}

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: 'image/png' });
}
