import React, { useEffect, useRef } from 'react';
import { Property } from '../types';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { BedIcon } from './icons/BedIcon';
import { BathIcon } from './icons/BathIcon';
import { SchoolIcon } from './icons/SchoolIcon';
import { PropertyTypeIcon } from './icons/PropertyTypeIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { MailIcon } from './icons/MailIcon';
import { UserIcon } from './icons/UserIcon';

interface PropertyDetailModalProps {
    property: (Property & { isGeneratedOrEnhanced?: boolean }) | null;
    onClose: () => void;
    enhancing: boolean;
    onEnhanceImage: (propertyId: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose, enhancing, onEnhanceImage }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const modalElement = modalRef.current;
        if (property && modalElement) {
            window.addEventListener('keydown', handleEsc);

            // Focus trapping logic
            const focusableElements = modalElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Focus the first focusable element (likely the close button)
            firstElement?.focus();

            const handleTabKey = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            };

            modalElement.addEventListener('keydown', handleTabKey);

            return () => {
                window.removeEventListener('keydown', handleEsc);
                modalElement.removeEventListener('keydown', handleTabKey);
            };
        }
    }, [property, onClose]);

    if (!property) return null;

    const handleEnhanceClick = () => {
        if (property && !enhancing) {
            onEnhanceImage(property.id);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-detail-title"
        >
            <div 
                ref={modalRef}
                className="bg-brand-secondary rounded-lg overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="w-full md:w-1/2 flex-shrink-0 relative">
                    {enhancing && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-20">
                            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-white text-lg mt-3">Enhancing Image...</p>
                        </div>
                    )}
                    <img className="w-full h-64 md:h-full object-cover" src={property.imageUrl} alt={`View of ${property.address}`} />
                    {!property.isGeneratedOrEnhanced && (
                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded">
                            Placeholder Image
                        </span>
                    )}
                     {property.isGeneratedOrEnhanced && !enhancing && (
                        <button 
                            onClick={handleEnhanceClick}
                            className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 px-4 py-2 bg-black bg-opacity-60 text-white font-semibold rounded-lg border border-gray-500 hover:bg-opacity-80 hover:border-brand-primary transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <SparkleIcon className="w-5 h-5" />
                            <span>Enhance Image</span>
                        </button>
                    )}
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-3xl font-bold text-brand-primary">${property.price.toLocaleString()}<span className="text-lg font-normal text-gray-400">/mo</span></p>
                            <h2 id="property-detail-title" className="text-2xl font-semibold text-brand-text truncate">{property.address}</h2>
                            <p className="text-md text-gray-400 flex items-center">
                                <LocationMarkerIcon className="mr-1 h-4 w-4"/>
                                {property.city}, {property.state} {property.zip}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary" aria-label="Close property details">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {property.isRentToOwn && (
                        <span className="self-start bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow mb-4">
                            Rent to Own
                        </span>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-300 my-4 border-t border-b border-gray-700 py-4">
                        <div className="text-center">
                            <BedIcon className="mx-auto mb-1 h-6 w-6 text-brand-primary" /> 
                            <p className="font-bold">{property.bedrooms}</p>
                            <p className="text-xs text-gray-400">Beds</p>
                        </div>
                        <div className="text-center">
                            <BathIcon className="mx-auto mb-1 h-6 w-6 text-brand-primary" />
                            <p className="font-bold">{property.bathrooms}</p>
                            <p className="text-xs text-gray-400">Baths</p>
                        </div>
                         <div className="text-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-1 h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
                            </svg>
                            <p className="font-bold">{property.sqft.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">sqft</p>
                        </div>
                        <div className="text-center">
                            <PropertyTypeIcon propertyType={property.propertyType} className="mx-auto mb-1 h-6 w-6 text-brand-primary" />
                            <p className="font-bold">{property.propertyType}</p>
                             <p className="text-xs text-gray-400">Type</p>
                        </div>
                    </div>
                    
                    {property.amenities && property.amenities.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Amenities</h3>
                            <ul className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity, index) => (
                                    <li key={index} className="bg-brand-background text-brand-text text-sm px-3 py-1 rounded-full">{amenity}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {property.contact && (
                        <div className="my-4 pt-4 border-t border-gray-700">
                             <h3 className="text-lg font-semibold text-gray-300 mb-2">Contact Information</h3>
                             <div className="space-y-2">
                                {property.contact.name && (
                                    <p className="flex items-center text-brand-text">
                                        <UserIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                                        <span>{property.contact.name}</span>
                                    </p>
                                )}
                                {property.contact.phone && (
                                    <p className="flex items-center text-brand-text">
                                        <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                                        <a href={`tel:${property.contact.phone}`} className="hover:text-brand-primary transition-colors">{property.contact.phone}</a>
                                    </p>
                                )}
                                {property.contact.email && (
                                     <p className="flex items-center text-brand-text">
                                        <MailIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                                        <a href={`mailto:${property.contact.email}`} className="hover:text-brand-primary transition-colors truncate">{property.contact.email}</a>
                                    </p>
                                )}
                             </div>
                        </div>
                    )}

                    {property.privateSchools && property.privateSchools.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-300 flex items-center mb-2">
                                <SchoolIcon className="w-5 h-5 mr-2 text-brand-primary" /> Nearby Private Schools
                            </h4>
                            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                                {property.privateSchools.map((school, index) => (
                                    <li key={index}>{school.name} <span className="text-gray-500">({school.distance})</span></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};