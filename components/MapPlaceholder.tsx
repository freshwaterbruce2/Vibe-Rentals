
import React from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface MapPlaceholderProps {
    properties: Property[];
    selectedPropertyId: string | null;
    onSelectProperty: (id: string | null) => void;
}

// Function to normalize coordinates to a 0-1 range
const normalizeCoords = (properties: Property[]): { lat: number; lng: number }[] => {
    if (properties.length === 0) return [];

    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return properties.map(p => ({
        lat: (p.lat - minLat) / latRange,
        lng: (p.lng - minLng) / lngRange,
    }));
};

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ properties, selectedPropertyId, onSelectProperty }) => {
    const normalizedCoords = normalizeCoords(properties);
    
    return (
        <div className="w-full h-full bg-gray-700 relative overflow-hidden">
            <img 
                src="https://picsum.photos/seed/map-background/2000/2000" 
                alt="City map background" 
                className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 p-4">
                {properties.map((property, index) => {
                    const coords = normalizedCoords[index];
                    const isSelected = property.id === selectedPropertyId;

                    return (
                        <div
                            key={property.id}
                            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300"
                            style={{ 
                                left: `${coords.lng * 95 + 2.5}%`, // 95% width to keep markers inside
                                top: `${(1 - coords.lat) * 95 + 2.5}%`, // Invert lat for top-down view
                            }}
                            onMouseEnter={() => onSelectProperty(property.id)}
                        >
                            <div className={`flex items-center justify-center p-1 rounded-full cursor-pointer ${isSelected ? 'bg-brand-primary' : 'bg-brand-secondary'}`}>
                                <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-brand-primary'}`}>
                                    ${(property.price / 1000).toFixed(1)}k
                                </span>
                            </div>
                            <LocationMarkerIcon 
                                className={`w-6 h-6 mx-auto ${isSelected ? 'text-brand-primary animate-bounce' : 'text-brand-secondary'}`}
                            />
                        </div>
                    );
                })}
            </div>
             <div className="absolute bottom-4 left-4 bg-brand-secondary/80 text-brand-text p-2 rounded-md text-xs">
                Map view is for demonstration purposes.
            </div>
        </div>
    );
};
