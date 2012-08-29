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

			// TODO: Use only the appropriate events to limit calls 
			// 	 Check 'add change reset destroy'
			window.app.Debts.on( 'all', this.render, this );

			this.$avaLifeInterest = this.$('#avalanche-lifetime');
			this.$avaDayInterest = this.$('#avalanche-daily'); 
		},

		// Re-rendering the Strategize view means deciding which steps of
		// the strategize wizard to show and updating the calculations.
		render: function( eventName ) {
			console.log( 'StrategizeView render() called with "' + eventName + '"' );

			var normal = this.totalLifetimeInterest(app.Debts.sortByRate(true), 0);

			var overPayment = 500;

			var ava = this.avalancheLifetimeInterest(overPayment);
			var snow = this.snowballLifetimeInterest(overPayment);

			this.$avaLifeInterest.html('Avalanche total: ' + 
				accounting.formatMoney(ava) + ' Savings: ' + 
				accounting.formatMoney(normal-ava) );
			this.$avaDayInterest.html('Snowball total: ' + 
				accounting.formatMoney(snow) + ' Savings: ' + 
				accounting.formatMoney(normal-snow) );
		},

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.Debts.off( null, null, this );
		},

		// Calculate the total lifetime interest for a list of debts sorted by
		// rate in descending order (Avalanche repayment method).
		avalancheLifetimeInterest: function( overPayment ) {
			return this.totalLifetimeInterest(app.Debts.sortByRate(true), overPayment);
		},

		// Calculate the total lifetime interest for a list of debts sorted by
		// principal in ascending order (Snowball repayment method).
		snowballLifetimeInterest: function( overPayment ) {
			return this.totalLifetimeInterest(app.Debts.sortByPrincipal(), overPayment);
		},

		// Calculates total lifetime interest for a list of debts by applying an 
		// overpayment during each month to the first debt in the list.
		totalLifetimeInterest: function( debts, overPayment ) {
			// Create a new array from the debts parameter.
			var debtList = _.map( debts, function(debt) { 
				return {
					'principal': 	debt.attributes.principal,
					'rate':		(debt.attributes.rate/100.0)/12.0,
					'monthly': 	debt.attributes.monthly
				}; 
			});

			var sum = this.totalInterest(debtList, overPayment);

			console.log( '--StrategizeView totalLifetimeInterest() recursive sum: ' + sum );

			return sum;
		},

		// Each debt accrues interest in the same manner during every period.
		// The only thing that changes is the amount by which the principal 
		// decreases. For the top debt in the list, an over payment is applied.
		// The principal for every other debt in the list decreases by its
		// pre-calculated monthly payment amount.
		// This recursive function uses a reduce() to determine the interest earned
		// during each period and to lower each debt's principal by the correct amount.
		totalInterest: function( debtList, amount ) {
			// Base case: No more debts left in the list
			if ( _.isEmpty(debtList) ) {
				return 0;
			}

			var overPayment = amount;

			// Calculate interest for this period and then calculate the payment
			// for each debt by factoring in overpayment amount and principal balance.
			var interestThisPeriod = _.reduce( debtList, function(sum, debt) {
				var interest = (debt.principal * debt.rate);
				debt.principal += interest;
				
				var payment = 0;

				if ( overPayment > 0 ) {
					if ( overPayment > debt.monthly ) {
						payment = overPayment;
					} else {
						payment = debt.monthly + overPayment;
					}
				} else {
					payment = debt.monthly;
				}

				if ( payment > debt.principal ) {
					overPayment -= debt.principal;
					debt.principal = 0;
				} else {
					debt.principal -= payment;
					overPayment = 0;
				}

				return sum + interest;
			}, 0 );

			// Reject debts in the list with a principal of 0
			debtList = _.reject(debtList, function(debt) { 
				return debt.principal <= 0.0; 
			});

			return interestThisPeriod + this.totalInterest( debtList, amount );
		},
	});
});
	
