# AGENTS.md — WanderWise AI Itinerary Engine Rebuild

> This document is the single source of truth for all AI coding agents working on the WanderWise rebuild.
> All planning documents live in the `docs/` directory.

---

## 1. Project Overview

WanderWise is an AI-powered travel itinerary generator. The current version relies on a static CSV database and mock AI logic, producing poor-quality, generic results.

This rebuild replaces the static pipeline entirely with:
- **OpenAI GPT-4o** — for intelligent, contextual itinerary generation
- **Google Maps Places API** — for real attraction data, photos, ratings, and coordinates
- **Google Maps JavaScript API** — for interactive map rendering

The goal is a fully working AI itinerary engine where a user inputs their trip details and receives a rich, realistic, day-by-day travel plan — backed by real places from Google Maps and structured intelligently by GPT-4o.

---

## 2. Business Requirements

### Core Features (MVP)
- User inputs: destination, number of days, traveler type, themes, budget level
- System calls Google Maps Places API to fetch real attractions, restaurants, and hotels
- System sends enriched data + user preferences to OpenAI GPT-4o
- GPT-4o returns a structured, day-by-day itinerary in JSON format
- Frontend displays the itinerary as a timeline with an interactive Google Map

### Constraints
- No reliance on the legacy CSV database for the new flow
- API keys must be stored in `.env.local` — never hardcoded
- The OpenAI call must use structured JSON output (response_format: json_object)
- Google Maps Places API (New) must be used — not the deprecated legacy Places API
- The system must handle API errors gracefully with user-facing messages
- No authentication required for MVP (remove NextAuth dependency for now)

---

## 3. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| AI Engine | OpenAI Node SDK (`openai` npm package) — GPT-4o |
| Places Data | Google Maps Places API (New) — REST |
| Map Display | Google Maps JavaScript API via `@vis.gl/react-google-maps` |
| HTTP Client | Native `fetch` (no axios) |
| Environment | `.env.local` for all secrets |

### Remove / Deprecate
- `papaparse`, `csv-parse` — no longer needed for core flow
- `better-sqlite3` — remove from MVP
- `next-auth` — remove for now
- Leaflet / React-Leaflet — replace with Google Maps

---

## 4. Environment Variables Required

```
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...
```

Both keys must be present for the app to function. The backend API routes will use both.

---

## 5. System Architecture

```
User Form Input
      │
      ▼
[Next.js API Route: /api/generate-itinerary]
      │
      ├─► Google Maps Places API (Text Search + Place Details)
      │     Returns: name, address, coordinates, rating, photos, type
      │
      ├─► Constructs enriched prompt with real places data
      │
      └─► OpenAI GPT-4o (JSON mode)
            Returns: structured day-by-day itinerary JSON
                  │
                  ▼
      [Frontend: Itinerary Results Page]
            │
            ├─► Timeline component (day-by-day activities)
            └─► Google Maps display (markers for each stop)
```

---

## 6. Key API Contracts

### Input to `/api/generate-itinerary` (POST)
```typescript
{
  destination: string;        // e.g. "Tokyo, Japan"
  days: number;               // e.g. 3
  travelerType: string;       // "solo" | "couple" | "family" | "friends"
  budget: string;             // "cheap" | "moderate" | "luxury"
  themes: string[];           // ["history", "food", "nature"]
}
```

### Output from `/api/generate-itinerary`
```typescript
{
  destination: string;
  totalDays: number;
  itinerary: Array<{
    day: number;
    date: string;
    activities: Array<{
      time: string;           // "09:00 AM"
      type: "attraction" | "meal" | "accommodation" | "transport";
      name: string;
      description: string;
      address: string;
      coordinates: { lat: number; lng: number };
      rating?: number;
      placeId?: string;
    }>;
  }>;
}
```

---

## 7. Implementation Strategy

### Step 1 — Google Maps Places Integration (Backend)
Create `src/services/google-places.ts`:
- Function: `searchPlaces(query: string, type: string, location: string)` — calls Places Text Search API
- Function: `getPlaceDetails(placeId: string)` — fetches coordinates, rating, address
- Returns normalized place objects ready for the AI prompt

### Step 2 — OpenAI Itinerary Generator (Backend)
Create `src/services/openai-itinerary.ts`:
- Accepts: user preferences + array of real places from Google
- Constructs a detailed system prompt instructing GPT-4o to:
  - Organize places into logical day-by-day sequences
  - Assign realistic time slots
  - Add meal stops between attractions
  - Output strict JSON matching the itinerary schema
- Uses `response_format: { type: "json_object" }` for reliable parsing

### Step 3 — API Route
Create `src/app/api/generate-itinerary/route.ts`:
- Orchestrates: fetch places → build prompt → call OpenAI → return JSON
- Handles errors at each stage

### Step 4 — Frontend Integration
Update `src/app/itinerary-results/page.tsx`:
- Consume the new API response format
- Render timeline using the `activities` array
- Pass coordinates to Google Maps component

### Step 5 — Google Maps Display
Create `src/components/ItineraryMap.tsx`:
- Uses `@vis.gl/react-google-maps`
- Renders numbered markers for each activity
- Draws polyline connecting stops in order

---

## 8. OpenAI Prompt Strategy

The system prompt must instruct GPT-4o clearly:

```
You are a professional travel planner. You will receive:
1. A list of real places with names, addresses, and ratings
2. User travel preferences

Your job is to create a logical, day-by-day itinerary by selecting and ordering these places.

Rules:
- Each day must start between 8–9 AM and end by 10 PM
- Include breakfast, lunch, and dinner slots
- Space activities with realistic travel time
- Match the budget level in recommendations
- Output ONLY valid JSON matching the provided schema — no extra text
```

---

## 9. Google Maps Places API — Fetch Strategy

For each trip, make these searches:
1. `tourist attractions in {destination}` — get top 10
2. `restaurants in {destination}` — get top 5 per budget level
3. `hotels in {destination} {budget}` — get top 3

Combine results into one `places[]` array and pass to OpenAI.

Use **Places API (New)** endpoint:
```
POST https://places.googleapis.com/v1/places:searchText
```
with header `X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.primaryType`

---

## 10. Coding Standards

- Keep all files under 200 lines where possible — split into smaller modules if needed
- No `any` types — define interfaces for all data structures
- All API calls must be server-side only (API routes) — never expose keys to the browser
- Use `async/await` — no `.then()` chains
- Error messages must be user-friendly strings, not raw error objects
- Frontend focus: functional over beautiful for MVP — clean layout, readable typography, no overengineering
- Do not add animation libraries or complex UI effects in MVP phase
- Store all working documents and notes in `docs/`

---

## 11. File Structure for New Code

```
src/
├── app/
│   ├── api/
│   │   └── generate-itinerary/
│   │       └── route.ts          ← Main orchestration route
│   └── itinerary-results/
│       └── page.tsx              ← Updated results page
├── services/
│   ├── google-places.ts          ← Google Maps Places API wrapper
│   └── openai-itinerary.ts       ← OpenAI prompt + call logic
├── components/
│   └── ItineraryMap.tsx          ← Google Maps display component
└── types/
    └── itinerary.ts              ← Shared TypeScript interfaces

docs/
├── AGENTS.md
├── PLAN.md
└── api-response-examples.md
```

---

## 12. What NOT to Do

- Do NOT use the legacy CSV database for the new AI flow
- Do NOT call Google Maps or OpenAI from client-side components
- Do NOT use `response_format` without validating the parsed JSON shape
- Do NOT skip error handling on API calls — both Google and OpenAI can fail
- Do NOT over-engineer the frontend — the priority is a working, reliable backend pipeline
- Do NOT use Leaflet — use Google Maps only
