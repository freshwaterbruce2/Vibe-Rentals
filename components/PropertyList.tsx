import React from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { SkeletonCard } from './SkeletonCard';

interface PropertyListProps {
    properties: Property[];
    loading: boolean;
    error: string | null;
    selectedPropertyId: string | null;
    setSelectedPropertyId: (id: string | null) => void;
    sources: any[];
}

export const PropertyList: React.FC<PropertyListProps> = ({ properties, loading, error, selectedPropertyId, setSelectedPropertyId, sources }) => {
    
    if (error) {
        return <div className="p-4 text-red-400 text-center">{error}</div>;
    }

    if (loading) {
        return (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
        );
    }
    
    if (properties.length === 0 && !loading) {
        return <div className="p-4 text-gray-400 text-center">No properties found. Try adjusting your filters.</div>;
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(property => (
                    <PropertyCard 
                        key={property.id} 
                        property={property} 
                        isSelected={selectedPropertyId === property.id}
                        onSelect={setSelectedPropertyId}
                    />
                ))}
            </div>
            {sources && sources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Data Sources</h4>
                    <ul className="list-disc list-inside text-xs space-y-1">
                        {sources.map((source, index) => (
                            source.web && <li key={index}>
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};