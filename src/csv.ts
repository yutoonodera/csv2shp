// src/csv.ts
import fs from "node:fs/promises";
import { parse } from "csv-parse/sync";

export async function parseCsv(filePath: string): Promise<Record<string, string>[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  return records;
}
