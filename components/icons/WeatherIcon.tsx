import React from 'react';

export const WeatherIcon: React.FC<{ condition: string; className?: string }> = ({ condition, className = "w-6 h-6" }) => {
    const normalizedCondition = condition.toLowerCase();

    if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        );
    }
    if (normalizedCondition.includes('cloud') || normalizedCondition.includes('overcast')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        );
    }
    if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle') || normalizedCondition.includes('shower')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                <path d="M16 14v6"/>
                <path d="M8 14v6"/>
                <path d="M12 16v6"/>
            </svg>
        );
    }
    if (normalizedCondition.includes('snow') || normalizedCondition.includes('sleet')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <path d="M12 2v10"/>
                <path d="M17 5L9.5 9.5"/>
                <path d="M7 5l7.5 4.5"/>
            </svg>
        );
    }
     if (normalizedCondition.includes('storm') || normalizedCondition.includes('thunder')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        );
    }
    return ( 
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    );
};