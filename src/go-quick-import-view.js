/*@flow*/
import { SelectListView } from "atom-space-pen-views";
import PackageLister from "./package-lister";
import { AddImport, RemoveImport, ListImports } from "../modimport/modimport";
import { partition, indexBy } from "lodash";

export default class GoQuickImportView extends SelectListView {
  constructor() {
    super()
    this.addClass("overlay from-top")
    this.modalPanel = atom.workspace.addModalPanel({item:this, visible: false});
    this.visible = false;
    this.packageLister = new PackageLister();
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
    var newText: string;
    if (item.Remove) {
      newText = RemoveImport(oldText, item.Path);
    } else {
      newText = AddImport(oldText, item.Path, "");
    }
    var pos = editor.getCursorBufferPosition();
    var lineChange = newText.split("\n").length - oldText.split("\n").length;
    pos.row += lineChange;
    var editorEl = atom.views.getView(editor);
    var line = editorEl.getFirstVisibleScreenRow() + editor.displayBuffer.getVerticalScrollMargin()+lineChange;
    editor.setText(newText);
    editor.setCursorBufferPosition(pos);
    editor.scrollToBufferPosition(pos);
    this.hide();
    editorEl.focus();
  }
}
