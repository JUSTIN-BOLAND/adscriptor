define [
  'backbone'
  'backbone.localstorage'
], (
  Backbone
  localStorage
) ->
  class Configuration extends Backbone.Model
    localStorage: new Backbone.LocalStorage('configuration')

    isConfigured: ->
      @get('dataSource')?

  c = new Configuration(id: 'only')
  c.save(dataSource: true) #TODO: remove this
  c.fetch()
  return c