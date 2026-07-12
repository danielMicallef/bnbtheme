# Sunset Seaview Apartment

Astro 5 site for Sunset Seaview Apartment in Xlendi, deployed to Cloudflare Workers. Most pages are pre-rendered; only the availability API and Astro Actions execute on demand.

## Local development

```sh
bun install
cp .env.example .env
bun run dev
```

Run the production checks with:

```sh
bunx astro check
bun run build
```

## Availability and pricing

`GET /api/availability.json` merges blocked nights from the Airbnb and Booking.com iCal feeds. Configure `AIRBNB_ICAL_URL` and `BOOKING_ICAL_URL` as secrets. Keep the complete feed URLs private because they contain calendar tokens.

Pricing is deliberately swappable. `PRICING_JSON_URL` may point to JSON with this shape:

```json
{
  "defaultNightly": 85,
  "cleaningFee": 65,
  "minStay": 2,
  "prices": {
    "2026-08-14": 125
  }
}
```

Date-specific values override `defaultNightly`. If the pricing source is absent or unavailable, the API uses seasonal fallback rates so local development remains functional. If iCal feeds are absent, the calendar explicitly labels availability as sample data.

## Email requests

Contact, booking and transfer forms post to Astro Actions and send through Resend. They do not collect or charge payment. Configure `RESEND_API_KEY` and `CONTACT_EMAIL_TO` as Cloudflare secrets before deployment.

## Cloudflare deployment

The Cloudflare adapter uses the `SESSION` KV binding for Astro Actions. `wrangler.jsonc` declares it without an ID so Wrangler can provision it on deploy.

```sh
bunx wrangler secret put RESEND_API_KEY
bunx wrangler secret put CONTACT_EMAIL_TO
bunx wrangler secret put AIRBNB_ICAL_URL
bunx wrangler secret put BOOKING_ICAL_URL
bunx wrangler secret put PRICING_JSON_URL
bun run build
bunx wrangler deploy
```

`PRICING_JSON_URL` is optional. The two iCal feeds are strongly recommended before accepting booking requests.
