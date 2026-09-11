import React, { useState } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';

export const ModalActualizarClaveObligatoria: React.FC = () => {
  const { user, cambiarClavePrimerAcceso } = useAuth();

  const [claveActual, setClaveActual] = useState('fragatacourier');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarNuevaClave, setConfirmarNuevaClave] = useState('');
  const [mostrarClaveActual, setMostrarClaveActual] = useState(false);
  const [mostrarNuevaClave, setMostrarNuevaClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Si el usuario no está autenticado o no debe cambiar su clave, no renderizar
  if (!user || !user.debeCambiarClave) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!claveActual.trim()) {
      setError('Por favor ingresa la contraseña temporal actual.');
      return;
    }

    if (nuevaClave.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaClave !== confirmarNuevaClave) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (nuevaClave.trim().toLowerCase() === claveActual.trim().toLowerCase()) {
      setError('Tu nueva contraseña debe ser distinta a la clave genérica asignada.');
      return;
    }

    try {
      setCargando(true);
      await cambiarClavePrimerAcceso(claveActual.trim(), nuevaClave.trim(), confirmarNuevaClave.trim());
      setExito(true);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-950/50 p-6 md:p-8 overflow-hidden text-slate-100">
        {/* Glow de fondo */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-crimson-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado con Icono */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 p-0.5 shadow-lg shadow-rose-600/30 flex items-center justify-center text-white">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                Primer Acceso Requerido
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Actualiza tu Contraseña
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          Hola <strong className="text-rose-300">{user.nombreCompleto}</strong>. Por tu seguridad y privacidad, debes reemplazar la contraseña temporal genérica asignada por una clave personal confidencial antes de acceder a la plataforma.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {exito ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-white">¡Contraseña Guardada con Éxito!</h3>
            <p className="text-xs text-slate-400">
              Bienvenido a Fragata Courier. Ingresando a tu panel de control...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Clave Temporal Actual */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña Temporal Recibida
              </label>
              <div className="relative">
                <input
                  type={mostrarClaveActual ? 'text' : 'password'}
                  value={claveActual}
                  onChange={(e) => setClaveActual(e.target.value)}
                  placeholder="fragatacourier"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarClaveActual(!mostrarClaveActual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {mostrarClaveActual ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nueva Clave */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nueva Contraseña Personal <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarNuevaClave ? 'text' : 'password'}
                  value={nuevaClave}
                  onChange={(e) => setNuevaClave(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarNuevaClave(!mostrarNuevaClave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {mostrarNuevaClave ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Clave */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmar Nueva Contraseña <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={confirmarNuevaClave}
                onChange={(e) => setConfirmarNuevaClave(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Requisitos mínimos */}
            <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-rose-400" />
                <span>Mínimo 6 caracteres (letras y/o números)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={13} className="text-rose-400" />
                <span>Solo tú conocerás esta clave en adelante</span>
              </div>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando tu nueva contraseña...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Guardar y Comenzar a Trabajar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
