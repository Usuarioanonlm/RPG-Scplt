import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Identidade base provida pelo fluxo de autenticação da plataforma. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Conta própria do RPG: o nick é público, mas a senha nunca é armazenada em texto puro. */
export const rpgAccounts = mysqlTable("rpgAccounts", {
  id: int("id").autoincrement().primaryKey(),
  nickname: varchar("nickname", { length: 32 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  sessionToken: varchar("sessionToken", { length: 96 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Uma ficha ativa por conta, com o estado de campanha serializado para permitir evolução do jogo sem perder saves. */
export const rpgCharacters = mysqlTable("rpgCharacters", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().unique(),
  characterName: varchar("characterName", { length: 32 }).notNull(),
  classId: varchar("classId", { length: 32 }).notNull(),
  originId: varchar("originId", { length: 32 }).notNull(),
  appearanceId: varchar("appearanceId", { length: 32 }).notNull(),
  stateJson: text("stateJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RpgAccount = typeof rpgAccounts.$inferSelect;
export type RpgCharacter = typeof rpgCharacters.$inferSelect;
