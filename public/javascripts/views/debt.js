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
			'click .destroy-btn':		'clear',
			'dblclick .title-cell':		'editTitle',
			'dblclick .type-cell':		'editType',
			'dblclick .principal-cell':	'editPrincipal',
			'dblclick .rate-cell':		'editRate',
			'dblclick ..repayment-cell':	'editRepayment',
			'blur .edit':			'close'
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

		// Remove the debt item, destroy the model from *LocalStorage* and delete
		// its view (since the OrganizeView is listening for changes in the collection).
		clear: function() {
			this.model.destroy();
		},

		// Overlay the current input in the table cell for the debt Title.
		editTitle: function( event ) {
			var cell = this.$('.title-cell');
			this.currentInput = this.$('.edit-title');
			this.startEditing( cell );
		},

		// Overlay the current input in the table cell for the debt Type.
		// Since we want the type cell to behave slightly differently (not get maxed
		// inside its parent's table cell) we have to manually turn on editing mode and set focus.
		editType: function( event ) {
			var cell = this.$('.type-cell');
			this.currentInput = this.$('.edit-type');
			this.currentInput.width( cell.outerWidth() );
			cell.addClass('editing');
			this.currentInput.focus();
		},

		// Overlay the current input in the table cell for the debt Principal.
		editPrincipal: function( event ) {
			var cell = this.$('.principal-cell');
			this.currentInput = this.$('.edit-principal');
			this.startEditing( cell );
		},

		// Overlay the current input in the table cell for the debt Rate.
		editRate: function( event ) {
			var cell = this.$('.rate-cell');
			this.currentInput = this.$('.edit-rate');
			this.startEditing( cell );
		},

		// Overlay the current input in the table cell for the debt Repayment.
		editRepayment: function( event ) {
			var cell = this.$('.repayment-cell');
			this.currentInput = this.$('.edit-repayment');
			this.startEditing( cell )
		},

		// TODO:
		close: function() {
			this.$('.editing').removeClass('editing');
		},

		// Overlays the current input completely within its parent table cell,
		// Turns on editing mode, and sets the focus on the currentInput.
		startEditing: function( cell ) {
			this.currentInput.width( cell.outerWidth() );
			// TODO (remove this hack): Subtract 1px to account for bottom border
			this.currentInput.height( cell.outerHeight() - 1);
			cell.addClass('editing');
			this.currentInput.focus();
		}
	});
});
