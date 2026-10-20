import { test, expect } from "@playwright/test";

test.describe("DevPilot AI - Dashboard", () => {
  test("debe cargar la vista de proyectos y permitir buscar proyectos", async ({ page }) => {
    await page.goto("/dashboard");

    // Verificar título y bienvenida
    await expect(page.locator("text=DevPilot AI")).toBeVisible();
    await expect(page.locator("text=Mis Proyectos")).toBeVisible();

    // Verificar campo de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar proyectos"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("React");

    // Verificar botón de crear proyecto
    const createBtn = page.locator('button:has-text("Nuevo Proyecto")');
    await expect(createBtn).toBeVisible();
  });
});
