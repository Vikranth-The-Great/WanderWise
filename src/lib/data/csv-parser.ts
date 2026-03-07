import fs from 'fs';
import path from 'path';

/**
 * Structure of a raw attraction record from the CSV file.
 */
export interface AttractionData {
  place: string;
  attraction: string;
  travelTheme: string;
  id: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  ratingCount: number;
  visitDurationMinutes: number;
  latitude: number;
  longitude: number;
}

/**
 * Structure for attraction opening hours derived from CSV data.
 */
export interface OpeningHoursData {
  attractionId: string;
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

/**
 * Parses the attractions CSV file from the data directory.
 * @returns Array of AttractionData objects.
 */
export function parseAttractionsCSV(): AttractionData[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
      const columns = line.split(',');

      return {
        place: columns[0],
        attraction: columns[1],
        travelTheme: columns[2],
        id: columns[3],
        openingTime: columns[4],
        closingTime: columns[5],
        rating: parseFloat(columns[6]),
        ratingCount: parseInt(columns[7]),
        visitDurationMinutes: parseInt(columns[8]),
        latitude: parseFloat(columns[9]),
        longitude: parseFloat(columns[10])
      };
    });
  } catch (error) {
    console.error('Error parsing attractions CSV:', error);
    return [];
  }
}

export function convertToAttractionFormat(csvData: AttractionData[]) {
  return csvData.map((item, index) => ({
    id: index + 1, // Convert to number
    name: item.attraction,
    rating: item.rating,
    ratingCount: item.ratingCount,
    visitDurationMinutes: item.visitDurationMinutes,
    latitude: item.latitude,
    longitude: item.longitude,
    categories: item.travelTheme.split(';').map(theme => theme.trim()),
    bestVisitWindows: [{ start: item.openingTime, end: item.closingTime }]
  }));
}

export function convertToOpeningHoursFormat(csvData: AttractionData[]): OpeningHoursData[] {
  return csvData.map(item => ({
    attractionId: item.id,
    monday: { open: item.openingTime, close: item.closingTime },
    tuesday: { open: item.openingTime, close: item.closingTime },
    wednesday: { open: item.openingTime, close: item.closingTime },
    thursday: { open: item.openingTime, close: item.closingTime },
    friday: { open: item.openingTime, close: item.closingTime },
    saturday: { open: item.openingTime, close: item.closingTime },
    sunday: { open: item.openingTime, close: item.closingTime }
  }));
}

export function getAttractionsByTheme(csvData: AttractionData[], themes: string[]): AttractionData[] {
  if (!themes || themes.length === 0) {
    return csvData;
  }

  return csvData.filter(attraction => {
    const attractionThemes = attraction.travelTheme.toLowerCase().split(';').map(t => t.trim());
    return themes.some(theme =>
      attractionThemes.some(aTheme =>
        aTheme.includes(theme.toLowerCase()) || theme.toLowerCase().includes(aTheme)
      )
    );
  });
}

export function getTopRatedAttractions(csvData: AttractionData[], limit: number = 20): AttractionData[] {
  return csvData
    .sort((a, b) => {
      // Sort by rating first, then by rating count
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.ratingCount - a.ratingCount;
    })
    .slice(0, limit);
}