import { spawn } from "node:child_process";

const port = 9555;
const profile = `/tmp/rpg-missions-ui-${Date.now()}`;
const browser = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "http://localhost:3000/?campaign=missions"], { stdio: "ignore" });
browser.unref();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (fn, label, timeout = 12_000) => { const started = Date.now(); while (Date.now() - started < timeout) { try { const value = await fn(); if (value) return value; } catch { /* aguarda a interface */ } await wait(160); } throw new Error(`Tempo esgotado: ${label}`); };

try {
  const target = await until(async () => (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((entry) => entry.type === "page"), "sessão do navegador");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => { const payload = JSON.parse(event.data); if (payload.id) { const handler = pending.get(payload.id); pending.delete(payload.id); handler?.(payload); } });
  const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, (payload) => payload.error ? reject(new Error(payload.error.message)) : resolve(payload.result)); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => (await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  const hasText = (text) => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
  const clickText = (text) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((entry) => entry.textContent.includes(${JSON.stringify(text)}) && !entry.disabled); if (!button) return false; button.click(); return true; })()`);
  const countCards = () => evaluate(`document.querySelectorAll('.campaign-mission-card').length`);

  const cards = await until(async () => { const count = await countCards(); return count >= 6 ? count : 0; }, "mural com várias missões");
  if (!await clickText("Aceitar jornada")) throw new Error("O primeiro aviso não ofereceu aceitar jornada.");
  await until(() => hasText("CENA DE MISSÃO"), "cena da missão");
  if (!await clickText("Proteger a rota")) throw new Error("A cena não ofereceu uma decisão de campo.");
  await until(() => hasText("Catacumbas do Sino"), "entrada real na dungeon da missão");
  console.log(`Mural de missões validado: ${cards} avisos disponíveis e a jornada abriu a dungeon de campo.`);
  socket.close();
  browser.kill("SIGTERM");
  process.exit(0);
} finally {
  browser.kill("SIGTERM");
}
