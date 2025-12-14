/**
 * Cookie utility functions for NextAuth session management
 */

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function setCookie(name: string, value: string, days: number = 30): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Use configured cookie domain if provided; otherwise default to current hostname.
  const configuredDomain = (import.meta as any)?.env?.VITE_COOKIE_DOMAIN as string | undefined;
  const domain = configuredDomain || window.location.hostname;
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=${domain};secure;samesite=lax`;
}

export function deleteCookie(name: string): void {
  const configuredDomain = (import.meta as any)?.env?.VITE_COOKIE_DOMAIN as string | undefined;
  const domain = configuredDomain || window.location.hostname;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain}`;
}

export function getAllCookies(): Record<string, string> {
  return document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}
