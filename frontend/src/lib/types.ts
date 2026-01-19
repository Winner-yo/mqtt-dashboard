export type SensorData = {
  temperature: string;
  heartbeat: string;
  lastUpdated: string;
  domain: string;
  alerts?: Alert[];
};

export type Alert = {
  type: "temperature" | "heartbeat";
  value: string;
  threshold: { min: number; max: number };
  status: "low" | "high";
  timestamp: string;
  message: string;
};

export type SocketStatus = "connecting" | "open" | "closed" | "error";

