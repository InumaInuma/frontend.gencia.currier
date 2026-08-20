import React, { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';

export const MapClickAdder: React.FC<{
  active: boolean;
  onAdd: (lat: number, lng: number) => void;
}> = ({ active, onAdd }) => {
  useMapEvents({
    click(e) {
      if (active) onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapController: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1 });
    }
  }, [center, map]);
  return null;
};
