# 🚨 Alert System Setup Guide

## Overview

The system monitors **Temperature** and **Heartbeat** and sends email alerts when values go out of normal range.

---

## 📧 Email Configuration

### Step 1: Add Email Settings to `backend/.env`

Add these lines to your `backend/.env` file:

```env
# Email Alert Configuration
ALERT_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 2: Gmail App Password Setup

If using Gmail, you need to create an **App Password** (not your regular password):

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Create a new app password for "Mail"
5. Copy the 16-character password
6. Use it as `SMTP_PASSWORD` in your `.env`

**Note:** For other email providers, adjust `SMTP_HOST` and `SMTP_PORT` accordingly.

---

## ⚙️ Alert Thresholds Configuration

Add these to `backend/.env` to customize alert thresholds:

```env
# Alert Thresholds
TEMP_MIN=20        # Minimum normal temperature (°C)
TEMP_MAX=30        # Maximum normal temperature (°C)
HEARTBEAT_MIN=60   # Minimum normal heartbeat (bpm)
HEARTBEAT_MAX=100  # Maximum normal heartbeat (bpm)
```

**Default values** (if not set):
- Temperature: 20-30°C
- Heartbeat: 60-100 bpm

---

## 🔔 How Alerts Work

### Alert Triggers

1. **Temperature Alert**: Triggered when temperature < `TEMP_MIN` or > `TEMP_MAX`
2. **Heartbeat Alert**: Triggered when heartbeat < `HEARTBEAT_MIN` or > `HEARTBEAT_MAX`

### Alert Behavior

- **Email sent** to `ALERT_EMAIL` when threshold is exceeded
- **Alert cooldown**: 5 minutes between emails (prevents spam)
- **Frontend notification**: Alert banner appears at top of dashboard
- **Alert history**: Last 10 alerts stored and displayed

### Alert States

- **HIGH** (🔴): Value exceeds maximum threshold
- **LOW** (🟡): Value below minimum threshold

---

## 📝 MQTT Topic Configuration

Update your MQTT topics in `backend/.env`:

```env
# MQTT Topics
MQTT_TEMP_TOPIC=dht11/temperature
MQTT_HEARTBEAT_TOPIC=dht11/heartbeat
```

---

## 🎯 Testing Alerts

### Test Temperature Alert

Publish a value outside the range to your temperature topic:
```bash
# Example: Publish temperature = 35°C (above max threshold of 30°C)
# This will trigger a HIGH alert
```

### Test Heartbeat Alert

Publish a value outside the range to your heartbeat topic:
```bash
# Example: Publish heartbeat = 45 bpm (below min threshold of 60 bpm)
# This will trigger a LOW alert
```

---

## 📧 Email Alert Format

When an alert is triggered, you'll receive an email with:

- **Subject**: `🔴 Alert: TEMPERATURE Out of Range` or `🟡 Alert: HEARTBEAT Out of Range`
- **Content**:
  - Current value
  - Normal range
  - Status (HIGH/LOW)
  - Timestamp
  - Link to dashboard (if configured)

---

## 🔍 Monitoring Alerts

### Backend Logs

Watch for these messages in your backend terminal:
```
⚠️ ALERT: TEMPERATURE is HIGH: 35.00 (Normal range: 20-30)
✅ Alert email sent to your-email@gmail.com
```

### Frontend Dashboard

- **Alert Banner**: Appears at top when alert is active
- **Alert History**: Stored in `data.alerts` array (last 10 alerts)

---

## 🛠️ Troubleshooting

### Email Not Sending

1. **Check SMTP credentials** in `backend/.env`
2. **Verify App Password** (for Gmail) is correct
3. **Check backend logs** for email errors
4. **Test SMTP connection** manually if needed

### Alerts Not Triggering

1. **Verify thresholds** in `backend/.env`
2. **Check MQTT messages** are being received
3. **Check backend logs** for alert processing
4. **Verify topic names** match your MQTT publisher

### Too Many Emails

- Alerts have a **5-minute cooldown** to prevent spam
- If you need to adjust, modify `alertCooldown` in `sensorService.js`

---