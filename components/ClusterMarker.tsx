import React from 'react';
import { Property } from '../types';

interface ClusterMarkerProps {
    cluster: { properties: Property[]; lat: number; lng: number };
    isSelected: boolean;
    isHovered: boolean;
    style: React.CSSProperties;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({ cluster, isSelected, isHovered, style, onMouseEnter, onMouseLeave, onClick }) => {
    const propertyCount = cluster.properties.length;
    const avgPrice = cluster.properties.reduce((sum, p) => sum + p.price, 0) / propertyCount;
    
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out"
            style={{ ...style, transform: `translate(-50%, -50%) scale(${isSelected || isHovered ? 1.1 : 1})` }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] bg-brand-background text-white text-xs rounded-md shadow-lg p-2 z-10 pointer-events-none animate-fade-in-up">
                    <p className="font-bold">{propertyCount} Properties</p>
                    <p className="text-brand-primary">Avg. Price: ${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                </div>
            )}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer
                ${isSelected ? 'bg-brand-primary/80 border-brand-primary' : 'bg-brand-secondary/80 border-gray-600'}
                ${isHovered ? 'border-brand-primary' : ''}`}
            >
                <span className="font-bold text-brand-text">{propertyCount}</span>
                 {isSelected && (
                    <span className="absolute inset-0 w-full h-full rounded-full bg-brand-primary opacity-50 animate-ping"></span>
                )}
            </div>
        </div>
    );
};