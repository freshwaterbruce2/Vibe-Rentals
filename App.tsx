import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Property, Filters, PropertyType, Weather } from './types';
import { generateRentalListings, getWeatherInfo } from './services/geminiService';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { PropertyList } from './components/PropertyList';
import { MapPlaceholder } from './components/MapPlaceholder';

const App: React.FC = () => {
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<string>('San Francisco, CA');
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

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setWeatherLoading(true);
        setError(null);
        setWeatherError(null);
        setSelectedPropertyId(null);
        setAllProperties([]);
        setSources([]);
        setWeather(null);

        try {
            const [listingsResult, weatherResult] = await Promise.allSettled([
                generateRentalListings(location),
                getWeatherInfo(location)
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
    }, [location]);

    useEffect(() => {
        fetchProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredProperties = useMemo(() => {
        return allProperties.filter(property => {
            const { price, bedrooms, bathrooms, propertyType } = filters;
            return (
                property.price <= price.max &&
                (bedrooms === 'any' || property.bedrooms >= bedrooms) &&
                (bathrooms === 'any' || property.bathrooms >= bathrooms) &&
                (propertyType === 'any' || property.propertyType === propertyType)
            );
        });
    }, [allProperties, filters]);

    return (
        <div className="h-screen w-screen bg-brand-background text-brand-text flex flex-col overflow-hidden">
            <Header location={location} setLocation={setLocation} onSearch={fetchProperties} />
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                    <div className="w-full md:w-1/3 lg:w-1/4 p-4 space-y-6 bg-brand-secondary overflow-y-auto fixed left-0 top-[68px] h-[calc(100vh-68px)] md:relative md:top-0 md:h-auto">
                        <FilterPanel 
                            filters={filters} 
                            setFilters={setFilters}
                            propertyCount={filteredProperties.length}
                            weather={weather}
                            weatherLoading={weatherLoading}
                            weatherError={weatherError}
                            location={location}
                        />
                    </div>
                    <div className="flex-grow overflow-y-auto md:ml-[33.333333%] lg:ml-[25%]">
                        <PropertyList 
                            properties={filteredProperties} 
                            loading={loading} 
                            error={error}
                            selectedPropertyId={selectedPropertyId}
                            setSelectedPropertyId={setSelectedPropertyId}
                            sources={sources}
                        />
                    </div>
                </div>
                <div className="hidden md:block md:w-1/3 lg:w-3/4 h-full fixed right-0 top-[68px]">
                   <MapPlaceholder 
                        properties={filteredProperties} 
                        selectedPropertyId={selectedPropertyId}
                        onSelectProperty={setSelectedPropertyId}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;