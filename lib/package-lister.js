"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var pkgDirs = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() /*: Promise<Array<string>>*/ {
    var env;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.t0 = parseEnv;
            _context.next = 3;
            return run("go env");

          case 3:
            _context.t1 = _context.sent;
            env = (0, _context.t0)(_context.t1);
            return _context.abrupt("return", [_path2.default.resolve(atom.config.get("go-quick-import.GOROOT") || env.GOROOT, "pkg", env.GOOS + "_" + env.GOARCH)].concat(_toConsumableArray((atom.config.get("go-quick-import.GOPATH") || env.GOPATH).split(_path2.default.delimiter).map(function (p) {
              return _path2.default.resolve(p, "pkg", env.GOOS + "_" + env.GOARCH);
            }))));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function pkgDirs() {
    return _ref.apply(this, arguments);
  };
}();

var aGlob = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(p /*: string*/) /*: Array<string>*/ {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              return (0, _glob2.default)(p, function (err, res) {
                return err && reject(err) || resolve(res);
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function aGlob(_x) {
    return _ref2.apply(this, arguments);
  };
}();

require("babel-polyfill");

var _child_process = require("child_process");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*@flow*/


function run(command /*: string*/, options /*:: ?: Object*/) /*: Promise<string>*/ {
  return new Promise(function (resolve, reject) {
    (0, _child_process.exec)(command, options, function (err, sout, serr) {
      if (err) return reject(serr);
      resolve(sout.toString());
    });
  });
}

function parseEnv(data /*: string*/) /*: {[key:string]: string}*/ {
  var parts = data.trim().split("\n");
  var result = {};
  parts.forEach(function (part) {
    var keys = part.split("=");
    result[keys[0]] = JSON.parse(keys.slice(1).join("="));
  });
  return result;
}

function validPackage(p /*: string*/) /*: boolean*/ {
  if (p.includes(_path2.default.sep + "_") || p.startsWith("_")) return false;

  return !["vendor", "internal"].some(function (key) {
    return p.includes(_path2.default.sep + key + _path2.default.sep) || p.startsWith(key + _path2.default.sep) || p.endsWith(p.sep + key);
  });
}

exports.default = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() /*: Promise<Array<string>>*/ {
    var pkgs, dirs;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            pkgs = [];
            _context3.next = 3;
            return pkgDirs();

          case 3:
            dirs = _context3.sent;
            _context3.next = 6;
            return Promise.all(dirs.map(function (d) {
              return aGlob(_path2.default.join(d, "**/*.a")).then(function (paths) {
                return paths.map(function (p) {
                  return _path2.default.relative(d, p.replace(/\.a$/, ""));
                });
              });
            }));

          case 6:
            _context3.t0 = function (acc, p) {
              return acc.concat(p);
            };

            _context3.t1 = [];
            pkgs = _context3.sent.reduce(_context3.t0, _context3.t1);
            return _context3.abrupt("return", pkgs.filter(validPackage));

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  function listPkgs() {
    return _ref3.apply(this, arguments);
  }

  return listPkgs;
}();

module.exports = exports["default"];
//# sourceMappingURL=package-lister.js.map