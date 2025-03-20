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

console.log('Using table:', config.tableName); // Debug log

export async function registerRoutes(app: Express) {
  app.get("/api/airtable", async (req, res) => {
    try {
      const email = z.string().email().parse(req.query.email);
      console.log('Searching for email:', email); // Debug log

      const filterFormula = `'${email}'={Email}`;
      console.log('Using filter formula:', filterFormula); // Debug log

      const url = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}?filterByFormula=${encodeURIComponent(filterFormula)}`;
      console.log('Request URL:', url); // Debug log

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Raw Airtable response:', JSON.stringify(result, null, 2)); // Debug log

      const transformedRecords = result.records.map((record: any) => ({
        email: record.fields.Email,
        data: record.fields,
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