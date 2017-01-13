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
    ...(atom.config.get("go-quick-import.GOPATH")||env.GOPATH).split(path.delimiter).map(p=>
      path.resolve(p, "pkg", env.GOOS + "_" + env.GOARCH)
    ),
  ]
}

async function aGlob(p: string): Array<string> {
  return new Promise((resolve, reject)=>glob(p, (err,res)=>err&&reject(err)||resolve(res)));
}

function validPackage(p: string): boolean {
  if (p.includes(path.sep+"_") || p.startsWith("_")) return false;
  
  return !["vendor", "internal"].some(key=>
    p.includes(path.sep+key+path.sep) || p.startsWith(key+path.sep) || p.endsWith(p.sep+key)
  )
}

export default async function listPkgs(): Promise<Array<string>> {
  var pkgs = [];
  var dirs = await pkgDirs();
  var pkgs = (await Promise.all(
    dirs.map(d=>
      aGlob(path.join(d, "**/*.a")).then(paths=>paths.map(p=>path.relative(d, p.replace(/\.a$/, ""))))
    )
  )).reduce((acc,p)=>acc.concat(p), []);

  return pkgs.filter(validPackage);
}
