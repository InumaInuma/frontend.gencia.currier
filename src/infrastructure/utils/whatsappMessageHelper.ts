import type { IComercioCuentaBancaria } from '../../domain/models/IComercioCuentaBancaria';

export interface IWhatsAppPedidoInfo {
  nombreDestinatario: string;
  telefonoDestinatario: string;
  nombreComercio?: string;
  descripcionProducto?: string;
  direccionDestinatario: string;
  distritoNombre?: string;
  referenciaDestinatario?: string;
  googleMapsUrl?: string;
  montoCobrar?: number;
  tarifaEnvio?: number;
  destinatarioPagaEnvio?: boolean;
  codigoSeguimiento: string;
  cuentasBancarias?: IComercioCuentaBancaria[];
}

export function buildWhatsAppPedidoMessage(info: IWhatsAppPedidoInfo): string {
  const comercio = info.nombreComercio ? `*${info.nombreComercio}*` : 'tu tienda';
  const prod = info.descripcionProducto?.trim() ? `📦 *Producto:* ${info.descripcionProducto.trim()}` : '';
  const dir = `📍 *Dirección de Entrega:* ${info.direccionDestinatario}${info.distritoNombre ? ` (${info.distritoNombre})` : ''}`;
  const ref = info.referenciaDestinatario?.trim() ? `🧭 *Referencia:* ${info.referenciaDestinatario.trim()}` : '';
  const gps = info.googleMapsUrl?.trim() ? `🗺️ *Ubicación GPS:* ${info.googleMapsUrl.trim()}` : '';
  
  const montoCobro = info.montoCobrar && info.montoCobrar > 0 
    ? `💵 *Monto del Pedido a Cobrar:* S/ ${info.montoCobrar.toFixed(2)}`
    : `💵 *Monto a Cobrar:* S/ 0.00 (Pagado)`;

  const costoEnvio = info.destinatarioPagaEnvio
    ? `🚚 *Costo de Envío:* S/ ${(info.tarifaEnvio || 0).toFixed(2)} (a cargo del cliente)`
    : `🚚 *Costo de Envío:* El comercio lo asume`;

  const cuentasBloque = (() => {
    if (!info.cuentasBancarias || info.cuentasBancarias.length === 0) return '';
    const lineasCuentas = ['💳 *MEDIOS DE PAGO DEL COMERCIO:*'];
    info.cuentasBancarias.forEach(c => {
      const metodoUpper = (c.tipoMetodo || '').toUpperCase();
      if (['YAPE', 'PLIN', 'BIM', 'TUNKI', 'AGORA', 'BILLETERA'].includes(metodoUpper)) {
        lineasCuentas.push(`📱 *${metodoUpper}:* ${c.numeroCuenta} (${c.titular})`);
      } else {
        const banco = c.banco || 'Cuenta Bancaria';
        const tipo = c.tipoCuenta ? ` (${c.tipoCuenta})` : '';
        lineasCuentas.push(`🏦 *${banco}${tipo}:* ${c.numeroCuenta} (Titular: ${c.titular})`);
        if (c.numeroCci) lineasCuentas.push(`🔢 *CCI:* ${c.numeroCci}`);
      }
    });
    return lineasCuentas.join('\n');
  })();

  const lineas = [
    `¡Hola ${info.nombreDestinatario}! 👋`,
    `Tu pedido ha sido registrado con la agencia de envíos *FRAGATA COURIER* de parte del comercio ${comercio}.`,
    '',
    prod,
    dir,
    ref,
    gps,
    montoCobro,
    costoEnvio,
    '',
    cuentasBloque,
    cuentasBloque ? '' : null,
    `🔎 *Código de Seguimiento:* *${info.codigoSeguimiento}*`,
    `¡Gracias por tu preferencia!`
  ].filter(line => line !== null && line !== '');

  return lineas.join('\n');
}

export function openWhatsAppWithPedidoMessage(info: IWhatsAppPedidoInfo) {
  const text = buildWhatsAppPedidoMessage(info);
  const cleanPhone = info.telefonoDestinatario.replace(/\D/g, '');
  const phoneParam = cleanPhone ? `51${cleanPhone}` : '';
  window.open(`https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`, '_blank');
}
