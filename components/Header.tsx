import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getLocationSuggestions } from '../services/geminiService';

interface HeaderProps {
    location: string;
    setLocation: (location: string) => void;
    onSearch: () => void;
    onSuggestionSelect: (location: string) => void;
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
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

export const Header: React.FC<HeaderProps> = ({ location, setLocation, onSearch, onSuggestionSelect }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debouncedLocation = useDebounce(location, 300);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedLocation) {
                const result = await getLocationSuggestions(debouncedLocation);
                setSuggestions(result);
                setShowSuggestions(result.length > 0);
                setActiveIndex(-1);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };
        fetchSuggestions();
    }, [debouncedLocation]);

    const handleSelect = (suggestion: string) => {
        onSuggestionSelect(suggestion);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex > -1) {
                handleSelect(suggestions[activeIndex]);
            } else {
                onSearch();
                setShowSuggestions(false);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };
    
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowSuggestions(false);
        onSearch();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-brand-secondary shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19l-4.95-5.05a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-brand-text">RentScout</h1>
            </div>
            <form className="flex-grow max-w-xl" onSubmit={handleSearch} autoComplete="off">
                <div className="relative" ref={containerRef}>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city, e.g., 'San Francisco, CA'"
                        className="w-full bg-brand-background border border-gray-600 text-brand-text rounded-full py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-full hover:bg-opacity-80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute top-full mt-2 w-full bg-brand-secondary border border-gray-600 rounded-md shadow-lg overflow-hidden">
                            {suggestions.map((s, index) => (
                                <li 
                                    key={s}
                                    className={`px-4 py-2 cursor-pointer text-brand-text ${
                                        index === activeIndex ? 'bg-brand-primary' : 'hover:bg-gray-600'
                                    }`}
                                    onClick={() => handleSelect(s)}
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </form>
            <div className="w-40"></div>
        </header>
    );
};