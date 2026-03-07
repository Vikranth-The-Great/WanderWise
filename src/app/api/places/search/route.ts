import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Cache the places to avoid reading CSV on every request
let cachedPlaces: Set<string> | null = null;

function getPlaces(): Set<string> {
  if (cachedPlaces) return cachedPlaces;

  try {
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    const places = new Set<string>();
    records.forEach((record: any) => {
      // Extract place names from "Place" or "Destination" columns
      const place = record.Place || record.destination || record.Destination;
      if (place) {
        places.add(place.trim());
      }
    });

    cachedPlaces = places;
    return places;
  } catch (error) {
    console.error('Error reading attractions database:', error);
    return new Set();
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const places = getPlaces();
  const lowerQuery = query.toLowerCase();

  const suggestions = Array.from(places)
    .filter(place => place.toLowerCase().includes(lowerQuery))
    .slice(0, 10) // Limit to 10 suggestions
    .sort((a, b) => {
      // Prioritize matches that start with the query
      const aStartsWith = a.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.toLowerCase().startsWith(lowerQuery);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.localeCompare(b);
    });

  return NextResponse.json({ suggestions });
}
