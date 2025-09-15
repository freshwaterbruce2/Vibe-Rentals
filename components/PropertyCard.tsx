import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { BedIcon } from './icons/BedIcon';
import { BathIcon } from './icons/BathIcon';
import { SchoolIcon } from './icons/SchoolIcon';
import { PropertyTypeIcon } from './icons/PropertyTypeIcon';
import { SqftIcon } from './icons/SqftIcon';
import { HeartIcon } from './icons/HeartIcon';
import { generatePropertyImage } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { UserIcon } from './icons/UserIcon';


interface PropertyCardProps {
    property: Property;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isFavorite: boolean;
    onToggleFavorite: (propertyId: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (propertyId: string, imageUrl: string) => void;
    enhancing: boolean;
    onEnhanceImage: (propertyId: string) => void;
}

export const PropertyCard = React.forwardRef<HTMLDivElement, PropertyCardProps>(
    ({ property, isSelected, onSelect, isHovered, onMouseEnter, onMouseLeave, isFavorite, onToggleFavorite, imageCache, onImageGenerated, enhancing, onEnhanceImage }, ref) => {
    
    const [imageUrl, setImageUrl] = useState<string | null>(imageCache[property.id] || null);
    const [imageLoading, setImageLoading] = useState<boolean>(!imageCache[property.id]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const isGenerated = !!imageCache[property.id];
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        // Use the forwarded ref if available, otherwise use the internal ref.
        const targetRef = (ref && (ref as React.RefObject<HTMLDivElement>)) || cardRef;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !imageUrl && imageLoading) {
                    generatePropertyImage(property)
                        .then(newUrl => {
                            onImageGenerated(property.id, newUrl);
                            setImageUrl(newUrl);
                        })
                        .catch(err => {
                            console.error(err);
                            // Fallback to original placeholder on error
                            setImageUrl(property.imageUrl);
                        })
                        .finally(() => {
                            setImageLoading(false);
                        });
                    observer.disconnect(); // Generate image only once
                }
            },
            { rootMargin: '100px' } // Pre-load images 100px before they enter the viewport
        );

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }
        observerRef.current = observer;

        return () => {
            observer.disconnect();
        };
    }, [property, imageUrl, onImageGenerated, imageLoading, ref]);


    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection when favoriting
        onToggleFavorite(property.id);
    };

    const handleEnhanceClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEnhanceImage(property.id);
    };

    const handleContactClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowContact(prev => !prev);
    };

    const finalImageUrl = imageCache[property.id] || imageUrl || property.imageUrl;

    return (
        <div 
            ref={node => {
                // Assign to both refs if they exist
                cardRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            className={`bg-brand-secondary rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 relative
                ${isSelected ? 'ring-2 ring-brand-primary scale-105' : 'hover:shadow-xl'}
                ${isHovered && !isSelected ? 'ring-2 ring-gray-500' : ''}
            `}
            onClick={() => onSelect(isSelected ? null : property.id)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <button
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:text-red-500 transition-colors"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                <HeartIcon filled={isFavorite} className="w-5 h-5" />
            </button>
            <div className="relative w-full h-48 bg-brand-background">
                 {imageLoading && !isGenerated && (
                    <div className="absolute inset-0 bg-gray-700 animate-pulse"></div>
                )}
                {enhancing && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center z-20">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-white text-sm mt-2">Enhancing...</p>
                    </div>
                )}
                {isGenerated && !enhancing && (
                     <button
                        onClick={handleEnhanceClick}
                        className="absolute top-2 left-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:text-brand-primary transition-colors group"
                        aria-label="Enhance image"
                    >
                        <SparkleIcon className="w-5 h-5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-brand-background text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Enhance Image
                        </span>
                    </button>
                )}
                <img 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoading && !isGenerated ? 'opacity-0' : 'opacity-100'}`} 
                    src={finalImageUrl} 
                    alt={`View of ${property.address}`} 
                    onLoad={() => {
                        // Only set loading to false if we are not using a cached image
                        if (!imageCache[property.id]) {
                            setImageLoading(false);
                        }
                    }}
                />
                {property.isRentToOwn && (
                    <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                        Rent to Own
                    </span>
                )}
                {!isGenerated && !imageLoading && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded">
                        Placeholder Image
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

                {property.contact && (
                    <div className="relative mt-3 pt-3 border-t border-gray-700">
                        <button 
                            onClick={handleContactClick}
                            className="w-full text-left text-sm font-semibold text-brand-primary hover:underline"
                        >
                            Contact Info
                        </button>
                        {showContact && (
                            <div className="absolute bottom-full right-0 mb-2 w-full max-w-xs bg-brand-background p-3 rounded-lg shadow-lg z-20 border border-gray-600 animate-fade-in-up">
                                {property.contact.name && (
                                    <p className="flex items-center text-sm text-brand-text mb-1">
                                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        {property.contact.name}
                                    </p>
                                )}
                                {property.contact.phone && (
                                    <p className="flex items-center text-sm text-brand-text mb-1">
                                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <a href={`tel:${property.contact.phone}`} className="hover:text-brand-primary">{property.contact.phone}</a>
                                    </p>
                                )}
                                {property.contact.email && (
                                     <p className="flex items-center text-sm text-brand-text">
                                        <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <a href={`mailto:${property.contact.email}`} className="hover:text-brand-primary truncate">{property.contact.email}</a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

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
});