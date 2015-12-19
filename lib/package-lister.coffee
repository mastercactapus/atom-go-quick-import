{spawn} = require 'child_process'
{ProcessImports} = require './modimport/modimport'

module.exports = class PackageLister
  constructor: ->
    @running = false
    @proc = null
    @list = null

  packages: ->
    return @list if @list
    return @list = new Promise (resolve, reject) =>
      @kill()
      buffer = ""
      @proc = spawn("go", ["list", "-json", "-e", "..."], {stdio: ["ignore", "pipe", "ignore"]})
      @proc.stdout.on 'data', (data) =>
        buffer+=data
      @proc.on 'close', (code) =>
        @proc = null
        return reject(new Error("go list exited with non-zero exit code")) if (code != 0)
        resolve ProcessImports(buffer)

  refresh: ->
    @list = null
    @packages()

  kill: ->
    @proc.kill() if @proc
