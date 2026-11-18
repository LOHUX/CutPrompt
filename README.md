# CutPrompts ✂️

**Split long AI prompts into manageable parts.** Free, responsive and available in English and Vietnamese.

![CutPrompts social preview](./public/og-image.png)

CutPrompts is a browser-based prompt splitter maintained under **LOHUX** (lohux.dev). Use it with ChatGPT, Claude, Gemini, Llama, Mistral and other AI tools. Token counts are estimates; each provider can use different tokenizers and context limits.

## Features

- Split by estimated tokens, characters, paragraphs, sentences or custom delimiters.
- AI model presets, configurable chunk sizes and a split preview.
- Prompt templates, locally saved history and keyboard shortcuts.
- Batch process text and Markdown files; export TXT and JSON.
- Light/dark modes, responsive layouts and English/Vietnamese translations.
- Prompt text and its processing remain in the browser. Saved history and settings use browser storage.
- Ad-free experience, optional support via Ko-fi.
- An aggregate **visit count** with a Vercel API and persistent Redis storage when configured.

## Run locally

Requires an active Node.js LTS release and npm.

    npm ci
    npm run dev

Verify the app:

    npm run typecheck
    npm run lint
    npm test
    npm run build
    npm run test:e2e

Vite development/preview serves the frontend; the /api/visits function runs through a Vercel deployment or the Vercel local runtime. Without configured Redis credentials the counter displays an unavailable state rather than a fabricated number.

## Deploy to Vercel

1. Import [LOHUX/CutPrompts](https://github.com/LOHUX/CutPrompts) into Vercel. Use **npm run build** and output directory **dist**.
2. Configure an Upstash Redis database with a REST endpoint. Set **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** as *server-side* environment variables in Vercel. Never prefix credentials with VITE_ or commit them.
3. Set **VITE_PUBLIC_SITE_URL** to the confirmed new production HTTPS origin, without a path or trailing slash, **before the production build**. The build uses this value for canonical tags, the sitemap, robots.txt, OG URLs and public error pages. The source templates still contain the legacy `https://cutprompt.vercel.app` address as a build-time fallback. That address is no longer a verified deployment and must not be used for the new production site.
4. Deploy from the `main` branch and check the OG preview, canonical URL, sitemap, Ko-fi link, visit count and both language views on the deployed site.

The serverless [visits API](./api/visits.js) performs an atomic Redis operation to count one **visit per randomly generated 30-minute browser-tab session**, including refresh deduplication. These are sessions, not unique people or page views. No IP or prompt content is written to Redis by the function. If Redis is not configured or unavailable, the site shows “unavailable”. The counter does not provide anti-bot guarantees; you can add rate limits if abuse occurs. A database is not provisioned automatically.

The ?lang=vi and ?lang=en URLs initialize their respective translations. Existing settings key cutprompt-settings-v1 and previous CutPrompt batch JSON exports remain compatible.

## Privacy and licensing

The splitter processes prompt text locally and displays no ads. Ko-fi is an external donation site, and the visit counter uses a Vercel API with Redis when configured. See the in-app Privacy and Terms pages.

MIT License: see [LICENSE](LICENSE). Existing contributor rights and third-party attribution remain applicable.

## Links

- Repository: https://github.com/LOHUX/CutPrompts
- Donate: https://ko-fi.com/lohux
- Maintainer: **LOHUX / lohux.dev**
- Contact: **lohux.dev@gmail.com**

The Powered by Vercel badge is a hosting acknowledgment, not an endorsement.
