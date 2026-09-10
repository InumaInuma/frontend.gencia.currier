import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUpgrade } from '../../../application/useCases/useUpgrade';
import type { ICrearCuentaBancariaParams } from '../../../domain/models/IComercioCuentaBancaria';
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  CreditCard,
  Building2,
  Store,
  MapPin,
  Phone,
  Navigation,
  FileText,
  Smartphone,
  Landmark,
  Plus,
  Trash2,
  CheckCircle2,
  Wallet
} from 'lucide-react';

const TIPOS_BILLETERAS = [
  { id: 'YAPE', nombre: '💜 Yape', placeholder: '987654321', banco: 'BCP' },
  { id: 'PLIN', nombre: '💙 Plin', placeholder: '987654321', banco: 'Interbank / BBVA / Scotiabank' },
  { id: 'BIM', nombre: '💛 BIM', placeholder: '987654321', banco: 'BIM' },
  { id: 'TUNKI', nombre: '🧡 Tunki', placeholder: '987654321', banco: 'Interbank' },
  { id: 'AGORA', nombre: '❤️ Agora PAY', placeholder: '987654321', banco: 'Agora' },
  { id: 'OTRO', nombre: '📱 Otra Billetera Digital', placeholder: '987654321', banco: 'Billetera' },
];

const BANCOS_PERU = [
  'BCP',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'Banco de la Nación',
  'BanBif',
  'Banco Pichincha',
  'Caja Arequipa',
  'Caja Huancayo',
  'Caja Piura',
  'Otro Banco / Caja'
];

interface IBilleteraFormItem {
  id: string;
  tipoMetodo: string;
  numeroCuenta: string;
  titular: string;
  esPrincipal: boolean;
}

interface ICuentaBancariaFormItem {
  id: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  numeroCci: string;
  titular: string;
  esPrincipal: boolean;
}

export const UpgradeComercioPage: React.FC = () => {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [direccionFiscal, setDireccionFiscal] = useState('');
  const [referenciaRecojo, setReferenciaRecojo] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [telefono, setTelefono] = useState('');
  const [validationError, setValidationError] = useState('');

  // Lista dinámica de Billeteras Digitales (Yape, Plin, BIM, Tunki, Agora)
  const [billeteras, setBilleteras] = useState<IBilleteraFormItem[]>([
    {
      id: 'wallet_1',
      tipoMetodo: 'YAPE',
      numeroCuenta: '',
      titular: '',
      esPrincipal: true,
    }
  ]);

  // Lista dinámica de Cuentas Bancarias
  const [cuentasBancarias, setCuentasBancarias] = useState<ICuentaBancariaFormItem[]>([]);

  const navigate = useNavigate();
  const upgradeMutation = useUpgrade();

  // --- MÉTODOS PARA BILLETERAS ---
  const handleAddBilletera = () => {
    setBilleteras(prev => [
      ...prev,
      {
        id: `wallet_${Date.now()}`,
        tipoMetodo: prev.some(w => w.tipoMetodo === 'YAPE') ? 'PLIN' : 'BIM',
        numeroCuenta: '',
        titular: razonSocial || nombreComercial || '',
        esPrincipal: prev.length === 0 && cuentasBancarias.length === 0,
      }
    ]);
  };

  const handleRemoveBilletera = (id: string) => {
    setBilleteras(prev => prev.filter(w => w.id !== id));
  };

  const handleUpdateBilletera = (id: string, field: keyof IBilleteraFormItem, value: any) => {
    setBilleteras(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  // --- MÉTODOS PARA CUENTAS BANCARIAS ---
  const handleAddCuentaBancaria = () => {
    setCuentasBancarias(prev => [
      ...prev,
      {
        id: `bank_${Date.now()}`,
        banco: 'BCP',
        tipoCuenta: 'Ahorros Soles',
        numeroCuenta: '',
        numeroCci: '',
        titular: razonSocial || nombreComercial || '',
        esPrincipal: billeteras.length === 0 && prev.length === 0,
      }
    ]);
  };

  const handleRemoveCuentaBancaria = (id: string) => {
    setCuentasBancarias(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateCuentaBancaria = (id: string, field: keyof ICuentaBancariaFormItem, value: any) => {
    setCuentasBancarias(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

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

    // Armar lista de cuentas para persistencia
    const listaCuentas: ICrearCuentaBancariaParams[] = [];

    // Procesar billeteras con número ingresado
    billeteras.forEach((w, index) => {
      if (w.numeroCuenta.trim()) {
        listaCuentas.push({
          tipoMetodo: w.tipoMetodo,
          banco: w.tipoMetodo,
          numeroCuenta: w.numeroCuenta.trim(),
          titular: w.titular.trim() || nombreComercial.trim() || razonSocial.trim(),
          esPrincipal: index === 0,
        });
      }
    });

    // Procesar cuentas bancarias con número ingresado
    cuentasBancarias.forEach((b) => {
      if (b.numeroCuenta.trim()) {
        listaCuentas.push({
          tipoMetodo: 'TRANSFERENCIA',
          banco: b.banco,
          tipoCuenta: b.tipoCuenta,
          numeroCuenta: b.numeroCuenta.trim(),
          numeroCci: b.numeroCci.trim() || undefined,
          titular: b.titular.trim() || razonSocial.trim() || nombreComercial.trim(),
          esPrincipal: listaCuentas.length === 0,
        });
      }
    });

    try {
      await upgradeMutation.mutateAsync({
        ruc: ruc.trim(),
        razonSocial: razonSocial.trim(),
        nombreComercial: nombreComercial.trim(),
        direccionFiscal: direccionFiscal.trim(),
        referenciaRecojo: referenciaRecojo.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        telefono: telefono.trim(),
        cuentasBancarias: listaCuentas.length > 0 ? listaCuentas : undefined,
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
      <div className="relative w-full max-w-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl my-6">
        
        {/* Back Link */}
        <Link to="/cliente/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} />
          Volver al Panel
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white mb-4 shadow-lg shadow-violet-500/20">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Activar mi Perfil de Comercio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Convierte tu cuenta en una tienda para registrar envíos, indicar tus puntos de recojo y configurar tus medios de pago para liquidaciones y compras.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECCIÓN 1: DATOS FISCALES Y UBICACIÓN */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-2">
              <Building2 size={16} />
              <span>1. Datos del Comercio / Tienda</span>
            </div>

            {/* RUC y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Número de RUC *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <CreditCard size={17} />
                  </span>
                  <input
                    type="text"
                    maxLength={11}
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                    placeholder="20123456789"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone size={17} />
                  </span>
                  <input
                    type="tel"
                    maxLength={9}
                    value={telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTelefono(val);
                      // Auto-completar teléfono en la primera billetera si está vacía
                      if (billeteras.length > 0 && !billeteras[0].numeroCuenta) {
                        handleUpdateBilletera(billeteras[0].id, 'numeroCuenta', val);
                      }
                    }}
                    placeholder="987654321"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Razón Social y Nombre Comercial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Razón Social *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Building2 size={17} />
                  </span>
                  <input
                    type="text"
                    value={razonSocial}
                    onChange={(e) => {
                      setRazonSocial(e.target.value);
                      if (!nombreComercial) setNombreComercial(e.target.value);
                    }}
                    placeholder="Mi Negocio S.A.C."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Nombre Comercial (Marca / Tienda) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Store size={17} />
                  </span>
                  <input
                    type="text"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                    placeholder="Mochilas Premium"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dirección Fiscal / Recojo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Dirección de Recojo (Almacén / Tienda Física) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <MapPin size={17} />
                </span>
                <input
                  type="text"
                  value={direccionFiscal}
                  onChange={(e) => setDireccionFiscal(e.target.value)}
                  placeholder="Ej: Av. Aviación 1450 Int 201, San Borja"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Referencia y Link GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Referencia del Recojo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <FileText size={17} />
                  </span>
                  <input
                    type="text"
                    value={referenciaRecojo}
                    onChange={(e) => setReferenciaRecojo(e.target.value)}
                    placeholder="Ej: Portón negro, timbrar 2"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Link GPS Google Maps / Waze
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Navigation size={17} />
                  </span>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: MEDIOS DE PAGO Y COBRO OFICIALES */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Wallet size={16} />
                <span>2. Medios de Pago y Cobro Oficiales</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">WhatsApp y Liquidaciones</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Agrega todas las <strong className="text-white">Billeteras Digitales</strong> (Yape, Plin, BIM, Tunki, etc.) y <strong className="text-white">Cuentas Bancarias</strong> donde tus clientes y la agencia te transferirán los pagos.
            </p>

            {/* --- SUBSECCIÓN: BILLETERAS DIGITALES --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Smartphone size={15} />
                  <span>Billeteras Digitales ({billeteras.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddBilletera}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Agregar Billetera</span>
                </button>
              </div>

              {billeteras.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-xs text-slate-500">
                  No has agregado ninguna billetera digital aún. Haz clic en "Agregar Billetera" para registrar Yape, Plin, BIM, etc.
                </div>
              ) : (
                billeteras.map((wallet, idx) => (
                  <div key={wallet.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/20 space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-xs text-purple-300">
                        📱 Billetera #{idx + 1}
                      </span>
                      {billeteras.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBilletera(wallet.id)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Billetera / Aplicación</label>
                        <select
                          value={wallet.tipoMetodo}
                          onChange={(e) => handleUpdateBilletera(wallet.id, 'tipoMetodo', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-purple-500"
                        >
                          {TIPOS_BILLETERAS.map(tb => (
                            <option key={tb.id} value={tb.id}>{tb.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Número de Celular *</label>
                        <input
                          type="tel"
                          maxLength={9}
                          value={wallet.numeroCuenta}
                          onChange={(e) => handleUpdateBilletera(wallet.id, 'numeroCuenta', e.target.value.replace(/\D/g, ''))}
                          placeholder="987654321"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre del Titular *</label>
                        <input
                          type="text"
                          value={wallet.titular}
                          onChange={(e) => handleUpdateBilletera(wallet.id, 'titular', e.target.value)}
                          placeholder="Ej: Juan Pérez / Tienda SAC"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* --- SUBSECCIÓN: CUENTAS BANCARIAS --- */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Landmark size={15} />
                  <span>Cuentas Bancarias ({cuentasBancarias.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddCuentaBancaria}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Agregar Cuenta Bancaria</span>
                </button>
              </div>

              {cuentasBancarias.length === 0 ? (
                <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-xs text-slate-500">
                  No has agregado cuentas bancarias para transferencias o CCI. Haz clic en "Agregar Cuenta Bancaria" si deseas registrarlas.
                </div>
              ) : (
                cuentasBancarias.map((bank, idx) => (
                  <div key={bank.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-xs text-emerald-300">
                        🏦 Cuenta Bancaria #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCuentaBancaria(bank.id)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Banco *</label>
                        <select
                          value={bank.banco}
                          onChange={(e) => handleUpdateCuentaBancaria(bank.id, 'banco', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                        >
                          {BANCOS_PERU.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipo de Cuenta</label>
                        <select
                          value={bank.tipoCuenta}
                          onChange={(e) => handleUpdateCuentaBancaria(bank.id, 'tipoCuenta', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                        >
                          <option value="Ahorros Soles">Ahorros Soles</option>
                          <option value="Corriente Soles">Corriente Soles</option>
                          <option value="Ahorros Dólares">Ahorros Dólares</option>
                          <option value="Corriente Dólares">Corriente Dólares</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nº de Cuenta *</label>
                        <input
                          type="text"
                          value={bank.numeroCuenta}
                          onChange={(e) => handleUpdateCuentaBancaria(bank.id, 'numeroCuenta', e.target.value)}
                          placeholder="Ej: 191-12345678-0-99"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Código Interbancario (CCI)</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={bank.numeroCci}
                          onChange={(e) => handleUpdateCuentaBancaria(bank.id, 'numeroCci', e.target.value)}
                          placeholder="Ej: 00219100123456780099"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre del Titular de la Cuenta *</label>
                      <input
                        type="text"
                        value={bank.titular}
                        onChange={(e) => handleUpdateCuentaBancaria(bank.id, 'titular', e.target.value)}
                        placeholder="Ej: Mochilas Premium S.A.C."
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={upgradeMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-sm font-bold rounded-xl py-3.5 px-4 shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200 mt-2"
          >
            {upgradeMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Activar Mi Perfil de Comercio</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UpgradeComercioPage;
