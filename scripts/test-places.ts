import { config as loadEnv } from 'dotenv';

import { fetchPlacesForTrip } from '../src/services/google-places';

loadEnv({ path: '.env.local' });

async function main() {
  const results = await fetchPlacesForTrip({
    destination: 'Paris',
    days: 2,
    travelerType: 'couple',
    budget: 'moderate',
    themes: ['history', 'food']
  });

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});