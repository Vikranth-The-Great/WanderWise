# PLAN.md — WanderWise AI Engine Rebuild Execution Plan

> This is the master execution plan for rebuilding WanderWise's itinerary engine using OpenAI GPT-4o and Google Maps APIs.
> AI coding agents must follow this plan phase by phase, in order. Do not skip phases.
> All documents live in `docs/`.

---

## Project Goal

Replace the broken static/CSV-based itinerary pipeline with a live AI-powered system:
- **Google Maps Places API** supplies real attraction, restaurant, and hotel data
- **OpenAI GPT-4o** intelligently organizes that data into a structured itinerary
- The frontend displays the result as an interactive timeline + map

---

## Execution Rules for AI Agents

1. Complete each phase fully before moving to the next
2. Run the specified tests at the end of each phase before proceeding
3. If a phase fails its success criteria, fix it before advancing
4. Never hardcode API keys — always use `.env.local`
5. After generating this plan, present it to the user and wait for approval before implementing

---

## Phase Overview

| Phase | Name | Goal |
|-------|------|------|
| 1 | Environment Setup | Configure project, install dependencies, validate env vars |
| 2 | TypeScript Interfaces | Define all shared data types used across the system |
| 3 | Google Maps Places Service | Build the Places API wrapper and verify real data returns |
| 4 | OpenAI Itinerary Service | Build the GPT-4o prompt engine and verify structured JSON output |
| 5 | API Route Orchestration | Wire Google Maps + OpenAI into a single `/api/generate-itinerary` endpoint |
| 6 | Frontend Form Integration | Connect the existing user input form to the new API route |
| 7 | Itinerary Timeline UI | Display the AI-generated itinerary as a readable day-by-day timeline |
| 8 | Google Maps Display | Replace Leaflet with Google Maps and render activity markers |
| 9 | Error Handling & Edge Cases | Add graceful failures, loading states, and fallback messages |
| 10 | Cleanup & Final Validation | Remove dead code, run end-to-end test, confirm everything works |

---

## Phase 1 — Environment Setup

### Objective
Prepare the project with the correct dependencies and environment configuration.

### Tasks
- [ ] Create `.env.local` at project root with the following keys:
  ```
  OPENAI_API_KEY=<your-key>
  GOOGLE_MAPS_API_KEY=<your-key>
  ```
- [ ] Install required packages:
  ```bash
  npm install openai @vis.gl/react-google-maps
  ```
- [ ] Uninstall deprecated packages no longer needed for MVP:
  ```bash
  npm uninstall leaflet react-leaflet papaparse csv-parse better-sqlite3 next-auth
  ```
- [ ] Remove any Leaflet CSS imports from `layout.tsx` or global stylesheets
- [ ] Create the `docs/` directory and move `AGENTS.md` and `PLAN.md` into it
- [ ] Create `src/types/` directory for shared TypeScript interfaces
- [ ] Verify the dev server starts without errors: `npm run dev`

### Test
- Run `npm run dev` — server must start with no TypeScript or import errors
- Confirm `.env.local` is in `.gitignore`

### Success Criteria
- [ ] Dev server starts cleanly on `localhost:3000`
- [ ] No Leaflet-related errors in console
- [ ] `.env.local` exists with both API keys present

---

## Phase 2 — TypeScript Interfaces

### Objective
Define all shared data structures used across services and frontend components.

### Tasks
- [ ] Create `src/types/itinerary.ts` with the following interfaces:

```typescript
export interface UserTripPreferences {
  destination: string;
  days: number;
  travelerType: 'solo' | 'couple' | 'family' | 'friends';
  budget: 'cheap' | 'moderate' | 'luxury';
  themes: string[];
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  primaryType?: string;
}

export interface ItineraryActivity {
  time: string;
  type: 'attraction' | 'meal' | 'accommodation' | 'transport';
  name: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  placeId?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface GeneratedItinerary {
  destination: string;
  totalDays: number;
  itinerary: ItineraryDay[];
}
```

### Test
- Run `npx tsc --noEmit` — must pass with zero type errors

### Success Criteria
- [ ] `src/types/itinerary.ts` exists and exports all interfaces
- [ ] TypeScript compiler reports no errors

---

## Phase 3 — Google Maps Places Service

### Objective
Build a backend service that fetches real attractions, restaurants, and hotels from Google Maps Places API (New).

### Tasks
- [ ] Create `src/services/google-places.ts`
- [ ] Implement `searchPlaces(query: string): Promise<PlaceResult[]>`:
  - Calls `POST https://places.googleapis.com/v1/places:searchText`
  - Request header: `X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.primaryType`
  - Request body: `{ textQuery: query, languageCode: "en" }`
  - Returns normalized `PlaceResult[]`
- [ ] Implement `fetchPlacesForTrip(prefs: UserTripPreferences): Promise<PlaceResult[]>`:
  - Calls `searchPlaces` three times in parallel using `Promise.all`:
    - `"top tourist attractions in {destination}"`
    - `"best {budget} restaurants in {destination}"`
    - `"best {budget} hotels in {destination}"`
  - Merges and returns combined results (max 18 places total)

### Test
- Write a temporary test script `scripts/test-places.ts`:
  ```typescript
  import { fetchPlacesForTrip } from '../src/services/google-places';
  const results = await fetchPlacesForTrip({ destination: 'Paris', budget: 'moderate', ... });
  console.log(JSON.stringify(results, null, 2));
  ```
- Run: `npx ts-node scripts/test-places.ts`
- Confirm real place names, coordinates, and ratings are returned

### Success Criteria
- [ ] `fetchPlacesForTrip` returns at least 10 real places with valid lat/lng
- [ ] No hardcoded API keys in service file
- [ ] Function handles 0-result responses without crashing

---

## Phase 4 — OpenAI Itinerary Service

### Objective
Build the GPT-4o integration that converts user preferences + real place data into a structured itinerary JSON.

### Tasks
- [ ] Create `src/services/openai-itinerary.ts`
- [ ] Initialize OpenAI client: `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`
- [ ] Implement `generateItinerary(prefs: UserTripPreferences, places: PlaceResult[]): Promise<GeneratedItinerary>`:
  - Build system prompt (see AGENTS.md Section 8 for exact wording)
  - Build user message containing:
    - Serialized `prefs` object
    - Serialized `places[]` array
    - The exact JSON output schema expected
  - Call `client.chat.completions.create()` with:
    - `model: "gpt-4o"`
    - `response_format: { type: "json_object" }`
    - `max_tokens: 4000`
  - Parse response content as JSON
  - Validate it matches `GeneratedItinerary` shape before returning
  - Throw descriptive error if shape is invalid

### The Prompt Template
```
SYSTEM:
You are a professional travel planner. Given a list of real places and user preferences, 
create a logical day-by-day travel itinerary.

Rules:
- Each day starts between 8–9 AM and ends by 10 PM
- Include breakfast, lunch, and dinner at realistic meal times
- Select from the provided places list — do not invent places
- Sequence activities to minimize unnecessary travel
- Match recommendations to the user's budget level
- Output ONLY a valid JSON object matching the schema provided — no markdown, no explanation

USER MESSAGE:
Preferences: {serialized prefs}
Available Places: {serialized places array}
Required Output Schema: {serialized GeneratedItinerary schema}
```

### Test
- Write `scripts/test-openai.ts`:
  - Pass hardcoded sample preferences and 10 sample places
  - Log the parsed output
- Verify: JSON parses cleanly, `itinerary` array has correct number of days, each day has `activities`

### Success Criteria
- [ ] GPT-4o returns valid JSON on every test run
- [ ] Output matches `GeneratedItinerary` interface exactly
- [ ] No `any` types used in the service
- [ ] Error is thrown (not silently swallowed) if JSON parse fails

---

## Phase 5 — API Route Orchestration

### Objective
Create the single backend endpoint that orchestrates the full pipeline: receive user input → fetch places → generate itinerary → return JSON.

### Tasks
- [ ] Create `src/app/api/generate-itinerary/route.ts`
- [ ] Implement `POST` handler:
  ```typescript
  export async function POST(req: Request) {
    const prefs: UserTripPreferences = await req.json();
    // 1. Validate required fields
    // 2. Fetch places from Google Maps
    // 3. Generate itinerary via OpenAI
    // 4. Return JSON response
  }
  ```
- [ ] Input validation: return `400` with message if required fields are missing
- [ ] If Google Places fetch fails: return `502` with message `"Failed to fetch place data"`
- [ ] If OpenAI call fails: return `502` with message `"Failed to generate itinerary"`
- [ ] On success: return `200` with full `GeneratedItinerary` JSON

### Test
- Use `curl` or Postman to POST to `http://localhost:3000/api/generate-itinerary`:
  ```json
  {
    "destination": "Rome, Italy",
    "days": 2,
    "travelerType": "couple",
    "budget": "moderate",
    "themes": ["history", "food"]
  }
  ```
- Confirm response is valid `GeneratedItinerary` JSON

### Success Criteria
- [ ] `POST /api/generate-itinerary` returns `200` with full itinerary
- [ ] Missing fields return `400` with descriptive message
- [ ] API keys never appear in response or client-side code

---

## Phase 6 — Frontend Form Integration

### Objective
Connect the existing user input form (quick or custom flow) to the new API route.

### Tasks
- [ ] Locate the existing form submission handler in `src/app/quick-itinerary/` or the custom wizard
- [ ] Replace any existing generation logic with a `fetch` call to `/api/generate-itinerary`
- [ ] On form submit:
  - Set a `loading` state to `true`
  - POST user preferences to the API
  - On success: save response to state or `sessionStorage`, navigate to `/itinerary-results`
  - On error: display error message to user, set `loading` to `false`
- [ ] Show a loading indicator while waiting for AI response (simple spinner or "Generating your itinerary…" text)
- [ ] Pass the `GeneratedItinerary` data to the results page (via `sessionStorage` or route state)

### Test
- Fill the form with sample trip details and submit
- Confirm loading state appears
- Confirm navigation to results page occurs after response
- Confirm error message appears when using an invalid destination

### Success Criteria
- [ ] Form submits and loading state displays
- [ ] Successful response navigates to results page
- [ ] Error state is visible to user (not just console)
- [ ] No API keys exposed in network requests from client

---

## Phase 7 — Itinerary Timeline UI

### Objective
Display the AI-generated itinerary as a clear, readable day-by-day timeline.

### Tasks
- [ ] Update `src/app/itinerary-results/page.tsx` to consume `GeneratedItinerary` data
- [ ] For each `ItineraryDay`, render a day section with:
  - Day number and date as a header
  - Ordered list of activities
- [ ] For each `ItineraryActivity`, render:
  - Time (e.g., "09:00 AM")
  - Type icon or label (attraction / meal / hotel)
  - Name (bold)
  - Description (smaller text)
  - Address (muted text)
  - Rating if available (e.g., ⭐ 4.5)
- [ ] Keep styling minimal — Tailwind utility classes only, no new component libraries
- [ ] Add a "Plan Another Trip" button that navigates back to the form

### Test
- Load the results page with the data returned from Phase 5's curl test (paste into state directly)
- Visually verify all days render with correct activities

### Success Criteria
- [ ] All days and activities display correctly
- [ ] No TypeScript errors on the page
- [ ] Page is readable on both desktop and mobile

---

## Phase 8 — Google Maps Display

### Objective
Replace Leaflet with Google Maps and render numbered markers for each itinerary stop.

### Tasks
- [ ] Install `@vis.gl/react-google-maps` if not already done in Phase 1
- [ ] Create `src/components/ItineraryMap.tsx`:
  - Wraps `<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>` at the top
  - Renders `<Map>` centered on the destination's coordinates (use first activity's coordinates)
  - Renders a `<Marker>` for each activity that has valid coordinates
  - Each marker shows activity index number
- [ ] Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` (this key is safe to expose for Maps JS API — restrict it to your domain in Google Console)
- [ ] Render `<ItineraryMap>` on the results page alongside the timeline

### Test
- Load results page and confirm:
  - Map renders without errors
  - Markers appear at correct locations
  - Map centers on the destination city

### Success Criteria
- [ ] Google Map renders with all activity markers
- [ ] No Leaflet references remain in the codebase
- [ ] Map key is domain-restricted (documented in `docs/`)

---

## Phase 9 — Error Handling & Edge Cases

### Objective
Ensure the app handles all failure scenarios gracefully without crashing.

### Tasks
- [ ] Add try/catch to all API calls in the backend route
- [ ] Handle the case where Google Places returns 0 results (return 404 with "No places found for this destination")
- [ ] Handle OpenAI rate limit errors (429) — return user-friendly message
- [ ] Handle malformed OpenAI JSON response — log and retry once, then return error
- [ ] Frontend: if results page loads with no data (direct navigation), redirect back to form
- [ ] Frontend: add an error banner component for API failures
- [ ] Test with: empty destination, very obscure location, disconnected API key

### Test Scenarios
| Scenario | Expected Behavior |
|----------|------------------|
| Empty destination submitted | Form validation error before API call |
| Google Places returns 0 results | User sees "We couldn't find places for this destination" |
| OpenAI key invalid | User sees "AI service unavailable, please try again" |
| User navigates directly to /itinerary-results | Redirect to home page |
| Network timeout | Loading spinner stops, error message shown |

### Success Criteria
- [ ] No unhandled promise rejections in console
- [ ] All error states show a human-readable message to the user
- [ ] App never crashes on bad input or API failure

---

## Phase 10 — Cleanup & Final Validation

### Objective
Remove all legacy dead code, verify the full flow end-to-end, and confirm production readiness.

### Tasks
- [ ] Delete or archive files no longer used:
  - `src/lib/ai/workflow.ts` (old mock pipeline)
  - `src/lib/scheduling/` directory
  - `src/lib/data/csv-parser.ts`
  - `src/services/attraction-optimizer.ts`
  - `src/services/geoapify-service.ts`
  - `data/attractions-database.csv`
  - `data/pairwise-distances.csv`
- [ ] Run `npx tsc --noEmit` — must return zero errors
- [ ] Run `npm run build` — must complete successfully
- [ ] Run full end-to-end manual test:
  1. Open `localhost:3000`
  2. Fill in: "Kyoto, Japan", 2 days, solo, moderate, themes: history + food
  3. Submit form
  4. Confirm loading state appears
  5. Confirm itinerary results display with real places
  6. Confirm Google Map renders with markers
- [ ] Review all console output — no warnings about deprecated packages or missing modules
- [ ] Update `README.md` with new setup instructions (env vars, npm install, npm run dev)

### Final Test
- Complete end-to-end flow for 3 different destinations
- Confirm each generates a unique, logical itinerary
- Confirm map markers match the timeline activities

### Success Criteria
- [ ] `npm run build` passes with no errors
- [ ] Three different destinations all generate valid itineraries
- [ ] Map renders correctly for all tested destinations
- [ ] No legacy CSV or Leaflet code remains active in the codebase
- [ ] README reflects the new stack and setup steps

---

## Definition of Done

The rebuild is complete when:
1. A user can submit a trip form and receive a real AI-generated itinerary
2. The itinerary is built from real Google Maps places (not CSV data)
3. The places are organized intelligently by GPT-4o
4. The results display as a timeline and on a Google Map
5. The app handles errors without crashing
6. The build passes TypeScript checks and `npm run build`
