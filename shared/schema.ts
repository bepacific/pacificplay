import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema to represent Airtable data
export const airtableRecords = pgTable("airtable_records", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  data: jsonb("data").notNull()
});

export const recordSchema = z.object({
  email: z.string().email(),
  data: z.record(z.unknown())
});

export type AirtableRecord = typeof airtableRecords.$inferSelect;
export type AirtableData = z.infer<typeof recordSchema>;
