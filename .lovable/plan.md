

# Cultural History Explorer — Phase 1 Plan

## Overview
Build the design system foundation and the Home/Civilization Explorer page with live data from free APIs and an AI-powered cultural assistant. This creates the "museum lobby" landing experience from your wireframes.

---

## 1. Design System Setup
- Implement your full color palette (light + dark mode) with warm parchment background (#FAF8F5), deep navy primary (#1A365D), cultural red accent (#C53030), warm gold (#B7791F)
- Add civilization accent colors (10 unique colors for each civ)
- Import Google Fonts: **Playfair Display** (hero headings), **DM Sans** (section headings, UI), **Source Serif 4** (body text)
- Set up typography scale, spacing tokens, border radius tokens per your wireframe spec
- Build reusable component tokens: Cards, Buttons (primary/secondary/ghost), Navigation bar (sticky, blurred), Source badges (Wikipedia, Met, Smithsonian, etc.)

## 2. Global Navigation Bar
- Sticky top nav with logo, Explore, Timeline, Map, AI Assistant links
- Global search bar with autocomplete placeholder
- Dark mode toggle
- Mobile hamburger menu (responsive)

## 3. Home / Civilization Explorer Page (Route: `/`)
- **Hero section**: Animated headline "Explore 10,000 Years of Human Civilization" with search bar and civilization quick-links
- **Civilization grid**: 10 cards (Ancient Egypt, Greece, Rome, China, India, Japan, Islamic Golden Age, Mesoamerican, Sub-Saharan Africa, American/Western Modern) with hero images, date ranges, regions, article counts
- **Card interactions**: Hover lift + shadow + gold border accent
- **Filter pills**: Filter by Region (Asia, Europe, Africa, Americas, Middle East) and Era (Ancient, Medieval, Modern)
- **"This Week in History" section**: Pulled live from a history API
- **Newsletter signup section**: Email input + subscribe button (frontend only, no backend)
- **Footer**: Logo, nav links, source badges, copyright

## 4. Live Data Integration
- **Wikipedia API**: Fetch civilization summaries and hero images for each civilization card (no API key needed)
- **Wikidata SPARQL**: Pull structured metadata — date ranges, regions, key figures count per civilization
- **History API** (Muffinlabs or similar): Fetch "This Week in History" events for the homepage section
- Create a data service layer with React Query for caching and loading states

## 5. AI Cultural Assistant
- **Floating chat button**: Bottom-right corner with pulsing glow animation (56px circle)
- **Slide-in chat panel**: 400px wide, full-height on desktop; full-screen overlay on mobile
- **Standalone page** at `/ask` with sidebar showing suggested questions and conversation history
- **Powered by Lovable AI** (via Supabase Edge Function): System prompt as a knowledgeable cultural historian
- **Suggested starter questions**: "How did the Silk Road influence trade?", "Compare Greek and Roman democracy", etc.
- **Streaming responses** with markdown rendering
- Requires enabling **Lovable Cloud** for the edge function + AI gateway

## 6. Responsive Design
- Desktop: 4-column civilization grid, side chat panel
- Tablet: 2-column grid
- Mobile: 1-column cards, hamburger nav, full-screen chat overlay
- Font sizes scale down ~15% on mobile per your spec

---

## Pages & Routes
| Route | Page |
|-------|------|
| `/` | Home / Civilization Explorer |
| `/ask` | AI Cultural Assistant (standalone) |

## Tech Notes
- React + Vite + Tailwind (current stack) — not Next.js, but we can build all the same UI
- Lovable Cloud for edge functions (AI chat)
- Free APIs: Wikipedia, Wikidata, Muffinlabs — no keys needed
- React Query for data fetching/caching

