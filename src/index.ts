// src/index.ts
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { parseCsv } from "./csv.js";
import { buildFieldMap, mapPropsToDbfSafe } from "./fields.js";
import { epsg4326Wkt } from "./prj.js";

// @ts-ignore shp-write has no perfect types in some setups
import shpwrite from "shp-write";

export type Csv2ShpOptions = {
  inputCsvPath: string;
  latField: string;
  lonField: string;
  layerName?: string;
  outZipPath: string;
  outFieldsMapPath?: string;
  strict?: boolean;
};

export type Csv2ShpResult = {
  totalRows: number;
  features: number;
  skippedRows: number;
  skipped: Array<{ rowNumber: number; reason: string }>;
  fieldMap: Record<string, string>; // original -> dbfName
};

export async function csv2shp(opts: Csv2ShpOptions): Promise<Csv2ShpResult> {
  const {
    inputCsvPath,
    latField,
    lonField,
    layerName = "layer",
    outZipPath,
    outFieldsMapPath,
    strict = true,
  } = opts;

  const rows = await parseCsv(inputCsvPath);
  const totalRows = rows.length;

  // フィールド名短縮（lat/lonは属性から除外）
  const sample = rows[0] ?? {};
  const allKeys = Object.keys(sample).filter((k) => k !== latField && k !== lonField);
  const fieldMap = buildFieldMap(allKeys);

  const skipped: Array<{ rowNumber: number; reason: string }> = [];

  const features = rows.flatMap((row, idx) => {
    const rowNumber = idx + 2; // ヘッダー行を1行目とする想定
    const lat = Number(row[latField]);
    const lon = Number(row[lonField]);

    const invalid =
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180;

    if (invalid) {
      const reason = `Invalid lat/lon: lat=${row[latField]} lon=${row[lonField]}`;
      if (strict) throw new Error(`Row ${rowNumber}: ${reason}`);
      skipped.push({ rowNumber, reason });
      return [];
    }

    // 属性整形（DBF安全な名前＆値に寄せる）
    const propsRaw: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === latField || k === lonField) continue;
      propsRaw[k] = v;
    }
    const props = mapPropsToDbfSafe(propsRaw, fieldMap);

    return [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: props,
      } as const,
    ];
  });

  const geojson = {
    type: "FeatureCollection",
    features,
  } as const;

  // shp-writeで shapefile（ArrayBuffer）生成（zipに含める）
  // note: shpwrite.zip(...) returns ArrayBuffer of a zip
  const zipArrayBuffer: ArrayBuffer = shpwrite.zip(geojson, {
    folder: layerName,
    types: { point: layerName },
  });

  // 生成されたzipに .prj と .cpg を追加する（MVPはEPSG:4326固定）
  const zip = await JSZip.loadAsync(Buffer.from(zipArrayBuffer));
  const base = layerName;

  // shp-writeの出力構造に合わせて追加（folder配下）
  zip.file(`${base}.prj`, epsg4326Wkt);
  zip.file(`${base}.cpg`, "UTF-8");

  const outBuf = await zip.generateAsync({ type: "nodebuffer" });
  await fs.mkdir(path.dirname(outZipPath), { recursive: true });
  await fs.writeFile(outZipPath, outBuf);

  if (outFieldsMapPath) {
    await fs.mkdir(path.dirname(outFieldsMapPath), { recursive: true });
    await fs.writeFile(outFieldsMapPath, JSON.stringify(fieldMap, null, 2), "utf-8");
  }

  return {
    totalRows,
    features: features.length,
    skippedRows: skipped.length,
    skipped,
    fieldMap,
  };
}
