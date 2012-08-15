var app = app || {};

$(function() {
        'use strict';

        // Organize Tab View
        // ---------------

	// The OrganizeView is the UI piece for the Organize tab in the App.
	app.OrganizeView = Backbone.View.extend({

		// Instead of generating to a new element, bind to the existing skeleton
		// of the Organize tab already present in the HTML.
		el: '#organize',

		// TODO: Template for the sum row

                // Delegated events for creating and deleting debts
                events: {
                        'click #debt-add':	'createOnAdd'
                        // TODO: Add ability to delete
                },

                // At initialization we bind to the relevant events in the 'Debts"
                // collection when debts are added or changed. Start things off by
                // loading any pre-existing debts that might have been saved in *LocalStorage*.
                initialize: function() {
                        this.title = this.$('#debt-title');
                        this.type = this.$('#debt-type');
                        this.principal = this.$('#debt-principal');
                        this.rate = this.$('#debt-rate');
                        this.repayment = this.$('#debt-repayment');

                        window.app.Debts.on( 'add', this.addAll, this );
                        window.app.Debts.on( 'reset', this.addAll, this );
                        window.app.Debts.on( 'change:completed', this.addAll, this );
                        window.app.Debts.on( 'all', this.render, this );
			window.app.Debts.on( 'error', this.handleErr, this );

			app.Debts.fetch();
                },

                // Re-rendering the Organize view means refreshing the sum row
                render: function( eventName ) {
			console.log("OrganizeView render() called with event: " + eventName);
                        // TODO: Update the sum-row via template
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
		newAttributes: function() {
			return {
				title: this.title.val().trim(),
				type: this.type.val().trim(),
				principal: this.principal.val().trim(),
				rate: this.rate.val().trim(),
				repayment: this.repayment.val().trim(),
				order: app.Debts.nextOrder()
			};
		},

		// If you click on the Add button, create new **Debt** model,
		// persisting it to *LocalStorage*.
		createOnAdd: function( e ) {
			// Create new model in collection, check if successful
			if ( app.Debts.create( this.newAttributes() ) ) {
				this.title.val('');
				this.type.val('Credit Card');
				this.principal.val('');
				this.rate.val('');
				this.repayment.val('');						
			}
		},

		// Debt from error handling.
		// Hide all control-group errors, create a new AlertView with the
		// given errors, place it in the DOM, show it with a jQuery UI Effect
		// and add the 'error' class to all appropriate control-groups.
		handleErr: function( model, errors ) {
			this.clearErrors();
			var view = new app.AlertView({ errors: errors });
			$('#error-msgs').html( view.render().el );
			$('.alert').show("drop", { direction: 'up' });
			_.each( errors, function(error){ 
				$('#' + error.field + '-group').addClass('error'); });
		},

		clearErrors: function() {
			$('.control-group').removeClass('error');
			$('.alert').alert('close');
		}
	});
});
