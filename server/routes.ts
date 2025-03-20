import type { Express } from "express";
import { createServer } from "http";
import { z } from "zod";
import { recordSchema } from "@shared/schema";
import { airtableConfigSchema } from "../client/src/lib/airtable";

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
  throw new Error("Missing required Airtable environment variables");
}

const config = airtableConfigSchema.parse({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME,
});

export async function registerRoutes(app: Express) {
  app.get("/api/airtable", async (req, res) => {
    try {
      const email = z.string().email().parse(req.query.email);

      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${config.tableName}?filterByFormula={email}="${email}"`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from Airtable");
      }

      const result = await response.json();
      const records = result.records.map((record: any) => ({
        email: record.fields.email,
        data: record.fields,
      }));

      const validatedRecords = z.array(recordSchema).parse(records);
      res.json(validatedRecords);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid email format" });
      } else {
        res.status(500).json({ error: "Failed to fetch Airtable data" });
      }
    }
  });

  return createServer(app);
}
