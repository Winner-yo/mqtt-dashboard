const mqtt = require("mqtt");
const WebSocket = require("ws");
const emailService = require("./emailService");

class SensorService {
  constructor() {
    this.sensorData = {
      temperature: "N/A",
      heartbeat: "N/A",
      lastUpdated: "N/A",
      domain: "default",
      alerts: []
    };

    this.wss = null;
    this.mqttClient = null;
    this.isConnected = false;
    
    // Alert thresholds
    this.thresholds = {
      temperature: {
        min: Number(process.env.TEMP_MIN) || 20,
        max: Number(process.env.TEMP_MAX) || 30
      },
      heartbeat: {
        min: Number(process.env.HEARTBEAT_MIN) || 60,
        max: Number(process.env.HEARTBEAT_MAX) || 100
      }
    };
    
    // Track last alert sent to avoid spam
    this.lastAlertSent = {
      temperature: null,
      heartbeat: null
    };
  }

  // Initialize WebSocket server
  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", (ws) => {
      console.log("Client connected via WebSocket");
      ws.send(JSON.stringify(this.sensorData));

      ws.on("error", (err) => {
        console.error("WebSocket client error:", err);
      });

      ws.on("close", () => {
        console.log("WebSocket client disconnected");
      });
    });

    this.wss.on("error", (err) => {
      console.error("WebSocket server error:", err);
    });

    console.log("WebSocket server initialized");
  }

  // Connect to MQTT broker
  connectToMQTT() {
    const mqttUrl = process.env.MQTT_URL;
    const mqttHost = process.env.MQTT_HOST;

    if (!mqttUrl && !mqttHost) {
      console.warn(
        "⚠️ MQTT is not configured. Set MQTT_URL (recommended) or MQTT_HOST/MQTT_PORT/MQTT_PROTOCOL in backend/.env"
      );
      this.isConnected = false;
      return;
    }

    const mqttOptions = {
      host: process.env.MQTT_HOST,
      port: Number(process.env.MQTT_PORT || 1883),
      protocol: process.env.MQTT_PROTOCOL || "mqtt",
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clientId: `EnvoInsight_Client_${Math.random().toString(16).slice(2)}`,
      reconnectPeriod: 1000
    };

    this.mqttClient = mqttUrl
      ? mqtt.connect(mqttUrl, {
          username: mqttOptions.username,
          password: mqttOptions.password,
          clientId: mqttOptions.clientId,
          reconnectPeriod: mqttOptions.reconnectPeriod
        })
      : mqtt.connect(mqttOptions);

    this.mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      this.isConnected = true;
      this._hasLoggedError = false;

      const tempTopic = process.env.MQTT_TEMP_TOPIC || "dht11/temperature";
      const heartbeatTopic = process.env.MQTT_HEARTBEAT_TOPIC || "dht11/heartbeat";

      this.mqttClient.subscribe([tempTopic, heartbeatTopic], { qos: 0 }, (err) => {
        if (!err) {
          console.log(`📡 Subscribed to ${tempTopic} and ${heartbeatTopic}`);
        } else {
          console.error("❌ MQTT subscription error:", err);
        }
      });
    });

    this.mqttClient.on("message", (topic, message) => {
      const payload = message.toString();
      console.log(`📨 Received ${payload} from ${topic}`);

      try {
        const now = new Date().toLocaleString();
        let value = null;
        let metricType = null;

        if (topic.includes("temperature")) {
          value = Number.parseFloat(payload);
          if (Number.isFinite(value)) {
            this.sensorData.temperature = value.toFixed(2);
            metricType = "temperature";
          } else {
            this.sensorData.temperature = payload;
          }
        } else if (topic.includes("heartbeat")) {
          value = Number.parseFloat(payload);
          if (Number.isFinite(value)) {
            this.sensorData.heartbeat = value.toFixed(2);
            metricType = "heartbeat";
          } else {
            this.sensorData.heartbeat = payload;
          }
        }
        
        this.sensorData.lastUpdated = now;

        // Check for alerts if we have a valid numeric value
        if (metricType && Number.isFinite(value)) {
          this.checkAlerts(metricType, value);
        }

        this.broadcastSensorData();
        this.storeSensorData();
      } catch (err) {
        console.error("❌ Error processing MQTT message:", err);
      }
    });

    this.mqttClient.on("error", (err) => {
      if (!this._hasLoggedError) {
        console.error("❌ MQTT connection error:", err.message || err);
        if (err.message?.includes("Not authorized") || err.code === 5) {
          console.error("   → Check MQTT_USERNAME and MQTT_PASSWORD in backend/.env");
        }
        this._hasLoggedError = true;
      }
      this.isConnected = false;
    });

    this.mqttClient.on("close", () => {
      if (this.isConnected) {
        console.log("🔌 Disconnected from MQTT broker. Reconnecting...");
      }
      this.isConnected = false;
    });
  }

  // Check if values are out of normal range and trigger alerts
  checkAlerts(metricType, value) {
    const threshold = this.thresholds[metricType];
    if (!threshold) return;

    const isOutOfRange = value < threshold.min || value > threshold.max;
    const now = Date.now();
    const alertCooldown = 5 * 60 * 1000; // 5 minutes between alerts

    if (isOutOfRange) {
      // Check if we should send alert (cooldown period)
      const lastAlert = this.lastAlertSent[metricType];
      if (!lastAlert || (now - lastAlert) > alertCooldown) {
        const alert = {
          type: metricType,
          value: value.toFixed(2),
          threshold: threshold,
          status: value < threshold.min ? "low" : "high",
          timestamp: new Date().toISOString(),
          message: `${metricType.toUpperCase()} is ${value < threshold.min ? "LOW" : "HIGH"}: ${value.toFixed(2)} (Normal range: ${threshold.min}-${threshold.max})`
        };

        // Add to alerts array (keep last 10)
        this.sensorData.alerts = [alert, ...(this.sensorData.alerts || []).slice(0, 9)];

        // Send email alert
        emailService.sendAlert(alert).catch(err => {
          console.error("❌ Failed to send email alert:", err);
        });

        // Log alert
        console.warn(`⚠️ ALERT: ${alert.message}`);
        
        this.lastAlertSent[metricType] = now;
      }
    } else {
      // Reset alert cooldown if value is back to normal
      if (this.lastAlertSent[metricType]) {
        console.log(`✅ ${metricType.toUpperCase()} back to normal: ${value.toFixed(2)}`);
        this.lastAlertSent[metricType] = null;
      }
    }
  }

  broadcastSensorData() {
    if (!this.wss) return;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this.sensorData));
      }
    });
  }

  async storeSensorData() {
    try {
      // TODO: Implement database storage (MongoDB/InfluxDB/etc.)
      // console.log("💾 Sensor data stored:", this.sensorData);
    } catch (error) {
      console.error("❌ Error storing sensor data:", error);
    }
  }

  getCurrentData() {
    return this.sensorData;
  }

  getConnectionStatus() {
    return {
      mqtt: this.isConnected,
      websocketClients: this.wss ? this.wss.clients.size : 0
    };
  }

  disconnect() {
    if (this.mqttClient) this.mqttClient.end();
    if (this.wss) this.wss.close();
  }
}

module.exports = new SensorService();

