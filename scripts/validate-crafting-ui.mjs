import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { getRpgSave, saveRpgCharacter } from "../server/db.ts";

const port = 9334;
const profile = `/tmp/rpg-crafting-ui-${Date.now()}`;
const nickname = `craftqa${Date.now().toString().slice(-8)}`;
const password = "craft-segura-2026";
const browser = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "http://localhost:3000/"], { stdio: "ignore" });
browser.unref();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (fn, label, timeout = 12_000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) { try { const value = await fn(); if (value) return value; } catch { /* navegador inicia */ } await wait(160); }
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
  await command("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  const clickText = (text) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((entry) => entry.textContent.includes(${JSON.stringify(text)})); if (!button || button.disabled) return false; button.click(); return true; })()`);
  const fill = (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); if (!input) return false; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  const hasText = (text) => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);

  await until(() => hasText("Inscreva seu nome no Arquivo"), "portal de cadastro");
  assert.equal(await fill('input[autocomplete="username"]', nickname), true);
  assert.equal(await fill('input[type="password"]', password), true);
  await clickText("Selar acesso e forjar ficha");
  await until(() => hasText("Quem responde ao chamado?"), "forja inicial");
  await fill('input[placeholder="Ex.: Arin Valcrest"]', "Tarin da Forja");
  await clickText("Selar escolha"); await until(() => hasText("Como você quebra a escuridão?"), "classe");
  await clickText("Selar escolha"); await until(() => hasText("Qual luz você carrega?"), "reliquia");
  await clickText("Selar escolha"); await until(() => hasText("A crônica está pronta."), "juramento");
  await clickText("Iniciar expedição"); await until(() => hasText("A ameaça avança"), "campanha");
  await wait(2_100);

  const sessionToken = await evaluate(`localStorage.getItem('rpg-scplt-session')`);
  const initial = await getRpgSave(sessionToken);
  const state = JSON.parse(initial.character?.stateJson ?? "{}");
  state.inventory = state.inventory.map((item) => item.id === "ironore" ? { ...item, quantity: 2 } : item.id === "wildfiber" ? { ...item, quantity: 1 } : item);
  await saveRpgCharacter({ sessionToken, characterId: initial.character?.id, characterName: initial.character?.characterName ?? "Tarin da Forja", classId: initial.character?.classId ?? "guardian", originId: initial.character?.originId ?? "vigil", appearanceId: initial.character?.appearanceId ?? "copper", stateJson: JSON.stringify(state) });
  await command("Page.navigate", { url: "http://localhost:3000/?craft=1" });
  await until(() => hasText("Crie o que a ruína não entrega"), "oficina aberta");
  await until(() => hasText("2/2"), "materiais restaurados na oficina");
  assert.equal(await clickText("Forjar equipamento"), true);
  await until(() => hasText("Faca da Vigília"), "resultado da criação");
  await evaluate(`document.querySelector('[aria-label="Fechar oficina"]')?.click()`);
  await until(() => hasText("Inventário"), "inventário");
  assert.equal(await clickText("Faca da Vigília"), true);
  assert.equal(await clickText("Equipar"), true);
  await wait(2_100);
  await command("Page.navigate", { url: "http://localhost:3000/" });
  await until(() => hasText("A ameaça avança"), "campanha recarregada");
  await until(() => hasText("Faca da Vigília"), "item forjado restaurado no inventário");
  assert.equal(await clickText("Faca da Vigília"), true);
  await until(() => hasText("Guardar"), "vínculo equipado restaurado na interface");
  const restored = JSON.parse((await getRpgSave(sessionToken)).character?.stateJson ?? "{}");
  assert.equal(restored.inventory.find((item) => item.id === "ironwatch")?.quantity, 1);
  assert.equal(restored.equipped.weapon, "ironwatch");
  console.log("Crafting pela interface móvel validado: materiais, criação, inventário, equipamento e restauração visual após recarregar a ficha.");
  socket.close(); browser.kill("SIGTERM"); process.exit(0);
} finally { browser.kill("SIGTERM"); }
