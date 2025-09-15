import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Property, Weather, Filters, School } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface RentalListingsResponse {
    properties: Property[];
    sources: any[];
}

/**
 * A wrapper function to retry an async operation with exponential backoff.
 * This is used to handle transient errors like API rate limiting.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @returns The result of the apiCall.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 4, initialDelay = 3000): Promise<T> => {
    let retries = 0;
    let delay = initialDelay;

    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            // Simplified and more robust error detection for Gemini API rate limit errors.
            const errorString = JSON.stringify(error).toLowerCase();
            const isRateLimitError = (
                errorString.includes('429') || 
                errorString.includes('resource_exhausted') ||
                errorString.includes('rate limit')
            );

            if (isRateLimitError && retries < maxRetries) {
                retries++;
                // Add jitter to the delay to prevent synchronized retries in some scenarios
                const jitter = Math.random() * 1500;
                const waitTime = delay + jitter;
                console.warn(`API call failed due to rate limiting. Retrying in ${(waitTime / 1000).toFixed(2)}s... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                delay *= 2; // Double the delay for the next retry (exponential backoff).
            } else {
                // Re-throw the error if it's not a rate limit error or if max retries are reached.
                throw error;
            }
        }
    }
};

export const generateRentalListings = async (location: string, filters: Filters): Promise<RentalListingsResponse> => {
    const apiCall = async () => {
        let prompt = `Search the web extensively for rental properties across Tennessee, focusing on listings from private landlords, smaller property management companies, and local Tennessee listing sites. Prioritize sources that are not major, national real estate aggregators. Include standard rentals and "rent to own" properties. Find a diverse and realistic list of up to 60 properties in ${location}.`;

        const hasFilters = filters.price.max < 10000 || filters.bedrooms !== 'any' || filters.bathrooms !== 'any' || filters.propertyType !== 'any' || filters.rentToOwn;

        if (hasFilters) {
            prompt += `\nThe listings must strictly match all of the following criteria:`;
            if (filters.price.max < 10000) {
                prompt += `\n- Price: Between $${filters.price.min} and $${filters.price.max} per month.`;
            }
            if (filters.bedrooms !== 'any') {
                prompt += `\n- Bedrooms: ${filters.bedrooms} or more.`;
            }
            if (filters.bathrooms !== 'any') {
                prompt += `\n- Bathrooms: ${filters.bathrooms} or more.`;
            }
            if (filters.propertyType !== 'any') {
                prompt += `\n- Property Type: Must be a '${filters.propertyType}'.`;
            }
            if (filters.rentToOwn) {
                prompt += `\n- The property MUST be available for 'Rent to Own'.`;
            }
        }

        prompt += `\n\nFor each property, you MUST find contact information (a name, phone number, or email). Also find 2-3 nearby private schools and list their name and approximate distance (e.g., '1.2 miles'). Format the response as a valid JSON array of objects. Each object must conform to this TypeScript interface:
interface Property {
  id: string; // A unique identifier
  address: string;
  city: string;
  state: string; // Should be 'TN'
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
  isRentToOwn?: boolean; // Set to true if it is a rent-to-own property
  privateSchools?: { name: string; distance: string; }[]; // List of 2-3 nearby private schools with name and distance.
  contact?: { name?: string; phone?: string; email?: string; }; // Contact info for the landlord or property manager.
}
Ensure the entire response is only the JSON array, with no surrounding text or markdown.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        if (!response || !response.text) {
            console.error("No text content received from Gemini API for rental listings.", response);
            throw new Error("The AI model did not return any content. This could be due to a safety block or an empty response.");
        }

        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        const properties = JSON.parse(jsonText) as Property[];
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { properties, sources };
    };
    
    try {
        return await withRetry(apiCall);
    } catch (error) {
        console.error("Error generating rental listings:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse property listings from AI response. The format was invalid.");
        }
        const errorMessage = JSON.stringify(error).toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
            throw new Error("API quota exceeded. Please wait a moment before trying again.");
        }
        if (error instanceof Error) {
            throw error; // Re-throw errors from the apiCall like the custom one.
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
    const apiCall = async () => {
        const prompt = `Get the current weather for ${location}. Provide the temperature in Fahrenheit, a short weather condition description, and the wind speed in mph.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weatherSchema
            }
        });

        if (!response || !response.text) {
            console.error("No text content received from Gemini API for weather.", response);
            throw new Error("The AI model did not return any weather content.");
        }

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Weather;
    };

    try {
        return await withRetry(apiCall);
    } catch (error) {
        console.error(`Error fetching weather for ${location}:`, error);
        const errorMessage = JSON.stringify(error).toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
            throw new Error("API quota exceeded. Could not load weather data.");
        }
        if (error instanceof Error) {
            throw error; // Re-throw errors from the apiCall
        }
        throw new Error("Failed to fetch weather information.");
    }
};

export const generatePropertyImage = async (property: Property): Promise<string> => {
    const apiCall = async () => {
        const typeDescription = property.propertyType === 'Apartment' ? 'a modern apartment building' : `a charming ${property.propertyType}`;
        const prompt = `A realistic, high-quality photograph of the exterior of ${typeDescription} in ${property.city}, ${property.state}. The style should be like a professional real estate listing photo, suitable for a sunny day.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed, no images returned.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    };
    
    // Use a shorter retry for image generation as it can be a longer process
    try {
        return await withRetry(apiCall, 2, 2000);
    } catch (error) {
         console.error(`Error generating image for property ${property.id}:`, error);
         throw new Error("Failed to generate property image.");
    }
};

export const enhancePropertyImage = async (base64ImageData: string): Promise<string> => {
    const apiCall = async () => {
        // The base64 string might have a data URI prefix, e.g., "data:image/jpeg;base64,".
        // The API needs just the raw base64 data.
        const pureBase64 = base64ImageData.split(',')[1] || base64ImageData;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: pureBase64,
                            mimeType: 'image/jpeg',
                        },
                    },
                    {
                        text: 'Enhance and upscale this real estate photo, significantly improving its resolution, lighting, and clarity. Make it look more professional and high-quality.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("Image enhancement failed: No candidates returned.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            const safetyRatings = response.candidates?.[0]?.safetyRatings;
            if(safetyRatings && safetyRatings.some(rating => rating.probability !== 'NEGLIGIBLE')) {
                 throw new Error("Image enhancement blocked due to safety settings.");
            }
            throw new Error("Image enhancement failed: No image data in the response.");
        }
        
        const base64ImageBytes: string = imagePart.inlineData.data;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    };

    try {
        return await withRetry(apiCall, 2, 2000);
    } catch (error) {
        console.error(`Error enhancing image:`, error);
        if (error instanceof Error) {
            throw error; // Re-throw specific errors
        }
        throw new Error("Failed to enhance property image.");
    }
};