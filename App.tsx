import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, Filters, Weather } from './types';
import { generateRentalListings, getWeatherInfo, enhancePropertyImage } from './services/geminiService';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { PropertyList } from './components/PropertyList';
import { MapPlaceholder } from './components/MapPlaceholder';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { MobileControls } from './components/MobileControls';
import { FilterModal } from './components/FilterModal';

const initialFilters: Filters = {
    price: { min: 500, max: 10000 },
    bedrooms: 'any',
    bathrooms: 'any',
    propertyType: 'any',
    rentToOwn: false,
};

const App: React.FC = () => {
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    
    const [location, setLocation] = useState<string>('');
    const [searchedLocation, setSearchedLocation] = useState<string>('');

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
    
    const [weather, setWeather] = useState<Weather | null>(null);
    const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
    
    const [sortBy, setSortBy] = useState<string>('price_asc');
    
    const [savedSettingsExist, setSavedSettingsExist] = useState<boolean>(false);
    const [favoritePropertyIds, setFavoritePropertyIds] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

    const [clusterFilterIds, setClusterFilterIds] = useState<string[] | null>(null);
    const propertyCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    const [imageCache, setImageCache] = useState<Record<string, string>>({});
    const [enhancingPropertyId, setEnhancingPropertyId] = useState<string | null>(null);

    // --- Mobile Specific State ---
    const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

    const listingsCache = useRef<Record<string, { properties: Property[]; sources: any[] }>>({});
    const weatherCache = useRef<Record<string, Weather>>({});
    const modalTriggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('rentScoutSettings');
            setSavedSettingsExist(!!savedSettings);
            
            const savedFavorites = localStorage.getItem('rentScoutFavorites');
            if (savedFavorites) {
                setFavoritePropertyIds(new Set(JSON.parse(savedFavorites)));
            }
        } catch (error) {
            console.error("Could not access localStorage:", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('rentScoutFavorites', JSON.stringify(Array.from(favoritePropertyIds)));
        } catch (error) {
            console.error("Could not save favorites to localStorage:", error);
        }
    }, [favoritePropertyIds]);

    useEffect(() => {
        const fetchListings = async () => {
            if (!searchedLocation) {
                // Don't fetch if no location is set (initial state)
                setAllProperties([]);
                setSources([]);
                setLoading(false);
                return;
            }
            setIsInitialLoad(false);

            const cacheKey = `${searchedLocation}-${JSON.stringify(appliedFilters)}`;
            if (listingsCache.current[cacheKey]) {
                const cachedData = listingsCache.current[cacheKey];
                setAllProperties(cachedData.properties);
                setSources(cachedData.sources);
                return;
            }

            setLoading(true);
            setError(null);
            setSelectedPropertyId(null);
            setAllProperties([]);
            setSources([]);
            setClusterFilterIds(null); // Reset cluster view on new search

            try {
                const listingsResult = await generateRentalListings(searchedLocation, appliedFilters);
                listingsCache.current[cacheKey] = listingsResult;
                setAllProperties(listingsResult.properties);
                setSources(listingsResult.sources);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to load properties. ${errorMessage}`);
                setAllProperties([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchListings();
        
    }, [searchedLocation, appliedFilters]);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!searchedLocation) return;
            
            const cacheKey = searchedLocation;
            if (weatherCache.current[cacheKey]) {
                setWeather(weatherCache.current[cacheKey]);
                return;
            }

            setWeatherLoading(true);
            setWeatherError(null);
            setWeather(null);

            try {
                const weatherResult = await getWeatherInfo(searchedLocation);
                weatherCache.current[cacheKey] = weatherResult;
                setWeather(weatherResult);
            } catch (err) {
                 setWeatherError('Weather data could not be loaded.');
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [searchedLocation]);

    // Effect to scroll the property card into view when selected from the map
    useEffect(() => {
        if (selectedPropertyId && mobileView === 'list') {
            const cardRef = propertyCardRefs.current[selectedPropertyId];
            cardRef?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedPropertyId, mobileView]);

    const handleSearch = () => {
       if (location.trim() === '') return;
       setAppliedFilters(filters);
       setSearchedLocation(location);
    };

    const handleApplyFiltersFromModal = () => {
        handleSearch();
        setIsFilterModalOpen(false);
    };
    
    const handleSaveSettings = () => {
        try {
            const settings = {
                location: location,
                filters: filters
            };
            localStorage.setItem('rentScoutSettings', JSON.stringify(settings));
            setSavedSettingsExist(true);
        } catch (error) {
            console.error("Could not save settings to localStorage:", error);
            alert("Error: Could not save settings. Your browser's storage might be disabled or full.");
        }
    };

    const handleLoadSettings = () => {
        try {
            const saved = localStorage.getItem('rentScoutSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.location && settings.filters) {
                    setLocation(settings.location);
                    setFilters(settings.filters);
                    // Automatically apply loaded settings
                    setSearchedLocation(settings.location);
                    setAppliedFilters(settings.filters);
                }
            }
        } catch (error) {
            console.error("Could not load or parse settings from localStorage:", error);
            alert("Error: Could not load settings.");
        }
    };
    
     const handleToggleFavorite = (propertyId: string) => {
        setFavoritePropertyIds(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(propertyId)) {
                newFavorites.delete(propertyId);
            } else {
                newFavorites.add(propertyId);
            }
            return newFavorites;
        });
    };
    
    const handleClusterClick = (propertyIds: string[]) => {
        setClusterFilterIds(propertyIds);
        setSelectedPropertyId(null); // Deselect any property when zooming
        setMobileView('list'); // Switch to list view on mobile to see the filtered results
    };

    const handleClearClusterFilter = () => {
        setClusterFilterIds(null);
    };
    
    const handleSelectPropertyFromMap = (id: string | null) => {
        setSelectedPropertyId(id);
        if(id) {
            modalTriggerRef.current = document.activeElement as HTMLElement;
            setMobileView('list');
        }
    };

    const handleSelectPropertyFromList = (id: string | null) => {
        if (id) {
            modalTriggerRef.current = document.activeElement as HTMLElement;
        }
        setSelectedPropertyId(id);
    }
    
    const handleImageGenerated = (propertyId: string, imageUrl: string) => {
        setImageCache(prevCache => ({
            ...prevCache,
            [propertyId]: imageUrl,
        }));
    };

    const handleEnhanceImage = async (propertyId: string) => {
        if (enhancingPropertyId || !imageCache[propertyId]) return;

        setEnhancingPropertyId(propertyId);
        try {
            const currentImage = imageCache[propertyId];
            const enhancedImage = await enhancePropertyImage(currentImage);
            setImageCache(prevCache => ({
                ...prevCache,
                [propertyId]: enhancedImage,
            }));
        } catch (err) {
            console.error("Failed to enhance image for property:", propertyId, err);
            // Optionally, set an error state to show a toast message to the user.
        } finally {
            setEnhancingPropertyId(null);
        }
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const handleClearFavorites = () => {
        if (window.confirm("Are you sure you want to clear all your favorites?")) {
            setFavoritePropertyIds(new Set());
            setShowFavoritesOnly(false);
        }
    };

    const displayedProperties = useMemo(() => {
        let propertiesToDisplay = allProperties;

        if (showFavoritesOnly) {
            propertiesToDisplay = propertiesToDisplay.filter(p => favoritePropertyIds.has(p.id));
        }

        if (clusterFilterIds) {
            const clusterIdSet = new Set(clusterFilterIds);
            propertiesToDisplay = propertiesToDisplay.filter(p => clusterIdSet.has(p.id));
        }
        
        const sorted = [...propertiesToDisplay];
        switch (sortBy) {
            case 'price_asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'sqft_desc':
                 sorted.sort((a, b) => b.sqft - a.sqft);
                break;
        }
        return sorted;
    }, [allProperties, sortBy, clusterFilterIds, showFavoritesOnly, favoritePropertyIds]);

    const selectedProperty = useMemo(() => {
        const foundProperty = allProperties.find(p => p.id === selectedPropertyId);
        if (!foundProperty) return null;

        const generatedImage = imageCache[foundProperty.id];
        return { 
            ...foundProperty, 
            imageUrl: generatedImage || foundProperty.imageUrl,
            isGeneratedOrEnhanced: !!generatedImage 
        };
    }, [selectedPropertyId, allProperties, imageCache]);


    const filterPanelComponent = (
        <FilterPanel 
            filters={filters} 
            setFilters={setFilters}
            propertyCount={displayedProperties.length}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            location={searchedLocation}
            onApplyFilters={isFilterModalOpen ? handleApplyFiltersFromModal : handleSearch}
            loading={loading}
            onSaveSettings={handleSaveSettings}
            onLoadSettings={handleLoadSettings}
            savedSettingsExist={savedSettingsExist}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
            hasFavorites={favoritePropertyIds.size > 0}
            onClearFilters={handleClearFilters}
            onClearFavorites={handleClearFavorites}
        />
    );

    return (
        <div className="h-screen w-screen bg-brand-background text-brand-text flex flex-col overflow-hidden">
            <Header 
                location={location} 
                setLocation={setLocation} 
                onSearch={handleSearch} 
                loading={loading}
            />
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {/* --- Desktop Layout --- */}
                <div className="hidden md:flex w-full h-full">
                    <aside className="w-1/3 lg:w-1/4 p-4 bg-brand-secondary overflow-y-auto flex-shrink-0 h-full">
                        {filterPanelComponent}
                    </aside>
                    <div className="flex-grow overflow-y-auto h-full">
                        <PropertyList 
                            properties={displayedProperties} 
                            loading={loading} 
                            error={error}
                            selectedPropertyId={selectedPropertyId}
                            setSelectedPropertyId={handleSelectPropertyFromList}
                            sources={sources}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            hoveredPropertyId={hoveredPropertyId}
                            setHoveredPropertyId={setHoveredPropertyId}
                            propertyCardRefs={propertyCardRefs}
                            clusterFilterActive={!!clusterFilterIds}
                            onClearClusterFilter={handleClearClusterFilter}
                            favoritePropertyIds={favoritePropertyIds}
                            onToggleFavorite={handleToggleFavorite}
                            imageCache={imageCache}
                            onImageGenerated={handleImageGenerated}
                            enhancingPropertyId={enhancingPropertyId}
                            onEnhanceImage={handleEnhanceImage}
                            isInitialLoad={isInitialLoad}
                        />
                    </div>
                    <aside className="w-1/3 lg:w-1/4 h-full flex-shrink-0">
                        <MapPlaceholder 
                            properties={displayedProperties} 
                            selectedPropertyId={selectedPropertyId}
                            onSelectProperty={handleSelectPropertyFromMap}
                            hoveredPropertyId={hoveredPropertyId}
                            setHoveredPropertyId={setHoveredPropertyId}
                            onClusterClick={handleClusterClick}
                        />
                    </aside>
                </div>

                {/* --- Mobile Layout --- */}
                <div className="flex flex-col md:hidden w-full h-full">
                    <MobileControls 
                        onFilterClick={() => {
                            modalTriggerRef.current = document.activeElement as HTMLElement;
                            setIsFilterModalOpen(true)
                        }}
                        mobileView={mobileView}
                        setMobileView={setMobileView}
                    />
                    <div className="flex-grow overflow-y-auto">
                        {mobileView === 'list' && (
                            <PropertyList 
                                properties={displayedProperties} 
                                loading={loading} 
                                error={error}
                                selectedPropertyId={selectedPropertyId}
                                setSelectedPropertyId={handleSelectPropertyFromList}
                                sources={sources}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                hoveredPropertyId={hoveredPropertyId}
                                setHoveredPropertyId={setHoveredPropertyId}
                                propertyCardRefs={propertyCardRefs}
                                clusterFilterActive={!!clusterFilterIds}
                                onClearClusterFilter={handleClearClusterFilter}
                                favoritePropertyIds={favoritePropertyIds}
                                onToggleFavorite={handleToggleFavorite}
                                imageCache={imageCache}
                                onImageGenerated={handleImageGenerated}
                                enhancingPropertyId={enhancingPropertyId}
                                onEnhanceImage={handleEnhanceImage}
                                isInitialLoad={isInitialLoad}
                            />
                        )}
                         {mobileView === 'map' && (
                            <div className="h-full w-full">
                                <MapPlaceholder 
                                    properties={displayedProperties} 
                                    selectedPropertyId={selectedPropertyId}
                                    onSelectProperty={handleSelectPropertyFromMap}
                                    hoveredPropertyId={hoveredPropertyId}
                                    setHoveredPropertyId={setHoveredPropertyId}
                                    onClusterClick={handleClusterClick}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <PropertyDetailModal 
                property={selectedProperty}
                onClose={() => {
                    setSelectedPropertyId(null);
                    modalTriggerRef.current?.focus();
                }}
                enhancing={enhancingPropertyId === selectedProperty?.id}
                onEnhanceImage={handleEnhanceImage}
            />
            
            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => {
                    setIsFilterModalOpen(false);
                    modalTriggerRef.current?.focus();
                }}
            >
                 {filterPanelComponent}
            </FilterModal>
        </div>
    );
};

export default App;