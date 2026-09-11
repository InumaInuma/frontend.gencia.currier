import React, { useState } from 'react';
import type { IColaborador } from '../../../infrastructure/repositories/ColaboradoresRepository';
import {
  Bike,
  Shield,
  Phone,
  Mail,
  Car,
  Clock,
  CheckCircle2,
  MessageCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  colaboradores: IColaborador[];
  pageSize?: number;
}

export const TablaColaboradores: React.FC<Props> = ({
  colaboradores,
  pageSize = 10
}) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [vistaModo, setVistaModo] = useState<'tabla' | 'tarjetas'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 'tabla' : 'tarjetas';
    }
    return 'tabla';
  });

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (correo: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(correo);
    setCopiedEmail(correo);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Reset de página al cambiar los datos
  React.useEffect(() => {
    setPaginaActual(1);
  }, [colaboradores]);

  const totalRegistros = colaboradores.length;
  const totalPaginas = Math.ceil(totalRegistros / pageSize) || 1;
  const indiceInicio = (paginaActual - 1) * pageSize;
  const colaboradoresPaginados = colaboradores.slice(indiceInicio, indiceInicio + pageSize);

  if (totalRegistros === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-3">
        <Users className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No se encontraron colaboradores</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No hay registros que coincidan con la búsqueda o filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de Vista (Tabla vs Tarjetas en pantallas grandes) */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
          Mostrando <span className="text-white font-bold">{colaboradoresPaginados.length}</span> de{' '}
          <span className="text-white font-bold">{totalRegistros}</span> colaboradores
        </div>

        <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setVistaModo('tabla')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              vistaModo === 'tabla' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tabla"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setVistaModo('tarjetas')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              vistaModo === 'tarjetas' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Vista de Tarjetas"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* VISTA TABLA (ESCRITORIO) */}
      <div className={`${vistaModo === 'tabla' ? 'hidden lg:block' : 'hidden'} bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 pl-5 pr-2">Colaborador</th>
                <th className="py-3.5 pl-2 pr-3">Documento</th>
                <th className="py-3.5 px-3">Rol</th>
                <th className="py-3.5 px-3">Contacto</th>
                <th className="py-3.5 px-3">Vehículo / Placa</th>
                <th className="py-3.5 px-3">Seguridad / Clave</th>
                <th className="py-3.5 pl-2 pr-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {colaboradoresPaginados.map((colab) => (
                <tr
                  key={colab.idUsuario}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 pl-5 pr-2">
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                      <div className="font-bold text-white group-hover:text-rose-400 transition-colors truncate" title={`${colab.nombre} ${colab.apellidoPaterno} ${colab.apellidoMaterno}`}>
                        {colab.nombre} {colab.apellidoPaterno} {colab.apellidoMaterno}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleCopyEmail(colab.correo, e)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer w-fit group/mail"
                        title="Clic para copiar correo"
                      >
                        <Mail size={12} className="text-slate-500 group-hover/mail:text-rose-400 transition-colors shrink-0" />
                        <span className="hover:underline truncate max-w-[170px]">{colab.correo}</span>
                        {copiedEmail === colab.correo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 shrink-0">
                            <Check size={10} /> Copiado
                          </span>
                        ) : (
                          <Copy size={11} className="text-slate-500 opacity-0 group-hover/mail:opacity-100 transition-opacity shrink-0" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 pl-2 pr-3 whitespace-nowrap">
                    <span className="font-mono text-slate-300 font-medium">
                      {colab.numeroDocumento}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {colab.tipoDocumentoNombre || 'DNI'}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {colab.idRol === 3 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        <Bike size={13} />
                        <span>Motorizado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Shield size={13} />
                        <span>Admin</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Phone size={12} className="text-emerald-400 shrink-0" />
                      <span>{colab.telefono || 'Sin teléfono'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {colab.idRol === 3 ? (
                      colab.placaVehiculo ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 text-xs w-fit">
                            <Car size={12} />
                            <span>{colab.placaVehiculo}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium pl-0.5">
                            {colab.tipoVehiculo || 'Moto'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Sin vehículo</span>
                      )
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {colab.debeCambiarClave ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30" title="Aún no ha ingresado a cambiar su clave temporal">
                        <Clock size={12} className="animate-pulse" />
                        <span>Pendiente 1er Acceso</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        <span>Clave Actualizada</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 pl-2 pr-5 text-center whitespace-nowrap">
                    {colab.telefono ? (
                      <a
                        href={`https://wa.me/51${colab.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl transition-colors text-[11px] font-semibold"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA TARJETAS (MÓVILES / O MODO TARJETAS EN DESKTOP) */}
      <div className={`${vistaModo === 'tarjetas' ? 'grid' : 'grid lg:hidden'} grid-cols-1 sm:grid-cols-2 gap-3`}>
        {colaboradoresPaginados.map((colab) => (
          <div
            key={colab.idUsuario}
            className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-xs font-bold text-white">
                  {colab.nombre} {colab.apellidoPaterno} {colab.apellidoMaterno}
                </h4>
                <button
                  type="button"
                  onClick={(e) => handleCopyEmail(colab.correo, e)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer w-fit text-left"
                  title="Clic para copiar correo"
                >
                  <Mail size={12} className="text-slate-500 shrink-0" />
                  <span className="hover:underline">{colab.correo}</span>
                  {copiedEmail === colab.correo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      <Check size={10} /> Copiado
                    </span>
                  ) : (
                    <Copy size={11} className="text-slate-500 shrink-0" />
                  )}
                </button>
              </div>

              {colab.idRol === 3 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <Bike size={11} />
                  <span>Moto</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Shield size={11} />
                  <span>Admin</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500">Documento:</span>
                <div className="font-mono text-slate-300 font-semibold">{colab.numeroDocumento}</div>
              </div>

              <div>
                <span className="text-slate-500">Teléfono:</span>
                <div className="text-slate-300 font-semibold">{colab.telefono || '—'}</div>
              </div>

              {colab.idRol === 3 && (
                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500">Vehículo:</span>
                  <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                    {colab.tipoVehiculo || 'Moto'} • {colab.placaVehiculo || 'S/P'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              {colab.debeCambiarClave ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Clock size={11} />
                  <span>Pendiente 1er Acceso</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  <span>Clave Actualizada</span>
                </span>
              )}

              {colab.telefono && (
                <a
                  href={`https://wa.me/51${colab.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-semibold transition-colors"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-3 text-xs">
          <span className="text-slate-400">
            Página <span className="text-white font-bold">{paginaActual}</span> de{' '}
            <span className="text-white font-bold">{totalPaginas}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPaginaActual(num)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  num === paginaActual
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
