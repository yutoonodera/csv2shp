#!/usr/bin/env node
import path from "node:path";
import { csv2shp } from "./index.js";

function getArg(flag: string) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const input = process.argv[2];
  if (!input || input.startsWith("-")) {
    console.error("Usage: csv2shp <input.csv> --lat <latField> --lon <lonField> -o <out.zip> [--layer <name>] [--strict false]");
    process.exit(1);
  }

  const lat = getArg("--lat") ?? "lat";
  const lon = getArg("--lon") ?? "lon";
  const out = getArg("-o") ?? getArg("--out") ?? "output.zip";
  const layer = getArg("--layer") ?? "layer";
  const strictRaw = getArg("--strict");
  const strict = strictRaw == null ? true : strictRaw !== "false";

  const result = await csv2shp({
    inputCsvPath: input,
    latField: lat,
    lonField: lon,
    layerName: layer,
    outZipPath: out,
    outFieldsMapPath: path.resolve(path.dirname(out), "fields.json"),
    strict,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
