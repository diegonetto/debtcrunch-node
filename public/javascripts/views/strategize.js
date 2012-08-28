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
			this.$avaLifeInterest.html( this.avalancheLifetimeInterest() );
			this.$avaDayInterest.html( this.snowballLifetimeInterest() );
		},

		// Calculate the total lifetime interest for a list of debts sorted by
		// rate in descending order (Avalanche repayment method).
		avalancheLifetimeInterest: function() {
			return accounting.formatMoney(
				this.totalLifetimeInterest(app.Debts.sortByRate(true)) );
		},

		// Calculate the total lifetime interest for a list of debts sorted by
		// principal in ascending order (Snowball repayment method).
		snowballLifetimeInterest: function() {
			return accounting.formatMoney(
				this.totalLifetimeInterest(app.Debts.sortByPrincipal()) );
		},

		// TODO: Implement
		// Helper function that calculates total lifetime interest for a list of debts
		// by applying a fixed overpayment during each month to the first debt in the list.
		totalLifetimeInterest: function( debts ) {
			// Create a new list from the debts
			var debtList = _.map( debts, function(debt) { 
				return {
					'principal': 	debt.attributes.principal,
					'rate':		(debt.attributes.rate/100.0)/12.0,
					'monthly': 	debt.calculateMonthly()
				}; 
			});

			var interest = 0.0;
			var sum = 0.0;
			// Iterate until all debts in the list are paid off (list is empty).
			while ( !_.isEmpty(debtList) ) {

				// Treat the rest of the list normally
				_.each( debtList, function(debt, key, debtList) {
					// Calculate interest and new principal
					interest = debt.principal * debt.rate;
					debt.principal += interest;

					// Apply payment
					if ( debt.monthly > debt.principal ) {
						debt.principal = 0.0;
					} else {
						debt.principal -= debt.monthly;
					}	

					// Add interest to sum
					sum += interest;
				});

				// Reject debts in the list with a principal of 0
				debtList = _.reject(debtList, function(debt) { 
					return debt.principal == 0.0; 
				});
			}

			console.log( 'Total sum: ' + sum );

			// If applying there is $$ left after applying the overpayment to a debt,
			// the remaining amount will be applied to the next loan.

			return sum;
		}
	});
});
	
