
import React from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { BedIcon } from './icons/BedIcon';
import { BathIcon } from './icons/BathIcon';

interface PropertyCardProps {
    property: Property;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSelected, onSelect }) => {
    return (
        <div 
            className={`bg-brand-secondary rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-brand-primary scale-105' : 'hover:shadow-xl'}`}
            onClick={() => onSelect(property.id)}
            onMouseLeave={() => onSelect(null)}
        >
            <img className="w-full h-48 object-cover" src={property.imageUrl} alt={`View of ${property.address}`} />
            <div className="p-4">
                <p className="text-2xl font-bold text-brand-primary">${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                <p className="text-lg font-semibold text-brand-text truncate">{property.address}</p>
                <p className="text-sm text-gray-400 flex items-center mb-2">
                    <LocationMarkerIcon className="mr-1"/>
                    {property.city}, {property.state} {property.zip}
                </p>
                <div className="flex justify-start items-center space-x-4 text-gray-300 mt-2 border-t border-gray-700 pt-2">
                    <span className="flex items-center"><BedIcon className="mr-2 text-brand-primary" /> {property.bedrooms} beds</span>
                    <span className="flex items-center"><BathIcon className="mr-2 text-brand-primary" /> {property.bathrooms} baths</span>
                    <span className="text-sm">{property.sqft} sqft</span>
                </div>
            </div>
        </div>
    );
};
