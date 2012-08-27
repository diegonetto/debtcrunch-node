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
		// collection when debts are added or changed.
		initialize: function() {

			// TODO: Use only the appropriate events to limit calls (optimize)
			window.app.Debts.on( 'all', this.render, this );

			this.$avaLifeInterest = this.$('#avalanche-lifetime');
			this.$avaDayInterest = this.$('#avalanche-daily'); 
		},

		// Re-rendering the Strategize view means deciding which steps of
		// the strategize wizard to show and updating the calculations.
		render: function( eventName ) {
			console.log( 'StrategizeView render() called with "' + eventName + '"' );
			this.$avaLifeInterest.html('TEST');
			this.$avaDayInterest.html('TEST');
		}
	});
});
	
