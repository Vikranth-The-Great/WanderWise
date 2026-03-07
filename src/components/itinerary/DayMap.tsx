'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity } from '@/app/itinerary-results/page';

// The actual Leaflet map must be dynamically imported to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-80 bg-gray-100 flex items-center justify-center rounded-xl animate-pulse">
            <div className="text-gray-500 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Map...
            </div>
        </div>
    )
});

interface DayMapProps {
    activities: Activity[];
    selectedDay: number;
    apiKey: string;
}

export default function DayMap({ activities, selectedDay, apiKey }: DayMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-80 bg-gray-100 flex items-center justify-center rounded-xl">
                <div className="text-gray-500 font-medium">Initializing Map...</div>
            </div>
        );
    }

    return (
        <div className="h-80 relative overflow-hidden rounded-xl">
            <MapComponent activities={activities} selectedDay={selectedDay} apiKey={apiKey} />
        </div>
    );
}
