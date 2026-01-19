# 📡 MQTT Data Flow Explanation

This document explains how data flows from the MQTT server to the frontend dashboard.

## 🔄 Complete Data Flow Path

```
MQTT Broker → Backend (Node.js) → WebSocket → Frontend (Next.js) → React Components → UI Display
```

---

## 📍 Step-by-Step Data Flow

### **1. MQTT Connection & Subscription** 
📍 **File:** `backend/src/services/sensorService.js` (lines 42-89)

```javascript
// Line 43-53: Connect to MQTT broker
connectToMQTT() {
  // Reads MQTT config from backend/.env
  const mqttHost = process.env.MQTT_HOST;
  const mqttPort = process.env.MQTT_PORT;
  // ... creates MQTT client connection
}

// Line 74-89: Subscribe to topics
this.mqttClient.on("connect", () => {
  // Subscribes to: dht11/temperature and dht11/humidity
  this.mqttClient.subscribe([tempTopic, humTopic], { qos: 0 });
});
```

**What happens:**
- Backend connects to MQTT broker (HiveMQ Cloud in your case)
- Subscribes to `dht11/temperature` and `dht11/humidity` topics
- Waits for messages from the broker

---

### **2. Receiving MQTT Messages**
📍 **File:** `backend/src/services/sensorService.js` (lines 91-115)

```javascript
// Line 91-115: Handle incoming MQTT messages
this.mqttClient.on("message", (topic, message) => {
  const payload = message.toString(); // e.g., "25.5" or "60.2"
  
  // Parse and store the data
  if (topic.includes("temperature")) {
    this.sensorData.temperature = parseFloat(payload).toFixed(2);
  } else if (topic.includes("humidity")) {
    this.sensorData.humidity = parseFloat(payload).toFixed(2);
  }
  this.sensorData.lastUpdated = new Date().toLocaleString();
  
  // Broadcast to all WebSocket clients
  this.broadcastSensorData();
});
```

**What happens:**
- When MQTT broker receives a message on subscribed topics
- Backend receives: `topic` (e.g., "dht11/temperature") and `message` (e.g., "25.5")
- Parses the value and stores it in `this.sensorData` object
- Updates `lastUpdated` timestamp
- Immediately broadcasts to all connected WebSocket clients

---

### **3. Broadcasting via WebSocket**
📍 **File:** `backend/src/services/sensorService.js` (lines 136-143)

```javascript
// Line 136-143: Send data to all WebSocket clients
broadcastSensorData() {
  if (!this.wss) return;
  this.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Send JSON string to frontend
      client.send(JSON.stringify(this.sensorData));
    }
  });
}
```

**What happens:**
- After receiving MQTT message, `broadcastSensorData()` is called
- Loops through all connected WebSocket clients (browsers)
- Sends JSON data: `{"temperature": "25.5", "humidity": "60.2", "lastUpdated": "...", "domain": "default"}`
- This happens **instantly** when MQTT message arrives

---

### **4. Frontend WebSocket Connection**
📍 **File:** `frontend/src/hooks/useSensorSocket.ts` (lines 23-70)

```javascript
// Line 23-70: Connect to WebSocket and listen for messages
useEffect(() => {
  const ws = new WebSocket(wsUrl); // ws://localhost:4040
  
  ws.onmessage = (evt) => {
    // Parse JSON from backend
    const parsed = JSON.parse(String(evt.data));
    // Update React state
    setData((prev) => ({
      temperature: parsed.temperature ?? prev.temperature,
      humidity: parsed.humidity ?? prev.humidity,
      lastUpdated: parsed.lastUpdated ?? prev.lastUpdated,
      domain: parsed.domain ?? prev.domain
    }));
  };
}, [wsUrl]);
```

**What happens:**
- React hook connects to WebSocket server (ws://localhost:4040)
- Listens for `onmessage` events
- When backend sends data, it parses JSON and updates React state
- State update triggers React re-render

---

### **5. Displaying Data in UI**
📍 **File:** `frontend/src/app/page.tsx` (lines 8-58)

```javascript
// Line 8-9: Get data from WebSocket hook
const { data, status, isLive } = useSensorSocket();

// Line 45-58: Display in MetricCard components
<MetricCard
  label="Temperature"
  value={data.temperature}  // ← Data from MQTT → WebSocket → React state
  unit="°C"
  isLive={isLive}
/>
<MetricCard
  label="Humidity"
  value={data.humidity}      // ← Data from MQTT → WebSocket → React state
  unit="%"
  isLive={isLive}
/>
```

**What happens:**
- `useSensorSocket()` hook returns `data` object with latest values
- React components receive `data.temperature` and `data.humidity`
- Components re-render automatically when data changes
- UI updates **instantly** when new MQTT message arrives

---

## 🗂️ Key Files & Their Roles

| File | Role | Key Function |
|------|------|--------------|
| `backend/src/services/sensorService.js` | **MQTT → WebSocket Bridge** | Receives MQTT messages, broadcasts via WebSocket |
| `backend/src/index.js` | **Server Setup** | Starts Express + WebSocket server |
| `frontend/src/hooks/useSensorSocket.ts` | **WebSocket Client** | Connects to backend, receives data, updates React state |
| `frontend/src/app/page.tsx` | **UI Display** | Renders data in MetricCard components |

---

## 🔑 Important Code Locations

### **Where MQTT messages are received:**
- `backend/src/services/sensorService.js` → Line **91** (`mqttClient.on("message")`)

### **Where data is broadcast to frontend:**
- `backend/src/services/sensorService.js` → Line **136** (`broadcastSensorData()`)

### **Where frontend receives data:**
- `frontend/src/hooks/useSensorSocket.ts` → Line **35** (`ws.onmessage`)

### **Where data is displayed:**
- `frontend/src/app/page.tsx` → Line **9** (`useSensorSocket()`) → Line **47, 54** (`data.temperature`, `data.humidity`)

---

## 🚀 Real-Time Flow Example

1. **Sensor publishes** `"25.5"` to topic `dht11/temperature` on MQTT broker
2. **Backend receives** message at `sensorService.js:91`
3. **Backend updates** `this.sensorData.temperature = "25.5"` at line 98-101
4. **Backend broadcasts** via WebSocket at line 110 → `broadcastSensorData()` at line 136
5. **Frontend receives** JSON at `useSensorSocket.ts:35` (`ws.onmessage`)
6. **React state updates** at line 38-43 (`setData()`)
7. **UI re-renders** automatically, showing new temperature value
8. **Total time:** < 100ms (near-instant)

---

## 📝 Summary

**Data Path:**
```
MQTT Broker 
  ↓ (publishes message)
Backend MQTT Client (sensorService.js:91)
  ↓ (stores in this.sensorData)
Backend WebSocket Server (sensorService.js:136)
  ↓ (sends JSON)
Frontend WebSocket Client (useSensorSocket.ts:35)
  ↓ (updates React state)
React Components (page.tsx:9)
  ↓ (renders)
UI Display (MetricCard components)
```

The entire flow is **real-time** and **bidirectional** - any MQTT message immediately appears on the dashboard without page refresh!
