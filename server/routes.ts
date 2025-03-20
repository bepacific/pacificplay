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

console.log('Using table:', config.tableName); // Debug log

const airtable = getAirtableClient(config.apiKey);
const base = airtable.base(config.baseId);

export async function registerRoutes(app: Express) {
  app.get("/api/airtable", async (req, res) => {
    try {
      const email = z.string().email().parse(req.query.email);
      console.log('Searching for email:', email); // Debug log

      const filterFormula = `'${email}'={Email}`;
      console.log('Using filter formula:', filterFormula); // Debug log

      const records = await base(config.tableName)
        .select({
          filterByFormula: filterFormula,
        })
        .firstPage();

      console.log('Raw records from Airtable:', JSON.stringify(records, null, 2)); // Debug log

      const transformedRecords = records.map(record => ({
        email: record.get('Email') as string,
        data: record.fields, // Include all fields dynamically
      }));

      console.log('Transformed records:', JSON.stringify(transformedRecords, null, 2)); // Debug log

      const validatedRecords = z.array(recordSchema).parse(transformedRecords);
      res.json(validatedRecords);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors); // Debug log
        res.status(400).json({ error: "Invalid email format" });
      } else {
        console.error('Airtable error:', error);
        res.status(500).json({ error: "Failed to fetch Airtable data" });
      }
    }
  });

  return createServer(app);
}