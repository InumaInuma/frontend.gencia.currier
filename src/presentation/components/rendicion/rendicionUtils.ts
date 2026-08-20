import type { ILiquidacionDetalle } from '../../../domain/models/ILiquidacionDetalle';

export interface ComercioLiquidacionSummary {
  idComercio: number;
  nombreComercial: string;
  totalPedidos: number;
  entregados: number;
  reprogramados: number;
  cancelados: number;
  totalCostoEnvios: number; // Suma total de las tarifas de delivery (ej: 5 x 9 = S/ 45.00)
  enviosPagadosPorCliente: number; // Subtotal de envíos cubiertos por clientes (ej: 3 x 9 = S/ 27.00)
  enviosACobrarComercio: number; // Subtotal de envíos que debe pagar el comercio a la agencia (ej: 2 x 9 = S/ 18.00)
  enviosPromocionComercio: number; // Subtotal envíos asumidos por promoción del comercio
  enviosReprogramadosOcancelados: number; // Subtotal envíos cobrados al comercio por intento fallido/reprogramado
  cobradoAClientes: number; // Dinero total recaudado en destino (Productos + Delivery)
  cobradoProductos: number; // Dinero recaudado exclusivo de venta de productos (ej: 3 x 50 = S/ 150.00)
  balanceNetoComercio: number; // Monto Neto Final a transferir al comercio (ej: 150 - 18 = S/ 132.00)
}

export function calcularResumenComercios(detalleList: ILiquidacionDetalle[] | undefined): ComercioLiquidacionSummary[] {
  if (!detalleList || detalleList.length === 0) return [];

  const map = new Map<number, ComercioLiquidacionSummary>();

  for (const item of detalleList) {
    const id = item.idComercio || 0;
    let summary = map.get(id);
    if (!summary) {
      summary = {
        idComercio: id,
        nombreComercial: item.nombreComercial || 'Comercio General',
        totalPedidos: 0,
        entregados: 0,
        reprogramados: 0,
        cancelados: 0,
        totalCostoEnvios: 0,
        enviosPagadosPorCliente: 0,
        enviosACobrarComercio: 0,
        enviosPromocionComercio: 0,
        enviosReprogramadosOcancelados: 0,
        cobradoAClientes: 0,
        cobradoProductos: 0,
        balanceNetoComercio: 0,
      };
      map.set(id, summary);
    }

    summary.totalPedidos += 1;
    if (item.idEstadosPedido === 11) {
      summary.entregados += 1;
    } else if (item.idEstadosPedido === 14) {
      summary.reprogramados += 1;
    } else if (item.idEstadosPedido === 13 || item.idEstadosPedido === 12) {
      summary.cancelados += 1;
    }

    const tarifaDelivery = item.tarifaEnvio || 0;
    summary.totalCostoEnvios += tarifaDelivery;

    const montoTotalRecaudado = item.montoTotalPedido || (item.montoEfectivo + item.montoYape + item.montoTransferencia) || 0;
    summary.cobradoAClientes += montoTotalRecaudado;

    // Determinamos quién debe pagar el envío
    const costoComercio = item.costoEnvioComercio ?? (
      item.destinatarioPagaEnvio === false || item.idEstadosPedido === 14 || item.idEstadosPedido === 13 || item.idEstadosPedido === 12
        ? tarifaDelivery
        : 0
    );

    const costoCliente = item.costoEnvioCliente ?? (
      item.destinatarioPagaEnvio === true && item.idEstadosPedido === 11
        ? tarifaDelivery
        : 0
    );

    summary.enviosPagadosPorCliente += costoCliente;
    summary.enviosACobrarComercio += costoComercio;

    if (item.destinatarioPagaEnvio === false) {
      summary.enviosPromocionComercio += tarifaDelivery;
    }
    if (item.idEstadosPedido === 14 || item.idEstadosPedido === 13 || item.idEstadosPedido === 12) {
      summary.enviosReprogramadosOcancelados += tarifaDelivery;
    }

    // Dinero de productos cobrados en destino que la agencia debe entregar al comercio
    // Si el cliente pagó en destino (montoTotalRecaudado > 0), extraemos el costo del producto (montoCobrar o montoTotalRecaudado - costoCliente)
    if (item.idEstadosPedido === 11 && montoTotalRecaudado > 0) {
      const valorProducto = item.montoCobrar > 0 ? item.montoCobrar : Math.max(0, montoTotalRecaudado - costoCliente);
      summary.cobradoProductos += valorProducto;
    }

    // Balance Neto Final que la Agencia debe abonar al Comercio = (Productos Recaudados) - (Envíos que el Comercio debe pagar)
    summary.balanceNetoComercio = summary.cobradoProductos - summary.enviosACobrarComercio;
  }

  return Array.from(map.values());
}
