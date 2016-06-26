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
      width: 6
      minWidth: 3
      minHeight: 3
    childView: LogViewItem
    className: 'wrapper'

    initialize: (options) ->
      @collection = Logger.getCollection()
      super