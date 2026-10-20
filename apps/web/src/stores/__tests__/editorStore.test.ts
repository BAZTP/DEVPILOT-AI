import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("EditorStore (Zustand)", () => {
  beforeEach(() => {
    const store = useEditorStore.getState();
    store.closeAllFiles();
    store.closeDiff();
  });

  it("debe abrir un archivo nuevo y marcarlo como activo", () => {
    const store = useEditorStore.getState();
    store.openFile({
      path: "src/app.ts",
      name: "app.ts",
      content: "console.log('hola');",
    });

    const state = useEditorStore.getState();
    expect(state.openFiles.length).toBe(1);
    expect(state.activeFilePath).toBe("src/app.ts");
    expect(state.openFiles[0]?.isDirty).toBe(false);
  });

  it("debe detectar cambios sin guardar (isDirty: true)", () => {
    const store = useEditorStore.getState();
    store.openFile({
      path: "src/calc.ts",
      name: "calc.ts",
      content: "export const add = (a: number, b: number) => a + b;",
    });

    store.updateFileContent("src/calc.ts", "export const add = (a: number, b: number) => a + b + 1;");

    const state = useEditorStore.getState();
    expect(state.openFiles[0]?.isDirty).toBe(true);
    expect(state.openFiles.some((f) => f.isDirty)).toBe(true);
  });

  it("debe limpiar el estado sucio al guardar el archivo", () => {
    const store = useEditorStore.getState();
    store.openFile({
      path: "src/calc.ts",
      name: "calc.ts",
      content: "const x = 1;",
    });

    store.updateFileContent("src/calc.ts", "const x = 2;");
    expect(useEditorStore.getState().openFiles[0]?.isDirty).toBe(true);

    store.saveFile("src/calc.ts");
    expect(useEditorStore.getState().openFiles[0]?.isDirty).toBe(false);
    expect(useEditorStore.getState().openFiles.some((f) => f.isDirty)).toBe(false);
  });

  it("debe activar el visor de comparación visual (Diff)", () => {
    const store = useEditorStore.getState();
    store.openDiff(
      "src/index.ts",
      "const oldVersion = 1;",
      "const newVersion = 2;",
      "Propuesta de IA: src/index.ts"
    );

    const state = useEditorStore.getState();
    expect(state.diffState).not.toBeNull();
    expect(state.diffState?.isOpen).toBe(true);
    expect(state.diffState?.filePath).toBe("src/index.ts");
    expect(state.diffState?.original).toBe("const oldVersion = 1;");
    expect(state.diffState?.modified).toBe("const newVersion = 2;");

    store.closeDiff();
    expect(useEditorStore.getState().diffState).toBeNull();
  });
});
