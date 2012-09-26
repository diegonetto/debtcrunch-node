var app = app || {};

$(function() {
	'use strict';

	// Debt Item View
	// --------------

	// The DOM element for a debt item...
	app.DebtView = Backbone.View.extend({
	
		//... is a table row tag.
		tagName: 'tr',

		// class
		className: 'debt-view',

		// Cache the template function for a single debt.
		template: _.template( $('#debt-template').html() ),

		// The DOM events specific to a debt.
		events: {
			'click .destroy-btn':		'clear',
			'click .title-cell':		'editTitle',
			'click .type-cell':		'editType',
			'click .principal-cell':	'editPrincipal',
			'click .rate-cell':		'editRate',
			'click ..repayment-cell':	'editRepayment',
			'blur .edit':			'close',
			'keypress .edit':		'closeOnEnter'
		},

		// The DebtView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Debt** and a *DebtView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.model.on( 'change error', this.render, this );
			this.model.on( 'error:msgs', this.fadeError, this );
			this.model.on( 'sync error', this.fadeOut, this );
			this.model.on( 'destroy', this.remove, this );
			this.model.on( 'change:repayment', this.fadeRepayment, this );
			this.model.on( 'change:monthly', this.fadeMonthly, this );
		},

		// Re-render the data in the table of this debt, and update the inputs accordingly.
		// (See debt-item template).
		render: function( eventName ) {
			console.log( 'DebtView render() called with "' + eventName + '"' );
			this.$el.html( this.template( this.model.toJSON() ) );
			
			return this;
		},

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			this.model.off( null, null, this );
		},

		// Adds a special class to the just edited row when the repayment is changed.
		fadeRepayment: function() {
			$('.just-edited').addClass('fade-repayment');
		},

		// Adds a special class to the just edited row when the monthly is changed.
		fadeMonthly: function() {
			$('.just-edited').addClass('fade-monthly');
		},

		// Adds a special class to the just edited row when an error occurs during
		// inline editing.
		fadeError: function(model, errorData) {
			console.log('fade error called');
			var e = $('.just-edited');
			var field = errorData[0].field
			e.addClass('fade-error');
			e.attr('data-error-idx', _.indexOf( DEBT_FIELDS, field ));
		},

		// Perform any Fade Out (highlight) animations after sync'ing, since
		// that should be the last event fired.
		fadeOut: function() {
			console.log('fadeOut');

			// Attempt repayment fade
			$('.fade-repayment td:eq(4)').effect('highlight', 
				{ color: '#0088cc' }, 1500 );
			$('.fade-repayment').removeClass('fade-repayment');

			// Attempt monthly fade
			$('.fade-monthly td:eq(5)').effect('highlight', 
				{ color: '#0088cc' }, 1500 );
			$('.fade-monthly').removeClass('fade-monthly');

			// Attempt error fade
			var e = $('.fade-error');
			var fieldIdx = e.attr('data-error-idx');
			$('.fade-error td:eq(' + fieldIdx + ')').effect('highlight',
				{ color: '#ff6881' }, 2000 );
			e.removeAttr('data-error-idx');
			e.removeClass('fade-error');
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
			this.currentInput.val(this.model.attributes.type);
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

			var cell = this.$('.editing');
			cell.removeClass('editing');
			$('.just-edited').removeClass('just-edited');
			cell.parent().addClass('just-edited');

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
