# MQTT Live Dashboard (Next.js + Express)

Modern, minimal dashboard that shows **live sensor data** streamed from an MQTT broker via a WebSocket server. Includes **real-time alert notifications** with email alerts when values go out of normal range.

## Folder structure

- `backend/`: Express API + MQTT subscriber + WebSocket broadcaster
- `frontend/`: Next.js dashboard UI (Tailwind)

## Prerequisites

- Node.js 18+ (recommended: 20+)
- An MQTT broker (HiveMQ Cloud, Mosquitto, etc.)

## Quick start (dev)

### 1) Configure the backend

Create `backend/.env` and put your MQTT broker details there.

### 1b) Configure the frontend (optional)

If your backend is not on `localhost:4000`, create `frontend/.env.local` and set:

- `NEXT_PUBLIC_BACKEND_HTTP_URL`
- `NEXT_PUBLIC_BACKEND_WS_URL`

### 2) Install deps

From repo root:

```bash
npm install
```

### 3) Run both apps

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- WebSocket: `ws://localhost:4000`

## MQTT topics expected

By default the backend subscribes to:

- temperature: `dht11/temperature`
- heartbeat: `dht11/heartbeat`

Override them via env vars:

- `MQTT_TEMP_TOPIC`
- `MQTT_HEARTBEAT_TOPIC`

## Alert System

The system monitors **Temperature** and **Heartbeat** and sends email alerts when values go out of normal range.

### Quick Alert Setup

Add to `backend/.env`:

```env
# Email Configuration
ALERT_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Alert Thresholds (optional)
TEMP_MIN=20
TEMP_MAX=30
HEARTBEAT_MIN=60
HEARTBEAT_MAX=100
```

**See `ALERT_SETUP.md` for detailed setup instructions.**

