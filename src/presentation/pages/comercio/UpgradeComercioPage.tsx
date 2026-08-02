import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUpgrade } from '../../../application/useCases/useUpgrade';
import { ShoppingBag, ArrowLeft, Loader2, CreditCard, Building2, Store, MapPin, Phone, Navigation, FileText } from 'lucide-react';

export const UpgradeComercioPage: React.FC = () => {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [direccionFiscal, setDireccionFiscal] = useState('');
  const [referenciaRecojo, setReferenciaRecojo] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [telefono, setTelefono] = useState('');
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const upgradeMutation = useUpgrade();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!ruc.trim() || !razonSocial.trim() || !nombreComercial.trim() || !direccionFiscal.trim()) {
      setValidationError('Por favor, complete todos los campos obligatorios (*).');
      return;
    }

    if (ruc.trim().length !== 11) {
      setValidationError('El RUC debe tener exactamente 11 dígitos.');
      return;
    }

    try {
      await upgradeMutation.mutateAsync({
        ruc: ruc.trim(),
        razonSocial: razonSocial.trim(),
        nombreComercial: nombreComercial.trim(),
        direccionFiscal: direccionFiscal.trim(),
        referenciaRecojo: referenciaRecojo.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        telefono: telefono.trim(),
      });

      // Redirigir directamente al nuevo dashboard del comercio
      navigate('/comercio/dashboard');
    } catch (err: any) {
      console.error(err);
    }
  };

  const errorMessage = validationError || (upgradeMutation.error as any)?.message;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl my-6">
        
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} />
          Volver al Panel
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white mb-4 shadow-lg shadow-violet-500/20">
            <ShoppingBag size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Activar mi Perfil de Comercio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Convierte tu cuenta en una tienda para registrar envíos e indicar el punto exacto de recojo a los motorizados.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* RUC y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RUC */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Número de RUC *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <CreditCard size={18} />
                </span>
                <input
                  type="text"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                  placeholder="20123456789"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Teléfono Comercial */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Teléfono de la Tienda
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="01-4455667 / 987654321"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Razón Social */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Razón Social *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Building2 size={18} />
              </span>
              <input
                type="text"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Mi Negocio S.A.C."
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Nombre Comercial */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Nombre Comercial *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Store size={18} />
              </span>
              <input
                type="text"
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                placeholder="Bodega Don Pepe"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Dirección Almacén / Recojo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Dirección de Recojo de Paquetes (Almacén / Tienda) *
            </label>
            <p className="text-[11px] text-violet-400 font-medium">
              Especifica la ubicación exacta donde nuestros motorizados acudirán a recoger tus pedidos diarios.
            </p>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                value={direccionFiscal}
                onChange={(e) => setDireccionFiscal(e.target.value)}
                placeholder="Ej: Av. Aviación 1450 Int 201, San Borja"
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Referencia de Recojo y Link GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Referencia de Recojo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Referencia del Recojo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FileText size={18} />
                </span>
                <input
                  type="text"
                  value={referenciaRecojo}
                  onChange={(e) => setReferenciaRecojo(e.target.value)}
                  placeholder="Ej: Frente al parque, timbrar 2"
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Link GPS Google Maps */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Link GPS Google Maps / Waze
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Navigation size={18} />
                </span>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-slate-950/80 border border-slate-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={upgradeMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg cursor-pointer transition-all duration-200 mt-2"
          >
            {upgradeMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Activar Mi Comercio'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UpgradeComercioPage;
