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
import './index.css';

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
          relativePath: "src/index.css",
          content: `body {
  margin: 0;
  background-color: #0d1117;
  color: #e6edf3;
}`,
        },
        {
          relativePath: "README.md",
          content: `# ${projectName}\n\nProyecto React creado con **DevPilot AI**.\n\n## Comandos\n- \`npm run dev\`: Inicia el servidor de desarrollo\n- \`npm run build\`: Compila para producción\n`,
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
          relativePath: "src/app/layout.tsx",
          content: `export const metadata = {
  title: '${projectName}',
  description: 'Creado con DevPilot AI',
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#0d1117', color: '#e6edf3' }}>{children}</body>
    </html>
  );
}`,
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
    return f"¡Hola, {name}! Bienvenido a {projectName}."

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
          content: `# ${projectName}\n\nProyecto Python generado por DevPilot AI.\n\n## Ejecución\n- \`python main.py\`\n- \`pytest\` para pruebas\n`,
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
                "reflect-metadata": "^0.2.2",
                rxjs: "^7.8.1",
              },
              devDependencies: {
                "@nestjs/cli": "^10.4.8",
                "@types/node": "^22.10.1",
                typescript: "^5.7.2",
              },
            },
            null,
            2
          ),
        },
        {
          relativePath: "src/main.ts",
          content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3002);
  console.log('${projectName} corriendo en http://localhost:3002');
}
bootstrap();`,
        },
        {
          relativePath: "src/app.module.ts",
          content: `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
})
export class AppModule {}`,
        },
        {
          relativePath: "src/app.controller.ts",
          content: `import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return { name: '${projectName}', status: 'online', generatedBy: 'DevPilot AI' };
  }
}`,
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
                build: "tsc",
                start: "node dist/index.js",
                dev: "ts-node src/index.ts",
              },
              devDependencies: {
                "@types/node": "^22.10.1",
                "ts-node": "^10.9.2",
                typescript: "^5.7.2",
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
          relativePath: "tsconfig.json",
          content: JSON.stringify(
            {
              compilerOptions: {
                target: "ES2022",
                module: "commonjs",
                outDir: "./dist",
                strict: true,
                esModuleInterop: true,
              },
              include: ["src/**/*"],
            },
            null,
            2
          ),
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
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="card">
    <h1>${projectName}</h1>
    <p>Aplicación web nativa creada en DevPilot AI.</p>
    <button id="btn">Haz clic aquí</button>
    <div id="output"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        },
        {
          relativePath: "styles.css",
          content: `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0d1117;
  color: #e6edf3;
  font-family: system-ui, sans-serif;
}
.card {
  background-color: #161b22;
  border: 1px solid #30363d;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}
button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}`,
        },
        {
          relativePath: "script.js",
          content: `document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('output').innerText = '¡Interactividad web funcionando!';
});`,
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
