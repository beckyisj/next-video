# Next Video

Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase + Gemini 2.5 Flash AI (DeepSeek fallback).
Custom domain: nextvideo.youtubeproducer.app

## Frontend Design System

Follow the YouTube Producer design system: `~/.claude/projects/-Users-beckyisjwara/memory/youtube-producer-design.md`

**Brand**: Studio Clean — light mode, teal accent, Manrope, gradients for premium feel.
**Key rule**: Every YouTube Producer tool should feel like it belongs to the same family.

## Dev

- `npm run dev` → localhost:3000
- Env vars: YOUTUBE_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY

## Architecture

- 3-step API pipeline: analyze-channel → find-peers → generate-ideas
- Free tier: 3 generations, Pro: unlimited (shared $19/mo with Packager + Carousel)
- Supabase caching (nextvideo_cache table) for peers (7d) and videos (1d)
- playlistItems.list used instead of search.list for fetching channel videos (1 unit vs 100)
