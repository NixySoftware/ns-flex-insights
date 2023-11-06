declare module 'convert-csv-to-json' {
    class CsvToJson {
        fieldDelimiter(delimiter: string): CsvToJson;
        supportQuotedField(active: boolean): CsvToJson;
        csvStringToJson(csvString: string): Record<string, string>[];
    }

    const singleton: CsvToJson;
    export default singleton;
}
