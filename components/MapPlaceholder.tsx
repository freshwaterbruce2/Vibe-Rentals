import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { CompassIcon } from './icons/CompassIcon';
import { PropertyMarker } from './PropertyMarker';
import { ClusterMarker } from './ClusterMarker';

interface MapPlaceholderProps {
    properties: Property[];
    selectedPropertyId: string | null;
    onSelectProperty: (id: string | null) => void;
    hoveredPropertyId: string | null;
    setHoveredPropertyId: (id: string | null) => void;
    onClusterClick: (propertyIds: string[]) => void;
}

const CLUSTER_RADIUS = 0.07; 

const normalizeCoords = (properties: Property[]): { id: string; lat: number; lng: number }[] => {
    if (properties.length === 0) return [];

    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return properties.map(p => ({
        id: p.id,
        lat: (p.lat - minLat) / latRange,
        lng: (p.lng - minLng) / lngRange,
    }));
};


export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ properties, selectedPropertyId, onSelectProperty, hoveredPropertyId, setHoveredPropertyId, onClusterClick }) => {
    const [mapHover, setMapHover] = useState<{ id: string; isCluster: boolean } | null>(null);
    const normalizedCoords = useMemo(() => normalizeCoords(properties), [properties]);

    const clusters = useMemo(() => {
        const coordsWithProps = normalizedCoords.map(coord => ({
            ...coord,
            property: properties.find(p => p.id === coord.id)!
        }));

        const clusters: { properties: Property[], lat: number, lng: number }[] = [];
        const processedIds = new Set<string>();

        for (const point of coordsWithProps) {
            if (processedIds.has(point.id)) continue;
            
            const neighbors = coordsWithProps.filter(neighbor => {
                if (processedIds.has(neighbor.id)) return false;
                const distance = Math.sqrt(Math.pow(point.lat - neighbor.lat, 2) + Math.pow(point.lng - neighbor.lng, 2));
                return distance < CLUSTER_RADIUS;
            });

            if (neighbors.length > 0) {
                 const clusterProperties = neighbors.map(n => n.property);
                 const avgLat = neighbors.reduce((sum, n) => sum + n.lat, 0) / neighbors.length;
                 const avgLng = neighbors.reduce((sum, n) => sum + n.lng, 0) / neighbors.length;
                 
                 clusters.push({ properties: clusterProperties, lat: avgLat, lng: avgLng });
                 neighbors.forEach(n => processedIds.add(n.id));
            }
        }
        return clusters;

    }, [normalizedCoords, properties]);

    const handlePropertyMouseEnter = (id: string) => {
        setMapHover({ id, isCluster: false });
        setHoveredPropertyId(id);
    };

    const handlePropertyMouseLeave = () => {
        setMapHover(null);
        setHoveredPropertyId(null);
    };
    
    const handleClusterMouseEnter = (id: string) => {
        setMapHover({ id, isCluster: true });
    };
    
    const handleClusterMouseLeave = () => {
        setMapHover(null);
    };

    return (
        <div className="w-full h-full bg-brand-background relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-gray-800/30 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23393E46%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            
            <div className="absolute inset-0 p-4">
               {clusters.map((cluster, index) => {
                    const clusterId = `cluster-${index}`;
                    const isSelected = cluster.properties.some(p => p.id === selectedPropertyId);

                    if (cluster.properties.length > 1) {
                        return (
                             <ClusterMarker
                                key={clusterId}
                                cluster={cluster}
                                isSelected={isSelected}
                                isHovered={mapHover?.id === clusterId}
                                onMouseEnter={() => handleClusterMouseEnter(clusterId)}
                                onMouseLeave={handleClusterMouseLeave}
                                onClick={() => onClusterClick(cluster.properties.map(p => p.id))}
                                style={{
                                    left: `${cluster.lng * 95 + 2.5}%`,
                                    top: `${(1 - cluster.lat) * 95 + 2.5}%`,
                                }}
                            />
                        );
                    }
                    
                    const property = cluster.properties[0];
                     return (
                         <PropertyMarker
                            key={property.id}
                            property={property}
                            isSelected={property.id === selectedPropertyId}
                            isHovered={mapHover?.id === property.id || hoveredPropertyId === property.id}
                            onSelect={onSelectProperty}
                            onMouseEnter={() => handlePropertyMouseEnter(property.id)}
                            onMouseLeave={handlePropertyMouseLeave}
                            style={{
                                left: `${cluster.lng * 95 + 2.5}%`,
                                top: `${(1 - cluster.lat) * 95 + 2.5}%`,
                            }}
                        />
                     );
               })}
            </div>
             <CompassIcon className="absolute top-4 right-4 h-12 w-12 text-gray-500 opacity-75" />
        </div>
    );
};