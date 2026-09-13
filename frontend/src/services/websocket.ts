import { useEffect, useRef, useState, useCallback } from 'react';
import type { NWDPEnvironmentalContext, CO2Sequestration, VerificationScore } from '../types';

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface TelemetryPondUpdate {
  pond_id: string;
  name: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  sensor_values: Record<string, any>;
  nwdp_environmental_context: NWDPEnvironmentalContext;
  anomaly_status: Record<string, any>;
  biomass_estimate: Record<string, any>;
  co2_estimate: Record<string, any>;
  verification_confidence: Record<string, any>;
}

export interface TelemetryFrame {
  event: string;
  timestamp: string;
  nwdp_environmental_context?: NWDPEnvironmentalContext;
  ponds?: TelemetryPondUpdate[];
  farm_carbon?: Partial<CO2Sequestration>;
  farm_verification?: Partial<VerificationScore>;
}

export const getWebSocketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (typeof window !== 'undefined') {
    const isDevPort = window.location.port === '5173' || window.location.port === '3000';
    const host = isDevPort ? `${window.location.hostname}:8000` : window.location.host;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${host}/api/v1/ws/telemetry`;
  }
  return 'ws://localhost:8000/api/v1/ws/telemetry';
};

export function useTelemetryWebSocket(onFrameReceived?: (frame: TelemetryFrame) => void) {
  const [status, setStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const onFrameRef = useRef(onFrameReceived);

  // Keep latest callback ref without triggering reconnects
  useEffect(() => {
    onFrameRef.current = onFrameReceived;
  }, [onFrameReceived]);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    setStatus((prev) => (prev === 'DISCONNECTED' ? 'CONNECTING' : 'RECONNECTING'));

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        console.log(`[WebSocket] Live Telemetry stream connected: ${wsUrl}`);
        setStatus('CONNECTED');
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const frame: TelemetryFrame = JSON.parse(event.data);
          if (onFrameRef.current) {
            onFrameRef.current(frame);
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
  }, []);

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
