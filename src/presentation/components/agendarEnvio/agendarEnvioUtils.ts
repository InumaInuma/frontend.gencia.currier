import React, { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const selectedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const MapClickListener: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

export const MapController: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1 });
  }, [center, map]);
  return null;
};

export function isPointInPolygon(point: { lat: number; lng: number }, vs: { latitud: number; longitud: number }[]): boolean {
  if (!vs || vs.length < 3) return false;
  let x = point.lng, y = point.lat;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].longitud, yi = vs[i].latitud;
    let xj = vs[j].longitud, yj = vs[j].latitud;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Extrae latitud y longitud a partir de cualquier texto, coordenadas DMS sexagesimales, o URLs de Google Maps.
 */
export function extraerCoordenadasDeTexto(input: string): { lat: number; lng: number } | null {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // 1. Regex !3d{lat}!4d{lng} (Formatos internos de Google Maps)
  const match3d4d = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match3d4d) {
    const lat = parseFloat(match3d4d[1]);
    const lng = parseFloat(match3d4d[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 2. Regex /@{lat},{lng} (Formatos de vista de Google Maps)
  const matchAt = str.match(/\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (matchAt) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. Regex q={lat},{lng} o ll={lat},{lng} (Parámetros de consulta)
  const matchQuery = str.match(/[?&](?:q|ll)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (matchQuery) {
    const lat = parseFloat(matchQuery[1]);
    const lng = parseFloat(matchQuery[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 4. Regex DMS Sexagesimal: 12°05'22.4"S 77°02'20.2"W
  const matchDMS = str.match(/(\d+)\s*°\s*(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*"\s*([NSns])[\s,]*(\d+)\s*°\s*(\d+)\s*'\s*(\d+(?:\.\d+)?)\s*"\s*([EWEOeweo])/);
  if (matchDMS) {
    const latDeg = parseFloat(matchDMS[1]);
    const latMin = parseFloat(matchDMS[2]);
    const latSec = parseFloat(matchDMS[3]);
    const latDir = matchDMS[4].toUpperCase();

    const lngDeg = parseFloat(matchDMS[5]);
    const lngMin = parseFloat(matchDMS[6]);
    const lngSec = parseFloat(matchDMS[7]);
    const lngDir = matchDMS[8].toUpperCase();

    let lat = latDeg + latMin / 60 + latSec / 3600;
    if (latDir === 'S') lat = -lat;

    let lng = lngDeg + lngMin / 60 + lngSec / 3600;
    if (lngDir === 'W' || lngDir === 'O') lng = -lng;

    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 5. Coordenadas decimales directas: -12.089551, -77.038937 o -12.089551 -77.038937
  const matchDecimal = str.match(/(-?\d{1,2}\.\d+)\s*[\s,]\s*(-?\d{1,3}\.\d+)/);
  if (matchDecimal) {
    const lat = parseFloat(matchDecimal[1]);
    const lng = parseFloat(matchDecimal[2]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  return null;
}
