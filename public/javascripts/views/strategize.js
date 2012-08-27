var app = app || {};

$(function() {
	'use strict';

	// Strategize Tab View
	// ---------------

	// The StrategizeView is the UI piece for the Strategize tab in the App.
	app.StrategizeView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton
		// of the Strategize tab already present in the HTML.
		el: '#strategize',

		// TODO: Delegated events
		events: {

		},

		// At initialization we bind to the relevant events in the 'Debts'
		// collection when debts are added or changed. Start things off by
		// loading any pre-existing debts that might have been saved in *LocalStorage*.
		initialize: function() {
	
		},

		// Re-rendering the Strategize view means deciding which steps of
		// the strategize wizard to show and updating the calculations.
		render: function( eventName ) {
	
		}
	});
});
	
