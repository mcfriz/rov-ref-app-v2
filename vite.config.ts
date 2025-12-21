import { defineConfig } from "vite";

export default defineConfig(() => ({
  // Makes Vite work locally AND on GitHub Pages
  base: process.env.BASE_PATH ?? "/",
}));
