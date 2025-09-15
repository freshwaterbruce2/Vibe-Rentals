import React from 'react';
import { PropertyType } from '../../types';
import { HouseIcon } from './HouseIcon';
import { ApartmentIcon } from './ApartmentIcon';
import { CondoIcon } from './CondoIcon';
import { TownhouseIcon } from './TownhouseIcon';

interface PropertyTypeIconProps extends React.SVGProps<SVGSVGElement> {
    propertyType: PropertyType | 'any';
}

export const PropertyTypeIcon: React.FC<PropertyTypeIconProps> = ({ propertyType, ...props }) => {
    switch (propertyType) {
        case PropertyType.House:
            return <HouseIcon {...props} />;
        case PropertyType.Apartment:
            return <ApartmentIcon {...props} />;
        case PropertyType.Condo:
            return <CondoIcon {...props} />;
        case PropertyType.Townhouse:
            return <TownhouseIcon {...props} />;
        default:
            return (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            );
    }
};
