import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { schema } from "@/db/schema";

export const auth = betterAuth({
    emailAndPassword: {
    enabled: true, 
  }, 
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    plugins: [nextCookies()] 
});