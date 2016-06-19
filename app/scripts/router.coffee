define [
  'marionette'
  './editor/editor'
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
      console.log 'routing'
      @app.layout.layout.show new EditorGrid
        collection: new Backbone.Collection([
          name: 'foo'
        ,
          name: 'bar'
        ])



























