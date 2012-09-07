var app = app || {};
var ENTER_KEY = 13;
var TAB_KEY = 9;
var DEBT_TYPES = ['Credit Card', 'Stafford Loan', 'Perkins Loan', 'Plus Loan', 'Mortgage', 'Other'];
var DEBT_FIELDS = ['title', 'type', 'principal', 'rate', 'repayment'];
var STAFFORD_LOAN_MIN = 50.0;
var PERKINS_LOAN_MIN = 40.0;
var PLUS_LOAN_MIN = 50.0;

// Helper functions
// ----------------

// Round a float only if it is not NaN.
app.toFixed = function( value ) {
	return value ? parseFloat( accounting.toFixed(value, 2) ): value;
}

$(function() {
	'use strict';

	//--------------
	// Add a close() method to the Backbone.View prototype to assist
	// during view clean up and avoid zombie views during page transitions.	
	Backbone.View.prototype.close = function(){
		// TODO: Make it so that the Organize and Strategize view generate
		// their 'el' (DOM elements) from a template so that calling remove() works.
		// this.remove();
		this.unbind();
		if (this.onClose){
			this.onClose();
 		}
	}

	//--------------
	// Create an alert event aggregator and add it to the app namespace so that
	// any bootstrap component can fire off an 'app:alert' to flash an alert message.
	app.AlertHandler = {
		// Create a new AlerView with the given messages, place it in the DOM,
		// and show it with a jQuery UI animation effect.
		flashMessage: function( msgData, type ) {
			$('.alert').alert('close');
			var view = new app.AlertView({ type: type, msgData: msgData });
			$('#error-msgs').html( view.render().el );
			$('.alert').show("drop", { direction: 'up' });
		}

		// TODO: Add a utility function to create the message data structure.
	};
	_.extend( app.AlertHandler, Backbone.Events );
	app.AlertHandler.on( 'app:alert', app.AlertHandler.flashMessage );

	//--------------
	// Entry point for the overall app. Create a new AppView.
	new app.AppView();
});
