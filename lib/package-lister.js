"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("babel-polyfill");

var _child_process = require("child_process");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; } /*@flow*/

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

var pkgDirs = (function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() /*: Promise<Array<string>>*/ {
    var env;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return run("go env");

          case 2:
            _context.t0 = _context.sent;
            env = parseEnv(_context.t0);
            return _context.abrupt("return", [_path2.default.resolve(env.GOROOT, "pkg", env.GOOS + "_" + env.GOARCH), _path2.default.resolve(env.GOPATH, "pkg", env.GOOS + "_" + env.GOARCH)]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function pkgDirs() {
    return ref.apply(this, arguments);
  };
})();

exports.default = (function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() /*: Promise<Array<string>>*/ {
    var pkgs, dirs, wait /*: Array<Promise<Array<string>>>*/, i;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pkgs = [];
            _context2.next = 3;
            return pkgDirs();

          case 3:
            dirs = _context2.sent;
            wait = dirs.map(function (dir) {
              return new Promise(function (resolve, reject) {
                (0, _glob2.default)(_path2.default.join(dir, "**/*.a"), function (err, paths /*: Array<string>*/) {
                  if (err) return reject(err);
                  resolve(paths.map(function (p) {
                    return _path2.default.relative(dir, p.replace(/\.a$/, ""));
                  }));
                });
              });
            });
            i = 0;

          case 6:
            if (!(i < wait.length)) {
              _context2.next = 15;
              break;
            }

            _context2.t0 = pkgs;
            _context2.next = 10;
            return wait[i];

          case 10:
            _context2.t1 = _context2.sent;
            pkgs = _context2.t0.concat.call(_context2.t0, _context2.t1);

          case 12:
            i++;
            _context2.next = 6;
            break;

          case 15:
            return _context2.abrupt("return", pkgs);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function listPkgs() {
    return ref.apply(this, arguments);
  };
})();

module.exports = exports['default'];
//# sourceMappingURL=package-lister.js.map