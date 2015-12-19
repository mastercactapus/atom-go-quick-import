/*@flow*/
import GoQuickImportView from "./go-quick-import-view";
import {CompositeDisposable} from "atom";

export default {
  goQuickImportView: null,
  subscriptions: null,
  activate() {
    this.goQuickImportView = new GoQuickImportView();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add("atom-text-editor", {"go-quick-import:trigger": ()=>this.trigger()}));
    this.subscriptions.add(atom.commands.add("atom-workspace", {"go-quick-import:refresh": ()=>this.goQuickImportView.refresh()}));
  },
  deactivate() {
    this.subscriptions.dispose();
    this.goQuickImportView.destroy();
  },
  trigger() {
    this.goQuickImportView.show();
  }
}
