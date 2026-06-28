import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// Static, mobile-first heirloom. No UI framework — Astro components + tiny TS islands.
// See 06_ENGINEERING_SPEC.md (static deployment, SVG-first, minimal initial JS).
export default defineConfig({
  site: 'https://prakhar-pranjali.example',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    resolve: {
      alias: {
        '@config': r('./src/config'),
        '@lib': r('./src/lib'),
        '@components': r('./src/components'),
        '@art': r('./src/components/art'),
        '@scenes': r('./src/components/scenes'),
        '@styles': r('./src/styles'),
        '@layouts': r('./src/layouts'),
      },
    },
    build: {
      cssCodeSplit: false,
    },
  },
});
