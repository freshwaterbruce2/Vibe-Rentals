import React from 'react';
import { FilterIcon } from './icons/FilterIcon';
import { ListIcon } from './icons/ListIcon';
import { MapIcon } from './icons/MapIcon';

interface MobileControlsProps {
    onFilterClick: () => void;
    mobileView: 'list' | 'map';
    setMobileView: (view: 'list' | 'map') => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onFilterClick, mobileView, setMobileView }) => {
    return (
        <div className="p-2 flex justify-between items-center bg-brand-secondary border-b border-gray-700 flex-shrink-0">
            <button
                onClick={onFilterClick}
                className="flex items-center space-x-2 px-3 py-2 bg-brand-background text-brand-text font-semibold rounded-lg border border-gray-600 hover:border-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
                <FilterIcon className="w-5 h-5" />
                <span>Filters</span>
            </button>
            <div className="flex items-center bg-brand-background rounded-lg p-1 border border-gray-600">
                <button 
                    onClick={() => setMobileView('list')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${mobileView === 'list' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}
                >
                    <ListIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setMobileView('map')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${mobileView === 'map' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}
                >
                    <MapIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};