var app = app || {};

(function() {
	'use strict';

	// Debt Model
	// ----------

	// Our basic **Debt** model has 'title', 'type', 'principle', 'rate', 
	// 'order', and 'repayment' attributes.
	app.Debt = Backbone.Model.extend({

		// Default attributes for the debt. Ensure that each debt created 
		// has 'title', 'type', 'principle', 'rate', and 'repayment' keys.
		defaults: {
			title: '',
			type: 'credit',
			principle: 5000,
			rate: 6.8,
			repayment: 10
		},
	});

}());
