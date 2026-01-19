import type { SocketStatus } from "@/lib/types";

function colorFor(status: SocketStatus, isLive: boolean) {
  if (status === "open" && isLive) return "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30";
  if (status === "connecting") return "bg-sky-500/15 text-sky-200 ring-sky-500/30";
  if (status === "open") return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
  if (status === "error") return "bg-rose-500/15 text-rose-200 ring-rose-500/30";
  return "bg-zinc-500/15 text-zinc-200 ring-zinc-500/30";
}

function labelFor(status: SocketStatus, isLive: boolean) {
  if (status === "open" && isLive) return "Live";
  if (status === "open" && !isLive) return "Connected (idle)";
  if (status === "connecting") return "Connecting…";
  if (status === "error") return "Error";
  return "Disconnected";
}

export function ConnectionPill({
  status,
  isLive
}: {
  status: SocketStatus;
  isLive: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold ring-1 backdrop-blur-sm transition-all duration-300",
        colorFor(status, isLive)
      ].join(" ")}
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={[
            "absolute inline-flex h-full w-full rounded-full",
            status === "open" && isLive 
              ? "animate-ping bg-emerald-400 opacity-75" 
              : status === "open"
              ? "bg-amber-400 opacity-50"
              : "bg-zinc-400 opacity-50"
          ].join(" ")}
        />
        <span
          className={[
            "relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-current ring-opacity-20",
            status === "open" && isLive 
              ? "bg-emerald-400" 
              : status === "open"
              ? "bg-amber-400"
              : "bg-zinc-400"
          ].join(" ")}
        />
      </span>
      <span>{labelFor(status, isLive)}</span>
    </div>
  );
}

