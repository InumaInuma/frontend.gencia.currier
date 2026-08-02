import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../../application/useCases/useRegister';
import { User, Mail, Lock, Phone, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!nombre.trim() || !apellidoPaterno.trim() || !apellidoMaterno.trim() || !numeroDocumento.trim() || !correo.trim() || !clave.trim()) {
      setValidationError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (numeroDocumento.trim().length !== 8) {
      setValidationError('El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        numeroDocumento: numeroDocumento.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        clave,
      });

      setSuccessMessage('¡Registro completado con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error(err);
    }
  };

  const errorMessage = validationError || (registerMutation.error as any)?.message;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        {/* Back Links */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            ← Volver al Inicio
          </Link>

          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Ir a Iniciar Sesión
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crear Cuenta de Cliente
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Regístrate ingresando tus datos reales de identidad.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Identity Grid (DNI y Teléfono) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DNI */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Número de DNI *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <CreditCard size={18} />
                </span>
                <input
                  type="text"
                  maxLength={8}
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987654321"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Names Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Nombres *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Carlos"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Last names Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Apellido Paterno */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Apellido Paterno *
              </label>
              <input
                type="text"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                placeholder="Pérez"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Apellido Materno */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Apellido Materno *
              </label>
              <input
                type="text"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                placeholder="Castro"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Account credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Correo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Correo Electrónico *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg cursor-pointer transition-all duration-200"
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Completar Registro'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
export default RegisterPage;
