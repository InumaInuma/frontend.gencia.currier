import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../application/useCases/useLogin';
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Glow Effects in Backdrop */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      {/* Login Card Container */}
      <div className="relative w-full max-w-md space-y-4">
        {/* Volver al Inicio Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <span>← Volver al Inicio</span>
        </Link>

        {/* Login Card */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
        
        {/* Brand/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group cursor-pointer">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xl mb-4 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all">
              AC
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
              ALMAIN CURRIER
            </h1>
          </Link>
          <p className="text-sm text-slate-400 mt-1">
            Conectando comercios y motorizados en tiempo real
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-pulse">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@dreamdrivers.com"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <a href="#forgot" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg shadow-violet-500/10 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
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
          <p className="text-xs text-slate-500">
            ¿No tiene una cuenta?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
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
