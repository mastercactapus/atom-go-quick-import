"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

require("babel-polyfill");

var _atomSpacePenViews = require("atom-space-pen-views");

var _packageLister = require("./package-lister");

var _packageLister2 = _interopRequireDefault(_packageLister);

var _modimport = require("./modimport");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var GoQuickImportView = function (_SelectListView) {
  _inherits(GoQuickImportView, _SelectListView);

  function GoQuickImportView() {
    _classCallCheck(this, GoQuickImportView);

    var _this = _possibleConstructorReturn(this, (GoQuickImportView.__proto__ || Object.getPrototypeOf(GoQuickImportView)).call(this));

    _this.addClass("overlay from-top");
    _this.modalPanel = atom.workspace.addModalPanel({ item: _this, visible: false });
    _this.visible = false;
    _this.setMaxItems(100);
    return _this;
  }

  _createClass(GoQuickImportView, [{
    key: "destroy",
    value: function destroy() {
      this.packageLister.kill();
      this.modalPanel.destroy();
      _get(GoQuickImportView.prototype.__proto__ || Object.getPrototypeOf(GoQuickImportView.prototype), "destroy", this).call(this);
    }
  }, {
    key: "updateItems",
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() /*: Promise*/ {
        var doList, importList, imports, existing, available, items;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.visible) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                doList = (0, _packageLister2.default)();
                importList = (0, _modimport.ListImports)(atom.workspace.getActiveTextEditor().getText());
                imports = importList.reduce(function (res, item) {
                  res[item.Path] = item;return res;
                }, {});
                existing = [];
                available = [];
                _context.next = 9;
                return doList;

              case 9:
                _context.t0 = function (item) {
                  if (imports[item]) existing.push(item);else available.push(item);
                };

                _context.sent.forEach(_context.t0);

                items = existing.map(function (pkg) {
                  return { Remove: true, Path: pkg, Label: "delete: " + imports[pkg].Name + " ( " + pkg + " )" };
                });

                items = items.concat(available.map(function (pkg) {
                  return { Path: pkg, Label: "" + pkg };
                }));
                this.setItems(items);
                this.focusFilterEditor();

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function updateItems() {
        return _ref.apply(this, arguments);
      }

      return updateItems;
    }()
  }, {
    key: "show",
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() /*: Promise*/ {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.visible = true;
                _context2.next = 3;
                return this.updateItems();

              case 3:
                if (this.visible) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return");

              case 5:
                this.modalPanel.show();
                this.focusFilterEditor();

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function show() {
        return _ref2.apply(this, arguments);
      }

      return show;
    }()
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.modalPanel.hide();
    }
  }, {
    key: "getFilterKey",
    value: function getFilterKey() /*: string*/ {
      return "Label";
    }
  }, {
    key: "viewForItem",
    value: function viewForItem(item /*: Object*/) /*: string*/ {
      return item.Remove ? "<li class=\"go-quick-import remove\">" + item.Label + "</li>" : "<li class=\"go-quick-import\">" + item.Label + "</li>";
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
      var origSource /*: string*/ = editor.getText();
      var res;
      if (item.Remove) {
        res = (0, _modimport.RemoveImport)(origSource, item.Path);
      } else {
        res = (0, _modimport.AddImport)(origSource, item.Path, pathAliases()[item.Path] || "");
      }
      var newHeader = res[0];
      var headerLen = res[1];

      var oldHeader = origSource.slice(0, headerLen);
      var rows = oldHeader.split("\n").length - 1;

      editor.setTextInBufferRange([[0, 0], [rows, 0]], newHeader);
      var editorEl = atom.views.getView(editor);
      this.hide();
      editorEl.focus();
    }
  }]);

  return GoQuickImportView;
}(_atomSpacePenViews.SelectListView);

exports.default = GoQuickImportView;
module.exports = exports["default"];
//# sourceMappingURL=go-quick-import-view.js.map