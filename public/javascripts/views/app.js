var app = app || {};

$(function( $ ) {
	'use strict';

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	app.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#debtapp',
	
		// Delegated events
		events: {
		},

		// At initialization we bind to the relevant events in the 'Debts"
		// collection when debts are added or changed.
		initialize: function() {
			// TODO: Bind to the appropriate events (once Debts are added / changed
			// call render to update clocks

			// Create the views for the tabs
			new app.OrganizeView();
			//new app.StrategizeView();

		},

		// Re-rendering the App means refreshing the clocks at the top of the page
		render: function() {
			// TODO: Update the clocks via template
		},


	});
});
