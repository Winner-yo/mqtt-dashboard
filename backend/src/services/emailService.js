const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.alertEmail = process.env.ALERT_EMAIL || "ashenafidamena415@gmail.com";
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Use Gmail SMTP or custom SMTP from env
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ Email service not configured. Set SMTP_USER and SMTP_PASSWORD in backend/.env");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    console.log("✅ Email service initialized");
  }

  async sendAlert(alert) {
    if (!this.transporter) {
      console.warn("⚠️ Email service not configured, skipping email alert");
      return;
    }

    const { type, value, threshold, status, message, timestamp } = alert;
    const statusEmoji = status === "high" ? "🔴" : "🟡";
    const subject = `${statusEmoji} Alert: ${type.toUpperCase()} Out of Range`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-box { background: ${status === "high" ? "#fee" : "#ffeaa7"}; border-left: 4px solid ${status === "high" ? "#e74c3c" : "#f39c12"}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .metric { font-size: 24px; font-weight: bold; color: ${status === "high" ? "#c0392b" : "#d68910"}; }
            .threshold { color: #7f8c8d; font-size: 14px; }
            .timestamp { color: #95a5a6; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${statusEmoji} Sensor Alert</h2>
            <div class="alert-box">
              <div class="metric">${type.toUpperCase()}: ${value}</div>
              <div class="threshold">Normal Range: ${threshold.min} - ${threshold.max}</div>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p><strong>Message:</strong> ${message}</p>
              <div class="timestamp">Alert Time: ${new Date(timestamp).toLocaleString()}</div>
            </div>
            <p>Please check your sensor dashboard immediately.</p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
ALERT: ${type.toUpperCase()} Out of Range

${message}

Current Value: ${value}
Normal Range: ${threshold.min} - ${threshold.max}
Status: ${status.toUpperCase()}
Time: ${new Date(timestamp).toLocaleString()}

Please check your sensor dashboard immediately.
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"MQTT Dashboard Alert" <${smtpUser}>`,
        to: this.alertEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`✅ Alert email sent to ${this.alertEmail}:`, info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Error sending alert email:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
