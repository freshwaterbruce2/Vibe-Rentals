import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, Filters, Weather } from './types';
import { generateRentalListings, getWeatherInfo } from './services/geminiService';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { PropertyList } from './components/PropertyList';
import { MapPlaceholder } from './components/MapPlaceholder';
import { PropertyDetailModal } from './components/PropertyDetailModal';

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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // The value in the search input
    const [location, setLocation] = useState<string>('Nashville, TN');
    // The location that has been explicitly submitted for search
    const [searchedLocation, setSearchedLocation] = useState<string>('Nashville, TN');

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    
    const [weather, setWeather] = useState<Weather | null>(null);
    const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // Current state of filters as user interacts with them
    const [filters, setFilters] = useState<Filters>(initialFilters);
    // The filters that have been submitted for a search
    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
    
    const [sortBy, setSortBy] = useState<string>('price_asc');
    
    const [savedSettingsExist, setSavedSettingsExist] = useState<boolean>(false);

    // In-memory cache to store results and avoid redundant API calls
    const listingsCache = useRef<Record<string, { properties: Property[]; sources: any[] }>>({});
    const weatherCache = useRef<Record<string, Weather>>({});

    // Effect to check for saved settings on initial load
    useEffect(() => {
        try {
            const saved = localStorage.getItem('rentScoutSettings');
            setSavedSettingsExist(!!saved);
        } catch (error) {
            console.error("Could not access localStorage:", error);
            setSavedSettingsExist(false);
        }
    }, []);

    // Effect for fetching rental listings. Runs on initial load and when location or applied filters change.
    useEffect(() => {
        const fetchListings = async () => {
            const cacheKey = `${searchedLocation}-${JSON.stringify(appliedFilters)}`;
            if (listingsCache.current[cacheKey]) {
                const cachedData = listingsCache.current[cacheKey];
                setAllProperties(cachedData.properties);
                setSources(cachedData.sources);
                return; // Use cached data
            }

            setLoading(true);
            setError(null);
            setSelectedPropertyId(null);
            setAllProperties([]); // Clear previous results immediately
            setSources([]);

            try {
                const listingsResult = await generateRentalListings(searchedLocation, appliedFilters);
                listingsCache.current[cacheKey] = listingsResult; // Store result in cache
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

    // Effect for fetching weather. Runs only when the searched location changes.
    useEffect(() => {
        const fetchWeather = async () => {
            if (!searchedLocation) return;
            
            const cacheKey = searchedLocation;
            if (weatherCache.current[cacheKey]) {
                setWeather(weatherCache.current[cacheKey]);
                return; // Use cached data
            }

            setWeatherLoading(true);
            setWeatherError(null);
            setWeather(null);

            try {
                const weatherResult = await getWeatherInfo(searchedLocation);
                weatherCache.current[cacheKey] = weatherResult; // Store result in cache
                setWeather(weatherResult);
            } catch (err) {
                 setWeatherError('Weather data could not be loaded.');
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [searchedLocation]);


    const handleSearch = () => {
       setAppliedFilters(filters);
       setSearchedLocation(location);
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
            // Optionally: show an error message to the user
        }
    };

    const handleLoadSettings = () => {
        try {
            const saved = localStorage.getItem('rentScoutSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.location && settings.filters) {
                    // Update the UI controls
                    setLocation(settings.location);
                    setFilters(settings.filters);
                    // Immediately apply the loaded settings and trigger a new search
                    setSearchedLocation(settings.location);
                    setAppliedFilters(settings.filters);
                }
            }
        } catch (error) {
            console.error("Could not load or parse settings from localStorage:", error);
             // Optionally: show an error message to the user
        }
    };

    const sortedProperties = useMemo(() => {
        const sorted = [...allProperties];
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
    }, [allProperties, sortBy]);

    const selectedProperty = useMemo(() => {
        return allProperties.find(p => p.id === selectedPropertyId) || null;
    }, [selectedPropertyId, allProperties]);

    return (
        <div className="h-screen w-screen bg-brand-background text-brand-text flex flex-col overflow-hidden">
            <Header 
                location={location} 
                setLocation={setLocation} 
                onSearch={handleSearch} 
                loading={loading}
            />
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {/* Left Column: Contains Filters and Property List */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col md:flex-row overflow-hidden">
                    {/* Filters Panel */}
                    <aside className="w-full md:w-1/3 lg:w-1/4 p-4 bg-brand-secondary overflow-y-auto flex-shrink-0 h-auto md:h-[calc(100vh-68px)]">
                         <FilterPanel 
                            filters={filters} 
                            setFilters={setFilters}
                            propertyCount={allProperties.length}
                            weather={weather}
                            weatherLoading={weatherLoading}
                            weatherError={weatherError}
                            location={searchedLocation}
                            onApplyFilters={handleSearch}
                            loading={loading}
                            onSaveSettings={handleSaveSettings}
                            onLoadSettings={handleLoadSettings}
                            savedSettingsExist={savedSettingsExist}
                        />
                    </aside>
                    {/* Property List Panel */}
                    <div className="flex-grow overflow-y-auto h-auto md:h-[calc(100vh-68px)]">
                        <PropertyList 
                            properties={sortedProperties} 
                            loading={loading} 
                            error={error}
                            selectedPropertyId={selectedPropertyId}
                            setSelectedPropertyId={setSelectedPropertyId}
                            sources={sources}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                    </div>
                </div>
                {/* Right Column: Map */}
                <aside className="hidden md:block md:w-1/3 lg:w-1/4 h-[calc(100vh-68px)] flex-shrink-0">
                   <MapPlaceholder 
                        properties={allProperties} 
                        selectedPropertyId={selectedPropertyId}
                        onSelectProperty={setSelectedPropertyId}
                    />
                </aside>
            </main>
            
            <PropertyDetailModal 
                property={selectedProperty}
                onClose={() => setSelectedPropertyId(null)}
            />
        </div>
    );
};

export default App;