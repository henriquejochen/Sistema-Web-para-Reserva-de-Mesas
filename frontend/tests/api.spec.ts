import { test, expect, type Page } from "@playwright/test";
const token = "a".repeat(64);
const reservation = {
  token,
  code: "R-TESTE",
  date: "2099-12-20",
  arrivalTime: "20:00",
  guests: 2,
  area: "any",
  note: "",
  name: "Cliente API",
  phone: "48999990000",
  status: "Confirmada",
  tables: [3],
  allowedActions: ["cancel"],
};
async function setup(page: Page, available = true) {
  await page.route("**/api/configuration/", (r) =>
    r.fulfill({
      json: {
        minArrival: "19:30",
        maxArrival: "21:30",
        maxGuests: 12,
        graceMinutes: 30,
        warningMinutes: 15,
        contactPhone: "+554830000000",
      },
    }),
  );
  await page.route("**/api/staff/session/", (r) =>
    r.fulfill({ json: { authenticated: false, csrfToken: "csrf-test" } }),
  );
  await page.route("**/api/availability/?**", (r) =>
    r.fulfill({
      json: {
        available,
        message: available
          ? "Mesa disponível"
          : "Sem disponibilidade para este dia",
        alternatives: available ? [] : ["Tente outra data"],
      },
    }),
  );
  await page.route("**/api/reservations/access/", (r) =>
    r.fulfill({ json: reservation }),
  );
}
async function form(page: Page) {
  await page.goto("/reservar");
  await page.getByLabel("Dia da reserva").fill("2099-12-20");
  await page.getByLabel("Previsão de chegada", { exact: true }).fill("20:00");
  await page.getByRole("button", { name: "Continuar para seus dados" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Cliente API");
  await page.getByLabel("Telefone com DDD").fill("48999990000");
}
test("conflito e erro de campo mantêm dados e confirmação só ocorre após sucesso", async ({
  page,
}) => {
  await setup(page);
  let attempts = 0;
  const keys: string[] = [];
  await page.route("**/api/reservations/", async (r) => {
    attempts++;
    keys.push(r.request().headers()["idempotency-key"]);
    expect(r.request().headers()["x-csrftoken"]).toBe("csrf-test");
    if (attempts === 1)
      return r.fulfill({
        status: 409,
        json: { detail: "A última mesa foi reservada. Consulte novamente." },
      });
    if (attempts === 2)
      return r.fulfill({
        status: 400,
        json: {
          detail: "Confira o telefone",
          fields: { phone: ["Telefone inválido"] },
        },
      });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return r.fulfill({ status: 201, json: reservation });
  });
  await form(page);
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("A última mesa");
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(
    "Cliente API",
  );
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(
    page.getByText("Telefone inválido", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Telefone com DDD")).toBeFocused();
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirmando…" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: "Reserva confirmada!" }),
  ).toBeVisible();
  await expect(page.getByText("Mesa(s)", { exact: true })).toBeVisible();
  expect(keys).toHaveLength(3);
  expect(new Set(keys).size).toBe(1);
  await expect(page.getByText(/Demonstração local/)).toHaveCount(0);
});
test("indisponibilidade impede avançar e apresenta alternativas", async ({
  page,
}) => {
  await setup(page, false);
  await page.goto("/reservar");
  await expect(
    page.getByText("Sem disponibilidade para este dia", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Tente outra data", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar para seus dados" }),
  ).toBeDisabled();
});
test("falha de conexão ao criar preserva os campos e não simula sucesso", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/reservations/", (r) => r.abort("failed"));
  await form(page);
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível conectar",
  );
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(
    "Cliente API",
  );
  await expect(
    page.getByRole("heading", { name: "Reserva confirmada!" }),
  ).toHaveCount(0);
});
test("sessão expirada em tela administrativa exige novo login", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/staff/session/", (r) =>
    r.fulfill({ json: { authenticated: true } }),
  );
  await page.route("**/api/staff/tables/", (r) =>
    r.fulfill({ status: 401, json: { detail: "Sessão expirada" } }),
  );
  await page.goto("/equipe/mesas");
  await expect(
    page.getByRole("heading", { name: "Acesso da equipe" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Sua sessão expirou");
});
test("resposta de criação incompatível não mostra confirmação", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/reservations/", (r) =>
    r.fulfill({ status: 201, json: { ok: true } }),
  );
  await form(page);
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("dados incompatíveis");
  await expect(
    page.getByRole("heading", { name: "Reserva confirmada!" }),
  ).toHaveCount(0);
});
test("cancelamento rejeitado não altera status e ações seguem a API", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/reservations/cancel/", (r) =>
    r.fulfill({ status: 403, json: { detail: "Cancelamento não autorizado" } }),
  );
  await page.goto("/reserva#reserva=" + token);
  await page
    .getByRole("button", { name: "Cancelar reserva", exact: true })
    .click();
  await page.getByRole("button", { name: "Sim, cancelar reserva" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Cancelamento não autorizado",
  );
  await expect(page.getByText("Confirmada", { exact: true })).toBeVisible();
  await page.route("**/api/reservations/access/", (r) =>
    r.fulfill({ json: { ...reservation, allowedActions: [] } }),
  );
  await page.reload();
  await expect(page.getByText("Cliente API", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cancelar reserva", exact: true }),
  ).toHaveCount(0);
});
