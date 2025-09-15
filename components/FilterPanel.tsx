import React from 'react';
import { Filters, PropertyType, Weather } from '../types';
import { WeatherWidget } from './WeatherWidget';

interface FilterPanelProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    propertyCount: number;
    weather: Weather | null;
    weatherLoading: boolean;
    weatherError: string | null;
    location: string;
    onApplyFilters: () => void;
    loading: boolean;
    onSaveSettings: () => void;
    onLoadSettings: () => void;
    savedSettingsExist: boolean;
}

const FilterButton: React.FC<{ value: any; current: any; onClick: (value: any) => void; children: React.ReactNode }> = ({ value, current, onClick, children }) => {
    const isActive = value === current;
    return (
        <button
            onClick={() => onClick(value)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                isActive ? 'bg-brand-primary text-white' : 'bg-brand-secondary hover:bg-gray-600'
            }`}
        >
            {children}
        </button>
    );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, propertyCount, weather, weatherLoading, weatherError, location, onApplyFilters, loading, onSaveSettings, onLoadSettings, savedSettingsExist }) => {
    const [saveButtonText, setSaveButtonText] = React.useState('Save Settings');

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, price: { ...prev.price, [e.target.name]: Number(e.target.value) } }));
    };
    
    const handleBedroomChange = (value: number | 'any') => {
        setFilters(prev => ({...prev, bedrooms: value}));
    };

    const handleBathroomChange = (value: number | 'any') => {
        setFilters(prev => ({...prev, bathrooms: value}));
    };
    
    const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({...prev, propertyType: e.target.value as PropertyType | 'any'}));
    }

    const handleSaveClick = () => {
        onSaveSettings();
        setSaveButtonText('Saved!');
        setTimeout(() => {
            setSaveButtonText('Save Settings');
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <WeatherWidget
                weather={weather}
                loading={weatherLoading}
                error={weatherError}
                location={location}
            />
            <h2 className="text-xl font-bold text-brand-text">Filters</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
                <div className="flex items-center space-x-2 text-brand-text">
                    <span>${filters.price.min.toLocaleString()}</span>
                    <input 
                        type="range" 
                        min="500" max="10000" step="100" 
                        value={filters.price.max}
                        onChange={(e) => setFilters(prev => ({...prev, price: {...prev.price, max: Number(e.target.value)}}))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <span>${filters.price.max.toLocaleString()}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bedrooms</label>
                <div className="flex space-x-2">
                    <FilterButton value="any" current={filters.bedrooms} onClick={handleBedroomChange}>Any</FilterButton>
                    {[1, 2, 3, 4, 5].map(v => <FilterButton key={v} value={v} current={filters.bedrooms} onClick={handleBedroomChange}>{v}</FilterButton>)}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bathrooms</label>
                <div className="flex space-x-2">
                    <FilterButton value="any" current={filters.bathrooms} onClick={handleBathroomChange}>Any</FilterButton>
                    {[1, 1.5, 2, 2.5, 3].map(v => <FilterButton key={v} value={v} current={filters.bathrooms} onClick={handleBathroomChange}>{v}{v % 1 !== 0 ? '' : '+'}</FilterButton>)}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Property Type</label>
                <select 
                    value={filters.propertyType}
                    onChange={handlePropertyTypeChange}
                    className="w-full bg-brand-background border border-gray-600 text-brand-text rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="any">Any</option>
                    {Object.values(PropertyType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            
            <div>
                 <label htmlFor="rentToOwn-toggle" className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-400">Rent to Own Only</span>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="rentToOwn-toggle" 
                            className="sr-only peer"
                            checked={filters.rentToOwn}
                            onChange={(e) => setFilters(prev => ({...prev, rentToOwn: e.target.checked}))}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </div>
                </label>
            </div>
             
            <div className="flex space-x-2">
                <button
                    onClick={handleSaveClick}
                    className="w-1/2 bg-brand-secondary text-brand-text font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:border-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    aria-label="Save current filter and location settings"
                >
                    {saveButtonText}
                </button>
                <button
                    onClick={onLoadSettings}
                    disabled={!savedSettingsExist}
                    className="w-1/2 bg-brand-secondary text-brand-text font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
                    aria-label="Load saved filter and location settings"
                >
                    Load Settings
                </button>
            </div>

            <button
                onClick={onApplyFilters}
                className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? 'Applying...' : 'Apply Filters'}
            </button>
            
            <div className="pt-4 border-t border-gray-700">
                <p className="text-brand-text font-bold">{propertyCount} results found</p>
            </div>
        </div>
    );
};