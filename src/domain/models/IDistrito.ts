export interface IDistrito {
  id: number;
  nombre: string;
  coberturaActiva?: boolean;
  latitud?: number;
  longitud?: number;
  tarifaDespacho?: number;
  zonaNombre?: string;
}
