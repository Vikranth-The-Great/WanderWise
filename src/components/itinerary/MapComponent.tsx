'use client';

import { Activity } from '@/app/itinerary-results/page';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function MapComponent({
    activities,
    selectedDay,
    apiKey
}: {
    activities: Activity[];
    selectedDay: number;
    apiKey: string;
}) {
    const activitiesWithCoordinates = activities.filter((activity) => activity.coordinates && activity.type !== 'transport');
    const firstActivity = activitiesWithCoordinates[0];

    if (!apiKey) {
        return (
            <div className="h-full w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Day {selectedDay} map preview</p>
                        <p className="text-sm text-slate-600">Google Maps key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local.</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                        0 stops
                    </span>
                </div>
            </div>
        );
    }

    if (!firstActivity?.coordinates) {
        return (
            <div className="h-full w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Day {selectedDay} map preview</p>
                        <p className="text-sm text-slate-600">No mappable stops are available for this day yet.</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                        0 stops
                    </span>
                </div>
            </div>
        );
    }

    const center = {
        lat: firstActivity.coordinates.lat,
        lng: firstActivity.coordinates.lng
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={center}
                    defaultZoom={12}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    mapId="wanderwise-itinerary-map"
                    style={{ width: '100%', height: '100%' }}
                >
                    {activitiesWithCoordinates.map((activity, index) => {
                        if (!activity.coordinates) {
                            return null;
                        }

                        return (
                            <Marker
                                key={`${activity.id}-${index}`}
                                position={{
                                    lat: activity.coordinates.lat,
                                    lng: activity.coordinates.lng
                                }}
                                label={`${index + 1}`}
                                title={`${activity.time} - ${activity.title}`}
                            />
                        );
                    })}
                </Map>
            </APIProvider>
        </div>
    );
}
