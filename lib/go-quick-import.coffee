GoQuickImportView = require './go-quick-import-view'
{CompositeDisposable} = require 'atom'

module.exports = GoQuickImport =
  goQuickImportView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @goQuickImportView = new GoQuickImportView()

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-text-editor', 'go-quick-import:trigger': => @trigger()
    @subscriptions.add atom.commands.add 'atom-workspace', 'go-quick-import:refresh': => @goQuickImportView.refresh()

  deactivate: ->
    @subscriptions.dispose()
    @goQuickImportView.destroy()

  trigger: ->
    @goQuickImportView.show()
