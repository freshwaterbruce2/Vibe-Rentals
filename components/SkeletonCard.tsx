
import React from 'react';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-brand-secondary rounded-lg overflow-hidden shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-600"></div>
            <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-600 rounded w-1/3"></div>
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="flex justify-between items-center pt-2">
                    <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};
