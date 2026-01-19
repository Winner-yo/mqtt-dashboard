export function getBackendHttpUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || "http://localhost:4000";
}

export function getBackendWsUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:4000";
}

