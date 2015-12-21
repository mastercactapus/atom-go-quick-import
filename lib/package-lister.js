"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /*@flow*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require("child_process");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PackageLister = (function () {
  function PackageLister() {
    _classCallCheck(this, PackageLister);

    this.proc = null;
    this.list = null;
  }

  _createClass(PackageLister, [{
    key: "packages",
    value: function packages() {
      var _this = this;

      if (this.list) return this.list;
      this.list = new Promise(function (resolve, reject) {
        _this.kill();
        var buffer = "";
        var proc = (0, _child_process.spawn)("go", ["list", "-f", '{"Path":"{{.ImportPath}}","Name":"{{.Name}}"}', "-e", "..."], { stdio: ["ignore", "pipe", "ignore"] });
        _this.proc = proc;
        proc.stdout.on("data", function (data) {
          return buffer += data;
        });
        proc.on("close", function (code) {
          _this.proc = null;
          if (code !== 0) return reject(new Error("go list exited with non-zero exit code"));
          resolve(buffer.trim().split("\n").map(function (str) {
            return JSON.parse(str);
          }));
        });
      });
      return this.list;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.list = null;
      return this.packages();
    }
  }, {
    key: "kill",
    value: function kill() {
      if (!this.proc) return;
      this.proc.kill();
      this.proc = null;
    }
  }]);

  return PackageLister;
})();

exports.default = PackageLister;
module.exports = exports['default'];
//# sourceMappingURL=package-lister.js.map