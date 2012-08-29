var app = app || {};

(function() {
	'use strict';

	// Debt App Router
	// ----------

	var Workspace = Backbone.Router.extend({

		// Client side app routes.
		routes:{
			'*app': 'requestView'
		},

		// Updates the app's requestedView variable and fires
		// off 'route:requestView' event.
		requestView: function( view ) {
			var tab = '';
			app.requestedView = view.trim() || '';
		}

	});

	app.AppRouter = new Workspace();
	Backbone.history.start();

}());
