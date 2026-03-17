interface PexelsPhotoSource {
  large?: string;
  large2x?: string;
  medium?: string;
  original?: string;
}

interface PexelsPhoto {
  src?: PexelsPhotoSource;
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[];
}

interface WikipediaSearchItem {
  title: string;
}

interface WikipediaSearchResponse {
  query?: {
    search?: WikipediaSearchItem[];
  };
}

interface WikipediaSummaryResponse {
  thumbnail?: {
    source?: string;
  };
  originalimage?: {
    source?: string;
  };
}

const imageCache = new Map<string, string | null>();
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';
let pexelsAuthDisabled = false;

function getBestImageUrl(photo?: PexelsPhoto): string | null {
  if (!photo?.src) return null;
  return photo.src.large2x || photo.src.large || photo.src.medium || photo.src.original || null;
}

async function searchImageForQuery(query: string): Promise<string | null> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  const cacheKey = trimmedQuery.toLowerCase();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) ?? null;
  }

  const apiKey = (process.env.PEXEL_KEY || process.env.PEXELS_KEY || process.env.PEXELS_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('PEXEL_KEY is missing. Attraction images will use fallback placeholders.');
    imageCache.set(cacheKey, null);
    return null;
  }

  if (pexelsAuthDisabled) {
    imageCache.set(cacheKey, null);
    return null;
  }

  try {
    const url = new URL(PEXELS_SEARCH_URL);
    url.searchParams.set('query', trimmedQuery);
    url.searchParams.set('per_page', '1');
    url.searchParams.set('orientation', 'landscape');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        pexelsAuthDisabled = true;
        console.warn('Pexels authorization failed (401/403). Falling back to alternative image source.');
      } else {
        console.warn(`Pexels lookup failed (${response.status}) for query: ${trimmedQuery}`);
      }
      imageCache.set(cacheKey, null);
      return null;
    }

    const data = (await response.json()) as PexelsSearchResponse;
    const imageUrl = getBestImageUrl(data.photos?.[0]);
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.warn(`Pexels lookup error for query: ${trimmedQuery}`, error);
    imageCache.set(cacheKey, null);
    return null;
  }
}

async function getWikipediaImageForQuery(query: string): Promise<string | null> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  try {
    const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
    searchUrl.searchParams.set('action', 'query');
    searchUrl.searchParams.set('list', 'search');
    searchUrl.searchParams.set('srsearch', trimmedQuery);
    searchUrl.searchParams.set('srlimit', '1');
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('utf8', '1');

    const searchResponse = await fetch(searchUrl.toString(), {
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!searchResponse.ok) return null;
    const searchData = (await searchResponse.json()) as WikipediaSearchResponse;
    const topTitle = searchData.query?.search?.[0]?.title;
    if (!topTitle) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`;
    const summaryResponse = await fetch(summaryUrl, {
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!summaryResponse.ok) return null;
    const summaryData = (await summaryResponse.json()) as WikipediaSummaryResponse;
    return summaryData.thumbnail?.source || summaryData.originalimage?.source || null;
  } catch {
    return null;
  }
}

export async function getAttractionImages(
  destination: string,
  attractionNames: string[]
): Promise<Record<string, string>> {
  const uniqueAttractions = [...new Set(attractionNames.map((name) => name.trim()).filter(Boolean))];
  const results: Record<string, string> = {};

  await Promise.all(
    uniqueAttractions.map(async (attractionName) => {
      const queries = [
        `${attractionName} ${destination}`.trim(),
        `${attractionName} travel`.trim(),
        attractionName
      ];

      for (const query of queries) {
        const imageUrl = await searchImageForQuery(query);
        if (imageUrl) {
          results[attractionName] = imageUrl;
          break;
        }
      }

      if (!results[attractionName]) {
        const wikiQueries = [
          `${attractionName} ${destination}`.trim(),
          attractionName
        ];

        for (const wikiQuery of wikiQueries) {
          const wikiImage = await getWikipediaImageForQuery(wikiQuery);
          if (wikiImage) {
            results[attractionName] = wikiImage;
            break;
          }
        }
      }
    })
  );

  return results;
}
