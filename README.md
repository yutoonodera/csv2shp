# csv2shp

CSV の **lat/lon** から **Point の Shapefile（.zip）** を作る Node.js CLI / TypeScript ライブラリ。

- ✅ QGIS の前処理なしで Shapefile を作れる
- ✅ `*.shp/*.shx/*.dbf/*.prj` を zip にまとめて出力
- ✅ DBF の **フィールド名10文字制限**を自動で回避（対応表 `fields.json` も出力）

---

## Demo

```bash
# 1) sample csv
cat << 'CSV' > input.csv
lat,lon,name
35.68,139.76,Tokyo
CSV

# 2) generate shapefile zip
npx csv2shp input.csv --lat lat --lon lon -o out.zip

# 3) result
ls -lah out.zip
```

## install

```bash
npm i -g csv2shp
# or
npx csv2shp --help
```

## Usage

```bash
csv2shp input.csv --lat lat --lon lon -o out.zip
# options:
#   --lon <field>   longitude field name
#   --lat <field>   latitude field name
#   --layer <name>  layer name (default: layer)
#   --strict false  skip invalid rows instead of error
```

## Output
```bash
out.zip contains:

*.shp

*.shx

*.dbf

*.prj

*.cpg (UTF-8)
```

## Use as a library (TypeScript)

```bash
import { csv2shp } from "csv2shp";

await csv2shp({
  inputCsvPath: "input.csv",
  latField: "lat",
  lonField: "lon",
  outZipPath: "out.zip",
  outFieldsMapPath: "fields.json"
});
```
## License

MIT License
