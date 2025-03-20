import { z } from "zod";

export const airtableConfigSchema = z.object({
  apiKey: z.string(),
  baseId: z.string(),
  tableName: z.string(),
});

export type AirtableConfig = z.infer<typeof airtableConfigSchema>;

export async function fetchAirtableData(email: string) {
  const result = await fetch(`/api/airtable?email=${encodeURIComponent(email)}`, {
    credentials: "include",
  });

  if (!result.ok) {
    throw new Error("Failed to fetch Airtable data");
  }

  return result.json();
}
