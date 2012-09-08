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
			window.app.Debts.on( 'reset change remove', this.render, this );
			window.app.AppRouter.on( 'all', this.updateTabView, this );

			this.$stepOne = this.$('#step-one');
			this.$statsWrapper = this.$('.stats-wrapper');
			this.$lifetimeInterest = this.$('#lifetime-interest');
			this.$dailyInterest = this.$('#daily-interest');
			this.$freedomDate = this.$('#freedom-date');

			// Set the padding for the wizard hero units so they will be correct during animation
			var heroUnit = this.$('.hero-unit');
			heroUnit.css('padding-top', '10px');
			heroUnit.css('padding-bottom', '0px');

			// Create the inital tab view.
			this.updateTabView();

			// Kick things off by fetching an pre-existing models from the collection
			// stored in *LocalStorage*.                                    
			// TODO: Remove this and boostrap it to the page as per Backbone JS
			//       recommendation: http://backbonejs.org/#FAQ-bootstrap
			app.Debts.fetch();
		},

		// Re-rendering the App means managing the guide at the top of the page
		// and refreshing the stat blocks.
		render: function( eventName ) {
			console.log( 'AppView render() called with "' + eventName + '"' );

			// Iterate over all Debt models in the Debts collection and reduce
			// all the lifetime interest calculations down to one sum.
                        var lifetimeSum = app.Debts.reduce( 
				function(sum, model) { return sum + model.calculateLifetimeInterest(); }, 0 );
			this.$lifetimeInterest.html( accounting.formatMoney(lifetimeSum) );

			// Update the daily interest in a similar manner.
			var dailySum = app.Debts.reduce(
				function(sum, model) { return sum + model.calculateDailyInterest(); }, 0 );
			this.$dailyInterest.html( accounting.formatMoney(dailySum) );

			// TODO: Update the freedom date.
			this.$freedomDate.html('January 11, 2013');

			switch ( app.Debts.length ) {
				case 0:
					this.$stepOne.show('drop', { direction: 'up' }, 1000);
					this.$statsWrapper.hide();
					break;
				case 1:
					this.$stepOne.hide();
					this.$statsWrapper.show('drop', { direction: 'up' }, 1000);
					break;
				default:
					this.$statsWrapper.show();
					break;
			}
		},

		// Helper function for activating a specific tab and rendering its 
		// associated view based on the requestedView variable set by the AppRouter.
		updateTabView: function() {
			// Close the currentView if it exists
			if ( window.app.currentView ) {
				window.app.currentView.close();
			}

			switch ( window.app.requestedView ) {
				case 'strategize': 
					this.$('#subnav a[href="#strategize"]').tab('show');
					window.app.currentView = new app.StrategizeView();
					break;
				default:
					this.$('#subnav a[href="#organize"]').tab('show');
					window.app.currentView = new app.OrganizeView();
					break;
			}

			// Render the current view
			window.app.currentView.render('AppView:updateTabView');

		},

		
	});
});
