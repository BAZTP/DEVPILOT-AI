import Link from "next/link";
import { Cpu } from "lucide-react";

/**
 * Página de autenticación
 * Fase 1: Formulario de login con email/password (stub)
 * Fase 6: Se agregará OAuth con GitHub
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ide-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-electric-500/25">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-ide-text">
            Bienvenido a DevPilot AI
          </h1>
          <p className="text-sm text-ide-text-muted mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-ide-panel border border-ide-border rounded-xl p-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-ide-text-muted mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              className="ide-input"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-ide-text-muted mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="ide-input"
            />
          </div>

          {/* Aviso de desarrollo */}
          <div className="bg-ide-warning/10 border border-ide-warning/20 rounded-lg p-3">
            <p className="text-xs text-ide-warning">
              🚧 <strong>Fase 1:</strong> La autenticación completa se implementa
              en la Fase 2. Por ahora puedes continuar para explorar la interfaz.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="ide-btn-primary w-full py-2.5 text-sm text-center flex items-center justify-center"
          >
            Iniciar sesión y Abrir Dashboard
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ide-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-ide-panel text-ide-text-muted">o</span>
            </div>
          </div>

          {/* GitHub OAuth — deshabilitado hasta Fase 6 */}
          <button
            type="button"
            disabled
            className="ide-btn-secondary w-full py-2.5 text-sm opacity-50 cursor-not-allowed"
            title="Disponible en Fase 6"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            Continuar con GitHub (Fase 6)
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-ide-text-muted mt-6">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-electric-400 hover:text-electric-300 transition-colors"
          >
            Crear cuenta
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-ide-text-muted hover:text-ide-text transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
