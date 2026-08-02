import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { getApiBaseUrl } from '../../infrastructure/api/apiClient';

export const useSignalR = () => {
  const queryClient = useQueryClient();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    // Inicializar conexión WebSocket SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/tracking`, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Escuchar Eventos de Cambio de Estado en Tiempo Real
    connection.on('EstadoPedidoCambiado', (data: { idPedido: number; codigoSeguimiento: string; nuevoEstado: string }) => {
      console.log('⚡ SignalR: EstadoPedidoCambiado', data);

      // Invalida consultas activas para refrescar inmediatamente
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['mis-compras'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-recojo'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-entrega-distritos'] });

      if (data?.codigoSeguimiento) {
        queryClient.invalidateQueries({ queryKey: ['rastreo-pedido', data.codigoSeguimiento] });
      }
    });

    connection.on('RecojoActualizado', () => {
      console.log('⚡ SignalR: RecojoActualizado');
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-recojo'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    });

    connection.on('EntregaActualizada', () => {
      console.log('⚡ SignalR: EntregaActualizada');
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-entrega-distritos'] });
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['rastreo-pedido'] });
      queryClient.invalidateQueries({ queryKey: ['mis-compras'] });
    });

    connection.on('LiquidacionActualizada', () => {
      console.log('⚡ SignalR: LiquidacionActualizada');
      queryClient.invalidateQueries({ queryKey: ['liquidaciones-resumen-admin'] });
      queryClient.invalidateQueries({ queryKey: ['liquidacion-detalle-motorizado'] });
    });

    // Iniciar conexión Hub
    connection
      .start()
      .then(() => {
        console.log('🟢 Conectado con éxito a SignalR Real-Time Tracking Hub');
      })
      .catch((err) => {
        console.warn('⚠️ No se pudo conectar a SignalR (se reintentará automáticamente):', err);
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [queryClient]);
};
