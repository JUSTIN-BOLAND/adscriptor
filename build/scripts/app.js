(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['backbone', 'backbone.marionette', './router', './views/layout'], function(Backbone, Marionette, AppRouter, AppLayout) {
    var App;
    App = (function(superClass) {
      extend(App, superClass);

      function App() {
        return App.__super__.constructor.apply(this, arguments);
      }

      App.prototype.start = function() {
        this.layout = new AppLayout({
          app: this
        });
        this.layout.render();
        this.router = new AppRouter({
          app: this
        });
        Backbone.history.start();
        return App.__super__.start.apply(this, arguments);
      };

      return App;

    })(Marionette.Application);
    return new App();
  });

}).call(this);

//# sourceMappingURL=app.js.map
