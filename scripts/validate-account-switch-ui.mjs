import { spawn } from "node:child_process";

const port = 9444;
const profile = `/tmp/rpg-switch-ui-${Date.now()}`;
const firstNickname = `trocaum${Date.now().toString().slice(-8)}`;
const secondNickname = `trocadois${Date.now().toString().slice(-8)}`;
const password = "troca-segura-2026";
const browser = spawn("/usr/bin/chromium", ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "http://localhost:3000/"], { stdio: "ignore" });
browser.unref();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (fn, label, timeout = 15_000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { const value = await fn(); if (value) return value; } catch { /* aguarda a página estabilizar */ }
    await wait(180);
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
  const register = async (nickname) => {
    await until(() => hasText("Inscreva seu nome no Arquivo"), "portal de acesso");
    if (await hasText("Retornar")) await clickText("Abrir crônica");
    await until(() => fill('input[autocomplete="username"]', nickname), "campo de nick");
    await fill('input[type="password"]', password);
    await clickText("Selar acesso e forjar ficha");
    await until(() => hasText("Quem responde ao chamado?"), "forja da nova conta");
  };

  await register(firstNickname);
  await clickText("Aetheri");
  await fill('input[placeholder="Ex.: Arin Valcrest"]', "Primeira Crônica");
  await clickText("Selar escolha");
  await until(() => hasText("Como você quebra a escuridão?"), "senda da primeira ficha");
  await clickText("Selar escolha");
  await until(() => hasText("Qual luz você carrega?"), "relíquia da primeira ficha");
  await clickText("Selar escolha");
  await until(() => hasText("A crônica está pronta."), "juramento da primeira ficha");
  await clickText("Iniciar expedição");
  await until(() => hasText("EXPEDIÇÃO ATIVA"), "campanha da primeira conta");
  await clickText("SAIR DA CONTA");
  await until(() => hasText("Inscreva seu nome no Arquivo"), "retorno ao portal após sair");
  if (await evaluate(`localStorage.getItem('rpg-scplt-session')`)) throw new Error("A sessão anterior permaneceu no armazenamento local.");
  await register(secondNickname);
  const visible = await evaluate(`document.body.innerText.includes(${JSON.stringify(firstNickname)})`);
  if (visible) throw new Error("Dados da primeira conta permaneceram no portal da segunda conta.");
  console.log("Troca de conta validada pela interface: sessão removida, portal restaurado e nova conta iniciou uma forja limpa.");
  socket.close();
  browser.kill("SIGTERM");
  process.exit(0);
} finally {
  browser.kill("SIGTERM");
}
