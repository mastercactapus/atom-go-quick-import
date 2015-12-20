
type Import = {
  Name: string;
  Path: string;
}
declare module "./modimport" {
  declare function ProcessImports(data: string): Array<Import>;
  declare function AddImport(source: string, path: string, name: string): string;
  declare function RemoveImport(source: string, path: string): string;
  declare function ListImports(source: string): Array<Import>;
}
