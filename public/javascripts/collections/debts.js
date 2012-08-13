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
		}
	});

	// Create our global collection of **Debts**.
	app.Debts = new DebtList();

}());
