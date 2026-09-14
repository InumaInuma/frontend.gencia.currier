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
    map.flyTo([center.lat, center.lng], 15, { animate: true, duration: 1.2 });
  }, [center.lat, center.lng, map]);
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
  const raw = input.trim();
  let str = raw;
  try {
    str = decodeURIComponent(raw);
  } catch (e) {
    // Si falla el decode URI, usar raw
  }

  // 1. Regex !3d{lat}!4d{lng} (Marcador interno exacto)
  const match3d4d = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match3d4d) {
    const lat = parseFloat(match3d4d[1]);
    const lng = parseFloat(match3d4d[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 2. Regex /search/{lat},{lng} o /search/{lat},+{lng} (URL de búsqueda de Google Maps)
  const matchSearch = str.match(/(?:maps\/)?search\/(-?\d+\.\d+)[,\s\+]+(-?\d+\.\d+)/);
  if (matchSearch) {
    const lat = parseFloat(matchSearch[1]);
    const lng = parseFloat(matchSearch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. Regex q={lat},{lng} o ll={lat},{lng} o destination o query o daddr o center
  const matchQuery = str.match(/[?&](?:q|ll|query|destination|daddr|center)=(-?\d+\.\d+)[,\s\+]+(-?\d+\.\d+)/);
  if (matchQuery) {
    const lat = parseFloat(matchQuery[1]);
    const lng = parseFloat(matchQuery[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 4. Regex ruta de direcciones /dir/.../{lat},{lng}
  const matchDir = str.match(/(?:dir|maps\/dir)\/[^\/]*\/(-?\d+\.\d+)[,\s\+]+(-?\d+\.\d+)/);
  if (matchDir) {
    const lat = parseFloat(matchDir[1]);
    const lng = parseFloat(matchDir[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 5. Regex DMS Sexagesimal: 12°05'22.4"S 77°02'20.2"W
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

  // 6. Coordenadas decimales explícitas: -12.089551, -77.038937 o -12.089551,+-77.038937 o -12.089551 -77.038937
  const matchDecimal = str.match(/(-?\d{1,2}\.\d{3,})[,\s\+]+(-?\d{1,3}\.\d{3,})/);
  if (matchDecimal) {
    const lat = parseFloat(matchDecimal[1]);
    const lng = parseFloat(matchDecimal[2]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  // 7. Regex /@{lat},{lng} (Formatos de vista o viewport de Google Maps)
  const matchAt = str.match(/\/@(-?\d+\.\d+)[,\s\+]+(-?\d+\.\d+)/);
  if (matchAt) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

/**
 * Normaliza cadenas removiendo acentos, signos y convirtiendo a minúsculas.
 */
export const normalizarTextoDistrito = (texto: string): string => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Busca de forma inteligente y exacta el distrito en la lista oficial de la base de datos
 * soportando acentos, mayúsculas/minúsculas y alias comunes de Lima Metropolitana.
 */
export const buscarDistritoEnLista = (
  candidato: string,
  listaDistritos: { id: number; nombre: string }[]
): { id: number; nombre: string } | undefined => {
  if (!candidato || !listaDistritos || listaDistritos.length === 0) return undefined;
  const normCandidato = normalizarTextoDistrito(candidato);

  // 1. Coincidencia exacta normalizada
  const exact = listaDistritos.find((d) => normalizarTextoDistrito(d.nombre) === normCandidato);
  if (exact) return exact;

  // 2. Mapeo de alias y variantes comunes en Lima
  const aliasMap: Record<string, string[]> = {
    'cercado de lima': ['lima', 'centro de lima', 'lima cercado'],
    'santiago de surco': ['surco'],
    'magdalena del mar': ['magdalena'],
    'san juan de lurigancho': ['sjl'],
    'san martin de porres': ['smp'],
    'lurigancho - chosica': ['chosica', 'lurigancho'],
    'callao (provincia constitucional)': ['callao'],
    'bellavista (callao)': ['bellavista'],
    'la perla (callao)': ['la perla'],
    'carmen de la legua reynoso': ['carmen de la legua'],
    'ventanilla (callao)': ['ventanilla']
  };

  for (const [distritoOficial, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((a) => normCandidato === a || normCandidato.includes(a))) {
      const match = listaDistritos.find(
        (d) => normalizarTextoDistrito(d.nombre) === normalizarTextoDistrito(distritoOficial)
      );
      if (match) return match;
    }
  }

  // 3. Coincidencia de subcadenas si es suficientemente descriptiva (>= 4 letras)
  if (normCandidato.length >= 4) {
    const subMatch = listaDistritos.find((d) => {
      const normD = normalizarTextoDistrito(d.nombre);
      return normD.includes(normCandidato) || normCandidato.includes(normD);
    });
    if (subMatch) return subMatch;
  }

  return undefined;
};
