// src/fields.ts
// DBFのフィールド名10文字制限を安全に回避する
export function buildFieldMap(keys) {
    const used = new Set();
    const map = {};
    for (const key of keys) {
        let base = key
            .toUpperCase()
            .replace(/[^A-Z0-9_]/g, "_")
            .replace(/^_+|_+$/g, "");
        if (!base)
            base = "FIELD";
        base = base.slice(0, 8); // 末尾に _1 など付ける余地を残す
        let candidate = base;
        let i = 1;
        while (used.has(candidate) || candidate.length === 0) {
            const suffix = String(i);
            const head = base.slice(0, Math.max(0, 10 - suffix.length - 1));
            candidate = `${head}_${suffix}`.slice(0, 10);
            i++;
        }
        used.add(candidate);
        map[key] = candidate;
    }
    return map;
}
// DBF向けに値を寄せる（MVP：数値/日付っぽい文字列はそのまま、長すぎる文字列は切る）
export function mapPropsToDbfSafe(props, fieldMap) {
    const out = {};
    for (const [k, v] of Object.entries(props)) {
        const name = fieldMap[k] ?? k.slice(0, 10);
        if (v == null || v === "") {
            out[name] = null;
            continue;
        }
        // 数値っぽいなら number に
        const n = Number(v);
        if (!Number.isNaN(n) && String(v).trim() !== "") {
            out[name] = n;
            continue;
        }
        // 日付っぽい（YYYY-MM-DD）ならそのまま（DBFがDate扱いできる実装もあるが、MVPは文字列）
        const s = String(v);
        out[name] = s.length > 254 ? s.slice(0, 254) : s; // DBFの文字列長を意識して切る
    }
    return out;
}
