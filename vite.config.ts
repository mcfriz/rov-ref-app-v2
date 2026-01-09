import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(() => {
  const base = process.env.BASE_PATH ?? "/";
  const fromRoot = (path: string) => resolve(rootDir, path);

  return {
    // Keeps local dev and GitHub Pages in sync
    base,
    build: {
      rollupOptions: {
        // Multi-page build: include dashboard and all mini-app HTML entry points
        input: {
          main: fromRoot("index.html"),
          about: fromRoot("apps/about.html"),
          fittingFinder: fromRoot("apps/fitting-finder.html"),
          rovCheatsheet: fromRoot("apps/rov-cheatsheet.html"),
          rovPod: fromRoot("apps/rov-pod.html"),
          cableList: fromRoot("apps/cable-list.html"),
          contact: fromRoot("apps/contact.html"),
          manualFinder: fromRoot("apps/manual-finder.html"),
          procedures: fromRoot("apps/procedures.html"),
          t4Torque: fromRoot("apps/t4-torque.html"),
          t4SlaveArmDrawing: fromRoot("apps/t4-slave-arm-drawing.html"),
          t4PartsFinder: fromRoot("apps/t4-parts-finder.html"),
          atlasPartsFinder: fromRoot("apps/atlas-parts-finder.html"),
          t4Videos: fromRoot("apps/t4-videos.html"),
          globalSearch: fromRoot("apps/search.html"),
          welcome: fromRoot("apps/welcome.html"),
        },
      },
    },
  };
});
