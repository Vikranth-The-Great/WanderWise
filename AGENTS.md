# WanderWise - AI Travel Itinerary Planner

## Project Overview

| Property | Value |
|----------|-------|
| **Name** | Quick AI Itinerary / WanderWise |
| **Type** | Web Application (Next.js) |
| **Description** | AI-powered travel itinerary planner that generates personalized trip schedules based on user preferences |
| **Version** | 0.1.0 |
| **Target Users** | Travelers seeking personalized trip planning with AI assistance |

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript
- **Runtime**: React 19.1.0
- **UI Library**: React DOM 19.1.0

### Styling & Animation
- **CSS Framework**: Tailwind CSS 3.3.0
- **PostCSS**: 8.4.31
- **Animations**: Framer Motion 12.23.12
- **Icons**: Lucide React 0.541.0, React Icons 5.5.0

### Maps & Location Services
- **Maps**: Leaflet 1.9.4, React-Leaflet 5.0.0
- **Address Search**: @geoapify/leaflet-address-search-plugin 1.0.2
- **Geocoding**: Geoapify API

### Data & Storage
- **Database**: SQLite 5.1.1, better-sqlite3 12.2.0
- **CSV Parsing**: papaparse 5.5.3, csv-parse 6.1.0

### Authentication & Utilities
- **Auth**: Next-auth 4.24.11
- **HTTP Client**: Axios 1.12.2
- **Date Handling**: date-fns 4.1.0
- **Date Picker**: react-datepicker 8.7.0
- **Notifications**: react-hot-toast 2.6.0

### Development Tools
- **Linting**: ESLint 9
- **Type Checking**: TypeScript 5
- **E2E Testing**: Puppeteer 24.18.0

---

## Project Structure

```
WanderWise/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (home)
│   │   ├── layout.tsx          # Root layout
│   │   ├── get-started/        # Get started page
│   │   ├── quick-itinerary/    # Quick AI itinerary flow
│   │   ├── custom-planning/    # Custom planning flow
│   │   ├── generate-itinerary/ # Itinerary generation
│   │   ├── itinerary-results/  # Display generated itinerary
│   │   ├── traveler-type/      # Select traveler type
│   │   ├── travel-theme/       # Select travel themes
│   │   ├── budget/             # Budget selection
│   │   ├── category/           # Category selection
│   │   ├── manual-planning/    # Manual planning mode
│   │   ├── about/              # About page
│   │   ├── contact/            # Contact page
│   │   ├── blogs/              # Blog listing
│   │   ├── test-attractions/   # Test attractions page
│   │   └── favicon.ico
│   │
│   ├── services/               # Business logic services
│   │   ├── attraction-optimizer.ts    # Attraction optimization
│   │   ├── attractionOptimizer.ts    # Alternative optimizer
│   │   ├── restaurant-service.ts     # Restaurant data
│   │   ├── geoapify-service.ts       # Geoapify integration
│   │   └── geoapify.ts               # Alternative Geoapify
│   │
│   ├── lib/                    # Core utilities and libraries
│   │   ├── ai/
│   │   │   └── workflow.ts           # AI workflow execution
│   │   ├── scheduling/
│   │   │   ├── time-scheduler.ts     # Time slot scheduling
│   │   │   ├── meal-timing.ts        # Meal time logic
│   │   │   ├── schedule-formatter.ts # Format schedules
│   │   │   └── attraction-scheduler.ts # Attraction scheduling
│   │   ├── data/
│   │   │   ├── distance-calculator.ts # Calculate distances
│   │   │   └── csv-parser.ts         # CSV parsing utilities
│   │   ├── api/
│   │   │   └── geoapify.ts           # Geoapify API client
│   │   └── config/
│   │       └── env-validation.ts     # Environment validation
│   │
│   ├── utils/                  # Additional utilities
│   │   ├── ai-workflow.ts
│   │   ├── travelai-workflow.ts
│   │   ├── attraction-time-scheduler.ts
│   │   ├── schedule-formatter.js
│   │   └── geoapify-api.ts
│   │
│   └── components/             # Reusable React components
│
├── public/                     # Static assets
│   ├── images/
│   │   ├── backgrounds/        # Background images
│   │   ├── logo/              # Logo files
│   │   ├── traveler-types/    # Traveler type images
│   │   ├── team/              # Team member photos
│   │   └── partners/          # Partner logos
│   ├── icons/                 # SVG icons
│   └── *.jpg, *.svg           # Various images
│
├── data/                       # Data files
│   ├── attractions-database.csv    # Attractions data
│   └── pairwise-distances.csv      # Pre-calculated distances
│
├── Screenshots/               # Project screenshots
├── Preference Images/         # User preference images
├── package.json               # Dependencies
├── next.config.ts            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.js         # PostCSS configuration
├── eslint.config.mjs         # ESLint configuration
├── .env.local                # Local environment variables
├── .env                      # Environment template
└── .gitignore               # Git ignore rules
```

---

## Key Features

### 1. Quick AI Itinerary
One-click AI-generated itinerary based on destination and dates.
- Flow: Destination → Dates → Get Results

### 2. Custom Planning
Full customization of every trip detail.
- Flow: Destination → Dates → Traveler Type → Budget → Themes → Category → Generate

### 3. Multi-step Wizard
- **Get Started**: Initial landing for planning options
- **Destination Selection**: Choose travel destination
- **Date Selection**: Pick travel dates and duration
- **Traveler Type**: Solo, Couple, Friends, Family
- **Budget**: Cheap, Moderate, Luxury
- **Travel Themes**: Adventure, Beach, Historical, Nature, etc.
- **Category**: Attractions, Restaurants, Events, etc.

### 4. Itinerary Generation
- AI-powered schedule generation
- Day-by-day breakdown with:
  - Attractions (with times and durations)
  - Meals (Breakfast, Lunch, Dinner)
  - Accommodation
- Distance optimization between locations

### 5. Itinerary Display
- Interactive results page
- Day-by-day timeline view
- Activity details with descriptions

---

## User Flows

### Quick Itinerary Flow
```
Home → Quick Itinerary → Enter Destination & Dates → View Results
```

### Custom Planning Flow
```
Home → Custom Planning → Destination → Dates → Traveler Type → Budget → Themes → Category → Generate Itinerary → View Results
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Geoapify API (for maps and geocoding)
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Database (if using SQLite)
DATABASE_URL=path/to/database.sqlite
```

### Required API Keys
- **Geoapify API Key**: Required for map functionality, address search, and geocoding services. Get one free at https://www.geoapify.com/

---

## Coding Conventions

### TypeScript
- Use explicit TypeScript types for all function parameters and return types
- Prefer interfaces over types for object shapes
- Use `any` sparingly - always prefer specific types

### React Components
- Use functional components with hooks
- Use `'use client'` directive for client-side components
- Memoize expensive computations with `useMemo` and `useCallback`
- Use Framer Motion for animations (with `motion.` prefix)

### File Organization
- Place reusable components in `src/components/`
- Place page-specific components alongside pages or in subdirectories
- Keep services in `src/services/`
- Keep utilities in `src/utils/` or `src/lib/`

### Naming Conventions
- **Components**: PascalCase (e.g., `ItineraryCard.tsx`)
- **Utilities**: camelCase (e.g., `distance-calculator.ts`)
- **Types/Interfaces**: PascalCase (e.g., `UserPreferences`)
- **Constants**: SCREAMING_SNAKE_CASE

### CSS/Tailwind
- Use Tailwind utility classes for styling
- Use custom gradients: `bg-gradient-to-r from-X to-Y`
- Use Framer Motion for complex animations
- Follow mobile-first responsive design

---

## Data Schemas

### User Preferences
```typescript
interface UserPreferences {
  type_of_group: string;      // "solo" | "couple" | "friends" | "family"
  destination: string;
  age: number;
  budget: string;             // "cheap" | "moderate" | "luxury"
  themes: string[];          // ["adventure", "nature", "historical", ...]
  days: number;
}
```

### Attraction (CSV)
```csv
A_id,Attraction,Place,latitude,longitude,Description & Backstory,...
```

### Schedule Day
```typescript
interface ScheduleDay {
  day: number;
  breakfast: { time: string; name: string; description: string };
  lunch: { time: string; name: string; description: string };
  dinner: { time: string; name: string; description: string };
  attractions: Array<{
    id: string;
    name: string;
    time: string;
    duration: string;
    description: string;
    type: string;
    coordinates: { lat: number; lng: number };
  }>;
}
```

---

## API Endpoints

### Internal API Routes (Future)
- `POST /api/ranking` - Rank attractions based on preferences
- `POST /api/scheduling` - Generate daily schedule

### External APIs
- **Geoapify**: Maps, geocoding, address search
  - Base URL: `https://api.geoapify.com`
  - Authentication: API Key in query params

---

## Page Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, features, testimonials |
| `/get-started` | Get Started | Planning option selection |
| `/quick-itinerary` | Quick Itinerary | Fast AI itinerary generation |
| `/custom-planning` | Custom Planning | Detailed trip customization |
| `/generate-itinerary` | Generate | Generate final itinerary |
| `/itinerary-results` | Results | Display generated itinerary |
| `/traveler-type` | Traveler Type | Select who traveling with |
| `/travel-theme` | Travel Theme | Select travel interests |
| `/budget` | Budget | Select budget level |
| `/category` | Category | Select attraction categories |
| `/manual-planning` | Manual | Manual planning mode |
| `/about` | About | About the project |
| `/contact` | Contact | Contact information |
| `/blogs` | Blogs | Blog posts listing |

---

## Development Notes

### Mock Mode
The AI workflow (`src/lib/ai/workflow.ts`) currently runs in **mock mode**:
- Reads attractions from CSV file (`data/attractions-database.csv`)
- Filters by destination
- Generates mock schedule without external AI API calls
- Ready for future AI integration (OpenAI, Claude, etc.)

### CSV Data
- `data/attractions-database.csv`: Contains destination attractions with coordinates
- `data/pairwise-distances.csv`: Pre-calculated distances between attractions

### Maps Integration
- Uses Leaflet for interactive maps
- Geoapify for tile rendering and address search
- Custom markers for attractions and restaurants

---

## Troubleshooting

### Common Issues

1. **Geoapify API Key Missing**
   - Error: Map not loading or address search not working
   - Solution: Add valid Geoapify API key to `.env.local`

2. **CSV File Not Found**
   - Error: Itinerary generation fails
   - Solution: Ensure `data/attractions-database.csv` exists

3. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Ensure all dependencies are installed: `npm install`

---

## Future Enhancements

- [ ] Integrate real AI (OpenAI/Claude) for intelligent ranking
- [ ] Add user authentication with NextAuth
- [ ] Save itineraries to database
- [ ] Add more destinations to CSV
- [ ] Implement real restaurant recommendations
- [ ] Add weather integration
- [ ] Export itinerary to PDF
- [ ] Mobile app version
