
import React, { useState, useEffect, useMemo } from 'react';
import { Property, Filters, Weather } from './types';
import { generateRentalListings, getWeatherInfo } from './services/geminiService';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { PropertyList } from './components/PropertyList';
import { MapPlaceholder } from './components/MapPlaceholder';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const App: React.FC = () => {
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // The value in the search input
    const [location, setLocation] = useState<string>('San Francisco, CA');
    // The location that has been explicitly submitted for search
    const [searchedLocation, setSearchedLocation] = useState<string>('San Francisco, CA');

    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    
    const [weather, setWeather] = useState<Weather | null>(null);
    const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
    const [weatherError, setWeatherError] = useState<string | null>(null);


    const [filters, setFilters] = useState<Filters>({
        price: { min: 500, max: 10000 },
        bedrooms: 'any',
        bathrooms: 'any',
        propertyType: 'any',
    });
    
    const [sortBy, setSortBy] = useState<string>('price_asc');

    // Debounce filter changes to avoid making API calls on every little change.
    const debouncedFilters = useDebounce(filters, 500);

    // This effect handles all data fetching, re-running when the location or filters change.
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setWeatherLoading(true);
            setError(null);
            setWeatherError(null);
            setSelectedPropertyId(null);
            setAllProperties([]); // Clear previous results immediately for better UX
            setSources([]);
            setWeather(null);

            try {
                const [listingsResult, weatherResult] = await Promise.allSettled([
                    generateRentalListings(searchedLocation, debouncedFilters),
                    getWeatherInfo(searchedLocation)
                ]);

                if (listingsResult.status === 'fulfilled') {
                    setAllProperties(listingsResult.value.properties);
                    setSources(listingsResult.value.sources);
                } else {
                    const errorMessage = listingsResult.reason instanceof Error ? listingsResult.reason.message : 'An unknown error occurred.';
                    setError(`Failed to load properties. ${errorMessage}`);
                    setAllProperties([]);
                }

                if (weatherResult.status === 'fulfilled') {
                    setWeather(weatherResult.value);
                } else {
                    setWeatherError('Weather data could not be loaded.');
                }

            } catch (err) {
                setError('An unexpected error occurred while fetching data.');
                setWeatherError('An unexpected error occurred.');
            } finally {
                setLoading(false);
                setWeatherLoading(false);
            }
        }
        
        fetchData();
        
    }, [searchedLocation, debouncedFilters]); // Re-run effect when searched location or debounced filters change


    const handleSearch = () => {
       setSearchedLocation(location);
    };
    
    const handleSuggestionSelect = (newLocation: string) => {
        setLocation(newLocation);
        setSearchedLocation(newLocation);
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

    return (
        <div className="h-screen w-screen bg-brand-background text-brand-text flex flex-col overflow-hidden">
            <Header 
                location={location} 
                setLocation={setLocation} 
                onSearch={handleSearch} 
                onSuggestionSelect={handleSuggestionSelect}
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
        </div>
    );
};

export default App;
