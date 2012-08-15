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

		// Validation helper for debt form. Retrieve the error messages
		// from the appropriate validation function and construct an error
		// object if messages were retrieved.
		validateHelper: function(value, field, attrs) {
			var msgs = [];
		
			// Skip the individual validations if the input value is empty
			if( _.isEmpty(value) && field !== 'order' ) {
				msgs.push('<strong>' + field.charAt(0).toUpperCase() + 
					field.slice(1) + '</strong> cannot be empty.');
				// Error object
				return {
					field: field,
					msgs: msgs
				};
			}

			switch( field ) {
				case 'title':
					msgs = this.validateTitle(value);
					break;
				case 'type':
					msgs = this.validateType(value);
					break;
				case 'principal':
					msgs = this.validatePrincipal(value);
					break;
				case 'rate':
					msgs = this.validateRate(value);
					break;
				case 'repayment':
					msgs = this.validateRepayment(value);
					break;
				default:
					break;
			}

			if ( !_.isEmpty(msgs) ) {
				// Error object
				return {
					field: field,
					msgs: msgs
				};
			}
		},

		// Validates title.
		// Only returns a JS object if error is detected.
		validateTitle: function (value) {
			var msgs = [];

			// TODO: Do not allow duplicate titles

			if ( value.length > 35 ) {
				msgs.push('<strong>Title</strong> of debt cannot be longer than 35 characters.');
			}

			return msgs;			
		},

		// Validates type.
		// Only returns a JS object if error is detected.
		validateType: function (value) {
			var msgs = [];

			if( DEBT_TYPES.indexOf(value) == -1 ) {
				msgs.push('<strong>Shame on you! Type</strong> should not be modified from given values.');
			}
			
			return msgs;
		},

		// Validates principal.
		// Only returns a JS object if error is detected.
		validatePrincipal: function (value) {
			var msgs = [];

			if ( value.length > 18 ) {
				msgs.push('<strong>Principal</strong> cannot be longer than 18 characters.');
			}

			var parsed = parseFloat( value.replace('/,/g', '') );
			if( !parsed ) {
				msgs.push('<strong>Principal</strong> ( ' + value + ' ) was unable to be converted to a valid number.');
			}

			return msgs;
		},

		// Validates rate.
		// Only returns a JS object if error is detected.
		validateRate: function (value) {
			var msgs = [];

			if ( value.length > 4 ) {
				msgs.push('<strong>Rate</strong> cannot be longer than 4 characters.');
			}

			var parsed = parseFloat( value );
			if( !parsed ) {
				msgs.push('<strong>Rate</strong> ( ' + value + ' ) is not a valid percentage.');
				return msgs;
			}

			if ( parsed > 100.00 ) {
				msgs.push('<strong>Rate</strong> ( ' + value + '% ) cannot be over 100%.');
			}

			return msgs;
		},

		// TODO: Validates repayment
		// Only returns a JS object if error is detected.
		validateRepayment: function (value) {
			console.log("TODO: Validate Repayment");
		}
	});

}());
