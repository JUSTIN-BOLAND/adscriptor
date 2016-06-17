# Configure require js
window.requireJS = require.config
  urlArgs: '_CACHE_'
  context: 'JS'
  baseUrl: './build/scripts'
  map:
    '*':
      marionette: 'backbone.marionette'
  locale: 'en'
  shim:
    jquery:
      exports: '$'
    jqueryui:
      deps: ['jquery']
    underscore:
      exports: '_'
    backbone:
      deps: ['underscore', 'jquery']
      exports: 'Backbone'
    'backbone.validation':
      deps: ['backbone']
    'backbone.radio':
      deps: ['backbone']
      exports: 'Radio'
    'backbone.marionette':
      deps: ['backbone']
    bootstrap:
      deps: ['jquery']

  paths:
    jquery: '../../bower_components/jquery/dist/jquery'
    jqueryui: '../../bower_components/jquery-ui/jquery-ui'
    underscore: '../../bower_components/underscore/underscore'
    backbone: '../../bower_components/backbone/backbone'
    'backbone.validation': '../../bower_components/backbone.validation/dist/backbone-validation-amd'
    'backbone.babysitter': '../../bower_components/backbone.babysitter/lib/backbone.babysitter'
    'backbone.radio': '../../bower_components/backbone.radio/build/backbone.radio'
    'backbone.wreqr': '../../bower_components/backbone.wreqr/lib/backbone.wreqr'
    'backbone.marionette': '../../bower_components/backbone.marionette/lib/backbone.marionette'
    jade: '../../bower_components/jade/runtime'

# load our app
requireJS ['jquery', 'app'], (jQuery, App) ->
  # Start our Application when the DOM is ready
  $ -> App.start()