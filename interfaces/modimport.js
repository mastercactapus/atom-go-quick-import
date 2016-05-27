
type Import = {
  Name: string;
  Path: string;
}
declare module "./modimport" {
  declare function AddImport(source: string, path: string, name: string): [string, number];
  declare function RemoveImport(source: string, path: string): [string, number];
  declare function ListImports(source: string): Array<Import>;
}
