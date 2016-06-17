define [
  'marionette'
], (
  Marionette
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
        isConfigured: -> false
      unless Configuration.isConfigured()
        @navigate('configuration', trigger: true)
      else
        @navigate('editor', trigger: true)

    configuration: ->
      #@app.layout.content.show new Marionette.ItemView()

    editor: ->
      #@app.layout.content.show new Marionette.ItemView()



























