var app = app || {};

(function() {
	'use strict';

	// Debt Model
	// ----------

	// Our basic **Debt** model has 'title', 'type', 'principle', 'rate', 
	// 'order', and 'repayment' attributes.
	app.Debt = Backbone.Model.extend({

		// Default attributes for the debt. Ensure that each debt created 
		// has 'title', 'type', 'principle', 'rate', and 'repayment' keys.
		defaults: {
			title: 'Double Click to Change',
			type: 'credit',
			principal: 5000,
			rate: 6.8,
			repayment: 10
		},

		// Validation function that gets called before 'set' and 'save'.
		validate: function( attrs ) {

			// Produces a new array of errors by mapping each object in attrs 
			// through a transformation function (iterator).
			var errors = _.map( attrs, this.validateHelper, this);

			// Remove all 'falsy' values (false, null, 0, '', undefined, NaN)
			errors = _.compact( errors )

			if ( !_.isEmpty(errors) ) {
				// Since we have a handle on the Debts collection
				// from the app, fire off an error event during validation
				// so the errors will be visible even during Collection.create.
				window.app.Debts.trigger('error', this, errors);
				return errors;
			}
		},

		// Validation helper for debt form
		validateHelper: function(value, field, attrs) {
			switch( field ) {
				case 'title':
					return this.validateTitle(value);
				case 'type':
					return this.validateType(value);
				case 'principal':
					return this.validatePrincipal(value);
				case 'rate':
					return this.validateRate(value);
				case 'repayment':
					return this.validateRepayment(value);
				default:
					break;
			}
		},

		// Validates title. 
		// Only returns a JS object if error is detected.
		validateTitle: function (value) {
			var msgs = [];

			if( _.isEmpty(value) ) {
				msgs.push('Title of debt must be specified.');
			}
			
			if ( !_.isEmpty(msgs) ) {
				return {
					field: 'title',
					msg: msgs
				};
			}
		},

		// TODO: Validates type
		// Only returns a JS object if error is detected.
		validateType: function (value) {
			var msgs = [];

			if( _.isEmpty(value) ) {
				msgs.push('Type of cannot be empty.');
			}
			
			if ( !_.isEmpty(msgs) ) {
				return {
					field: 'type',
					msg: msgs
				};
			}

			console.log("TODO: Validate Type");
		},

		// TODO: Validates principal
		// Only returns a JS object if error is detected.
		validatePrincipal: function (value) {
			var msgs = [];

			if( _.isEmpty(value) ) {
				msgs.push('Principal cannot be empty.');
			}
			
			if ( !_.isEmpty(msgs) ) {
				return {
					field: 'principal',
					msg: msgs
				};
			}
			console.log("TODO: Validate Principal");
		},

		// TODO: Validates rate
		// Only returns a JS object if error is detected.
		validateRate: function (value) {
			console.log("TODO: Validate Rate");
		},

		// TODO: Validates repayment
		// Only returns a JS object if error is detected.
		validateRepayment: function (value) {
			console.log("TODO: Validate Repayment");
		}
	});

}());
