"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction || isLocalhost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      caches.keys().then((keys) => {
        keys.filter((key) => key.startsWith("bosnina-")).forEach((key) => caches.delete(key));
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}
