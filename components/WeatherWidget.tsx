import React from 'react';
import { Weather } from '../types';
import { WeatherIcon } from './icons/WeatherIcon';

interface WeatherWidgetProps {
    weather: Weather | null;
    loading: boolean;
    error: string | null;
    location: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading, error, location }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-brand-text mb-2">Current Weather</h3>
            <div className="p-3 bg-brand-background rounded-lg">
                {loading && (
                    <div className="animate-pulse flex items-center space-x-4">
                        <div className="rounded-full bg-gray-600 h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
                {!loading && !error && weather && (
                    <div className="flex items-center space-x-4">
                        <WeatherIcon condition={weather.condition} className="w-10 h-10 text-brand-primary" />
                        <div>
                            <p className="text-brand-text font-semibold capitalize">{location.split(',')[0]}</p>
                            <p className="text-2xl font-bold text-brand-text">{Math.round(weather.temperature)}°F</p>
                            <p className="text-sm text-gray-400">{weather.condition}</p>
                        </div>
                    </div>
                )}
                 {!loading && !error && !weather && (
                    <p className="text-sm text-gray-400">Weather data unavailable.</p>
                 )}
            </div>
        </div>
    );
};