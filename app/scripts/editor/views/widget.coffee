define [
  'backbone.marionette'
  './templates/widget'
], (
  Marionette
  template
) ->
  class Widget extends Marionette.LayoutView
    template: template
    className: 'widget-wrapper'
    attributes: ->
      'data-sizex': @model.get('position-data')?.width || 1
      'data-sizey': @model.get('position-data')?.height || 1
      'data-row': @model.get('position-data')?.x || 1
      'data-col': @model.get('position-data')?.y || 1
    initialize: ->
      console.log 'widget init'
    remove: ->
      console.log 'widget destruct'
      super