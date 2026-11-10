import { test, expect, type Page } from "@playwright/test";

const date = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
async function visit(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Reservar mesa", exact: true })
    .click();
  await page.getByLabel("Dia da reserva").fill(date());
  await page.getByLabel("Previsão de chegada", { exact: true }).fill("20:00");
  expect(
    await page
      .locator("form")
      .evaluate((form) =>
        [...(form as HTMLFormElement).elements]
          .filter((e) => e instanceof HTMLInputElement && !e.validity.valid)
          .map((e) => (e as HTMLInputElement).validationMessage),
      ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Continuar para seus dados" }).click();
  await expect(
    page.getByRole("heading", { name: "Confira e confirme" }),
  ).toBeVisible();
}
async function staff(page: Page) {
  await page.goto("/equipe");
  await page.getByLabel("Usuário", { exact: true }).fill("equipe");
  await page.getByLabel("Senha", { exact: true }).fill("napoli-demo");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Painel da equipe" }),
  ).toBeVisible();
}
test("reserva preserva dados entre etapas e navegação; link permite recarregar e cancelar", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await visit(page);
  await page.getByLabel("Nome", { exact: true }).fill("Cliente de Teste");
  await page.getByLabel("Telefone com DDD").fill("48999990000");
  await page.getByRole("button", { name: "Alterar visita" }).click();
  await page.getByRole("button", { name: "Continuar para seus dados" }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(
    "Cliente de Teste",
  );
  await page
    .getByRole("navigation", { name: "Menu principal no celular" })
    .getByRole("button", { name: "Início", exact: true })
    .click();
  await page.goBack();
  await expect(page).toHaveURL(/\/reservar$/);
  await page.getByRole("button", { name: "Continuar para seus dados" }).click();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(
    "Cliente de Teste",
  );
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Reserva confirmada!" }),
  ).toBeVisible();
  const link = await page.locator("#reservation-link").inputValue();
  await page.goto(link);
  await page.reload();
  await expect(
    page.getByText("Cliente de Teste", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancelar reserva", exact: true })
    .click();
  await page.getByRole("button", { name: "Manter reserva" }).click();
  await expect(page.getByText("Confirmada", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Cancelar reserva", exact: true })
    .click();
  await page.getByRole("button", { name: "Sim, cancelar reserva" }).click();
  await expect(page.getByText("Cancelada", { exact: true })).toBeVisible();
  await staff(page);
  await page.getByRole("button", { name: "Ver reservas e atrasos" }).click();
  await page.getByLabel("Dia das reservas").fill(date());
  await page.getByLabel("Status", { exact: true }).selectOption("Cancelada");
  await expect(
    page.getByText("Cliente de Teste", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Previsão de chegada", { exact: true }).fill("21:00");
  await expect(
    page.getByRole("heading", { name: "Nenhuma reserva encontrada" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("cadastro, edição e inativação de mesa persistem após recarregar; sessão também", async ({
  page,
}) => {
  await staff(page);
  await page
    .getByRole("button", { name: "Gerenciar mesas", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "+ Cadastrar mesa", exact: true })
    .click();
  await page.getByLabel("Identificação da mesa").fill("20");
  await page.getByLabel("Capacidade", { exact: true }).fill("6");
  await page.getByLabel("Área", { exact: true }).selectOption("externa");
  await page.getByRole("button", { name: "Salvar mesa" }).click();
  await expect(page.getByRole("button", { name: /Mesa 20/ })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Gerenciamento de mesas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Mesa 20/ }).click();
  const close = await page
    .getByRole("button", { name: "Fechar edição" })
    .boundingBox();
  expect(close!.width).toBeGreaterThanOrEqual(44);
  expect(close!.height).toBeGreaterThanOrEqual(44);
  await page.getByLabel("Mesa ativa para novas reservas").uncheck();
  await page.getByRole("button", { name: "Salvar mesa" }).click();
  await expect(page.getByRole("button", { name: /Mesa 20/ })).toHaveCount(0);
  await page.getByLabel("Mostrar mesas inativas").check();
  await expect(page.getByRole("button", { name: /Mesa 20/ })).toContainText(
    "Inativa",
  );
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.goto("/equipe/mesas");
  await expect(
    page.getByRole("heading", { name: "Acesso da equipe" }),
  ).toBeVisible();
});
test("layout de ambas as etapas cabe entre 320 e 1366 px e dados longos não estouram", async ({
  page,
}, info) => {
  await page.goto("/reservar");
  for (const width of [320, 360, 390, 430, 768, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.getByLabel("Dia da reserva").fill(date());
  await page.getByLabel("Previsão de chegada", { exact: true }).fill("20:00");
  await page.getByRole("button", { name: "Continuar para seus dados" }).click();
  await page
    .getByLabel("Nome", { exact: true })
    .fill(
      "Cliente com um nome bastante longo para verificar a apresentação no celular",
    );
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("heading", { name: "Confira e confirme" }).click();
  await page.screenshot({
    path: info.outputPath("reserva-mobile.png"),
    fullPage: true,
  });
});
