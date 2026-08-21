import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { getRpgSave } from "../server/db.ts";

const port = 9333;
const profile = `/tmp/rpg-forge-ui-${Date.now()}`;
const nickname = `forjaqa${Date.now().toString().slice(-8)}`;
const password = "forja-segura-2026";
const browser = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "http://localhost:3000/"], { stdio: "ignore" });
browser.unref();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (fn, label, timeout = 12_000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const value = await fn(); if (value) return value; } catch { /* tenta novamente enquanto o navegador inicia */ }
    await wait(160);
  }
  throw new Error(`Tempo esgotado: ${label}`);
};

try {
  const target = await until(async () => (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((entry) => entry.type === "page"), "sessão do navegador");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => { const payload = JSON.parse(event.data); if (payload.id) { const handler = pending.get(payload.id); pending.delete(payload.id); handler?.(payload); } });
  const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, (payload) => payload.error ? reject(new Error(payload.error.message)) : resolve(payload.result)); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  const clickText = (text) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((entry) => entry.textContent.includes(${JSON.stringify(text)})); if (!button) return false; button.click(); return true; })()`);
  const fill = (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); if (!input) return false; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  const hasText = (text) => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);

  await until(() => hasText("Inscreva seu nome no Arquivo"), "portal de cadastro");
  assert.equal(await fill('input[autocomplete="username"]', nickname), true);
  assert.equal(await fill('input[type="password"]', password), true);
  assert.equal(await clickText("Selar acesso e forjar ficha"), true);
  await until(() => hasText("Quem responde ao chamado?"), "primeiro selo da forja");
  assert.equal(await clickText("Aetheri"), true);
  assert.equal(await fill('input[placeholder="Ex.: Arin Valcrest"]', "Lysa Forjada"), true);
  assert.equal(await clickText("Selar escolha"), true);
  await until(() => hasText("Como você quebra a escuridão?"), "senda de combate");
  assert.equal(await clickText("Selar escolha"), true);
  await until(() => hasText("Qual luz você carrega?"), "selo de relíquia");
  assert.equal(await clickText("Selo da Raiz Ancestral"), true);
  assert.equal(await clickText("Selar escolha"), true);
  await until(() => hasText("A crônica está pronta."), "juramento final");
  assert.equal(await clickText("Iniciar expedição"), true);
  await until(() => hasText("EXPEDIÇÃO ATIVA"), "início da campanha");
  await wait(2_200);
  const sessionToken = await evaluate(`localStorage.getItem('rpg-scplt-session')`);
  assert.ok(sessionToken, "A conta criada pela interface não gerou sessão.");
  const loaded = await getRpgSave(sessionToken);
  const state = JSON.parse(loaded.character?.stateJson ?? "{}");
  assert.equal(state.draft.raceId, "aetheri");
  assert.equal(state.draft.relicId, "thornsigil");
  assert.equal(state.equipped.relic, "thornsigil");
  assert.equal(state.inventory.find((item) => item.id === "thornsigil")?.quantity, 1);
  console.log("Forja pela interface validada: conta, raça, classe, relíquia equipada e primeiro salvamento restaurados.");
  socket.close();
  browser.kill("SIGTERM");
  process.exit(0);
} finally {
  browser.kill("SIGTERM");
}
