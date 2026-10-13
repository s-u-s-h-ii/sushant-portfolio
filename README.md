# Sushant Yadav portfolio (Astro)

Static Astro site. GSAP + ScrollTrigger and Lenis are bundled from npm and fonts come from @fontsource, so nothing loads from a CDN.

## Run
    npm install
    npm run dev        # http://localhost:4321
    npm run build      # outputs dist/
    npm run preview

## Deploy on Vercel
Import the repo (or run `vercel`). Vercel detects Astro automatically:
- Build command: `npm run build`
- Output directory: `dist`

Netlify and Cloudflare Pages work the same way.

## Where things are
- `src/pages/index.astro`    page markup
- `src/styles/global.css`    all styles and design tokens
- `src/scripts/main.js`      animations, canvases and interactions
- `src/layouts/Layout.astro` head, SEO tags, fonts
- `public/assets/`           static public assets
