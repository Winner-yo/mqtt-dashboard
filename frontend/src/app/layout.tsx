import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MQTT Live Dashboard",
  description: "Modern live dashboard for MQTT sensor data"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

