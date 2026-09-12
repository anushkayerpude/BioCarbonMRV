import { useEffect, useRef, useState, useCallback } from 'react';
import type { NWDPEnvironmentalContext } from '../types';

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface TelemetryFrame {
  event: string;
  timestamp: string;
  nwdp_environmental_context?: NWDPEnvironmentalContext;
  ponds?: Array<{
    pond_id: string;
    name: string;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
    sensor_values: Record<string, any>;
    nwdp_environmental_context: NWDPEnvironmentalContext;
    anomaly_status: Record<string, any>;
    biomass_estimate: Record<string, any>;
    co2_estimate: Record<string, any>;
    verification_confidence: Record<string, any>;
  }>;
}

const WS_URL = 'ws://localhost:8000/api/v1/ws/telemetry';

export function useTelemetryWebSocket(onFrameReceived?: (frame: TelemetryFrame) => void) {
  const [status, setStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    setStatus((prev) => (prev === 'DISCONNECTED' ? 'CONNECTING' : 'RECONNECTING'));

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        console.log('[WebSocket] Live Telemetry stream connected: ws://localhost:8000/api/v1/ws/telemetry');
        setStatus('CONNECTED');
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const frame: TelemetryFrame = JSON.parse(event.data);
          if (onFrameReceived) {
            onFrameReceived(frame);
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing telemetry frame:', e);
        }
      };

      ws.onerror = (error) => {
        console.warn('[WebSocket] Stream error encountered:', error);
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        console.warn('[WebSocket] Telemetry stream closed. Scheduling automatic reconnect in 3s...');
        setStatus('RECONNECTING');

        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect();
          }
        }, 3000);
      };
    } catch (err) {
      console.error('[WebSocket] Failed to initiate connection:', err);
      setStatus('DISCONNECTED');
    }
  }, [onFrameReceived]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status, reconnect: connect };
}
