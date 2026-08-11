export interface IZonaCoberturaInfo {
  id: number;
  nombre: string;
  zonaNombre: string;
  coberturaActiva: boolean;
  lat: number;
  lng: number;
  tarifaDespacho: number;
  polygonCoords?: [number, number][];
}

// Unified main polygon representing Lima Metropolitan Coverage Zone (Miraflores, San Isidro, Surco, SJL, Los Olivos, Callao, Ate, etc.)
export const LIMA_COVERAGE_MAIN_POLYGON: [number, number][] = [
  [-11.9200, -77.0800], // Comas / SMP Norte
  [-11.9400, -76.9800], // SJL Norte
  [-11.9900, -76.9600], // SJL Este
  [-12.0300, -76.9000], // Ate Vitarte
  [-12.0800, -76.9100], // La Molina / Santa Anita
  [-12.1500, -76.9300], // Surco / VMT / SJM
  [-12.2250, -76.9300], // Villa El Salvador
  [-12.1950, -77.0250], // Chorrillos Costa
  [-12.1450, -77.0350], // Barranco / Miraflores Costa
  [-12.0950, -77.0850], // San Miguel Costa
  [-12.0550, -77.1450], // Callao Puerto / La Perla
  [-11.9800, -77.1100], // Los Olivos / SMP Oeste
  [-11.9200, -77.0800]  // Closing loop
];

// Uncovered Outer Region Polygons (Red transparent areas)
export const UNCOVERED_POLYGONS: { id: number; nombre: string; coords: [number, number][] }[] = [
  {
    id: 31,
    nombre: 'Ancón & Carabayllo Norte (Sin Cobertura)',
    coords: [
      [-11.7500, -77.1900],
      [-11.7500, -77.0100],
      [-11.9150, -77.0200],
      [-11.9150, -77.1900]
    ]
  },
  {
    id: 36,
    nombre: 'Chosica & Chaclacayo (Sin Cobertura)',
    coords: [
      [-11.9100, -76.8500],
      [-11.9100, -76.6500],
      [-12.0200, -76.6500],
      [-12.0200, -76.8500]
    ]
  },
  {
    id: 37,
    nombre: 'Cieneguilla & Pachacámac Este (Sin Cobertura)',
    coords: [
      [-12.0500, -76.8500],
      [-12.0500, -76.7000],
      [-12.2300, -76.7000],
      [-12.2300, -76.8500]
    ]
  },
  {
    id: 40,
    nombre: 'Balnearios del Sur (Lurín, San Bartolo - Sin Cobertura)',
    coords: [
      [-12.2300, -76.9200],
      [-12.2300, -76.7500],
      [-12.3800, -76.7500],
      [-12.3800, -76.9200]
    ]
  }
];

export const LIMA_DISTRITOS_DEFAULT: IZonaCoberturaInfo[] = [
  { id: 1, nombre: 'Miraflores', zonaNombre: 'Lima Centro / Sur', coberturaActiva: true, lat: -12.1221, lng: -77.0312, tarifaDespacho: 10.00 },
  { id: 2, nombre: 'San Isidro', zonaNombre: 'Lima Centro / Financiera', coberturaActiva: true, lat: -12.0975, lng: -77.0361, tarifaDespacho: 10.00 },
  { id: 3, nombre: 'Santiago de Surco', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.1465, lng: -76.9911, tarifaDespacho: 12.00 },
  { id: 4, nombre: 'San Borja', zonaNombre: 'Lima Centro / Este', coberturaActiva: true, lat: -12.0886, lng: -77.0022, tarifaDespacho: 10.00 },
  { id: 5, nombre: 'Lince', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0847, lng: -77.0347, tarifaDespacho: 9.00 },
  { id: 6, nombre: 'Jesús María', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0781, lng: -77.0475, tarifaDespacho: 9.00 },
  { id: 7, nombre: 'Magdalena del Mar', zonaNombre: 'Lima Centro / Costa', coberturaActiva: true, lat: -12.0911, lng: -77.0708, tarifaDespacho: 10.00 },
  { id: 8, nombre: 'Pueblo Libre', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0736, lng: -77.0628, tarifaDespacho: 9.00 },
  { id: 9, nombre: 'San Miguel', zonaNombre: 'Lima Oeste', coberturaActiva: true, lat: -12.0786, lng: -77.0914, tarifaDespacho: 10.00 },
  { id: 10, nombre: 'La Victoria', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0653, lng: -77.0175, tarifaDespacho: 9.00 },
  { id: 11, nombre: 'Cercado de Lima', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0464, lng: -77.0428, tarifaDespacho: 10.00 },
  { id: 12, nombre: 'Barranco', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.1492, lng: -77.0211, tarifaDespacho: 10.00 },
  { id: 13, nombre: 'Chorrillos', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.1800, lng: -77.0167, tarifaDespacho: 12.00 },
  { id: 14, nombre: 'Ate Vitarte', zonaNombre: 'Lima Este', coberturaActiva: true, lat: -12.0425, lng: -76.9242, tarifaDespacho: 15.00 },
  { id: 15, nombre: 'Santa Anita', zonaNombre: 'Lima Este', coberturaActiva: true, lat: -12.0433, lng: -76.9719, tarifaDespacho: 12.00 },
  { id: 16, nombre: 'San Juan de Lurigancho', zonaNombre: 'Lima Norte / Este', coberturaActiva: true, lat: -11.9806, lng: -76.9961, tarifaDespacho: 15.00 },
  { id: 17, nombre: 'Los Olivos', zonaNombre: 'Lima Norte', coberturaActiva: true, lat: -11.9822, lng: -77.0711, tarifaDespacho: 14.00 },
  { id: 18, nombre: 'San Martín de Porres', zonaNombre: 'Lima Norte', coberturaActiva: true, lat: -12.0125, lng: -77.0811, tarifaDespacho: 14.00 },
  { id: 19, nombre: 'Comas', zonaNombre: 'Lima Norte', coberturaActiva: true, lat: -11.9364, lng: -77.0506, tarifaDespacho: 16.00 },
  { id: 20, nombre: 'Callao (Provincia Constitucional)', zonaNombre: 'Callao', coberturaActiva: true, lat: -12.0564, lng: -77.1181, tarifaDespacho: 15.00 },
  { id: 21, nombre: 'Bellavista (Callao)', zonaNombre: 'Callao', coberturaActiva: true, lat: -12.0622, lng: -77.1106, tarifaDespacho: 14.00 },
  { id: 22, nombre: 'La Perla (Callao)', zonaNombre: 'Callao', coberturaActiva: true, lat: -12.0686, lng: -77.1194, tarifaDespacho: 14.00 },
  { id: 23, nombre: 'La Molina', zonaNombre: 'Lima Este', coberturaActiva: true, lat: -12.0833, lng: -76.9389, tarifaDespacho: 15.00 },
  { id: 24, nombre: 'San Juan de Miraflores', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.1583, lng: -76.9694, tarifaDespacho: 14.00 },
  { id: 25, nombre: 'Villa María del Triunfo', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.1639, lng: -76.9389, tarifaDespacho: 15.00 },
  { id: 26, nombre: 'Villa El Salvador', zonaNombre: 'Lima Sur', coberturaActiva: true, lat: -12.2167, lng: -76.9333, tarifaDespacho: 16.00 },
  { id: 27, nombre: 'Independencia', zonaNombre: 'Lima Norte', coberturaActiva: true, lat: -11.9944, lng: -77.0528, tarifaDespacho: 14.00 },
  { id: 28, nombre: 'Rímac', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0306, lng: -77.0306, tarifaDespacho: 11.00 },
  { id: 29, nombre: 'Breña', zonaNombre: 'Lima Centro', coberturaActiva: true, lat: -12.0569, lng: -77.0489, tarifaDespacho: 9.00 },
  { id: 30, nombre: 'El Agustino', zonaNombre: 'Lima Centro / Este', coberturaActiva: true, lat: -12.0478, lng: -76.9972, tarifaDespacho: 12.00 },

  // Distritos en Zona Restringida / SIN COBERTURA
  { id: 31, nombre: 'Ancón', zonaNombre: 'Lima Norte Periférica', coberturaActiva: false, lat: -11.7733, lng: -77.1764, tarifaDespacho: 0.00 },
  { id: 32, nombre: 'Ventanilla (Callao)', zonaNombre: 'Callao Norte', coberturaActiva: false, lat: -11.8783, lng: -77.1264, tarifaDespacho: 0.00 },
  { id: 33, nombre: 'Puente Piedra', zonaNombre: 'Lima Norte Periférica', coberturaActiva: false, lat: -11.8667, lng: -77.0833, tarifaDespacho: 0.00 },
  { id: 34, nombre: 'Carabayllo', zonaNombre: 'Lima Norte Periférica', coberturaActiva: false, lat: -11.8483, lng: -77.0264, tarifaDespacho: 0.00 },
  { id: 35, nombre: 'Chaclacayo', zonaNombre: 'Lima Este Periférica', coberturaActiva: false, lat: -11.9733, lng: -76.7667, tarifaDespacho: 0.00 },
  { id: 36, nombre: 'Lurigancho - Chosica', zonaNombre: 'Lima Este Periférica', coberturaActiva: false, lat: -11.9389, lng: -76.7028, tarifaDespacho: 0.00 },
  { id: 37, nombre: 'Cieneguilla', zonaNombre: 'Lima Este Periférica', coberturaActiva: false, lat: -12.0917, lng: -76.7722, tarifaDespacho: 0.00 },
  { id: 38, nombre: 'Lurín', zonaNombre: 'Lima Sur Periférica', coberturaActiva: false, lat: -12.2750, lng: -76.8694, tarifaDespacho: 0.00 },
  { id: 39, nombre: 'Pachacámac', zonaNombre: 'Lima Sur Periférica', coberturaActiva: false, lat: -12.2306, lng: -76.8583, tarifaDespacho: 0.00 },
  { id: 40, nombre: 'Punta Hermosa / San Bartolo', zonaNombre: 'Balnearios del Sur', coberturaActiva: false, lat: -12.3389, lng: -76.8250, tarifaDespacho: 0.00 }
];

const STORAGE_KEY = 'almain_cobertura_distritos_v2';

export function obtenerDistritosCobertura(): IZonaCoberturaInfo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading localStorage coverage:', e);
  }
  return LIMA_DISTRITOS_DEFAULT;
}

export function guardarDistritosCobertura(list: IZonaCoberturaInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving localStorage coverage:', e);
  }
}

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function detectarDistritoCercano(lat: number, lng: number): IZonaCoberturaInfo {
  const currentList = obtenerDistritosCobertura();
  let minDistance = Infinity;
  let closest = currentList[0];

  for (const d of currentList) {
    const dist = calcularDistanciaKm(lat, lng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return closest;
}
