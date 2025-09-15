export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: PropertyType;
  amenities: string[];
  imageUrl: string;
  lat: number;
  lng: number;
  isRentToOwn?: boolean;
  privateSchools?: School[];
}

export interface School {
  name: string;
  distance: string;
}

export enum PropertyType {
    Apartment = 'Apartment',
    House = 'House',
    Condo = 'Condo',
    Townhouse = 'Townhouse',
}

export interface Filters {
    price: { min: number; max: number };
    bedrooms: number | 'any';
    bathrooms: number | 'any';
    propertyType: PropertyType | 'any';
    rentToOwn: boolean;
}

export interface Weather {
  temperature: number;
  condition: string;
  windSpeed: number;
}