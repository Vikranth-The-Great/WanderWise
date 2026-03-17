import { NextRequest, NextResponse } from 'next/server';
import { getAttractionImages } from '@/lib/api/pexels';

interface AttractionImagesRequest {
  destination?: string;
  attractions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AttractionImagesRequest;
    const destination = (body.destination || '').trim();
    const attractions = Array.isArray(body.attractions) ? body.attractions : [];

    const uniqueAttractions = [...new Set(attractions.map((name) => name.trim()).filter(Boolean))].slice(0, 60);

    if (uniqueAttractions.length === 0) {
      return NextResponse.json({ images: {} });
    }

    const images = await getAttractionImages(destination, uniqueAttractions);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Failed to fetch attraction images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attraction images', images: {} },
      { status: 500 }
    );
  }
}
