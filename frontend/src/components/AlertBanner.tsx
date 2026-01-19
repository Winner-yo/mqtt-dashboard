"use client";

import type { Alert } from "@/lib/types";
import { useEffect, useState } from "react";

export function AlertBanner({ alerts }: { alerts?: Alert[] }) {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      // Show only the most recent alert
      const latestAlert = alerts[0];
      setVisibleAlerts([latestAlert]);
    } else {
      setVisibleAlerts([]);
    }
  }, [alerts]);

  if (visibleAlerts.length === 0) return null;

  const alert = visibleAlerts[0];
  const isHigh = alert.status === "high";
  const bgColor = isHigh 
    ? "bg-red-500/20 border-red-500/50 text-red-200" 
    : "bg-yellow-500/20 border-yellow-500/50 text-yellow-200";

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top-5`}>
      <div className={`${bgColor} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isHigh ? "bg-red-500/30" : "bg-yellow-500/30"
            }`}>
              <span className="text-lg">{isHigh ? "🔴" : "🟡"}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-1">
              {alert.type.toUpperCase()} Alert
            </div>
            <div className="text-xs opacity-90">
              {alert.message}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(alert.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
