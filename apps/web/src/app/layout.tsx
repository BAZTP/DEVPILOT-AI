import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | DevPilot AI",
    default: "DevPilot AI — Entorno de Desarrollo Inteligente",
  },
  description:
    "DevPilot AI es un entorno de desarrollo integrado con inteligencia artificial para crear, editar y desplegar proyectos de software.",
  keywords: ["IDE", "IA", "desarrollo", "código", "editor", "DevPilot"],
  robots: {
    index: false, // Aplicación privada — no indexar
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconectar a fuentes de Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-ide-bg text-ide-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
