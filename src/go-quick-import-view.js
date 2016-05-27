/*@flow*/
import "babel-polyfill";
import { SelectListView } from "atom-space-pen-views";
import listPackages from "./package-lister";
import { AddImport, RemoveImport, ListImports } from "./modimport";
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
    this.setMaxItems(100);
  }
  destroy() {
    this.packageLister.kill();
    this.modalPanel.destroy();
    super.destroy();
  }

  async updateItems(): Promise {
    if (!this.visible) return;
    var doList = listPackages();
    var imports = ListImports(atom.workspace.getActiveTextEditor().getText());
    imports = indexBy(imports, "Path");
    var parts = partition(await doList, pkg=>imports[pkg]);
    var items = parts[0].map(pkg=>({Remove: true, Path: pkg, Label: `delete: ${imports[pkg].Name} ( ${pkg} )`}));
    items = items.concat(parts[1].map(pkg=>({Path: pkg, Label: `${pkg}`})));
    this.setItems(items);
    this.focusFilterEditor();
  }
  async show(): Promise {
    this.visible = true;
    await this.updateItems();
    if (!this.visible) return;
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
    return item.Remove
      ? `<li class="go-quick-import remove">${item.Label}</li>`
      : `<li class="go-quick-import">${item.Label}</li>`;
  }
  cancelled() {
    this.hide();
    atom.views.getView(atom.workspace.getActiveTextEditor()).focus();
  }
  confirmed(item: Object) {
    var editor = atom.workspace.getActiveTextEditor();
    var origSource: string = editor.getText();
    var res;
    if (item.Remove) {
      res = RemoveImport(origSource, item.Path);
    } else {
      res = AddImport(origSource, item.Path, pathAliases()[item.Path] || "");
    }
    var newHeader = res[0];
    var headerLen = res[1];

    var oldHeader = origSource.slice(0, headerLen)
    var rows = oldHeader.split("\n").length-1;

    editor.setTextInBufferRange([[0,0], [rows, 0]], newHeader);
    var editorEl = atom.views.getView(editor);
    this.hide();
    editorEl.focus();
  }
}
