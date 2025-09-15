import { GoogleGenAI, Type } from "@google/genai";
import { Property, Weather } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface RentalListingsResponse {
    properties: Property[];
    sources: any[];
}

export const generateRentalListings = async (location: string): Promise<RentalListingsResponse> => {
    try {
        const prompt = `Search the web extensively to find a diverse and realistic list of 15 rental property listings in ${location}. Look for properties from various sources like real estate websites, apartment complex sites, and local classifieds to ensure a wide range of options. Format the response as a valid JSON array of objects. Each object must conform to this TypeScript interface:
interface Property {
  id: string; // A unique identifier
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number; // Monthly rental price in USD
  bedrooms: number;
  bathrooms: number; // Can be a float, e.g., 1.5
  sqft: number;
  propertyType: 'Apartment' | 'House' | 'Condo' | 'Townhouse';
  amenities: string[]; // List of 4-6 key amenities
  imageUrl: string; // A unique placeholder URL from picsum.photos, e.g., https://picsum.photos/seed/{unique_word}/800/600
  lat: number; // Plausible latitude for the location
  lng: number; // Plausible longitude for the location
}
Ensure the entire response is only the JSON array, with no surrounding text or markdown.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        const properties = JSON.parse(jsonText) as Property[];
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { properties, sources };

    } catch (error) {
        console.error("Error generating rental listings:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse property listings from AI response. The format was invalid.");
        }
        throw new Error("Failed to fetch rental listings. Please try again later.");
    }
};


const weatherSchema = {
    type: Type.OBJECT,
    properties: {
        temperature: { type: Type.NUMBER, description: 'The current temperature in Fahrenheit.' },
        condition: { type: Type.STRING, description: 'A short description of the weather condition, e.g., "Sunny", "Partly Cloudy".' },
        windSpeed: { type: Type.NUMBER, description: 'The current wind speed in miles per hour (mph).' }
    },
    required: ["temperature", "condition", "windSpeed"]
};


export const getWeatherInfo = async (location: string): Promise<Weather> => {
    try {
        const prompt = `Get the current weather for ${location}. Provide the temperature in Fahrenheit, a short weather condition description, and the wind speed in mph.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weatherSchema
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Weather;

    } catch (error) {
        console.error(`Error fetching weather for ${location}:`, error);
        throw new Error("Failed to fetch weather information.");
    }
};

const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A location suggestion, e.g., 'San Francisco, CA, USA'"
            }
        }
    },
    required: ["suggestions"]
};

export const getLocationSuggestions = async (query: string): Promise<string[]> => {
    if (!query.trim()) {
        return [];
    }
    try {
        const prompt = `Provide up to 5 city name suggestions for the partial input "${query}". The suggestions should be in the format 'City, State' or 'City, Country'.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { suggestions: string[] };
        return result.suggestions || [];
    } catch (error) {
        console.error("Error fetching location suggestions:", error);
        return [];
    }
};