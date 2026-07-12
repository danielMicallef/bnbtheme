// @ts-check
import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: 'https://seaviewapartmentxlendi.com',
  base: '',
  integrations: [alpinejs(), sitemap()],

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  // The adapter bundles an older Wrangler parser that rejects ID-less KV
  // bindings during `astro dev`. Local development uses `.env` and does not
  // access Astro sessions, so skip the platform proxy while retaining the
  // production SESSION binding declared in wrangler.jsonc.
  adapter: cloudflare({
    platformProxy: { enabled: false },
  }),
});
