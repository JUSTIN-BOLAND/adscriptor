define [
  './github/client'
], (
  GithubClient
) ->
  class EndpointFactory
    @create: (options) ->
      switch options.endpoint
        when 'github' then new GithubClient(options)
        else throw new Error("Unknown Endpoint type \"#{options.endpoint}\"")