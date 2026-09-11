import React, { useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import { Download, Upload, AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import type { IDistrito } from '../../../domain/models/IDistrito';
import type { DistritoTarifaDto } from '../../../application/useCases/useCoberturaAdmin';
import { useRegistrarPedidoMasivo } from '../../../application/useCases/useMisPedidos';
import type { IPedidoMasivoItem, IResultadoCargaMasiva } from '../../../domain/repositories/IPedidosRepository';

interface Props {
  distritos: IDistrito[] | undefined;
  distritosList: DistritoTarifaDto[];
  onSuccessFinished?: () => void;
}

interface ParsedRow {
  id: number;
  nombreCliente: string;
  telefonoCliente: string;
  direccionEntrega: string;
  distritoTexto: string;
  matchedDistritoId: number | null;
  tarifaCalculada: number;
  referencia: string;
  producto: string;
  observaciones: string;
  montoCobrar: number;
  destinatarioPagaEnvio: boolean;
  googleMapsUrl: string;
  isValid: boolean;
  errorMessage?: string;
}

export const CargaMasivaExcel: React.FC<Props> = ({
  distritos,
  distritosList,
  onSuccessFinished,
}) => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [resultSuccess, setResultSuccess] = useState<IResultadoCargaMasiva | null>(null);

  const registrarMasivoMutation = useRegistrarPedidoMasivo();

  // 1. Descargar Plantilla Excel Oficial (Envíos A-J, Separador K, Leyendas L-P)
  const handleDownloadTemplate = () => {
    const catalogList: any[] = distritosList.length > 0 ? distritosList : distritos || [];

    // Matriz de celdas vacía inicial (45 filas x 16 columnas)
    const totalRows = Math.max(45, catalogList.length + 15);
    const dataMatrix: any[][] = Array.from({ length: totalRows }, () => Array(16).fill(''));

    // Fila 1 (Índice 0): Encabezados Principales del Registro de Pedidos (Cols A-J)
    const orderHeaders = [
      'Nombre Cliente *',
      'Teléfono Cliente *',
      'Dirección Entrega *',
      'ID o Nombre Distrito *',
      'Referencia',
      'Producto / Contenido',
      'Observaciones / Notas',
      'Monto a Cobrar (S/)',
      '¿Paga Envío? (1=SI / 0=NO)',
      'Link Google Maps / Coordenadas',
    ];
    for (let col = 0; col < orderHeaders.length; col++) {
      dataMatrix[0][col] = orderHeaders[col];
    }

    // Filas 2 y 3 (Índices 1 y 2): Ejemplos de Envíos
    dataMatrix[1][0] = 'Juan Pérez';
    dataMatrix[1][1] = '987654321';
    dataMatrix[1][2] = 'Av. Javier Prado Este 2450';
    dataMatrix[1][3] = '1'; // Ejemplo ID San Borja
    dataMatrix[1][4] = 'Frente a la clínica, dpto 302';
    dataMatrix[1][5] = 'Zapatillas Nike Talla 41';
    dataMatrix[1][6] = 'TIMBRAR AL LLEGAR';
    dataMatrix[1][7] = 120.0;
    dataMatrix[1][8] = 0; // 0 = NO
    dataMatrix[1][9] = 'https://maps.app.goo.gl/...';

    dataMatrix[2][0] = 'Maria García';
    dataMatrix[2][1] = '912345678';
    dataMatrix[2][2] = 'Ca. los Pinos 120';
    dataMatrix[2][3] = 'Miraflores'; // Ejemplo Nombre
    dataMatrix[2][4] = 'Puerta negra metálica';
    dataMatrix[2][5] = 'Cosméticos y Maquillaje';
    dataMatrix[2][6] = 'FRÁGIL - ENTREGAR DE MAÑANA';
    dataMatrix[2][7] = 0.0;
    dataMatrix[2][8] = 1; // 1 = SI
    dataMatrix[2][9] = '';

    // LEYENDA 1: Banner Título de Catálogo de Distritos (Cols L-P, Fila 6 -> Índice 5)
    dataMatrix[5][11] = '📋 LEYENDA 1: CATÁLOGO DE DISTRITOS (IDs Oficiales)';

    // Fila 7 (Índice 6): Encabezados del Catálogo de Distritos (Cols L-P)
    const legendHeaders = ['ID Distrito', 'Nombre Distrito (Catálogo)', 'Zona', 'Tarifa Base (S/)', 'Estado Cobertura'];
    for (let c = 0; c < legendHeaders.length; c++) {
      dataMatrix[6][11 + c] = legendHeaders[c];
    }

    // Filas 8+ (Índices 7+): Filas del Catálogo de Distritos
    for (let i = 0; i < catalogList.length; i++) {
      const d = catalogList[i];
      const r = 7 + i;
      dataMatrix[r][11] = d.id;
      dataMatrix[r][12] = d.nombre;
      dataMatrix[r][13] = d.zonaNombre || 'Lima';
      dataMatrix[r][14] = d.tarifaDespacho || 10;
      dataMatrix[r][15] = d.coberturaActiva !== false ? '🟢 Habilitado' : '🔴 Sin Cobertura';
    }

    // LEYENDA 2: Banner Título de ¿PAGA ENVÍO? (BIT 1 / 0)
    const bitLegendStartRow = 7 + catalogList.length + 2;
    dataMatrix[bitLegendStartRow][11] = '💳 LEYENDA 2: ¿PAGA ENVÍO? (VALOR BIT: 1 / 0)';
    
    // Encabezados de Leyenda Bit
    dataMatrix[bitLegendStartRow + 1][11] = 'Valor (Bit)';
    dataMatrix[bitLegendStartRow + 1][12] = 'Significado de Cobro';

    // Opciones Bit
    dataMatrix[bitLegendStartRow + 2][11] = 1;
    dataMatrix[bitLegendStartRow + 2][12] = 'SI — El cliente destinatario paga la tarifa de envío al recibir';

    dataMatrix[bitLegendStartRow + 3][11] = 0;
    dataMatrix[bitLegendStartRow + 3][12] = 'NO — El comercio asume el envío (Envío gratis para el cliente)';

    // Crear Hoja de Trabajo
    const ws = XLSX.utils.aoa_to_sheet(dataMatrix);

    // Definir Anchos de Columna
    ws['!cols'] = [
      { wch: 22 }, // A: Nombre
      { wch: 16 }, // B: Teléfono
      { wch: 30 }, // C: Dirección
      { wch: 24 }, // D: ID o Nombre Distrito
      { wch: 25 }, // E: Referencia
      { wch: 25 }, // F: Producto
      { wch: 28 }, // G: Observaciones
      { wch: 18 }, // H: Monto
      { wch: 22 }, // I: Paga Envío
      { wch: 30 }, // J: Google Maps
      { wch: 4 },  // K: Separador
      { wch: 12 }, // L: ID Distrito / Bit
      { wch: 25 }, // M: Nombre Distrito / Significado
      { wch: 18 }, // N: Zona
      { wch: 18 }, // O: Tarifa Base
      { wch: 18 }, // P: Estado Cobertura
    ];

    // Fusionar celdas para Banners de Leyendas
    ws['!merges'] = [
      { s: { r: 5, c: 11 }, e: { r: 5, c: 15 } }, // Leyenda 1 Banner L6:P6
      { s: { r: bitLegendStartRow, c: 11 }, e: { r: bitLegendStartRow, c: 15 } }, // Leyenda 2 Banner
      { s: { r: bitLegendStartRow + 2, c: 12 }, e: { r: bitLegendStartRow + 2, c: 15 } }, // Texto SI
      { s: { r: bitLegendStartRow + 3, c: 12 }, e: { r: bitLegendStartRow + 3, c: 15 } }, // Texto NO
    ];

    // ESTILOS DE CELDAS (Colores Profesionales)
    const orderHeaderStyle = {
      fill: { fgColor: { rgb: '4F46E5' } }, // Azul Violeta / Indigo Elegante
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };

    const legendTitleStyle = {
      fill: { fgColor: { rgb: '059669' } }, // Esmeralda Oscuro / Verde Pro
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const legendHeaderStyle = {
      fill: { fgColor: { rgb: '064E3B' } }, // Verde Selva Oscuro
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const sampleRowStyle = {
      fill: { fgColor: { rgb: 'F3F4F6' } },
      font: { sz: 10 },
    };

    const catalogIdStyle = {
      font: { bold: true, color: { rgb: '4F46E5' } },
      alignment: { horizontal: 'center' },
    };

    // Aplicar estilos a la cabecera de Pedidos (A1:J1)
    for (let c = 0; c < 10; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) ws[cellRef].s = orderHeaderStyle;
    }

    // Aplicar estilo a las filas de ejemplo (A2:J3)
    for (let r = 1; r <= 2; r++) {
      for (let c = 0; c < 10; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (ws[cellRef]) ws[cellRef].s = sampleRowStyle;
      }
    }

    // Aplicar estilo al Banner del Catálogo (L6:P6)
    const titleCellRef = XLSX.utils.encode_cell({ r: 5, c: 11 });
    if (ws[titleCellRef]) ws[titleCellRef].s = legendTitleStyle;

    // Aplicar estilo a la Cabecera del Catálogo (L7:P7)
    for (let c = 11; c <= 15; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 6, c });
      if (ws[cellRef]) ws[cellRef].s = legendHeaderStyle;
    }

    // Aplicar estilo a la columna ID del Catálogo
    for (let i = 0; i < catalogList.length; i++) {
      const r = 7 + i;
      const cellRef = XLSX.utils.encode_cell({ r, c: 11 });
      if (ws[cellRef]) ws[cellRef].s = catalogIdStyle;
    }

    // Aplicar estilos a la Leyenda 2 (Paga Envío Bit)
    const bitTitleCellRef = XLSX.utils.encode_cell({ r: bitLegendStartRow, c: 11 });
    if (ws[bitTitleCellRef]) ws[bitTitleCellRef].s = legendTitleStyle;

    for (let c = 11; c <= 15; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: bitLegendStartRow + 1, c });
      if (ws[cellRef]) ws[cellRef].s = legendHeaderStyle;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Envíos');

    XLSX.writeFile(wb, 'Plantilla_Carga_Masiva_DreamDrivers.xlsx');
  };

  // 2. Procesar Archivo Excel Subido
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileName(file.name);
    setResultSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawData.length < 2) {
          alert('El archivo Excel está vacío o no contiene filas de pedidos.');
          setIsProcessingFile(false);
          return;
        }

        // Ignorar fila 0 (encabezados)
        const parsedRows: ParsedRow[] = [];

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0 || row.every((cell) => cell === undefined || cell === '')) {
            continue; // Saltar filas completamente vacías
          }

          const nombreCliente = String(row[0] || '').trim();
          const telefonoCliente = String(row[1] || '').trim();
          const direccionEntrega = String(row[2] || '').trim();
          const distritoTexto = String(row[3] || '').trim();
          const referencia = String(row[4] || '').trim();
          const producto = String(row[5] || '').trim();
          const observaciones = String(row[6] || '').trim();
          const montoCobrar = parseFloat(row[7]) || 0;
          const pagaEnvioRaw = String(row[8] || '').trim().toUpperCase();
          const googleMapsUrl = String(row[9] || '').trim();

          // Si los campos del pedido (columnas A-D) están vacíos, omitir esta fila (es sólo resto de las leyendas)
          if (!nombreCliente && !telefonoCliente && !direccionEntrega && !distritoTexto) {
            continue;
          }

          const destinatarioPagaEnvio = pagaEnvioRaw === '1' || pagaEnvioRaw === 'SI' || pagaEnvioRaw === 'S' || pagaEnvioRaw === 'YES' || pagaEnvioRaw === 'TRUE';

          // Match distrito con catálogo (Soporta ID numérico, Nombre exacto o Combo "ID - Nombre")
          let matchedDistritoId: number | null = null;
          let matchedDistritoNombre = distritoTexto;
          let tarifaCalculada = 10;
          let errorMessage = '';

          if (distritoTexto) {
            const cleanInput = distritoTexto.toLowerCase().trim();
            const listToSearch: any[] = distritosList.length > 0 ? distritosList : distritos || [];

            const match = listToSearch.find((d: any) => {
              const idMatch = String(d.id) === cleanInput;
              const nameMatch = d.nombre.toLowerCase().trim() === cleanInput;
              const comboMatch = `${d.id} - ${d.nombre.toLowerCase().trim()}` === cleanInput || `${d.id}-${d.nombre.toLowerCase().trim()}` === cleanInput;
              return idMatch || nameMatch || comboMatch;
            });

            if (match) {
              matchedDistritoId = match.id;
              matchedDistritoNombre = `${match.nombre} (ID: ${match.id})`;
              tarifaCalculada = (match as any).tarifaDespacho || 10;
              if ((match as any).coberturaActiva === false) {
                errorMessage = `El distrito "${match.nombre}" (ID: ${match.id}) está deshabilitado temporalmente.`;
              }
            } else {
              errorMessage = `Distrito / ID "${distritoTexto}" no encontrado en el catálogo de cobertura.`;
            }
          } else {
            errorMessage = 'Falta especificar el ID o Nombre del distrito.';
          }

          if (!nombreCliente) errorMessage = 'El nombre del cliente es obligatorio.';
          else if (!telefonoCliente) errorMessage = 'El teléfono del cliente es obligatorio.';
          else if (!direccionEntrega) errorMessage = 'La dirección de entrega es obligatoria.';

          parsedRows.push({
            id: i,
            nombreCliente,
            telefonoCliente,
            direccionEntrega,
            distritoTexto: matchedDistritoNombre,
            matchedDistritoId,
            tarifaCalculada,
            referencia,
            producto,
            observaciones,
            montoCobrar,
            destinatarioPagaEnvio,
            googleMapsUrl,
            isValid: !errorMessage,
            errorMessage,
          });
        }

        setRows(parsedRows);
      } catch (err) {
        console.error('Error leyendo archivo Excel:', err);
        alert('No se pudo procesar el archivo Excel. Asegúrate de usar el formato .xlsx correcto.');
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Eliminar una fila individual de la tabla previa
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Confirmar Carga Masiva al Backend
  const handleConfirmarCarga = async () => {
    const validRows = rows.filter((r) => r.isValid && r.matchedDistritoId);
    if (validRows.length === 0) {
      alert('No hay filas válidas para agendar.');
      return;
    }

    const payload: IPedidoMasivoItem[] = validRows.map((r) => ({
      nombreDestinatario: r.nombreCliente,
      telefonoDestinatario: r.telefonoCliente,
      direccionDestinatario: r.direccionEntrega,
      idDistritoDestinatario: r.matchedDistritoId!,
      referenciaDestinatario: r.referencia || undefined,
      descripcionProducto: r.producto || undefined,
      observaciones: r.observaciones || undefined,
      googleMapsUrl: r.googleMapsUrl || undefined,
      montoCobrar: r.montoCobrar,
      tarifaEnvio: r.tarifaCalculada,
      destinatarioPagaEnvio: r.destinatarioPagaEnvio,
    }));

    try {
      const res = await registrarMasivoMutation.mutateAsync(payload);
      setResultSuccess(res);
      if (onSuccessFinished) onSuccessFinished();
    } catch (err: any) {
      console.error('Error en carga masiva:', err);
    }
  };

  const totalFilas = rows.length;
  const validas = rows.filter((r) => r.isValid).length;
  const invalidas = rows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Card con descarga de plantilla */}
      <div className="bg-gradient-to-r from-violet-950/80 via-slate-900/90 to-slate-900/90 border border-violet-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/30 text-violet-300 border border-violet-500/40 flex items-center justify-center shrink-0 shadow-lg">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Carga Masiva de Envíos mediante Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Descarga la plantilla de Excel, completa la lista de pedidos de tu comercio y súbela para registrar decenas de envíos en un solo clic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 shrink-0 cursor-pointer"
          >
            <Download size={16} />
            <span>Descargar Plantilla Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      {resultSuccess ? (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">¡Carga Masiva Procesada con Éxito!</h3>
            <p className="text-xs text-emerald-300 font-medium mt-1">
              Se agendaron correctamente <strong className="text-white text-sm">{resultSuccess.totalInsertados}</strong> envíos en el sistema.
            </p>
          </div>

          {/* Tabla resumen de códigos de seguimiento autogenerados */}
          <div className="max-h-60 overflow-y-auto rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-2 text-left">
            <table className="w-full text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Código Seguimiento</th>
                  <th className="p-2">Destinatario</th>
                  <th className="p-2">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {resultSuccess.pedidosCreados.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="p-2 text-slate-500">{idx + 1}</td>
                    <td className="p-2 text-violet-400 font-bold">{p.codigoSeguimiento}</td>
                    <td className="p-2 text-white font-sans">{p.nombreDestinatario}</td>
                    <td className="p-2 text-slate-400">{p.telefonoDestinatario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              setRows([]);
              setFileName('');
              setResultSuccess(null);
            }}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw size={14} /> Subir Otro Archivo Excel
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 hover:border-violet-500/50 rounded-3xl p-8 text-center relative transition-all group">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="space-y-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              {isProcessingFile ? <Loader2 size={28} className="animate-spin text-violet-400" /> : <Upload size={28} />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {fileName ? `Archivo seleccionado: ${fileName}` : 'Haz clic o arrastra tu archivo Excel aquí'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Soporta formatos oficial de MS Excel (.xlsx, .xls) o CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tabla de Pre-visualización y Validación */}
      {rows.length > 0 && !resultSuccess && (
        <div className="space-y-4">
          {/* Summary Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-slate-300">
                Total Leídos: <span className="text-white text-sm font-mono">{totalFilas}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> Válidos: <span className="font-mono text-sm">{validas}</span>
              </div>
              {invalidas > 0 && (
                <>
                  <span className="text-slate-700">|</span>
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} /> Errores: <span className="font-mono text-sm">{invalidas}</span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleConfirmarCarga}
              disabled={validas === 0 || registrarMasivoMutation.isPending}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
            >
              {registrarMasivoMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              <span>
                {registrarMasivoMutation.isPending
                  ? 'Procesando Envíos...'
                  : `Confirmar y Agendar ${validas} Envíos`}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/60 shadow-xl">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider font-bold text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Dirección</th>
                    <th className="p-3">Distrito</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rows.map((r) => (
                    <tr key={r.id} className={r.isValid ? 'hover:bg-slate-800/40' : 'bg-red-500/5 hover:bg-red-500/10'}>
                      <td className="p-3 whitespace-nowrap">
                        {r.isValid ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-full font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={11} /> Listo
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded-full font-bold inline-flex items-center gap-1" title={r.errorMessage}>
                            <AlertCircle size={11} /> {r.errorMessage}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-white truncate max-w-[150px]">{r.nombreCliente || '-'}</td>
                      <td className="p-3 text-slate-300 font-mono">{r.telefonoCliente || '-'}</td>
                      <td className="p-3 text-slate-300 truncate max-w-[200px]" title={r.direccionEntrega}>
                        {r.direccionEntrega || '-'}
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${r.matchedDistritoId ? 'text-purple-300' : 'text-red-400'}`}>
                          {r.distritoTexto || 'Falta'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        S/ {r.montoCobrar.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(r.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Quitar de la lista"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
