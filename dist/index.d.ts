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
    skipped: Array<{
        rowNumber: number;
        reason: string;
    }>;
    fieldMap: Record<string, string>;
};
export declare function csv2shp(opts: Csv2ShpOptions): Promise<Csv2ShpResult>;
