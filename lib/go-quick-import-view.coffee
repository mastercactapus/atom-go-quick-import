{SelectListView} = require 'atom-space-pen-views'
PackageLister = require './package-lister'
{AddImport, RemoveImport, ListImports} = require './modimport/modimport'
_ = require 'lodash'

module.exports =
class GoQuickImportView extends SelectListView
  initialize: ->
    super
    @addClass('overlay from-top')
    @modalPanel = atom.workspace.addModalPanel(item: this, visible: false)
    @visible = false
    @packageLister = new PackageLister()
    @refresh()
  destroy: ->
    @packageLister.kill()
    @modalPanel.destroy()
    super

  refresh: ->
    @setLoading("Reading available packages...")
    @packages = []
    @packageLister.refresh().then (packages) =>
      @setLoading("")
      @packages = packages
      @updateItems()
  updateItems: ->
    return if !@visible
    imports = ListImports(atom.workspace.getActiveTextEditor().getText())
    imports = _.indexBy(imports, "Path")
    parts = _.partition @packages, (pkg) =>
      imports[pkg.Path]
    items = parts[0].map (pkg) =>
      {
        Remove: true,
        Label: "delete: " + pkg.Name + " ( " + pkg.Path + " )",
        Path: pkg.Path
      }
    items = items.concat parts[1].map (pkg) =>
      {
        Label: pkg.Name + " ( " + pkg.Path + " )",
        Path: pkg.Path,
      }
    @setItems items
    @focusFilterEditor()
  show: ->
    @visible = true
    @updateItems()
    @modalPanel.show()
    @focusFilterEditor()
  hide: ->
    @visible = false
    @modalPanel.hide()
  getFilterKey: ->
    "Label"
  viewForItem: (item) ->
    "<li>#{item.Label}</li>"
  confirmed: (item) ->
    editor = atom.workspace.getActiveTextEditor()
    oldText = editor.getText()
    if item.Remove
      newText = RemoveImport(oldText, item.Path)
    else
      newText = AddImport(oldText, item.Path, "")
    pos = editor.getCursorBufferPosition()
    lineChange = newText.split("\n").length - oldText.split("\n").length
    pos.row += lineChange
    editorEl = atom.views.getView(editor)
    line = editorEl.getFirstVisibleScreenRow() + editor.displayBuffer.getVerticalScrollMargin()+lineChange
    editor.setText(newText)
    editor.setCursorBufferPosition(pos)
    editor.scrollToBufferPosition(pos)
    # if editor.getScreenLineCount() > line
      # editor.scrollToScreenPosition([line, 0])
    @hide()
    editorEl.focus()
  cancelled: ->
    @hide()
    atom.views.getView(atom.workspace.getActiveTextEditor()).focus()
