define [
], (
) ->
  class GithubClient
    construct: (options) ->
      @options = options

    checkAuthorization: (options = null) ->
      options = @options unless options?
      $.ajax
        url: options.url
        cache: false
        dataType: 'json'
        jsonp: false
        headers:
          Authorization: "token #{options.token}"
      .done (data, textStatus, jqXHR) =>
        @options.endpointMap = data unless @options.endpointMap?