import React from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { BedIcon } from './icons/BedIcon';
import { BathIcon } from './icons/BathIcon';
import { SchoolIcon } from './icons/SchoolIcon';
import { PropertyTypeIcon } from './icons/PropertyTypeIcon';
import { SqftIcon } from './icons/SqftIcon';

interface PropertyCardProps {
    property: Property;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSelected, onSelect }) => {
    return (
        <div 
            className={`bg-brand-secondary rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-brand-primary scale-105' : 'hover:shadow-xl'}`}
            onClick={() => onSelect(isSelected ? null : property.id)}
        >
            <div className="relative">
                <img className="w-full h-48 object-cover" src={property.imageUrl} alt={`View of ${property.address}`} />
                {property.isRentToOwn && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                        Rent to Own
                    </span>
                )}
            </div>
            <div className="p-4">
                <p className="text-2xl font-bold text-brand-primary">${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                <p className="text-lg font-semibold text-brand-text truncate">{property.address}</p>
                <p className="text-sm text-gray-400 flex items-center mb-2">
                    <LocationMarkerIcon className="mr-1"/>
                    {property.city}, {property.state} {property.zip}
                </p>
                <div className="flex justify-between items-center text-gray-300 mt-2 border-t border-gray-700 pt-2">
                    <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center"><BedIcon className="mr-1 h-5 w-5 text-brand-primary" /> {property.bedrooms}</span>
                        <span className="flex items-center"><BathIcon className="mr-1 h-5 w-5 text-brand-primary" /> {property.bathrooms}</span>
                        <span className="flex items-center"><SqftIcon className="mr-1 h-5 w-5 text-brand-primary" /> {property.sqft}</span>
                    </div>
                    <div className="flex items-center text-xs bg-brand-background px-2 py-1 rounded-full">
                        <PropertyTypeIcon propertyType={property.propertyType} className="mr-1.5 h-4 w-4 text-brand-primary" />
                        {property.propertyType}
                    </div>
                </div>
                {property.privateSchools && property.privateSchools.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center mb-1">
                            <SchoolIcon className="w-5 h-5 mr-2 text-brand-primary" /> Nearby Private Schools
                        </h4>
                        <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                            {property.privateSchools.map((school, index) => (
                                <li key={index}>{school.name} <span className="text-gray-500">({school.distance})</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
