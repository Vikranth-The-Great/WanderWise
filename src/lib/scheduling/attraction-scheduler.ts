// Data Models
// --------------------------
export interface Attraction {
  id: number;
  name: string;
  rating: number;
  ratingCount: number;
  visitDurationMinutes: number;
  latitude: number;
  longitude: number;
  categories: string[];
  bestVisitWindows: { start: string; end: string }[];
}

export interface VisitPlan {
  attractionId: number;
  name: string;
  start: string;
  end: string;
}

export interface OpeningHours {
  attractionId: number;
  weekday: number;      // 0 = Monday ... 6 = Sunday
  openTime: string;     // "09:00"
  closeTime: string;    // "18:00"
  isClosed: boolean;
}

export interface DayWindow {
  date: Date;
  startTime: string;    // "09:00"
  endTime: string;      // "18:00"
}

// For scheduled results
export interface ScheduledAttraction {
  attraction: Attraction;
  startTime: Date;
  endTime: Date;
  travelFromPrevMinutes: number;
}

// -----------------------------
// Constants (comfort knobs)
// -----------------------------
const MIN_BUFFER = 15;          // minutes buffer between visits
const MAX_TRAVEL_MIN = 90;      // max travel minutes per day

// -----------------------------
// Utility Functions
// -----------------------------

// Parse "HH:MM" into minutes since midnight
/**
 * Converts a time string in "HH:MM" format to minutes from midnight.
 * @param t - Time string (e.g., "14:30").
 * @returns Minutes from midnight (e.g., 870).
 */
export function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Format minutes since midnight into "HH:MM"
/**
 * Converts minutes from midnight to a time string in "HH:MM" format.
 * @param m - Minutes from midnight.
 * @returns Time string (e.g., "14:30").
 */
export function formatTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const min = (m % 60).toString().padStart(2, "0");
  return `${h}:${min}`;
}

// Calculate distance between two points using Haversine formula
/**
 * Calculates the great-circle distance between two points on the Earth's surface.
 * @param lat1 - Latitude of point 1.
 * @param lon1 - Longitude of point 1.
 * @param lat2 - Latitude of point 2.
 * @param lon2 - Longitude of point 2.
 * @returns Distance in kilometers.
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Parse "HH:MM" into a Date object for a specific day (legacy function)
export function timeOnDate(baseDate: Date, timeString: string): Date {
  const [hh, mm] = timeString.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

// Check if attraction fits within opening hours and day window
/**
 * Checks if an attraction can be visited starting at the candidate time,
 * given its opening hours and duration.
 * 
 * @param attraction - The attraction to visit.
 * @param opening - The opening hours for the specific day.
 * @param candidateStart - The proposed start time.
 * @returns Object indicating feasibility and actual start/finish times.
 */
export function isFeasibleStart(
  attraction: Attraction,
  opening: OpeningHours,
  candidateStart: Date
): { feasible: boolean; start: Date; finish: Date } {
  if (opening.isClosed) return { feasible: false, start: candidateStart, finish: candidateStart };

  const openTime = timeOnDate(candidateStart, opening.openTime);
  const closeTime = timeOnDate(candidateStart, opening.closeTime);

  // adjust start if earlier than opening
  const start = candidateStart < openTime ? openTime : candidateStart;
  const finish = new Date(start.getTime() + attraction.visitDurationMinutes * 60000);

  if (finish <= closeTime) {
    return { feasible: true, start, finish };
  } else {
    return { feasible: false, start, finish };
  }
}

// Score attraction based on rating and rating count
/**
 * Calculates a score for an attraction based on its rating and rating count.
 * Uses a logarithmic scale for rating count to dampen the effect of very high counts.
 * @param a - The attraction to score.
 * @returns The calculated score.
 */
export function scoreAttraction(a: Attraction): number {
  return a.rating * Math.log(1 + a.ratingCount);
}

// Cluster attractions by proximity
/**
 * Groups attractions into clusters based on geographical proximity.
 * Uses a greedy approach: for each unvisited attraction, finds all neighbors within maxDistKm.
 * 
 * @param attractions - List of attractions to cluster.
 * @param maxDistKm - Maximum distance in km to consider an attraction part of the cluster (default: 3km).
 * @returns Array of attraction clusters (each cluster is an array of Attractions).
 */
export function clusterByProximity(attractions: Attraction[], maxDistKm = 3): Attraction[][] {
  const clusters: Attraction[][] = [];
  const visited = new Set<number>();

  for (let i = 0; i < attractions.length; i++) {
    if (visited.has(attractions[i].id)) continue;

    const cluster: Attraction[] = [attractions[i]];
    visited.add(attractions[i].id);

    for (let j = i + 1; j < attractions.length; j++) {
      if (visited.has(attractions[j].id)) continue;

      const d = haversine(
        attractions[i].latitude,
        attractions[i].longitude,
        attractions[j].latitude,
        attractions[j].longitude
      );

      if (d <= maxDistKm) {
        cluster.push(attractions[j]);
        visited.add(attractions[j].id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// Dummy travel time function (to be replaced with actual matrix lookup)
export function getTravelMinutes(fromId: number | null, _toId: number): number {
  if (fromId === null) {
    return 0; // starting from hotel/base point
  }
  // TODO: lookup from precomputed travel_time_matrix
  return Math.floor(Math.random() * 30) + 5; // fake 5–35 mins
}

// -----------------------------
// Scheduler for one day
// -----------------------------
/**
 * Schedules attractions for a single day.
 * Attempts to fit as many high-scoring attractions as possible into the day's time window,
 * respecting opening hours and travel times.
 * 
 * @param day - The time window for the day.
 * @param candidates - List of available attractions to schedule.
 * @param openingHours - Opening hours for all attractions.
 * @returns The generated schedule and set of used attraction IDs.
 */
export function scheduleDay(
  day: DayWindow,
  candidates: Attraction[],
  openingHours: OpeningHours[]
): { schedule: ScheduledAttraction[]; used: Set<number> } {
  const schedule: ScheduledAttraction[] = [];
  const used = new Set<number>();

  let currentTime = timeOnDate(day.date, day.startTime);
  const dayEnd = timeOnDate(day.date, day.endTime);
  let remainingTravel = MAX_TRAVEL_MIN;

  for (const attraction of candidates) {
    if (used.has(attraction.id)) continue;

    // Travel from last scheduled attraction (or base point if first)
    const lastId = schedule.length > 0 ? schedule[schedule.length - 1].attraction.id : null;
    const travelMinutes = getTravelMinutes(lastId, attraction.id);

    // Compute earliest start considering travel + buffer
    const earliestStart = new Date(currentTime.getTime() + (travelMinutes + MIN_BUFFER) * 60000);

    // Opening hours for this day
    // Convert JavaScript weekday (0=Sunday) to our format (0=Monday)
    const jsWeekday = day.date.getDay(); // 0=Sunday ... 6=Saturday
    const weekday = jsWeekday === 0 ? 6 : jsWeekday - 1; // 0=Monday ... 6=Sunday
    const opening = openingHours.find(
      (o) => o.attractionId === attraction.id && o.weekday === weekday
    );
    if (!opening) continue;

    // Check feasibility
    const { feasible, start, finish } = isFeasibleStart(attraction, opening, earliestStart);

    if (feasible && finish <= dayEnd && remainingTravel >= travelMinutes) {
      schedule.push({
        attraction,
        startTime: start,
        endTime: finish,
        travelFromPrevMinutes: travelMinutes,
      });

      used.add(attraction.id);
      currentTime = finish;
      remainingTravel -= travelMinutes;
    }
  }

  // TODO: local improvement step (swap, insert closer attractions)

  return { schedule, used };
}

// -----------------------------
// New Main Itinerary Builder
// -----------------------------
/**
 * Builds a multi-day itinerary by clustering attractions and scheduling them across days.
 * 
 * @param attractions - List of all available attractions.
 * @param numDays - Number of days to schedule.
 * @returns Array of daily plans (each plan is an array of VisitPlan items).
 */
export function buildItinerary(
  attractions: Attraction[],
  numDays: number
): VisitPlan[][] {
  // Sort attractions by score (rating * log(1 + ratingCount))
  const ranked = attractions
    .slice()
    .sort((a, b) => scoreAttraction(b) - scoreAttraction(a));

  // Group attractions by proximity
  const clusters = clusterByProximity(ranked);
  const days: VisitPlan[][] = [];
  let dayIndex = 0;

  for (const cluster of clusters) {
    if (!days[dayIndex]) days[dayIndex] = [];

    // Sort cluster by score and schedule attractions
    for (const a of cluster.sort((x, y) => scoreAttraction(y) - scoreAttraction(x))) {
      const window = a.bestVisitWindows[0];
      const start = parseTime(window.start);
      const end = start + a.visitDurationMinutes;

      days[dayIndex].push({
        attractionId: a.id,
        name: a.name,
        start: formatTime(start),
        end: formatTime(end),
      });
    }

    dayIndex = (dayIndex + 1) % numDays;
  }

  return days;
}

// -----------------------------
// Legacy Itinerary Builder (for backward compatibility)
// -----------------------------
export function buildItineraryLegacy(
  days: DayWindow[],
  attractions: Attraction[],
  openingHours: OpeningHours[]
): Record<string, ScheduledAttraction[]> {
  // Sort candidates by rating, then ratingCount
  let candidates = attractions.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.ratingCount - a.ratingCount;
  });

  const finalSchedule: Record<string, ScheduledAttraction[]> = {};

  for (const day of days) {
    const { schedule, used } = scheduleDay(day, candidates, openingHours);
    finalSchedule[day.date.toDateString()] = schedule;

    // Remove used attractions from candidate list
    candidates = candidates.filter((c) => !used.has(c.id));
  }

  return finalSchedule;
}

// -----------------------------
// Sample Data for Testing
// -----------------------------
export const sampleAttractions: Attraction[] = [
  {
    id: 1,
    name: "Lalbagh Botanical Garden",
    rating: 4.6,
    ratingCount: 12000,
    visitDurationMinutes: 120,
    latitude: 12.95,
    longitude: 77.59,
    categories: ["Nature", "Garden"],
    bestVisitWindows: [{ start: "06:00", end: "09:00" }],
  },
  {
    id: 2,
    name: "Cubbon Park",
    rating: 4.7,
    ratingCount: 15000,
    visitDurationMinutes: 90,
    latitude: 12.97,
    longitude: 77.6,
    categories: ["Park", "Nature"],
    bestVisitWindows: [{ start: "06:30", end: "10:00" }],
  },
  {
    id: 3,
    name: "Bangalore Palace",
    rating: 4.5,
    ratingCount: 8000,
    visitDurationMinutes: 90,
    latitude: 12.9987,
    longitude: 77.592,
    categories: ["Historical", "Architecture"],
    bestVisitWindows: [{ start: "09:00", end: "17:00" }],
  },
  {
    id: 4,
    name: "ISKCON Temple",
    rating: 4.8,
    ratingCount: 10000,
    visitDurationMinutes: 60,
    latitude: 12.981175,
    longitude: 77.591481,
    categories: ["Religious", "Spiritual"],
    bestVisitWindows: [{ start: "06:00", end: "20:00" }],
  },
  {
    id: 5,
    name: "Commercial Street",
    rating: 4.2,
    ratingCount: 5000,
    visitDurationMinutes: 120,
    latitude: 12.9819,
    longitude: 77.6171,
    categories: ["Shopping", "Culture"],
    bestVisitWindows: [{ start: "10:00", end: "21:00" }],
  },
];

export const sampleOpeningHours: OpeningHours[] = [
  // Old Fort - closed on Mondays (weekday 0)
  { attractionId: 1, weekday: 0, openTime: "09:00", closeTime: "18:00", isClosed: true },
  { attractionId: 1, weekday: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { attractionId: 1, weekday: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { attractionId: 1, weekday: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { attractionId: 1, weekday: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { attractionId: 1, weekday: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
  { attractionId: 1, weekday: 6, openTime: "09:00", closeTime: "18:00", isClosed: false },

  // City Museum - closed on Sundays (weekday 6)
  { attractionId: 2, weekday: 0, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 1, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 2, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 3, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 4, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 5, openTime: "10:00", closeTime: "17:00", isClosed: false },
  { attractionId: 2, weekday: 6, openTime: "10:00", closeTime: "17:00", isClosed: true },

  // Botanical Garden - open daily
  { attractionId: 3, weekday: 0, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 1, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 2, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 3, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 4, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 5, openTime: "08:00", closeTime: "19:00", isClosed: false },
  { attractionId: 3, weekday: 6, openTime: "08:00", closeTime: "19:00", isClosed: false },

  // Art Gallery - closed on Tuesdays (weekday 1)
  { attractionId: 4, weekday: 0, openTime: "11:00", closeTime: "18:00", isClosed: false },
  { attractionId: 4, weekday: 1, openTime: "11:00", closeTime: "18:00", isClosed: true },
  { attractionId: 4, weekday: 2, openTime: "11:00", closeTime: "18:00", isClosed: false },
  { attractionId: 4, weekday: 3, openTime: "11:00", closeTime: "18:00", isClosed: false },
  { attractionId: 4, weekday: 4, openTime: "11:00", closeTime: "18:00", isClosed: false },
  { attractionId: 4, weekday: 5, openTime: "11:00", closeTime: "18:00", isClosed: false },
  { attractionId: 4, weekday: 6, openTime: "11:00", closeTime: "18:00", isClosed: false },

  // Historic Temple - open daily
  { attractionId: 5, weekday: 0, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 1, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 2, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 3, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 4, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 5, openTime: "06:00", closeTime: "20:00", isClosed: false },
  { attractionId: 5, weekday: 6, openTime: "06:00", closeTime: "20:00", isClosed: false },
];