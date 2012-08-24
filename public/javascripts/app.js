var app = app || {};
var ENTER_KEY = 13;
var DEBT_TYPES = ['Credit Card', 'Stafford Loan', 'Perkins Loan', 'Plus Loan', 'Mortgage', 'Other'];

// Helper functions
// ----------------

// Round a float only if it is not NaN.
app.toFixed = function( value ) {
	return value ? parseFloat( accounting.toFixed(value, 2) ): value;
}

$(function() {

	// Entry point for the overall app. Create a new AppView
	new app.AppView();

});
