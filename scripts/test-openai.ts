import { config as loadEnv } from 'dotenv';

import { generateItinerary } from '../src/services/openai-itinerary';
import { PlaceResult } from '../src/types/itinerary';

loadEnv({ path: '.env.local' });

const samplePlaces: PlaceResult[] = [
  {
    placeId: 'place-1',
    name: 'The Louvre',
    address: '75001 Paris, France',
    coordinates: { lat: 48.8606111, lng: 2.337644 },
    rating: 4.7,
    primaryType: 'art_museum'
  },
  {
    placeId: 'place-2',
    name: 'Eiffel Tower',
    address: 'Champ de Mars, 5 Av. Anatole France, Paris',
    coordinates: { lat: 48.8583701, lng: 2.2944813 },
    rating: 4.7,
    primaryType: 'historical_landmark'
  },
  {
    placeId: 'place-3',
    name: 'Musée d\'Orsay',
    address: '1 Rue de la Légion d\'Honneur, 75007 Paris, France',
    coordinates: { lat: 48.8600009, lng: 2.3266317 },
    rating: 4.7,
    primaryType: 'museum'
  },
  {
    placeId: 'place-4',
    name: 'Le Jules Verne',
    address: 'Avenue Gustave Eiffel, 75007 Paris, France',
    coordinates: { lat: 48.8582602, lng: 2.2945165 },
    rating: 4.5,
    primaryType: 'restaurant'
  },
  {
    placeId: 'place-5',
    name: 'Seine River Cruise',
    address: 'Port de la Conférence, Paris, France',
    coordinates: { lat: 48.862, lng: 2.313 },
    rating: 4.6,
    primaryType: 'tourist_attraction'
  },
  {
    placeId: 'place-6',
    name: 'Cafe de Flore',
    address: '172 Bd Saint-Germain, 75006 Paris, France',
    coordinates: { lat: 48.8556, lng: 2.3338 },
    rating: 4.4,
    primaryType: 'cafe'
  },
  {
    placeId: 'place-7',
    name: 'Luxembourg Gardens',
    address: '75006 Paris, France',
    coordinates: { lat: 48.8462, lng: 2.3371 },
    rating: 4.7,
    primaryType: 'park'
  },
  {
    placeId: 'place-8',
    name: 'Le Bristol Paris',
    address: '112 Rue du Faubourg Saint-Honoré, 75008 Paris, France',
    coordinates: { lat: 48.8719, lng: 2.3164 },
    rating: 4.8,
    primaryType: 'lodging'
  },
  {
    placeId: 'place-9',
    name: 'Notre-Dame Cathedral',
    address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France',
    coordinates: { lat: 48.853, lng: 2.3499 },
    rating: 4.7,
    primaryType: 'church'
  },
  {
    placeId: 'place-10',
    name: 'Marché des Enfants Rouges',
    address: '39 Rue de Bretagne, 75003 Paris, France',
    coordinates: { lat: 48.8625, lng: 2.3622 },
    rating: 4.4,
    primaryType: 'market'
  }
];

async function main() {
  const result = await generateItinerary(
    {
      destination: 'Paris, France',
      days: 2,
      travelerType: 'couple',
      budget: 'moderate',
      themes: ['history', 'food']
    },
    samplePlaces
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});