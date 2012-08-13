var app = app || {};

$(function() {
	'use strict';

	// Debt Item View
	// --------------

	// The DOM element for a debt item...
	app.DebtView = Backbone.View.extend({
	
		//... is a table row tag.
		tagName: 'tr',

		// Cache the template function for a single debt.
		template: _.template( $('#debt-template').html() ),

		// The DOM events specific to a debt.
		events: {
			// TODO: add interactive events
		},

		// The DebtView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Debt** and a *DebtView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.model.on( 'change', this.render, this );
			this.model.on( 'destroy', this.remove, this );
		},

		// Re-render the data in the table of this debt.
		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			
			return this;
		},

	});
});
