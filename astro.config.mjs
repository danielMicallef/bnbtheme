// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://seaviewapartmentxlendi.com',
  base: '',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [alpinejs(), react()],
});