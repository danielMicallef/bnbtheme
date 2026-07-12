import type { APIRoute } from "astro";

export const prerender = false;

type RuntimeEnv = { AIRBNB_ICAL_URL?: string; BOOKING_ICAL_URL?: string; PRICING_JSON_URL?: string };
type PriceSource = { defaultNightly?: number; cleaningFee?: number; minStay?: number; prices?: Record<string, number> };

const iso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

function bookedDates(ical: string) {
  const booked = new Set<string>();
  for (const event of ical.replace(/\r?\n[ \t]/g, "").split("BEGIN:VEVENT").slice(1)) {
    const startRaw = event.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/)?.[1];
    const endRaw = event.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/)?.[1];
    if (!startRaw || !endRaw) continue;
    const parse = (value: string) => new Date(Date.UTC(+value.slice(0, 4), +value.slice(4, 6) - 1, +value.slice(6, 8)));
    for (let day = parse(startRaw), end = parse(endRaw); day < end; day = addDays(day, 1)) booked.add(iso(day));
  }
  return booked;
}

function seasonalPrice(date: Date) {
  const month = date.getUTCMonth() + 1;
  const weekend = date.getUTCDay() === 5 || date.getUTCDay() === 6;
  const base = month >= 7 && month <= 9 ? 110 : month === 6 || month === 10 ? 85 : 75;
  return base + (weekend ? 10 : 0);
}

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as unknown as { runtime?: { env?: RuntimeEnv } }).runtime?.env ?? {};
  const env = { ...runtime, AIRBNB_ICAL_URL: runtime.AIRBNB_ICAL_URL || import.meta.env.AIRBNB_ICAL_URL, BOOKING_ICAL_URL: runtime.BOOKING_ICAL_URL || import.meta.env.BOOKING_ICAL_URL, PRICING_JSON_URL: runtime.PRICING_JSON_URL || import.meta.env.PRICING_JSON_URL };
  const urls = [env.AIRBNB_ICAL_URL, env.BOOKING_ICAL_URL].filter(Boolean) as string[];
  const calendars = await Promise.all(urls.map(async (url) => { try { const response = await fetch(url, { cf: { cacheTtl: 900 } } as RequestInit); return response.ok ? response.text() : ""; } catch { return ""; } }));
  const booked = new Set(calendars.flatMap((calendar) => [...bookedDates(calendar)]));
  let pricing: PriceSource = {};
  if (env.PRICING_JSON_URL) { try { const response = await fetch(env.PRICING_JSON_URL, { cf: { cacheTtl: 900 } } as RequestInit); if (response.ok) pricing = await response.json(); } catch { /* use seasonal fallback */ } }
  const today = new Date();
  const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const last = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 18, 0));
  const days: Record<string, { available: boolean; price: number }> = {};
  for (let day = first; day <= last; day = addDays(day, 1)) {
    const key = iso(day);
    days[key] = { available: !booked.has(key), price: pricing.prices?.[key] ?? pricing.defaultNightly ?? seasonalPrice(day) };
  }
  return new Response(JSON.stringify({ updatedAt: new Date().toISOString(), liveSources: calendars.filter(Boolean).length, minStay: pricing.minStay ?? 2, cleaningFee: pricing.cleaningFee ?? 65, days }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" } });
};
