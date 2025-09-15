import React from 'react';

interface HeaderProps {
    location: string;
    setLocation: (location: string) => void;
    onSearch: () => void;
    loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ location, setLocation, onSearch, loading }) => {

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
        }
    };

    return (
        <header className="bg-brand-secondary shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center space-x-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19l-4.95-5.05a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-brand-text">RentScout</h1>
            </div>
            <form className="flex-grow max-w-xl" onSubmit={handleSearch} autoComplete="off">
                <div className="relative">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a city, e.g., 'Nashville, TN'"
                        className="w-full bg-brand-background border border-gray-600 text-brand-text rounded-full py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-full hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>
            <div className="w-40"></div>
        </header>
    );
};