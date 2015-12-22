/*@flow*/
import "babel-polyfill";
import { exec } from "child_process";
import path from "path";
import glob from "glob";

function run(command: string, options?: Object): Promise<string> {
  return new Promise((resolve,reject)=>{
    exec(command, options, (err,sout,serr)=>{
      if (err) return reject(serr);
      resolve(sout.toString());
    });
  });
}

function parseEnv(data: string): {[key:string]: string} {
  var parts = data.trim().split("\n");
  var result = {};
  parts.forEach(part=>{
    var keys = part.split("=");
    result[keys[0]] = JSON.parse(keys.slice(1).join("="));
  });
  return result;
}

async function pkgDirs(): Promise<Array<string>> {
  var env = parseEnv(await run("go env"));
  return [
    path.resolve(atom.config.get("go-quick-import.GOROOT")||env.GOROOT, "pkg", env.GOOS + "_" + env.GOARCH),
    path.resolve(atom.config.get("go-quick-import.GOPATH")||env.GOPATH, "pkg", env.GOOS + "_" + env.GOARCH),
  ]
}

export default async function listPkgs(): Promise<Array<string>> {
  var pkgs = [];
  var dirs = await pkgDirs();
  var wait: Array<Promise<Array<string>>> = dirs.map(dir=>{
    return new Promise((resolve,reject)=>{
      glob(path.join(dir, "**/*.a"), (err, paths: Array<string>)=>{
        if (err) return reject(err);
        resolve(paths.map(p=>{
          return path.relative(dir, p.replace(/\.a$/, ""));
        }));
      });
    })
  });
  for (var i=0;i<wait.length;i++){
    pkgs = pkgs.concat(await wait[i]);
  }
  return pkgs;
}
