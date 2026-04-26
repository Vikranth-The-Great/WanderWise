'use client';

import { Activity } from '@/app/itinerary-results/page';
import MapComponent from './MapComponent';

interface DayMapProps {
    activities: Activity[];
    selectedDay: number;
    apiKey: string;
}

export default function DayMap({ activities, selectedDay, apiKey }: DayMapProps) {
    return (
        <div className="h-80 relative overflow-hidden rounded-xl">
            <div className="h-full">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Selected day {selectedDay}</p>
                        <p className="text-xs text-slate-500">{activities.length} itinerary stops prepared for the map view</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {apiKey ? 'Key detected' : 'Awaiting map key'}
                    </span>
                </div>

                <MapComponent activities={activities} selectedDay={selectedDay} apiKey={apiKey} />
            </div>
        </div>
    );
}
