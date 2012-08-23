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

			window.app.Debts.on( 'all', this.render, this );

			this.$stepOne = this.$('#step-one');
			this.$stepTwo = this.$('#step-two');
			this.$clockWrapper = this.$('#interest-clocks-wrapper');

			// Set the padding for the wizard hero units so they will be correct during animation
			var heroUnit = this.$('.hero-unit');
			heroUnit.css('padding-top', '10px');
			heroUnit.css('padding-bottom', '10px');

			// Create the views for the tabs
			new app.OrganizeView();
			//new app.StrategizeView();
		},

		// Re-rendering the App means managing the guide at the top of the page
		// and refreshing the interest clocks.
		render: function( eventName ) {
			// TODO: Update the clocks via template

			// Be specific about which events to show / hide the wizard since we are using
			// animations and do not want them to repeat unnecessarily 
			if ( eventName == 'reset' || eventName == 'add' || eventName == 'destroy') {
				switch ( app.Debts.length ) {
					case 0:
						this.$stepTwo.hide();
						this.$stepOne.show('blind', 1000);
						this.$clockWrapper.hide();
						break;
					case 1:
						this.$stepOne.hide();
						this.$stepTwo.show('blind', 1000);
						this.$clockWrapper.hide();
						break;
					case 2:
						this.$stepTwo.hide();
						this.$clockWrapper.show('blind', { direction: 'vertical' }, 1000);
						break;
					default:
						this.$clockWrapper.show();
						break;
				}
			}
		}

	});
});
