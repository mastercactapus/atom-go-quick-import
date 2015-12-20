/*@flow*/
import { SelectListView } from "atom-space-pen-views";
import PackageLister from "./package-lister";
import { AddImport, RemoveImport, ListImports, Header } from "./modimport";
import { partition, indexBy } from "lodash";

function pathAliases(): Object {
  var vals: Array<string> = atom.config.get("go-quick-import.importNames")
  var paths = {};
  vals.forEach(val=>{
    var parts = val.split(" ");
    if (parts.length !== 2) return;
    paths[parts[1]] = parts[0];
  });
  return paths;
}

export default class GoQuickImportView extends SelectListView {
  constructor() {
    super()
    this.addClass("overlay from-top")
    this.modalPanel = atom.workspace.addModalPanel({item:this, visible: false});
    this.visible = false;
    this.packageLister = new PackageLister();
    this.setMaxItems(100);
    this.refresh();
  }
  destroy() {
    this.packageLister.kill();
    this.modalPanel.destroy();
    super.destroy();
  }
  refresh() {
    this.setLoading("Reading available packages...");
    this.packages = [];
    this.packageLister.refresh().then(pkgs=>{
      this.setLoading("");
      this.packages = pkgs;
      this.updateItems();
    });
  }
  updateItems() {
    if (!this.visible) return;
    var imports = ListImports(atom.workspace.getActiveTextEditor().getText());
    imports = indexBy(imports, "Path");
    var parts = partition(this.packages, pkg=>imports[pkg.Path]);
    var items = parts[0].map(pkg=>({Remove: true, Path: pkg.Path, Label: `delete: ${pkg.Name} ( ${pkg.Path} )`}));
    items = items.concat(parts[1].map(pkg=>({Path: pkg.Path, Label: `${pkg.Name} ( ${pkg.Path} )`})));
    this.setItems(items);
    this.focusFilterEditor();
  }
  show() {
    this.visible = true;
    this.updateItems();
    this.modalPanel.show();
    this.focusFilterEditor();
  }
  hide() {
    this.visible = false;
    this.modalPanel.hide();
  }
  getFilterKey(): string {
    return "Label";
  }
  viewForItem(item: Object): string {
    return `<li>${item.Label}</li>`
  }
  cancelled() {
    this.hide();
    atom.views.getView(atom.workspace.getActiveTextEditor()).focus();
  }
  confirmed(item: Object) {
    var editor = atom.workspace.getActiveTextEditor();
    var oldText: string = editor.getText();
    var oldHeader: string = Header(editor.getText())[0];
    var newHeader: string;
    if (item.Remove) {
      newHeader = RemoveImport(oldHeader, item.Path);
    } else {
      newHeader = AddImport(oldHeader, item.Path, pathAliases()[item.Path] || "");
    }
    var oldLines = oldHeader.split("\n").length;
    editor.setTextInBufferRange([[0,0], [oldLines-1, 0]], newHeader);
    var editorEl = atom.views.getView(editor);
    this.hide();
    editorEl.focus();
  }
}
