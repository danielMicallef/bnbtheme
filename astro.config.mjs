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

  adapter: cloudflare(),
});