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

		// Set editing mode on and display the input field for debt Title.
		// Position the input within the cell.
		editTitle: function( event ) {
			var cell = this.$('.title-cell');
			var element = this.$('.edit-title');
			this.overlayInCell( cell, element );
			cell.addClass('editing');
			element.focus();
		},

		// Set editing mode on and display the input field for debt Type.
		editType: function( event ) {
			var cell = this.$('.type-cell');
			var element = this.$('.edit-type');
			element.width( cell.outerWidth() );
			cell.addClass('editing');
			element.focus();
		},

		// Set editing mode on and display the input field for debt Principal.
		editPrincipal: function( event ) {
			var cell = this.$('.principal-cell');
			var element = this.$('.edit-principal');
			this.overlayInCell( cell, element );
			cell.addClass('editing');
			element.focus();
		},

		// Set editing mode on and display the input field for debt Rate.
		editRate: function( event ) {
			var cell = this.$('.rate-cell');
			var element = this.$('.edit-rate');
			this.overlayInCell( cell, element );
			cell.addClass('editing');
			element.focus();
		},

		// Set editing mode on and display the input field for debt Repayment.
		editRepayment: function( event ) {
			var cell = this.$('.repayment-cell');
			var element = this.$('.edit-repayment');
			this.overlayInCell( cell, element );
			cell.addClass('editing');
			element.focus();
		},

		// TODO:
		close: function() {
			this.$('.editing').removeClass('editing');
		},

		// Overlays an element complete within its parent table cell.
		overlayInCell: function( cell, element ) {
			element.width( cell.outerWidth() );
			// Subtract 1px to account for bottom border
			element.height( cell.outerHeight() - 1);
		}
	});
});
