# 🏛️ World Civilizations Explorer

An interactive, richly detailed web application for exploring the history of world civilizations — from Ancient Egypt to the Ottoman Empire. Powered by live data from Wikipedia, Wikidata, museum APIs, and AI-generated content.

**Built with:** React · TypeScript · Vite · Tailwind CSS · Lovable Cloud · Framer Motion

---

## ✨ Features

### 🌍 Civilization Hub Pages (`/civilizations/:slug`)
- **Deep-dive pages** for each civilization with Wikipedia-sourced summaries, hero images, and metadata
- **AI-Generated Timelines** — 25–35 key historical events per civilization, generated via Lovable Cloud AI (Gemini 2.5 Flash) and cached in the database for instant reload
- **Key Figures** — portrait cards linking to individual figure pages, with data from Wikipedia
- **Topics & Culture** — related cultural, scientific, and religious topics with thumbnail previews
- **Gallery** — image grids from Wikimedia Commons
- **Museum Artifacts** — real artifacts from the Met Museum, Art Institute of Chicago, and Rijksmuseum
- **Primary Sources** — digitized documents and images from the Library of Congress
- **Modern Photography** — site photography from Unsplash

### 🗺️ Interactive World Map (`/map`)
- Pan-and-zoom world map with civilization markers using `react-simple-maps`
- **Era filtering** — filter by Ancient, Medieval, Modern, or custom time ranges
- **Time slider** — scrub through history to see which civilizations existed at a given point
- Detail panel on marker click with quick stats and links

### 📅 Timeline Page (`/timeline`)
- Vertical chronological timeline of all civilizations
- Filterable by era and region

### ⚖️ Civilization Comparison (`/compare`)
- Side-by-side comparison of two civilizations
- Compare key stats, timelines, figures, and cultural achievements

### 👤 Historical Figure Pages (`/figures/:slug`)
- Biographical data from Wikipedia and structured facts from Wikidata (birth/death dates, birthplace, occupation)
- Related civilizations, timelines, and topic cross-references
- Image gallery and museum artifact search

### 📖 Topic Pages (`/topics/:slug`)
- In-depth articles on cultural, scientific, and religious topics
- Cross-linked to related civilizations, figures, and timelines
- Gallery from Wikimedia Commons and museum artifacts

### 📰 This Week in History
- Daily historical events, births, and deaths on the homepage
- Tabbed interface (Events / Births / Deaths) with links to detailed event pages

### 🔍 Search (`/search`)
- Full-text search across civilizations, figures, and topics

### 🏛️ Museum Search (`/museums`)
- Search real museum collections across multiple institutions:
  - **Metropolitan Museum of Art** (The Met)
  - **Art Institute of Chicago**
  - **Rijksmuseum** (Amsterdam)

### 💬 AI Chat Widget
- Floating chat assistant available on every page
- Powered by **RAG (Retrieval-Augmented Generation)** — answers questions using embedded content from the app's knowledge base
- Streams responses in real-time with source attribution

### 📄 Additional Pages
- **Ask Page** (`/ask`) — dedicated Q&A interface
- **Era Pages** (`/era/:slug`) — browse civilizations by historical era
- **Figures Index** (`/figures`) — browse all historical figures
- **History Event Page** (`/history-event`) — detailed view for specific historical events
- **About** (`/about`), **Contact** (`/contact`), **Contribute** (`/contribute`)
- **Newsletter** (`/newsletter`) — subscription page
- **Data Sources** (`/sources`) — transparency page listing all APIs and data providers

---

## 🎨 Design System

- **Typography:** Playfair Display (display), DM Sans (headings), Source Serif 4 (body), JetBrains Mono (monospace)
- **Color palette:** Warm parchment backgrounds with deep navy primary, gold accents, and civilization-specific color keys
- **Animations:** Framer Motion scroll reveals, stagger containers, and hover transitions
- **Dark mode:** Full dark theme support with semantic HSL tokens
- **Responsive:** Mobile-first layout across all pages

---

## 🔌 Data Sources & APIs

| Source | Usage |
|---|---|
| **Wikipedia REST API** | Civilization summaries, figure bios, topic articles |
| **Wikidata SPARQL** | Structured facts (dates, locations, occupations) |
| **Wikimedia Commons** | Historical images and artwork |
| **Metropolitan Museum of Art API** | Artifact search and images |
| **Art Institute of Chicago API** | Artwork search and images |
| **Rijksmuseum API** | Dutch and world art collections |
| **Library of Congress API** | Primary source documents and images |
| **Unsplash API** | Modern site photography |
| **Lovable Cloud AI** | AI-generated timelines & RAG chat |

---

## ⚙️ Backend (Lovable Cloud)

### Database Tables
- **`civilization_timelines`** — cached AI-generated timeline events per civilization
- **`content_embeddings`** — embedded content chunks for RAG search (full-text + vector)

### Edge Functions
| Function | Purpose |
|---|---|
| `generate-timeline` | AI-generates 25–35 historical events for a civilization, caches in DB |
| `chat` | General AI chat |
| `rag-chat` | RAG-powered chat with source retrieval |
| `rag-search` | Full-text search over embedded content |
| `embed-content` | Embeds content for RAG indexing |
| `museum-search` | Proxied museum API search |
| `unsplash-proxy` | Proxied Unsplash image search |
| `api-ninjas-history` | Historical events API proxy |

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the dev server
npm run dev
```

---

## 🗂️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── ChatWidget    # AI chat overlay
│   ├── WorldMap      # Interactive map
│   ├── MuseumGallery # Museum artifact grid
│   ├── LOCGallery    # Library of Congress gallery
│   ├── SitePhotos    # Unsplash photography
│   └── ...
├── data/             # Static civilization data
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
├── services/         # API service modules
└── integrations/     # Lovable Cloud client & types

supabase/
├── functions/        # Edge functions (Deno)
└── config.toml       # Backend configuration
```

---

## 📜 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **State & Data:** TanStack React Query, React Router v6
- **Animations:** Framer Motion
- **Maps:** react-simple-maps
- **Charts:** Recharts
- **Backend:** Lovable Cloud (database, auth, edge functions, AI gateway)
- **Markdown:** react-markdown (for chat responses)

---

## 📝 License

This project is built with [Lovable](https://lovable.dev).
