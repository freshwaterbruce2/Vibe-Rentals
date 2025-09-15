import React from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface PropertyMarkerProps {
    property: Property;
    isSelected: boolean;
    isHovered: boolean;
    style: React.CSSProperties;
    onSelect: (id: string | null) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const PropertyMarker: React.FC<PropertyMarkerProps> = ({ property, isSelected, isHovered, style, onSelect, onMouseEnter, onMouseLeave }) => {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-full transition-transform duration-300 ease-in-out"
            style={{ ...style, transform: `translate(-50%, -100%) scale(${isSelected ? 1.2 : 1})` }}
        >
            {/* Tooltip on hover */}
            {isHovered && !isSelected && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-9 w-max max-w-[200px] bg-brand-background text-white text-xs rounded-md shadow-lg p-2 z-10 pointer-events-none animate-fade-in-up">
                    <p className="font-bold truncate">{property.address}</p>
                    <p className="text-brand-primary font-semibold">${property.price.toLocaleString()}/mo</p>
                </div>
            )}

            <div
                className="relative flex flex-col items-center cursor-pointer"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={() => onSelect(isSelected ? null : property.id)}
            >
                {/* Pulsing ring for selected state */}
                {isSelected && (
                    <span className="absolute top-[28px] w-6 h-6 rounded-full bg-brand-primary opacity-75 animate-ping"></span>
                )}

                <div className={`relative z-[1] flex items-center justify-center p-1 rounded-full transition-all duration-300 ${isSelected ? 'bg-brand-primary' : isHovered ? 'bg-brand-primary/80' : 'bg-brand-secondary'}`}>
                    <span className={`font-bold text-xs transition-colors ${isSelected || isHovered ? 'text-white' : 'text-brand-primary'}`}>
                        ${(property.price / 1000).toFixed(1)}k
                    </span>
                </div>
                <LocationMarkerIcon
                    className={`relative z-[1] w-6 h-6 mx-auto transition-colors duration-300 ${isSelected ? 'text-brand-primary' : isHovered ? 'text-brand-primary/80' : 'text-brand-secondary'}`}
                />
            </div>
        </div>
    );
};
