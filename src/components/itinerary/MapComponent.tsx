'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity } from '@/app/itinerary-results/page';

// Fix Leaflet's default icon path issues with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A component to recenter the map when activities change
function MapRecenter({ coordinates }: { coordinates: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            // Give a little padding so markers don't hit the edge
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [coordinates, map]);
    return null;
}

export default function MapComponent({
    activities,
    selectedDay,
    apiKey
}: {
    activities: Activity[];
    selectedDay: number;
    apiKey: string;
}) {
    // Filter activities to only include those with coordinates
    const markers = useMemo(() => {
        return activities
            .filter((a) => a.coordinates && a.type !== 'transport');
    }, [activities]);

    const coordinates: [number, number][] = useMemo(() => {
        return markers
            .map((m) => m.coordinates)
            .filter((c): c is NonNullable<typeof c> => c !== undefined && c !== null)
            .map((c) => [c.lat, c.lng]);
    }, [markers]);

    // Give a default center if no coordinates (e.g., Paris default)
    const center: [number, number] = coordinates.length > 0 ? coordinates[0] : [48.8566, 2.3522];

    // Helper to generate the numbered icon HTML
    const createCustomIcon = (index: number, type: string, dayColors: string[]) => {
        let bg = '#6b7280'; // gray-500 default
        if (type === 'meal') bg = '#ef4444'; // red-500
        if (type === 'attraction') bg = '#a855f7'; // purple-500
        if (type === 'accommodation') bg = '#22c55e'; // green-500

        // We can also use day color for the border just to tie it together
        const borderColor = dayColors[(selectedDay - 1) % dayColors.length];

        const html = `
      <div style="
        background-color: ${bg};
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 2px solid white;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        position: relative;
        z-index: 10;
      ">
        ${index + 1}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${bg};
        margin: -2px auto 0 auto;
        position: relative;
        z-index: 1;
      "></div>
    `;

        return L.divIcon({
            html,
            className: 'custom-div-icon',
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40]
        });
    };

    const dayColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316'];
    const routeColor = dayColors[(selectedDay - 1) % dayColors.length];

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Powered by <a href="https://www.geoapify.com/">Geoapify</a>'
                url={apiKey ? `https://maps.geoapify.com/v1/tile/osm-liberty/{z}/{x}/{y}.png?apiKey=${apiKey}` : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />

            {coordinates.length > 0 && <MapRecenter coordinates={coordinates} />}

            {/* Route Line */}
            {coordinates.length > 1 && (
                <Polyline
                    positions={coordinates}
                    pathOptions={{ color: routeColor, weight: 4, dashArray: '10, 5' }}
                />
            )}

            {/* Markers */}
            {markers.map((activity, index) => {
                if (!activity.coordinates) return null;
                return (
                    <Marker
                        key={`${activity.id}-${index}`}
                        position={[activity.coordinates.lat, activity.coordinates.lng]}
                        icon={createCustomIcon(index, activity.type, dayColors)}
                    >
                        <Popup>
                            <div className="font-semibold text-gray-800 text-sm">{activity.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{activity.time} • {activity.duration}</div>
                            <div className="text-xs text-gray-400 mt-1">{activity.type}</div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
