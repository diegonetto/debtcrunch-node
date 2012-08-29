var app = app || {};

(function() {
	'use strict';

	// Debt App Router
	// ----------

	var Workspace = Backbone.Router.extend({
		routes:{
			'*app': 'setView'
		},

		setView: function( view ) {
			switch ( view.trim() || '' ) {
				case 'strategize':
					console.log('Render strategize view');
					break;
				default:
					console.log('Render organize view');
					break;
			}

			// Trigger something to cause the view to update
		}
	});

	app.DebtRouter = new Workspace();
	Backbone.history.start();

}());
