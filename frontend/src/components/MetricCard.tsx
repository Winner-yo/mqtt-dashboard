import { TemperatureIcon, HeartbeatIcon } from "./Icons";

export function MetricCard({
  label,
  value,
  unit,
  isLive,
  gradient = "from-white/10 via-white/5 to-transparent"
}: {
  label: string;
  value: string;
  unit?: string;
  isLive?: boolean;
  gradient?: string;
}) {
  const isNumeric = value !== "N/A" && !isNaN(Number(value));
  const Icon = label === "Temperature" ? TemperatureIcon : HeartbeatIcon;
  const iconColor = label === "Temperature" 
    ? "text-orange-400/80" 
    : "text-red-400/80";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl p-6 ring-1 ring-white/10 border border-white/5 transition-all duration-300 hover:ring-white/20 hover:shadow-xl hover:shadow-blue-500/10">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 transition-opacity duration-500 ${isLive ? "group-hover:opacity-60" : ""}`} />
      
      {/* Shimmer effect on live updates */}
      {isLive && isNumeric && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-white/5 ring-1 ring-white/10 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {label}
            </div>
          </div>
          {isLive && isNumeric && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <div className={`text-4xl font-bold tracking-tight tabular-nums transition-all duration-300 ${
            isNumeric 
              ? "text-white" 
              : "text-zinc-500"
          }`}>
            {value}
          </div>
          {unit && (
            <div className={`pb-1 text-base font-medium transition-colors duration-300 ${
              isNumeric ? "text-zinc-300" : "text-zinc-600"
            }`}>
              {unit}
            </div>
          )}
        </div>

        {/* Value indicator line */}
        {isNumeric && (
          <div className="h-0.5 w-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: isLive ? "100%" : "0%",
                animation: isLive ? "shimmer 2s linear infinite" : "none"
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

