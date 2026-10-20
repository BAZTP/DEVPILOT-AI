import { describe, it, expect } from "vitest";
import * as path from "path";
import { resolveSafePath, validateFileExtension, SecurityError } from "../security";

describe("Workspace Security (Path Traversal & Sandboxing)", () => {
  const mockBasePath = path.resolve("C:/fake/devpilot/workspace/proj-1");

  it("debe resolver rutas relativas válidas dentro del workspace", () => {
    const resolved = resolveSafePath(mockBasePath, "src/components/Button.tsx");
    expect(resolved).toBe(path.join(mockBasePath, "src/components/Button.tsx"));
  });

  it("debe bloquear intentos de Path Traversal con ../ hacia directorios superiores", () => {
    expect(() => {
      resolveSafePath(mockBasePath, "../../Windows/System32/cmd.exe");
    }).toThrow(SecurityError);

    expect(() => {
      resolveSafePath(mockBasePath, "../../../etc/passwd");
    }).toThrow(/escapa del workspace/);
  });

  it("debe bloquear inyecciones con null byte", () => {
    expect(() => {
      resolveSafePath(mockBasePath, "src/app.ts\0.exe");
    }).toThrow(/null byte/);
  });

  it("debe rechazar extensiones binarias peligrosas (.exe, .dll, .bin)", () => {
    expect(() => validateFileExtension("malicious.exe")).toThrow(SecurityError);
    expect(() => validateFileExtension("library.dll")).toThrow(SecurityError);
    expect(() => validateFileExtension("archive.zip")).toThrow(SecurityError);
  });

  it("debe permitir extensiones de código fuente estándar (.ts, .tsx, .json, .py, .md)", () => {
    expect(() => validateFileExtension("index.ts")).not.toThrow();
    expect(() => validateFileExtension("App.tsx")).not.toThrow();
    expect(() => validateFileExtension("package.json")).not.toThrow();
    expect(() => validateFileExtension("main.py")).not.toThrow();
    expect(() => validateFileExtension("README.md")).not.toThrow();
  });
});
