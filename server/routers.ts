import { z } from "zod";
import { getRpgSave, loginRpgAccount, registerRpgAccount, saveRpgCharacter } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";

const credentials = z.object({
  nickname: z.string().trim().min(3, "Use ao menos 3 caracteres.").max(32, "Use até 32 caracteres.").regex(/^[A-Za-z0-9_-]+$/, "Use letras, números, _ ou - no nick."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.").max(72, "A senha é muito longa."),
});

const saveInput = z.object({
  sessionToken: z.string().min(20),
  characterName: z.string().trim().min(2).max(32),
  classId: z.string().max(32),
  originId: z.string().max(32),
  appearanceId: z.string().max(32),
  stateJson: z.string().min(2).max(250_000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  rpg: router({
    register: publicProcedure.input(credentials).mutation(({ input }) => registerRpgAccount(input.nickname, input.password)),
    login: publicProcedure.input(credentials).mutation(({ input }) => loginRpgAccount(input.nickname, input.password)),
    load: publicProcedure.input(z.object({ sessionToken: z.string().min(20) })).query(({ input }) => getRpgSave(input.sessionToken)),
    save: publicProcedure.input(saveInput).mutation(({ input }) => saveRpgCharacter(input)),
  }),
});

export type AppRouter = typeof appRouter;
