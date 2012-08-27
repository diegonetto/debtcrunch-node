var app = app || {};

(function() {
	'use strict';

	// Debts Collection
	// ---------------

	// The collection of debts is backed by *localStorage* instead of a remote
	// server.
	var DebtList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: app.Debt,

		// Save all of the debt list items under the '"debts"' namespace.
		localStorage: new Store('debts-management'),

		// We keep the Debts in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		nextOrder: function() {
			if ( !this.length ) {
				return 1;
			}
			return this.last().get('order') + 1;
		},

		// Debts are sorted by their original insertion order.
		comparator: function( debt ) {
			return debt.get('order');
		},

		// Return a list of debts sorted by principal balance.
		// Pass in 'true' to sort in descending order.
		sortByPrincipal: function( descending ) {
			var dir = descending ? -1 : 1;
			return this.sortBy( function(debt) { return dir * debt.attributes.principal; } );
		},

		// Return a list of debts sorted by interest rate.
		// Pass in 'true' to sort in descending order.
		sortByRate: function( descending ) {
			var dir = descending ? -1 : 1;
			return this.sortBy( function(debt) { return dir * debt.attributes.rate; } );
		}
	});

	// Create our global collection of **Debts**.
	app.Debts = new DebtList();

}());
