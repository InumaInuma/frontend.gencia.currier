import L from 'leaflet';

// Fix Leaflet icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const greenPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const redPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Orange vertex icon for green polygon editor
export const vertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#f97316;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Red vertex icon for restricted zone editor
export const redVertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Yellow vertex icon for Zonas Alejadas editor
export const yellowVertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#eab308;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const yellowPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function stripClosingVertex(coords: [number, number][]): [number, number][] {
  let pts = [...coords];
  // Remove consecutive duplicate coordinates
  pts = pts.filter((v, idx) => {
    if (idx === 0) return true;
    const prev = pts[idx - 1];
    return Math.abs(v[0] - prev[0]) > 0.000001 || Math.abs(v[1] - prev[1]) > 0.000001;
  });
  // Remove all trailing vertices that match the first vertex
  while (
    pts.length > 1 &&
    Math.abs(pts[0][0] - pts[pts.length - 1][0]) < 0.000001 &&
    Math.abs(pts[0][1] - pts[pts.length - 1][1]) < 0.000001
  ) {
    pts.pop();
  }
  return pts;
}
