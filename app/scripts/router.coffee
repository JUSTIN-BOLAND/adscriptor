define [
  'marionette'
  './editor/editor-grid'
], (
  Marionette
  EditorGrid
) ->
  class AppRouter extends Marionette.AppRouter
    routes:
      '': 'index'
      '/': 'index'
      'configuration': 'configuration'
      'editor': 'editor'

    initialize: (options) ->
      @app = options.app
      super

    index: ->
      Configuration =
        isConfigured: -> true
      unless Configuration.isConfigured()
        @navigate('configuration', trigger: true)
      else
        @navigate('editor', trigger: true)

    configuration: ->
      #@app.layout.content.show new Marionette.ItemView()

    editor: ->
      @app.layout.layout.show new EditorGrid()
