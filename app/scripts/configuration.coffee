define [
  'backbone'
  'backbone.localstorage'
  'backbone.deepmodel'
], (
  Backbone
  localStorage
  deepModel
) ->
  class Configuration extends Backbone.DeepModel
    localStorage: new Backbone.LocalStorage('configuration')

    isConfigured: ->
      @get('dataSource')?

  c = new Configuration(id: 'only')
  c.fetch()
  c.save(dataSource: true) unless c.get('dataSource') #TODO: remove this
  return c