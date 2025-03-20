import { z } from "zod";
import Airtable from "airtable";

export const airtableConfigSchema = z.object({
  apiKey: z.string(),
  baseId: z.string(),
  tableName: z.string(),
});

export type AirtableConfig = z.infer<typeof airtableConfigSchema>;

export function getAirtableClient(apiKey: string) {
  return new Airtable({ apiKey });
}

export async function fetchAirtableData(email: string) {
  const result = await fetch(`/api/airtable?email=${encodeURIComponent(email)}`, {
    credentials: "include",
  });

  if (!result.ok) {
    throw new Error("Failed to fetch Airtable data");
  }

  return result.json();
}