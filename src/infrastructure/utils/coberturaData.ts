export interface IZonaCoberturaInfo {
  id: number;
  nombre: string;
  zonaNombre: string;
  coberturaActiva: boolean;
  lat: number;
  lng: number;
  tarifaDespacho: number;
}

export const LIMA_DISTRITOS_COBERTURA: IZonaCoberturaInfo[] = [
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
  { id: 30, nombre: 'El Agustino', zonaNombre: 'Lima Centro / Este', coberturaActiva: true, lat: -12.0478, lng: -76.9972, tarifaDespacho: 12.00 }
];

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
  let minDistance = Infinity;
  let closest = LIMA_DISTRITOS_COBERTURA[0];

  for (const d of LIMA_DISTRITOS_COBERTURA) {
    const dist = calcularDistanciaKm(lat, lng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return closest;
}
