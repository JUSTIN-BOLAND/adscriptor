define [
  'backbone.marionette'
  'logger'
  './log_view_item'
], (
  Marionette
  Logger
  LogViewItem
  template
) ->
  class LogView extends Marionette.CollectionView
    @defaultAttributes:
      # Default Widget Attributes for a MenuBar
      name: 'Log'
      height: 4
      width: 12
      minWidth: 8
      minHeight: 2
    childView: LogViewItem
    className: 'wrapper'

    collectionEvents:
      'add': 'onCollectionChange'

    initialize: (options) ->
      @collection = Logger.getCollection()
      super
      @delegateEvents()

    remove: ->
      @undelegateEvents()
      super

    _scrollDown: ->
      console.log 'scrollDown', @$el.prop('scrollHeight')
      @$el.parent().stop(true, false).animate scrollTop: (@$el.parent().prop('scrollHeight'))

     render: ->
      super
      @_scrollDown()

    onCollectionChange: ->
      @_scrollDown()