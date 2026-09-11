import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../application/useCases/useLogin';
import { AnimatedLogisticsBackground } from '../components/landing/AnimatedLogisticsBackground';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!correo.trim() || !clave.trim()) {
      setValidationError('Por favor, complete todos los campos.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ correo, clave });
      navigate('/dashboard');
    } catch (err: any) {
      // Manejar error amigable
      console.error(err);
    }
  };

  const errorMessage = validationError || (loginMutation.error as any)?.message;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Background Logistics Network Animation */}
      <AnimatedLogisticsBackground />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md space-y-4">
        {/* Volver al Inicio Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 transition-all shadow-md"
        >
          <span>← Volver al Inicio</span>
        </Link>

        {/* Login Card */}
        <div className="w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:border-red-500/30">
          
          {/* Brand / Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group cursor-pointer">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2 mb-3 shadow-xl shadow-red-500/20 group-hover:scale-105 transition-all border border-slate-200">
                <img
                  src="/icons/icon-192.png"
                  alt="Fragata Courier"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-red-400 transition-colors">
                FRAGATA <span className="text-red-500">COURIER</span>
              </h1>
            </Link>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Conectando comercios, motorizados y clientes en tiempo real
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@fragatacourier.pe"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contraseña
                </label>
                <a href="#forgot" className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl py-3.5 px-4 shadow-lg shadow-red-600/30 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            >
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Ingresar al Sistema
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="text-center mt-8 pt-6 border-t border-slate-800/60">
            <p className="text-xs text-slate-400">
              ¿No tiene una cuenta?{' '}
              <Link to="/register" className="text-red-400 hover:text-red-300 font-bold transition-colors">
                Regístrese aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
