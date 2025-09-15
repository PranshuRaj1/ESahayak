import { boolean } from "drizzle-orm/pg-core";
import {
  pgTable,
  text,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  
} from "drizzle-orm/pg-core";

// --- AUTH SCHEMA (Unchanged) ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// --- ENUMS (Unchanged) ---
export const cityEnum = pgEnum("city_enum", [
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);
export const propertyTypeEnum = pgEnum("property_type_enum", [
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);
export const bhkEnum = pgEnum("bhk_enum", ["1", "2", "3", "4", "Studio"]);
export const purposeEnum = pgEnum("purpose_enum", ["Buy", "Rent"]);
export const timelineEnum = pgEnum("timeline_enum", ["0-3m", "3-6m", ">6m", "Exploring"]);
export const sourceEnum = pgEnum("source_enum", ["Website", "Referral", "Walk-in", "Call", "Other"]);
export const statusEnum = pgEnum("status_enum", [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

// ---------------------------------
// --- BUYERS TABLE (CORRECTED) ---
// ---------------------------------
export const buyers = pgTable("buyers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("fullName", { length: 80 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: cityEnum("city").notNull(),
  propertyType: propertyTypeEnum("propertyType").notNull(),
  bhk: bhkEnum("bhk"),
  purpose: purposeEnum("purpose").notNull(),
  budgetMin: integer("budgetMin"),
  budgetMax: integer("budgetMax"),
  timeline: timelineEnum("timeline").notNull(),
  source: sourceEnum("source").notNull(),
  status: statusEnum("status").notNull().default("New"),
  notes: text("notes"),
  tags: text("tags").array(),
  
  // --- THIS IS THE FIX ---
  // Changed from uuid() to text() and added references() to match the user.id
  ownerId: text("ownerId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Links to the user table
    
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------
// --- BUYER HISTORY TABLE (CORRECTED) ---
// ----------------------------------------
export const buyerHistory = pgTable("buyer_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyerId")
    .notNull()
    .references(() => buyers.id, { onDelete: "cascade" }),
    
  // --- THIS IS THE FIX ---
  // Changed from uuid() to text() and added references()
  changedBy: text("changedBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Links to the user table

  changedAt: timestamp("changedAt", { withTimezone: true }).defaultNow().notNull(),
  diff: jsonb("diff").notNull(),
});


export const schema = {
  user,
  session,
  account,
  verification,
  buyers,
  buyerHistory,
};