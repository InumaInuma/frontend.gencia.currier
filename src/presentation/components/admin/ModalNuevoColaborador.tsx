import React, { useState } from 'react';
import { X, UserPlus, Bike, Shield, Copy, Check, MessageCircle, AlertCircle } from 'lucide-react';
import { colaboradoresRepository, type IRegistrarColaboradorParams } from '../../../infrastructure/repositories/ColaboradoresRepository';

interface ModalNuevoColaboradorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalNuevoColaborador: React.FC<ModalNuevoColaboradorProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [idRol, setIdRol] = useState<number>(3); // 3 = Motorizado por defecto, 1 = Administrador
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [idTiposDocumento, setIdTiposDocumento] = useState<number>(1); // 1 = DNI
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  
  // Datos de conductor (si rol = 3)
  const [tipoVehiculo, setTipoVehiculo] = useState('Moto');
  const [placaVehiculo, setPlacaVehiculo] = useState('');
  const [licenciaConducir, setLicenciaConducir] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setNombre('');
    setApellidoPaterno('');
    setApellidoMaterno('');
    setNumeroDocumento('');
    setTelefono('');
    setCorreo('');
    setPlacaVehiculo('');
    setLicenciaConducir('');
    setError(null);
    setRegistroExitoso(false);
    setCopiado(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !apellidoPaterno.trim() || !numeroDocumento.trim() || !correo.trim()) {
      setError('Por favor completa todos los campos obligatorios marcados con (*).');
      return;
    }

    if (idRol === 3 && !placaVehiculo.trim()) {
      setError('Para un motorizado es obligatorio ingresar la placa de su vehículo.');
      return;
    }

    const payload: IRegistrarColaboradorParams = {
      idRol,
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      idTiposDocumento,
      numeroDocumento: numeroDocumento.trim(),
      telefono: telefono.trim(),
      correo: correo.trim().toLowerCase(),
      tipoVehiculo: idRol === 3 ? tipoVehiculo : undefined,
      placaVehiculo: idRol === 3 ? placaVehiculo.trim() : undefined,
      licenciaConducir: idRol === 3 ? licenciaConducir.trim() : undefined,
    };

    try {
      setCargando(true);
      await colaboradoresRepository.registrar(payload);
      setRegistroExitoso(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al registrar el colaborador.');
    } finally {
      setCargando(false);
    }
  };

  const URL_PRODUCCION = 'https://fragata-courier.vercel.app';

  const mensajeCredenciales = `¡Hola ${nombre}! Te damos la bienvenida al equipo de Fragata Courier 🚀
Aquí tienes tus credenciales de acceso a la plataforma:

👤 Usuario: ${correo}
🔑 Contraseña temporal: fragatacourier

📲 Ingresa aquí: ${URL_PRODUCCION}/login

⚠️ Al iniciar sesión por primera vez, el sistema te pedirá actualizar tu contraseña por una propia y confidencial. ¡Muchos éxitos!`;

  const copiarCredenciales = () => {
    navigator.clipboard.writeText(mensajeCredenciales);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const enviarWhatsApp = () => {
    const telLimpio = telefono.replace(/\D/g, '');
    const url = `https://wa.me/51${telLimpio}?text=${encodeURIComponent(mensajeCredenciales)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {registroExitoso ? (
          /* PANTALLA DE ÉXITO Y COPIA DE CREDENCIALES */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                ¡Colaborador Registrado!
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                {nombre} {apellidoPaterno}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Rol asignado: <strong className="text-rose-400">{idRol === 3 ? 'Motorizado' : 'Administrador'}</strong>
              </p>
            </div>

            {/* Tarjeta de credenciales listas para enviar */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Credenciales de Primer Acceso:
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400">Usuario / Correo:</span>
                <span className="font-mono text-white font-semibold">{correo}</span>
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400">Clave Genérica:</span>
                <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  fragatacourier
                </span>
              </div>
              <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>
                  El sistema detectará que es su primera vez y le mostrará automáticamente la pantalla obligatoria para actualizar su contraseña.
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={copiarCredenciales}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                {copiado ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiado ? '¡Copiado al portapapeles!' : 'Copiar Credenciales'}</span>
              </button>

              {telefono && (
                <button
                  type="button"
                  onClick={enviarWhatsApp}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Enviar por WhatsApp</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cerrar y volver a la lista
            </button>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Registrar Nuevo Colaborador</h2>
                <p className="text-xs text-slate-400">
                  Crea un usuario y asígnale su rol en Fragata Courier
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* SELECCIÓN DE ROL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Rol del Colaborador <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIdRol(3)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    idRol === 3
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-1 ring-rose-500 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Bike className="w-6 h-6" />
                  <span className="text-xs font-bold">Motorizado</span>
                  <span className="text-[10px] text-slate-400">Repartos y Recojos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIdRol(1)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    idRol === 1
                      ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-1 ring-rose-500 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-xs font-bold">Administrador</span>
                  <span className="text-[10px] text-slate-400">Control y Gestión</span>
                </button>
              </div>
            </div>

            {/* DATOS DE IDENTIDAD */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo Documento
                  </label>
                  <select
                    value={idTiposDocumento}
                    onChange={(e) => setIdTiposDocumento(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value={1}>DNI</option>
                    <option value={2}>Carnet Extranjería</option>
                    <option value={4}>Pasaporte</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    N° de Documento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="Ej. 72345678"
                    maxLength={15}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombres <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apellido Paterno <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    placeholder="Ej. Perez"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="colaborador@fragata.pe"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* DATOS DE VEHÍCULO (Solo si rol = Motorizado) */}
            {idRol === 3 && (
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <Bike size={16} />
                  <span>Datos del Vehículo de Reparto</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tipo Vehículo
                    </label>
                    <select
                      value={tipoVehiculo}
                      onChange={(e) => setTipoVehiculo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Moto">Moto</option>
                      <option value="Bicicleta">Bicicleta</option>
                      <option value="Auto">Auto</option>
                      <option value="Furgoneta">Furgoneta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Placa Vehículo <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={placaVehiculo}
                      onChange={(e) => setPlacaVehiculo(e.target.value.toUpperCase())}
                      placeholder="Ej. 4567-XY"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      N° Licencia
                    </label>
                    <input
                      type="text"
                      value={licenciaConducir}
                      onChange={(e) => setLicenciaConducir(e.target.value.toUpperCase())}
                      placeholder="Ej. B2C-123456"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AVISO DE CLAVE GENÉRICA AUTOMÁTICA */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Clave genérica inicial que se asignará:</span>
              <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                fragatacourier
              </span>
            </div>

            {/* BOTONES */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={cargando}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={cargando}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {cargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Registrar Colaborador</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
