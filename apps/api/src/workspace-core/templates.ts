export interface TemplateFile {
  relativePath: string;
  content: string;
}

export type SupportedTemplate =
  | "REACT"
  | "NEXTJS"
  | "NODEJS"
  | "PYTHON"
  | "NESTJS_API"
  | "HTML_CSS_JS"
  | "BLANK";

export function getTemplateFiles(template: SupportedTemplate, projectName: string): TemplateFile[] {
  switch (template) {
    case "REACT":
      return [
        {
          relativePath: "package.json",
          content: JSON.stringify(
            {
              name: projectName,
              private: true,
              version: "0.1.0",
              type: "module",
              scripts: {
                dev: "vite",
                build: "tsc && vite build",
                preview: "vite preview",
              },
              dependencies: {
                react: "^18.3.1",
                "react-dom": "^18.3.1",
                "lucide-react": "^0.460.0",
              },
              devDependencies: {
                "@types/react": "^18.3.12",
                "@types/react-dom": "^18.3.1",
                "@vitejs/plugin-react": "^4.3.4",
                typescript: "^5.7.2",
                vite: "^6.0.1",
              },
            },
            null,
            2
          ),
        },
        {
          relativePath: "index.html",
          content: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} — DevPilot AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        },
        {
          relativePath: "src/main.tsx",
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        },
        {
          relativePath: "src/App.tsx",
          content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>¡Proyecto ${projectName} Listo!</h1>
      <p>Creado con DevPilot AI — Plantilla React + Vite</p>
      <button
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '4px' }}
        onClick={() => setCount((c) => c + 1)}
      >
        Contador: {count}
      </button>
    </div>
  );
}`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto React creado con **DevPilot AI**.\n`,
        },
      ];

    case "NEXTJS":
      return [
        {
          relativePath: "package.json",
          content: JSON.stringify(
            {
              name: projectName,
              version: "0.1.0",
              private: true,
              scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
              },
              dependencies: {
                next: "^15.0.3",
                react: "^19.0.0",
                "react-dom": "^19.0.0",
              },
              devDependencies: {
                "@types/node": "^22.10.1",
                "@types/react": "^19.0.1",
                "@types/react-dom": "^19.0.1",
                typescript: "^5.7.2",
              },
            },
            null,
            2
          ),
        },
        {
          relativePath: "src/app/page.tsx",
          content: `export default function HomePage() {
  return (
    <main style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Bienvenido a ${projectName}</h1>
      <p>Aplicación Next.js 15 App Router lista para editar en DevPilot AI.</p>
    </main>
  );
}`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nAplicación Next.js generada en DevPilot AI.\n`,
        },
      ];

    case "PYTHON":
      return [
        {
          relativePath: "main.py",
          content: `"""
Módulo principal de ${projectName}
Generado por DevPilot AI
"""

def greet(name: str = "Mundo") -> str:
    return f"¡Hola, {name}! Bienvenido a ${projectName}."

def main():
    mensaje = greet()
    print(mensaje)

if __name__ == "__main__":
    main()
`,
        },
        {
          relativePath: "test_main.py",
          content: `from main import greet

def test_greet():
    assert greet("DevPilot") == "¡Hola, DevPilot! Bienvenido a ${projectName}."
    assert "Hola" in greet()
`,
        },
        {
          relativePath: "requirements.txt",
          content: `pytest>=8.0.0\nruff>=0.8.0\n`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto Python generado por DevPilot AI.\n`,
        },
      ];

    case "NESTJS_API":
      return [
        {
          relativePath: "package.json",
          content: JSON.stringify(
            {
              name: projectName,
              version: "0.1.0",
              scripts: {
                dev: "nest start --watch",
                build: "nest build",
                start: "node dist/main",
              },
              dependencies: {
                "@nestjs/common": "^10.4.12",
                "@nestjs/core": "^10.4.12",
                "@nestjs/platform-express": "^10.4.12",
              },
            },
            null,
            2
          ),
        },
        {
          relativePath: "src/main.ts",
          content: `console.log('${projectName} backend listo');`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nAPI REST NestJS creada con DevPilot AI.\n`,
        },
      ];

    case "NODEJS":
      return [
        {
          relativePath: "package.json",
          content: JSON.stringify(
            {
              name: projectName,
              version: "0.1.0",
              main: "dist/index.js",
              scripts: {
                start: "node dist/index.js",
              },
            },
            null,
            2
          ),
        },
        {
          relativePath: "src/index.ts",
          content: `console.log("¡Hola desde ${projectName}! Ejecución Node.js con TypeScript.");`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto Node.js + TypeScript generado por DevPilot AI.\n`,
        },
      ];

    case "HTML_CSS_JS":
      return [
        {
          relativePath: "index.html",
          content: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${projectName}</title>
</head>
<body>
  <h1>${projectName}</h1>
  <p>Aplicación web nativa creada en DevPilot AI.</p>
</body>
</html>`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto HTML, CSS y JavaScript nativo generado por DevPilot AI.\n`,
        },
      ];

    case "BLANK":
    default:
      return [
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto vacío iniciado en DevPilot AI.\n`,
        },
      ];
  }
}
