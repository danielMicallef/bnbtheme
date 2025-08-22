// @ts-check
import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://seaviewapartmentxlendi.com',
  base: '',
  integrations: [alpinejs()],

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});