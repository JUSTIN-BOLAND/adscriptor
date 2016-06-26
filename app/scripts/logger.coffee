define [
  'backbone'
], (
  Backbone
) ->
  class Logger
    @_severities:
      trace: 0
      debug: 1
      log: 2
      warn: 3
      error: 4
    @_maxMessages: 100
    @_logCollection: new Backbone.Collection()
    @_logLevel: @_severities.trace

    @_stringify: (message) ->
      return message if typeof message == 'string'
      JSON.stringify(message, null, 1)

    @_insertMessage: (severity, message) ->
      @_logCollection.shift() if @_logCollection.length >= @_maxMessages
      if @_severities[severity] >= @_logLevel
        @_logCollection.push
          severity: severity
          message: @_stringify message
          timestamp: new Date()

    @getCollection: () -> @_logCollection

    @setLogLevel: (severity) -> @_logLevel = @_severities[severity]

    @trace: (messages...) ->
      window.console?.trace?.apply(window.console, arguments)
      @_insertMessage 'trace', message for message in messages

    @debug: (messages...) ->
      window.console?.debug?.apply(window.console, arguments)
      @_insertMessage 'debug', message for message in messages

    @log: (messages...) ->
      window.console?.log?.apply(window.console, arguments)
      @_insertMessage 'log', message for message in messages

    @warn: (messages...) ->
      window.console?.warn?.apply(window.console, arguments)
      @_insertMessage 'warn', message for message in messages

    @error: (messages...) ->
      window.console?.error?.apply(window.console, arguments)
      @_insertMessage 'error', message for message in messages

    @raiseError: (message) ->
      @error message
      throw new Error(message)