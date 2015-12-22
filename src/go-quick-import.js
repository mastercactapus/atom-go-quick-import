/*@flow*/
import GoQuickImportView from "./go-quick-import-view";
import {CompositeDisposable} from "atom";



export default {
  config: {
    importNames: {
      title: "Import Names",
      description: "Override import name for packages (comma-separated)",
      type: "array",
      default: ["log github.com/sirupsen/logrus"],
      items: { type: "string" }
    }
  },
  goQuickImportView: null,
  subscriptions: null,
  activate() {
    this.goQuickImportView = new GoQuickImportView();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add("atom-text-editor[data-grammar='source go']", {"go-quick-import:trigger": ()=>this.trigger()}));
  },
  deactivate() {
    this.subscriptions.dispose();
    this.goQuickImportView.destroy();
  },
  trigger() {
    this.goQuickImportView.show();
  }
}
