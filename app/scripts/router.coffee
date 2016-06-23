define [
  'marionette'
  './configuration'
  './editor/editor_grid'
], (
  Marionette
  Configuration
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
      unless Configuration.isConfigured()
        @navigate('configuration', trigger: true)
      else
        @navigate('editor', trigger: true)

    configuration: ->
      if not Configuration.isConfigured()
        #@app.layout.content.show new Marionette.ItemView()
      else
        @index()

    editor: ->
      if Configuration.isConfigured()
        @app.layout.layout.show new EditorGrid()
      else
        @index()
