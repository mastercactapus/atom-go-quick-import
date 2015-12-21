"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atomSpacePenViews = require("atom-space-pen-views");

var _packageLister = require("./package-lister");

var _packageLister2 = _interopRequireDefault(_packageLister);

var _modimport = require("./modimport");

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*@flow*/

function pathAliases() /*: Object*/ {
  var vals /*: Array<string>*/ = atom.config.get("go-quick-import.importNames");
  var paths = {};
  vals.forEach(function (val) {
    var parts = val.split(" ");
    if (parts.length !== 2) return;
    paths[parts[1]] = parts[0];
  });
  return paths;
}

var GoQuickImportView = (function (_SelectListView) {
  _inherits(GoQuickImportView, _SelectListView);

  function GoQuickImportView() {
    _classCallCheck(this, GoQuickImportView);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GoQuickImportView).call(this));

    _this.addClass("overlay from-top");
    _this.modalPanel = atom.workspace.addModalPanel({ item: _this, visible: false });
    _this.visible = false;
    _this.packageLister = new _packageLister2.default();
    _this.setMaxItems(100);
    _this.refresh();
    return _this;
  }

  _createClass(GoQuickImportView, [{
    key: "destroy",
    value: function destroy() {
      this.packageLister.kill();
      this.modalPanel.destroy();
      _get(Object.getPrototypeOf(GoQuickImportView.prototype), "destroy", this).call(this);
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this2 = this;

      this.setLoading("Reading available packages...");
      this.packages = [];
      this.packageLister.refresh().then(function (pkgs) {
        _this2.setLoading("");
        _this2.packages = pkgs;
        _this2.updateItems();
      });
    }
  }, {
    key: "updateItems",
    value: function updateItems() {
      if (!this.visible) return;
      var imports = (0, _modimport.ListImports)(atom.workspace.getActiveTextEditor().getText());
      imports = (0, _lodash.indexBy)(imports, "Path");
      var parts = (0, _lodash.partition)(this.packages, function (pkg) {
        return imports[pkg.Path];
      });
      var items = parts[0].map(function (pkg) {
        return { Remove: true, Path: pkg.Path, Label: "delete: " + pkg.Name + " ( " + pkg.Path + " )" };
      });
      items = items.concat(parts[1].map(function (pkg) {
        return { Path: pkg.Path, Label: pkg.Name + " ( " + pkg.Path + " )" };
      }));
      this.setItems(items);
      this.focusFilterEditor();
    }
  }, {
    key: "show",
    value: function show() {
      this.visible = true;
      this.updateItems();
      this.modalPanel.show();
      this.focusFilterEditor();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.modalPanel.hide();
    }
  }, {
    key: "getFilterKey",
    value: function getFilterKey() {
      return "Label";
    }
  }, {
    key: "viewForItem",
    value: function viewForItem(item /*: Object*/) {
      return "<li>" + item.Label + "</li>";
    }
  }, {
    key: "cancelled",
    value: function cancelled() {
      this.hide();
      atom.views.getView(atom.workspace.getActiveTextEditor()).focus();
    }
  }, {
    key: "confirmed",
    value: function confirmed(item /*: Object*/) {
      var editor = atom.workspace.getActiveTextEditor();
      var oldText /*: string*/ = editor.getText();
      var oldHeader /*: string*/ = (0, _modimport.Header)(editor.getText())[0];
      var newHeader /*: string*/;
      if (item.Remove) {
        newHeader = (0, _modimport.RemoveImport)(oldHeader, item.Path);
      } else {
        newHeader = (0, _modimport.AddImport)(oldHeader, item.Path, pathAliases()[item.Path] || "");
      }
      var oldLines = oldHeader.split("\n").length;
      editor.setTextInBufferRange([[0, 0], [oldLines - 1, 0]], newHeader);
      var editorEl = atom.views.getView(editor);
      this.hide();
      editorEl.focus();
    }
  }]);

  return GoQuickImportView;
})(_atomSpacePenViews.SelectListView);

exports.default = GoQuickImportView;
module.exports = exports['default'];
//# sourceMappingURL=go-quick-import-view.js.map