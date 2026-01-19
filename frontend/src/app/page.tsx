"use client";

import { ConnectionPill } from "@/components/ConnectionPill";
import { MetricCard } from "@/components/MetricCard";
import { AlertBanner } from "@/components/AlertBanner";
import { ClockIcon } from "@/components/Icons";
import { useSensorSocket } from "@/hooks/useSensorSocket";

export default function Page() {
  const { data, status, isLive } = useSensorSocket();

  return (
    <main className="h-screen relative overflow-hidden flex flex-col">
      {/* Alert Banner */}
      <AlertBanner alerts={data.alerts} />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-6 md:py-8 flex-1 flex flex-col">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">
                Live Data Stream
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Sensor
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-sm text-zinc-400">
              Real-time temperature and heartbeat monitoring
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <ConnectionPill status={status} isLive={isLive} />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 mb-4 flex-1">
          <MetricCard
            label="Temperature"
            value={data.temperature}
            unit="°C"
            isLive={isLive}
            gradient="from-orange-500/20 via-red-500/20 to-orange-500/20"
          />
          <MetricCard
            label="Heartbeat"
            value={data.heartbeat}
            unit="bpm"
            isLive={isLive}
            gradient="from-red-500/20 via-pink-500/20 to-red-500/20"
          />
        </section>

        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300" />
          <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl p-5 ring-1 ring-white/10 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-cyan-400/80">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Last Updated
                </div>
                <div className="text-lg font-semibold text-white tabular-nums">
                  {data.lastUpdated}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Domain
                </div>
                <div className="text-sm font-medium text-zinc-300">
                  {data.domain}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

