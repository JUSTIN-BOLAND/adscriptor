define [
  'backbone'
  'backbone.marionette'
  './router'
  './views/layout'
], (
  Backbone
  Marionette
  AppRouter
  AppLayout
) ->
  class App extends Marionette.Application
    start: ->
      # Render our main layout
      @layout = new AppLayout(app: this)
      @layout.render()
      # create our router
      @router = new AppRouter(app: this)
      # start navigating by hash
      Backbone.history.start()
      super
  # Make a singleton out of the App
  new App()