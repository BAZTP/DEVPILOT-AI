"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Providers — Envuelve la aplicación con los proveedores necesarios:
 * - TanStack Query para peticiones remotas
 * Se agregarán más proveedores en fases posteriores (Auth, Toasts, etc.)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // En un IDE queremos datos frescos pero no recargar constantemente
            staleTime: 1000 * 60 * 5, // 5 minutos
            retry: (failureCount, error) => {
              // No reintentar en errores 4xx (auth, not found, etc.)
              if (error instanceof Error && "status" in error) {
                const status = (error as { status: number }).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
