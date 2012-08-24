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
			'blur .edit':			'close',
			'keypress .edit':		'closeOnEnter'
		},

		// The DebtView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Debt** and a *DebtView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.model.on( 'change sync', this.render, this );
			this.model.on( 'destroy', this.remove, this );
			this.model.on( 'error', this.render, this );
		},

		// Re-render the data in the table of this debt, and update the inputs accordingly.
		// (See debt-item template).
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

		// Set the default selected option, then overlay the current input in the table cell for the debt Type.
		// Since we want the type cell to behave slightly differently (not get maxed
		// inside its parent's table cell) we have to manually turn on editing mode and set focus.
		editType: function( event ) {
			var cell = this.$('.type-cell');
			this.currentInput = this.$('.edit-type');
			this.startEditing( cell );
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

		// Disable editing mode, trim and parse value if appropriate,
		// and attempt to save the updates. If value is empty, flash a message and return.
		close: function() {
			var value = this.currentInput.val().trim();

			if ( !value ) {
				// TODO: Flash message
				return;
			}			

			var response;
			switch ( this.currentInput.selector ) {
				case '.edit-title':
					response = this.model.save({ title: value });
					break;
				case '.edit-type':
					response = this.model.save({ type: value });
					break;
				case '.edit-principal':
					response = this.model.save({ principal: app.toFixed( parseFloat(value.replace('/,/g', '')) ) });
					break;
				case '.edit-rate':
					response = this.model.save({ rate: app.toFixed( parseFloat(value) ) });
					break;
				case '.edit-repayment':
					response = this.model.save({ repayment: parseInt( value ) });
					break;
				default:
					break;
			}

			this.$('.editing').removeClass('editing');
		},

		// Calls the this.close() function if enter key is pressed in an .edit input.
		closeOnEnter: function( e ) {
			if ( e.which == ENTER_KEY ) {
				this.close();
			}
		},

		// Overlays the current input completely within its parent table cell,
		// Turns on editing mode, and sets the focus on the currentInput.
		startEditing: function( cell ) {
			this.currentInput.width( cell.innerWidth() );
			this.currentInput.height( cell.innerHeight() );
			cell.addClass('editing');
			this.currentInput.focus();
		}
	});
});
