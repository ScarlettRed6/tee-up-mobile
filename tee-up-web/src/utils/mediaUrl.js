/**
 * Builds a usable image URL for <img src>. Cloudinary/Google URLs pass through.
 * Relative paths (e.g. /uploads/...) are prefixed with API origin from VITE_API_URL.
 */
export function resolveMediaUrl(url) {
  if (url == null || url === '') return undefined;
  const s = String(url).trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  if (s.startsWith('/')) return `${origin}${s}`;
  return s;
}
