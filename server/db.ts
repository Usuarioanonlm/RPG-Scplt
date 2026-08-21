import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { InsertUser, rpgAccounts, rpgCharacters, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    try {
      database = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }
  return database;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { ...user, lastSignedIn: new Date() };
  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: { name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: new Date() },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

function normalizeNickname(nickname: string) {
  return nickname.trim().toLocaleLowerCase("pt-BR");
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function passwordMatches(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(digest, "hex"));
}

function newSessionToken() {
  return randomBytes(48).toString("base64url");
}

export async function registerRpgAccount(nickname: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const normalized = normalizeNickname(nickname);
  const exists = await db.select().from(rpgAccounts).where(eq(rpgAccounts.nickname, normalized)).limit(1);
  if (exists[0]) throw new Error("Este nick já está em uso.");
  const sessionToken = newSessionToken();
  await db.insert(rpgAccounts).values({ nickname: normalized, passwordHash: createPasswordHash(password), sessionToken, lastSignedIn: new Date() });
  const account = (await db.select().from(rpgAccounts).where(eq(rpgAccounts.sessionToken, sessionToken)).limit(1))[0];
  if (!account) throw new Error("Não foi possível criar a conta.");
  return { id: account.id, nickname: account.nickname, sessionToken };
}

export async function loginRpgAccount(nickname: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const normalized = normalizeNickname(nickname);
  const account = (await db.select().from(rpgAccounts).where(eq(rpgAccounts.nickname, normalized)).limit(1))[0];
  if (!account || !passwordMatches(password, account.passwordHash)) throw new Error("Nick ou senha incorretos.");
  const sessionToken = newSessionToken();
  await db.update(rpgAccounts).set({ sessionToken, lastSignedIn: new Date() }).where(eq(rpgAccounts.id, account.id));
  return { id: account.id, nickname: account.nickname, sessionToken };
}

export async function getRpgAccountByToken(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const account = (await db.select().from(rpgAccounts).where(eq(rpgAccounts.sessionToken, sessionToken)).limit(1))[0];
  if (!account) throw new Error("Sessão expirada. Entre novamente.");
  return account;
}

export async function getRpgSave(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const account = await getRpgAccountByToken(sessionToken);
  const characters = await db.select().from(rpgCharacters).where(eq(rpgCharacters.accountId, account.id)).orderBy(desc(rpgCharacters.updatedAt));
  const character = (account.activeCharacterId ? characters.find((entry) => entry.id === account.activeCharacterId) : undefined) ?? characters[0] ?? null;
  return { account: { nickname: account.nickname, activeCharacterId: character?.id ?? null }, character, characters: characters.map((entry) => ({ id: entry.id, characterName: entry.characterName, classId: entry.classId, originId: entry.originId, appearanceId: entry.appearanceId, updatedAt: entry.updatedAt })) };
}

export async function saveRpgCharacter(input: { sessionToken: string; characterId?: number; characterName: string; classId: string; originId: string; appearanceId: string; stateJson: string }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const account = await getRpgAccountByToken(input.sessionToken);
  let characterId = input.characterId;
  if (characterId) {
    const existing = (await db.select({ id: rpgCharacters.id }).from(rpgCharacters).where(and(eq(rpgCharacters.id, characterId), eq(rpgCharacters.accountId, account.id))).limit(1))[0];
    if (!existing) throw new Error("Ficha não encontrada para esta conta.");
    await db.update(rpgCharacters).set({
      characterName: input.characterName,
      classId: input.classId,
      originId: input.originId,
      appearanceId: input.appearanceId,
      stateJson: input.stateJson,
    }).where(and(eq(rpgCharacters.id, characterId), eq(rpgCharacters.accountId, account.id)));
  } else {
    await db.insert(rpgCharacters).values({ accountId: account.id, characterName: input.characterName, classId: input.classId, originId: input.originId, appearanceId: input.appearanceId, stateJson: input.stateJson });
    const created = (await db.select().from(rpgCharacters).where(eq(rpgCharacters.accountId, account.id)).orderBy(desc(rpgCharacters.id)).limit(1))[0];
    if (!created) throw new Error("Não foi possível criar a ficha.");
    characterId = created.id;
  }
  await db.update(rpgAccounts).set({ activeCharacterId: characterId }).where(eq(rpgAccounts.id, account.id));
  return { savedAt: Date.now(), characterId };
}

export async function selectRpgCharacter(sessionToken: string, characterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const account = await getRpgAccountByToken(sessionToken);
  const character = (await db.select().from(rpgCharacters).where(and(eq(rpgCharacters.id, characterId), eq(rpgCharacters.accountId, account.id))).limit(1))[0];
  if (!character) throw new Error("Ficha não encontrada.");
  await db.update(rpgAccounts).set({ activeCharacterId: character.id }).where(eq(rpgAccounts.id, account.id));
  return character;
}
