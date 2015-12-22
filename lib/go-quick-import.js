"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goQuickImportView = require("./go-quick-import-view");

var _goQuickImportView2 = _interopRequireDefault(_goQuickImportView);

var _atom = require("atom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*@flow*/
exports.default = {
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
  activate: function activate() {
    var _this = this;

    this.goQuickImportView = new _goQuickImportView2.default();
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add("atom-text-editor[data-grammar='source go']", { "go-quick-import:trigger": function goQuickImportTrigger() {
        return _this.trigger();
      } }));
  },
  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.goQuickImportView.destroy();
  },
  trigger: function trigger() {
    this.goQuickImportView.show();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=go-quick-import.js.map