define [
  'backbone.marionette'
  './widget_factory'
], (
  Marionette
  WidgetFactory
) ->
  class LayoutManager extends Marionette.Object
    initialize: (options) ->
      @gridSize = options.gridSize
      @collection = options.collection
      @editor = options.editor

    applyLayout: (layoutName = 'default') ->
      switch layoutName
        when 'default' then @_defaultLayout()
        when 'other' then @_defaultLayout()
        else throw new Error("Can't apply Layout \"#{layoutName}\", unknown layout name.")

    _setLayout: (newLayout) ->
      @editor.destroyAllWidgets()
      _.invoke @collection.toArray(), 'destroy'
      @collection.create widget for widget in newLayout

    _defaultLayout: ->
      layout = []
      # Menubar
      menubar = WidgetFactory.getAttributesFor('menubar')
      _.extend menubar,
        x: 1
        y: 1
        width: @gridSize.cols
        height: 2
      layout.push menubar
      # Project Explorer
      projectExplorerWidth = Math.min 5, Math.floor(@gridSize.cols / 5)
      projectExplorer = WidgetFactory.getAttributesFor('menubar')
      _.extend projectExplorer,
        x: 1
        y: 3
        width: projectExplorerWidth
        height: @gridSize.rows - 2
      layout.push projectExplorer

      @_setLayout layout

