export const EVENT_ID = "inauguracao";
export const EVENT_TARGET = Date.UTC(2026, 9, 2, 22, 0, 0);
export const MAPS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Rua+Amazonas%2C+430%2C+Centro%2C+S%C3%A3o+Caetano+do+Sul+-+SP%2C+09520-060";

export const BUBBLES = Array.from({ length: 14 }, (_, k) => ({
  left: `${(k * 7.3 + (k % 3) * 11) % 100}%`,
  size: `${6 + ((k * 5) % 16)}px`,
  dur: `${9 + ((k * 3) % 9)}s`,
  delay: `${-((k * 1.7) % 12)}s`,
}));

export type Utm = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_page: string | null;
};

export const EMPTY_UTM: Utm = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  referrer: null,
  landing_page: null,
};

export function readUtm(): Utm {
  const q = new URLSearchParams(window.location.search);
  return {
    utm_source: q.get("utm_source"),
    utm_medium: q.get("utm_medium"),
    utm_campaign: q.get("utm_campaign"),
    utm_content: q.get("utm_content"),
    utm_term: q.get("utm_term"),
    referrer: document.referrer || null,
    landing_page: window.location.href,
  };
}

export function track(event: string, data: Record<string, unknown> = {}) {
  const w = window as Window & {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, event_id: EVENT_ID, ...data });
  if (w.fbq && process.env.NEXT_PUBLIC_META_PIXEL_ID && typeof data.pixel === "string") {
    w.fbq("track", data.pixel);
  }
}
