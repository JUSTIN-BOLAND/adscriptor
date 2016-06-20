define [
  'backbone'
  'backbone.localstorage'
  '../models/widget'
], (
  Backbone
  localStorage
  Widget
) ->
  class Widgets extends Backbone.Collection
    model: Widget
    localStorage: new Backbone.LocalStorage('WidgetCache')