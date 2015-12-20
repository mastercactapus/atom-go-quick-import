/*@flow*/
import { spawn } from "child_process";
import { ProcessImports } from "../modimport/modimport";


export default class PackageLister {
  constructor() {
    this.proc = null;
    this.list = null;
  }
  list: ?Promise;
  proc: ?Object;

  packages(): Promise<Array<Import>> {
    if (this.list) return this.list;
    this.list = new Promise((resolve,reject)=>{
      this.kill();
      var buffer = "";
      var proc = spawn("go", ["list", "-json", "-e", "..."], {stdio: ["ignore", "pipe", "ignore"]});
      this.proc = proc;
      proc.stdout.on("data", data=>buffer+=data);
      proc.on("close", code=>{
        this.proc = null;
        if (code !== 0) return reject(new Error("go list exited with non-zero exit code"));
        resolve(ProcessImports(buffer));
      });
    });
    return this.list;
  }

  refresh(): Promise<Array<Import>> {
    this.list = null;
    return this.packages();
  }

  kill() {
    if (!this.proc) return;
    this.proc.kill();
    this.proc = null;
  }
}
