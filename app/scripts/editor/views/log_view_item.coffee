define [
  'backbone.marionette'
  './templates/log_view_item'
], (
  Marionette
  template
) ->
  class LogViewItem extends Marionette.ItemView
    template: template
    className: 'item'

    serializeData: ->
      data = @model.toJSON()
      data.severity = 'info' if data.severity == 'log'
      d = data.timestamp
      date = "#{d.getFullYear()}/#{('0' + (d.getMonth() + 1)).slice(-2)}/#{('0' + d.getDate()).slice(-2)}"
      time = "#{('0' + d.getHours()).slice(-2)}:#{('0' + d.getMinutes()).slice(-2)}:#{('0' + d.getSeconds()).slice(-2)}.#{('00' + d.getMilliseconds()).slice(-3)}"
      data.timestamp = "#{date} #{time}"
      data