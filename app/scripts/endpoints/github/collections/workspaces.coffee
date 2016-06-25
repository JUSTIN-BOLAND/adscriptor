define [
  'backbone'
  'configuration'
  '../models/workspace'
], (
  Backbone
  Configuration
  GithubWorkspace
) ->
  class GithubWorkspaces extends Backbone.Collection
    model: GithubWorkspace
    url: -> Configuration.get('dataSource').url