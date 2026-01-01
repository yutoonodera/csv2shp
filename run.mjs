import { csv2shp } from "./dist/index.js";

const result = await csv2shp({
  inputCsvPath: "./sample.csv",
  latField: "lat",
  lonField: "lon",
  layerName: "points",
  outZipPath: "./out/points.zip",
  outFieldsMapPath: "./out/fields.json",
  strict: true,
});

console.log(result);
