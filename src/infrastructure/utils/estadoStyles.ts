export interface IEstadoBadgeConfig {
  label: string;
  className: string;
}

export function getEstadoBadgeConfig(idEstadoOrName: number | string, customLabel?: string): IEstadoBadgeConfig {
  let id: number = typeof idEstadoOrName === 'number' ? idEstadoOrName : 0;

  if (typeof idEstadoOrName === 'string') {
    const lower = idEstadoOrName.toLowerCase().trim();
    if (lower === 'registrado' || lower.includes('registrado')) id = 1;
    else if (lower.includes('recojoasignado') || lower.includes('recojo asignado')) id = 2;
    else if (lower.includes('en camino al comercio')) id = 3;
    else if (lower.includes('llegó al comercio') || lower.includes('llego al comercio')) id = 4;
    else if (lower === 'recogido' || lower.includes('recogido')) id = 5;
    else if (lower.includes('en camino al almacén') || lower.includes('en camino al almacen')) id = 6;
    else if (lower.includes('en almacén') || lower.includes('en almacen')) id = 7;
    else if (lower.includes('entregaasignada') || lower.includes('entrega asignada')) id = 8;
    else if (lower.includes('en ruta')) id = 9;
    else if (lower.includes('a 20 min') || lower.includes('a 5 min')) id = 10;
    else if (lower === 'entregado' || lower.includes('entregado')) id = 11;
    else if (lower.includes('no entregado')) id = 12;
    else if (lower.includes('cancelado')) id = 13;
  }

  switch (id) {
    case 1: // Registrado
      return {
        label: customLabel || 'Registrado',
        className: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold',
      };
    case 2: // RecojoAsignado
      return {
        label: customLabel || 'Recojo Asignado',
        className: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold',
      };
    case 3: // En Camino al Comercio
      return {
        label: customLabel || 'En Camino al Comercio',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
      };
    case 4: // Llegó al Comercio
      return {
        label: customLabel || 'Llegó al Comercio',
        className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold',
      };
    case 5: // Recogido
      return {
        label: customLabel || 'Recogido',
        className: 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold',
      };
    case 6: // En Camino al Almacén
      return {
        label: customLabel || 'En Camino al Almacén',
        className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold',
      };
    case 7: // En Almacén
      return {
        label: customLabel || 'En Almacén',
        className: 'bg-slate-700/40 text-slate-200 border border-slate-600/50 font-bold',
      };
    case 8: // EntregaAsignada
      return {
        label: customLabel || 'Entrega Asignada',
        className: 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold',
      };
    case 9: // En Ruta
      return {
        label: customLabel || 'En Ruta',
        className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-extrabold animate-pulse',
      };
    case 10: // A 20 Minutos
      return {
        label: customLabel || 'A 20 Minutos',
        className: 'bg-amber-500/25 text-amber-300 border border-amber-400/60 font-extrabold animate-pulse',
      };
    case 11: // Entregado
      return {
        label: customLabel || 'Entregado',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold',
      };
    case 12: // No Entregado
      return {
        label: customLabel || 'No Entregado',
        className: 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold',
      };
    case 13: // Cancelado
      return {
        label: customLabel || 'Cancelado',
        className: 'bg-slate-800/60 text-slate-400 border border-slate-700/60 font-medium',
      };
    case 14: // Reprogramado
      return {
        label: customLabel || 'Reprogramado',
        className: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold',
      };
    default:
      return {
        label: customLabel || (typeof idEstadoOrName === 'string' ? idEstadoOrName : 'Procesando'),
        className: 'bg-slate-800 text-slate-300 border border-slate-700 font-medium',
      };
  }
}
