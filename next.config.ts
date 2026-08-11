import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad básicas. No hay CSP completa todavía: exigiría nonces
 * para los scripts inline de Next y no se justifica antes del lanzamiento;
 * queda anotado en la revisión de seguridad como mejora futura.
 */
const securityHeaders = [
  // Nadie tiene por qué meter el tablero en un iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La app no usa cámara, micrófono ni ubicación; que quede declarado.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
