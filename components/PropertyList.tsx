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
    sortBy: string;
    setSortBy: (value: string) => void;
    hoveredPropertyId: string | null;
    setHoveredPropertyId: (id: string | null) => void;
    propertyCardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    clusterFilterActive: boolean;
    onClearClusterFilter: () => void;
    favoritePropertyIds: Set<string>;
    onToggleFavorite: (propertyId: string) => void;
    imageCache: Record<string, string>;
    onImageGenerated: (propertyId: string, imageUrl: string) => void;
    enhancingPropertyId: string | null;
    onEnhanceImage: (propertyId: string) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({ 
    properties, loading, error, selectedPropertyId, setSelectedPropertyId, sources, sortBy, setSortBy, 
    hoveredPropertyId, setHoveredPropertyId, propertyCardRefs, clusterFilterActive, onClearClusterFilter,
    favoritePropertyIds, onToggleFavorite, imageCache, onImageGenerated, enhancingPropertyId, onEnhanceImage
}) => {
    
    if (error) {
        return <div className="p-4 text-red-400 text-center">{error}</div>;
    }

    if (loading) {
        return (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
        );
    }
    
    if (properties.length === 0 && !loading) {
        return (
            <div className="p-4 text-center text-gray-400">
                <p className="mb-4">No properties found. Try adjusting your filters.</p>
                {clusterFilterActive && (
                    <button
                        onClick={onClearClusterFilter}
                        className="text-sm bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        &larr; Show All Properties
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
                {clusterFilterActive ? (
                     <button
                        onClick={onClearClusterFilter}
                        className="text-sm bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        &larr; Show All Properties
                    </button>
                ) : <div />}
                 <div className="flex items-center">
                    <label htmlFor="sort-by" className="text-sm text-gray-400 mr-2">Sort by:</label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-brand-secondary border border-gray-600 text-brand-text rounded-md p-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    >
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="sqft_desc">Sqft: High to Low</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(property => (
                    <PropertyCard 
                        key={property.id} 
                        // FIX: A ref callback function should not return a value. The previous concise body `() => (assignment)` returned the assigned element, which caused a type error. Wrapping the assignment in curly braces `{ assignment; }` fixes this by ensuring a `void` return.
                        ref={el => { propertyCardRefs.current[property.id] = el; }}
                        property={property} 
                        isSelected={selectedPropertyId === property.id}
                        onSelect={setSelectedPropertyId}
                        isHovered={hoveredPropertyId === property.id}
                        onMouseEnter={() => setHoveredPropertyId(property.id)}
                        onMouseLeave={() => setHoveredPropertyId(null)}
                        isFavorite={favoritePropertyIds.has(property.id)}
                        onToggleFavorite={onToggleFavorite}
                        imageCache={imageCache}
                        onImageGenerated={onImageGenerated}
                        enhancing={enhancingPropertyId === property.id}
                        onEnhanceImage={onEnhanceImage}
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