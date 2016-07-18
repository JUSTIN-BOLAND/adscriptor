# Configure require js
window.requireJS = require.config
  urlArgs: '_CACHE_'
  context: 'JS'
  baseUrl: './build/scripts'
  map:
    '*':
      marionette: 'backbone.marionette'
      'jquery-ui/accordion': 'jquery-ui'
      'jquery-ui/autocomplete': 'jquery-ui'
      'jquery-ui/button': 'jquery-ui'
      'jquery-ui/core': 'jquery-ui'
      'jquery-ui/datepicker': 'jquery-ui'
      'jquery-ui/dialog': 'jquery-ui'
      'jquery-ui/draggable': 'jquery-ui'
      'jquery-ui/droppable': 'jquery-ui'
      'jquery-ui/effect': 'jquery-ui'
      'jquery-ui/effect-blind': 'jquery-ui'
      'jquery-ui/effect-bounce': 'jquery-ui'
      'jquery-ui/effect-clip': 'jquery-ui'
      'jquery-ui/effect-drop': 'jquery-ui'
      'jquery-ui/effect-explode': 'jquery-ui'
      'jquery-ui/effect-fade': 'jquery-ui'
      'jquery-ui/effect-fold': 'jquery-ui'
      'jquery-ui/effect-highlight': 'jquery-ui'
      'jquery-ui/effect-puff': 'jquery-ui'
      'jquery-ui/effect-pulsate': 'jquery-ui'
      'jquery-ui/effect-scale': 'jquery-ui'
      'jquery-ui/effect-shake': 'jquery-ui'
      'jquery-ui/effect-size': 'jquery-ui'
      'jquery-ui/effect-slide': 'jquery-ui'
      'jquery-ui/effect-transfer': 'jquery-ui'
      'jquery-ui/menu': 'jquery-ui'
      'jquery-ui/mouse': 'jquery-ui'
      'jquery-ui/position': 'jquery-ui'
      'jquery-ui/progressbar': 'jquery-ui'
      'jquery-ui/resizable': 'jquery-ui'
      'jquery-ui/selectable': 'jquery-ui'
      'jquery-ui/selectmenu': 'jquery-ui'
      'jquery-ui/slider': 'jquery-ui'
      'jquery-ui/sortable': 'jquery-ui'
      'jquery-ui/spinner': 'jquery-ui'
      'jquery-ui/tabs': 'jquery-ui'
      'jquery-ui/tooltip': 'jquery-ui'
      'jquery-ui/widget': 'jquery-ui'
  locale: 'en'
  shim:
    jquery:
      exports: '$'
    'jquery-ui':
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
    'backbone.babysitter':
      deps: ['backbone']
    'backbone.localstorage':
      deps: ['backbone']
    'backbone.deepmodel':
      deps: ['backbone']
    bootstrap:
      deps: ['jquery']
    gridster:
      deps: ['jquery']
    'perfect-scrollbar':
      deps: ['jquery']

  paths:
    jquery: '../../bower_components/jquery/dist/jquery'
    'jquery-ui': '../../bower_components/jquery-ui/jquery-ui'
    underscore: '../../bower_components/underscore/underscore'
    backbone: '../../bower_components/backbone/backbone'
    'backbone.validation': '../../bower_components/backbone.validation/dist/backbone-validation-amd'
    'backbone.babysitter': '../../bower_components/backbone.babysitter/lib/backbone.babysitter'
    'backbone.radio': '../../bower_components/backbone.radio/build/backbone.radio'
    'backbone.wreqr': '../../bower_components/backbone.wreqr/lib/backbone.wreqr'
    'backbone.marionette': '../../bower_components/backbone.marionette/lib/backbone.marionette'
    'backbone.localstorage': '../../bower_components/backbone.localStorage/backbone.localStorage'
    'backbone.deepmodel': '../../bower_components/backbone-deep-model/distribution/deep-model'
    jade: '../../bower_components/jade/runtime'
    gridster: '../../bower_components/gridster/dist/jquery.gridster'
    bootstrap: '../../bower_components/bootstrap/dist/js/bootstrap'
    'perfect-scrollbar': '../../bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery'

# load our app
requireJS [
  'jquery'
  'app'
  'logger'
  'bootstrap'
], (jQuery, App, Logger) ->
  # Start our Application when the DOM is ready
  $ ->
    Logger.log('Initializing, please wait...')
    App.start()
