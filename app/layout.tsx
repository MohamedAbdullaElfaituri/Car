import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "بوسنينه لخدمات السيارات",
  description: "نظام داخلي لإدارة مغسلة وخدمات السيارات",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
