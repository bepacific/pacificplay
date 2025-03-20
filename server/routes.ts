import type { Express } from "express";
import { createServer } from "http";
import { z } from "zod";
import { recordSchema } from "@shared/schema";
import { airtableConfigSchema, getAirtableClient } from "../client/src/lib/airtable";

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
  throw new Error("Missing required Airtable environment variables");
}

const config = airtableConfigSchema.parse({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME,
});

const airtable = getAirtableClient(config.apiKey);
const base = airtable.base(config.baseId);

export async function registerRoutes(app: Express) {
  app.get("/api/airtable", async (req, res) => {
    try {
      const email = z.string().email().parse(req.query.email);

      const records = await base(config.tableName)
        .select({
          filterByFormula: `{Email}="${email}"`,
        })
        .firstPage();

      console.log('Fetched records:', records); // Debug log

      const transformedRecords = records.map(record => ({
        email: record.get('Email') as string,
        data: {
          Name: record.get('Name'),
          Phone: record.get('Phone'),
          Email: record.get('Email'),
          LinkedIn: record.get('LinkedIn')
        },
      }));

      const validatedRecords = z.array(recordSchema).parse(transformedRecords);
      res.json(validatedRecords);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid email format" });
      } else {
        console.error('Airtable error:', error);
        res.status(500).json({ error: "Failed to fetch Airtable data" });
      }
    }
  });

  return createServer(app);
}