var app = app || {};

(function() {
	'use strict';

	// Debt Model
	// ----------

	// Our basic **Debt** model has 'title', 'type', 'principle', 'rate', 
	// 'order', 'repayment', and 'monthly' attributes.
	app.Debt = Backbone.Model.extend({

		// Default attributes for the debt. Ensure that each debt created 
		// has 'title', 'type', 'principle', 'rate', 'repayment', and 'monthly' keys.
		defaults: {
			title: 'Double Click to Change',
			type: 'credit',
			principal: 5000,
			rate: 6.8,
			repayment: 10,
			monthly: 0
		},

		// The model listens for changes on itself in order properly
		// update its 'monthly' attribute value when it is first added and
		// subsequently on 'type', 'principal', 'rate', or 'repayment' change.
		initialize: function() {
			this.on( 'add change:type change:principal change:rate change:repayment', this.updateMonthly, this );
		},

		// Helper function that will update the model's 'monthly' attribute
		// based on the current 'type' value. Use the 'silent: true' option
		// when setting so that another 'change' event is not triggered on the model.
		updateMonthly: function( eventName ) {
			switch( this.attributes.type ) {
				case 'Credit Card':
					this.set( { monthly: this.creditCardMonthly() }, { silent: true } );
					break;
				case 'Stafford Loan':
					this.set( { monthly: this.staffordLoanMonthly() }, { silent: true } );
					break;
				case 'Perkins Loan':
					this.set( { monthly: this.perkinsLoanMonthly() }, { silent: true } );
					break;
				case 'Plus Loan':
					this.set( { monthly: this.plusLoanMonthly() }, { silent: true } );
					break
				default:
					this.set( { monthly: 0 }, { silent: true } );
					break;
			}
		},

		// Function that calculates monthly payment for Credit Card debts.
		creditCardMonthly: function() {
			// payment = (1% * principal) + (rate / 12) * principal
			console.log('TODO: Update monthly payment for CREDIT CARD');
			var rate = this.attributes.rate / 100.0;
			var principal = this.attributes.principal;
			return (0.01 * principal) + (rate / 12) * principal;
		},

		// Function that calculates monthly payment for Stafford Loan debts.
		staffordLoanMonthly: function() {
			console.log('TODO: Update monthly payment for STAFFORD LOAN');
			return 20.20;
		},

		// Function that calculates monthly payment for Perkins Loan debts.
		perkinsLoanMonthly: function() {
			console.log('TODO: Update monthly payment for PERKINS LOAN');
			return 30.30;
		},

		// Function that calculates monthly payment for Plus Loan debts.
		plusLoanMonthly: function() {
			console.log('TODO: Update monthly payment for PLUS LOAN');
			return 40.40;
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
				window.app.Debts.trigger('creation-error', this, errors);
				return errors;
			}
		},

		// Validation helper for debt form. Retrieve the error messages
		// from the appropriate validation function and construct an error
		// object if messages were retrieved.
		validateHelper: function(value, field, attrs) {
			var msgs = [];

			// TODO: Consider a smarter alternative to completely skipping validation.
			// Skip validation if the field being validated is the 'monthly' attribute 
			if( field == 'monthly' ) {
				return;
			}
		
			// Skip the individual validations if the input value is empty or is NaN
			if( value == '' ) {
				msgs.push('<strong>' + field.charAt(0).toUpperCase() + 
					field.slice(1) + '</strong> cannot be empty.');
				return {
					field: field,
					msgs: msgs
				};
			} 
			if( !value ) {
				msgs.push('<strong>' + field.charAt(0).toUpperCase() + 
					field.slice(1) + '</strong> does not contain a valid number.');
				return {
					field: field,
					msgs: msgs
				};
			}
			if( value < 0 ) {
				msgs.push('<strong>' + field.charAt(0).toUpperCase() +
					field.slice(1) + '</strong> cannot be a negative number.');
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
		validateTitle: function ( value ) {
			var msgs = [];

			// TODO: Do not allow duplicate titles

			if ( value.length > 35 ) {
				msgs.push('<strong>Title</strong> of debt cannot be longer than 35 characters.');
			}

			return msgs;			
		},

		// Validates type.
		// Only returns a JS object if error is detected.
		validateType: function ( value ) {
			var msgs = [];

			if( DEBT_TYPES.indexOf(value) == -1 ) {
				msgs.push('<strong>Shame on you! Type</strong> should not be modified from given values.');
			}
			
			return msgs;
		},

		// Validates principal.
		// Only returns a JS object if error is detected.
		validatePrincipal: function ( value ) {
			var msgs = [];

			if ( value > 50000000000000000000 ) {
				msgs.push('<strong>Principal</strong> cannot be longer than 50 quintillion.');
			}

			return msgs;
		},

		// Validates rate.
		// Only returns a JS object if error is detected.
		validateRate: function ( value ) {
			var msgs = [];

			if ( value > 100.00 ) {
				msgs.push('<strong>Rate</strong> ( ' + value + '% ) cannot be over 100%.');
			}
			
			return msgs;
		},

		// Validates repayment.
		// Only returns a JS object if error is detected.
		validateRepayment: function (value) {
			var msgs = [];

			if ( value > 12000 ) {
				msgs.push('<strong>Repayment</strong> period cannot be longer than 12000 months.');
			}
			
			return msgs;
		}
	});

}());
