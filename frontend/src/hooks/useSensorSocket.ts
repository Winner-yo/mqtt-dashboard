import { useEffect, useMemo, useRef, useState } from "react";

import { getBackendWsUrl } from "@/lib/config";
import type { SensorData, SocketStatus } from "@/lib/types";

const initialData: SensorData = {
  temperature: "N/A",
  heartbeat: "N/A",
  lastUpdated: "N/A",
  domain: "default",
  alerts: []
};

export function useSensorSocket() {
  const wsUrl = useMemo(() => getBackendWsUrl(), []);
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptRef = useRef(0);

  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [data, setData] = useState<SensorData>(initialData);
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);

  useEffect(() => {
    const connect = () => {
      setStatus("connecting");

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryAttemptRef.current = 0;
        setStatus("open");
      };

      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(String(evt.data)) as Partial<SensorData>;
          setData((prev) => ({
            temperature: parsed.temperature ?? prev.temperature,
            heartbeat: parsed.heartbeat ?? prev.heartbeat,
            lastUpdated: parsed.lastUpdated ?? prev.lastUpdated,
            domain: parsed.domain ?? prev.domain,
            alerts: parsed.alerts ?? prev.alerts ?? []
          }));
          setLastMessageAt(Date.now());
        } catch {
          // ignore bad payloads
        }
      };

      ws.onerror = () => {
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus("closed");
        const attempt = Math.min(6, retryAttemptRef.current + 1);
        retryAttemptRef.current = attempt;
        const delayMs = Math.min(15_000, 500 * 2 ** (attempt - 1));
        retryTimerRef.current = window.setTimeout(connect, delayMs);
      };
    };

    connect();

    return () => {
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [wsUrl]);

  const isLive =
    status === "open" &&
    lastMessageAt != null &&
    Date.now() - lastMessageAt < 10_000;

  return { data, status, isLive, wsUrl };
}

