import { test, expect } from "@playwright/test";

test.describe("DevPilot AI - IDE Principal", () => {
  test("debe cargar la barra superior, barra lateral, editor y asistente de IA", async ({ page }) => {
    await page.goto("/ide");

    // Verificar TopBar con el logo
    await expect(page.locator("text=DevPilot AI").first()).toBeVisible();

    // Verificar panel de IA Assistant
    await expect(page.locator("text=DevPilot Assistant").first()).toBeVisible();

    // Verificar selector de modos de IA (Chat, Plan, Edit, Agent)
    await expect(page.locator('button:has-text("Chat")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Plan")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Edit")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Agent")').first()).toBeVisible();

    // Verificar pestañas del panel inferior (Terminal, Problemas, Pruebas)
    await expect(page.locator('button:has-text("Terminal")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Problemas")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Pruebas")').first()).toBeVisible();
  });
});
