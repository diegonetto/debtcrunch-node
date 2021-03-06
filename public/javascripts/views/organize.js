var app = app || {};

$(function() {
        'use strict';

        // Organize Tab View
        // ---------------

	// The OrganizeView is the UI piece for the Organize tab in the App.
	app.OrganizeView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton
		// of the Organize tab already present in the HTML.
		el: '#organize',

		// TODO: Template for the sum row

                // Delegated events for creating and deleting debts
                events: {
			'click .form-cell':		'showFormInput',
                        'click #debt-add':		'createOnAdd',
			'keypress .debt-input':		'createOrTab',
			'blur .debt-input':		'hideFormInput'
                },

                // At initialization we bind to the relevant events in the 'Debts'
                // collection when debts are added or changed.
                initialize: function() {
			window.app.Debts.on( 'reset change remove', this.render, this );
			window.app.Debts.on( 'add reset', this.addAll, this );
			window.app.Debts.on( 'creation-error', this.formError, this );
			window.app.Debts.on( 'error', this.modelError, this );

                        this.title = this.$('#debt-title');
                        this.type = this.$('#debt-type');
                        this.principal = this.$('#debt-principal');
                        this.rate = this.$('#debt-rate');
                        this.repayment = this.$('#debt-repayment');

			this.$debtTable = this.$('#debt-table-wrapper');
			this.$principalTotal = this.$('#principal-total');
			this.$monthlyTotal = this.$('#monthly-total');

			// Wrap the debt inputs in a list for ease of processing.
			this.debtInputs = [this.title, this.type, this.principal, this.rate, this.repayment];

			// Enable the help pop-overs for each of the debt inputs.
			_.each( this.debtInputs, this.enablePopovers, this );

			// Kick things off by adding all debts to table
			this.addAll();
                },

                // Re-rendering the Organize view means showing or hiding the debt table
		// and redrawing the sum row.
                render: function( eventName ) {
			console.log( 'OrganizeView render() called with "' + eventName + '"' );

			// Pluck all the principal values from each model in the Debts collection
			// and reduce them down to a sum and update the html.
			var principalSum = _.reduce(window.app.Debts.pluck("principal"), 
				function(sum, num) { return sum + num; }, 0 );
			this.$principalTotal.html( accounting.formatMoney(principalSum) );

			// Pluck all the monthly values from each model in the Debts collection
			// and reduce them down to a sum and update the html.
			var monthlySum = _.reduce(window.app.Debts.pluck("monthly"), 
				function(sum, num) { return sum + num; }, 0 );
			this.$monthlyTotal.html( accounting.formatMoney(monthlySum) );

			switch ( app.Debts.length ) {
				case 0:
					this.$debtTable.addClass('empty');
					break;
				default:
					this.$debtTable.removeClass('empty');
					break;
			}
                },

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.Debts.off( null, null, this );
		},

		// Helper function that iterates over the debtInputs and creates unique popovers.
		enablePopovers: function( input ) {
			var title = '';
			var content = '';

			switch ( input.attr('data-field') ) {
				case 'title':
					title = 'Debt Title';
					content = 'A descriptive title for this debt.';
					break;
				case 'type':
					title = 'Type';
					content = 'The debt type affects how monthly payments are calculated.';
					break;
				case 'principal':
					title = 'Starting Principal';
					content = 'The initial dollar amount of this debt.';
					break;
				case 'rate':
					title = 'Percentage Rate';
					content = 'The annual interest rate (percentage) of this debt.';
					break;
				case 'repayment':
					title = 'Repayment Time';
					content = 'The lifetime of this debt in months. Normally the default is 120 months (10 years).';
					break;
				default:
					break;
			}

			input.popover({ 
				placement: 'top',
				title: title,
				content: content,
				trigger: 'focus'
			});
		},

		// Uses the event's currentTarget's data-form attribute to find the input that
		// needs to be shown. Also sets a reference to the .view div that contains the text
		// for the current input.
		showFormInput: function( event ) {
			var formInput = event.currentTarget.getAttribute('data-form');
			this.currentInput = this.$('#' + formInput);

			var cell = $('td[data-form="' + formInput + '"]');
			this.currentInputView = cell.find('.view');
			this.displayFormInput( cell );
		},

		// Positions the current debt form input based on its parent cell, adds the
		// 'editing' and 'focused' classes and sets focus.
		displayFormInput: function( cell ) {
			this.currentInput.width( cell.find('.view').innerWidth() -1 );
			this.currentInput.height( cell.find('.view').innerHeight() - 1 );
			cell.addClass('editing focused');
			this.currentInput.focus();
		},

		// Removes the editing (which hides the input) and focused classes from the table
		// cell containing the input. If the value is not empty, it updates the associated
		// view with the current input and adds the 'not-empty' class. If the value is empty, 
		// it sets it back to its default, which is given by the 'data-default' attribute. 
		hideFormInput: function() {
			this.currentInputView.parent().removeClass('editing focused');

			var value = this.currentInput.val();
			if ( value ) {
				this.currentInputView.html( this.currentInput.val() );
				this.currentInputView.parent().addClass('not-empty');
			} else {
				this.currentInputView.html( this.currentInput.attr('data-default') );
				this.currentInputView.parent().removeClass('not-empty');
			}
		},

		// Add a single debt to the list by creating a view for it and
		// appending its element to the table
		addOne: function( debt ) {
			var view = new app.DebtView({ model: debt});
			$('#debt-table-body').append( view.render('OrganizeView:addOne').el );
		},

		// Add all debts in the **Debts** collection at once.
		// Remove all debt-view rows from the table and current errors.
		addAll: function() {
			this.$('.debt-view').remove();
			this.clearErrors();	
			app.Debts.each( this.addOne, this );
		},

		// Generate the attributes for a new Debt item.
		// First sanitize the strings from the input fields
		// and convert to proper types before sending off to the model.
		newAttributes: function() {
			return {
				title: this.title.val().trim(),
				type: this.type.val().trim(),
				principal: app.toFixed( parseFloat(this.principal.val().trim().replace('/,/g', '')) ),
				rate: app.toFixed( parseFloat(this.rate.val().trim()) ),
				repayment: parseInt( this.repayment.val().trim() ),
				order: app.Debts.nextOrder()
			};
		},

		// If you click on the Add button, create new **Debt** model,
		// persisting it to *LocalStorage*.
		createOnAdd: function( e ) {
			// Clear any current errors
			this.clearErrors();

			// Create new model in collection, check if successful
			if ( app.Debts.create( this.newAttributes() ) ) {
				this.clearFormInputs();
			}
		},

		// If the enter key is pressed while in a debt input, attempt to create a new debt.
		// If the tab key is pressed, find the next tabindex to focus on.
		createOrTab: function( e ) {
				if ( e.which == ENTER_KEY ) {
					this.$('.debt-input').blur();
					this.createOnAdd();
				} else if ( e.which == TAB_KEY ) {
					console.log('TODO: switch to the next tabindex input');
				}
		},

		// Helper function that clears debt form input fields and resets form cell views.
		clearFormInputs: function() {
				this.title.val('');
				this.type.val(DEBT_TYPES[0]);
				this.principal.val('');
				this.rate.val('');
				this.repayment.val('');
				$('.form-cell').each(function(idx, item) {
					var defaultText = $(this).find('[data-default]').attr('data-default');
					$(this).find('.view').html(defaultText);
					$(this).removeClass('not-empty');
				});
		},

		// Debt from error handling.
		// Add the 'error' class to all appropriate control-groups in the form
		// then flash the error messages.
		// The trigger for function comes from event manually fired from the Debt Model
		// during validation to take care of returning errors during model creation.
		formError: function( model, errors ) {
			_.each( errors, function(error){ 
				$('[data-form="debt-' + error.field + '"]').addClass('error'); 
			});

			app.EventAggregator.trigger( 'app:alert', errors, 'error' );
		},

		// Debt model error handling.
		// Trigger for this function comes from the 'error' event that is
		// automatically fired when the model fails validation.
		// In this case we do not want to highlight the form inputs so
		// we clear them out (since during model validation failure both
		// automatic 'error' and manual 'creation-error' are fired.).
		modelError: function( model, errors ) {
			this.clearErrors();

			// Since this will only be fired from model if validation fails
			// after a model already is created, go ahead and re-render the
			// debt creation form since we just cleared any errors it might have had.
			this.clearFormInputs();

			app.EventAggregator.trigger( 'app:alert', errors, 'error' );
		},
		
		clearErrors: function() {
			$('.form-cell').removeClass('error');
			$('.alert').alert('close');
		}
	});
});
