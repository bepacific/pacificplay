import type { Express } from "express";
import { createServer } from "http";

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
  throw new Error("Missing required Airtable environment variables");
}

const config = {
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME,
};

console.log('Using table:', config.tableName); // Debug log

export async function registerRoutes(app: Express) {
  app.get("/api/airtable", async (_req, res) => {
    try {
      const filterFormula = `'test1@test1.com'={Email}`;
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
      res.json(transformedRecords);
    } catch (error) {
      console.error('Airtable error:', error);
      res.status(500).json({ error: "Failed to fetch Airtable data" });
    }
  });

  return createServer(app);
}