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
                        'click #debt-add':		'createOnAdd',
			'keypress .debt-input':		'createOnEnter'
                },

                // At initialization we bind to the relevant events in the 'Debts'
                // collection when debts are added or changed. Start things off by
                // loading any pre-existing debts that might have been saved in *LocalStorage*.
                initialize: function() {
                        this.title = this.$('#debt-title');
                        this.type = this.$('#debt-type');
                        this.principal = this.$('#debt-principal');
                        this.rate = this.$('#debt-rate');
                        this.repayment = this.$('#debt-repayment');

			// Wrap the debt inputs in a list for ease of processing.
			this.debtInputs = [this.title, this.type, this.principal, this.rate, this.repayment];

			// Enable the help pop-overs for each of the debt inputs.
			_.each( this.debtInputs, this.enablePopovers, this );

                        window.app.Debts.on( 'add', this.addAll, this );
                        window.app.Debts.on( 'reset', this.addAll, this );
                        window.app.Debts.on( 'change:completed', this.addAll, this );
                        window.app.Debts.on( 'all', this.render, this );
			window.app.Debts.on( 'creation-error', this.formError, this );
			window.app.Debts.on( 'error', this.modelError, this );

			this.$debtTable = this.$('#debt-table-wrapper');
			this.$principalTotal = this.$('#principal-total');
			this.$monthlyTotal = this.$('#monthly-total');

			app.Debts.fetch();
                },

                // Re-rendering the Organize view means showing or hiding the debt table
		// and redrawing the sum row.
                render: function( eventName ) {
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

			if ( eventName == 'reset' || eventName == 'add' || eventName == 'destroy') {
				switch ( app.Debts.length ) {
					case 0:
						this.$debtTable.hide();
						break;
					case 1:
						this.$debtTable.show('blind', 700);
						break;
					default:
						this.$debtTable.show();
						break;
				}
			}
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

		// Add a single debt to the list by creating a view for it and
		// appending its element to the table
		addOne: function( debt ) {
			var view = new app.DebtView({ model: debt});
			$('#debt-table-body').append( view.render().el );
		},

		// Add all debts in the **Debts** collection at once.
		// Clear current rows from the table and current errors.
		addAll: function() {
			this.$('#debt-table-body').html('');
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
		createOnEnter: function( e ) {
				if ( e.which == ENTER_KEY ) {
					this.createOnAdd();
				}
		},

		// Helper function that clears debt form input fields
		clearFormInputs: function() {
				this.title.val('');
				this.type.val(DEBT_TYPES[0]);
				this.principal.val('');
				this.rate.val('');
				this.repayment.val('');
		},

		// Debt from error handling.
		// Add the 'error' class to all appropriate control-groups in the form
		// then flash the error messages.
		// The trigger for function comes from event manually fired from the Debt Model
		// during validation to take care of returning errors during model creation.
		formError: function( model, errors ) {
			_.each( errors, function(error){ 
				$('#' + error.field + '-group').addClass('error'); });

			this.flashErrors( model, errors );
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

			this.flashErrors( model, errors );
		},
		
		// Hide all control-group errors, create a new AlertView with the
		// given errors, place it in the DOM, show it with a jQuery UI Effect
		flashErrors: function( model, errors ) {
			var view = new app.AlertView({ errors: errors });
			$('#error-msgs').html( view.render().el );
			$('.alert').show("drop", { direction: 'up' });
		},

		clearErrors: function() {
			$('.control-group').removeClass('error');
			$('.alert').alert('close');
		}
	});
});
