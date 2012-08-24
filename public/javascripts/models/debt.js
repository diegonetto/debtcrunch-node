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
					this.set( { monthly: this.calculateMonthly() }, { silent: true } );
					break;
			}
		},

		// Function that calculates monthly payment for Credit Card debts.
		creditCardMonthly: function() {
			// payment = (1% * principal) + (rate / 12) * principal
			var rate = this.attributes.rate / 100.0;
			var principal = this.attributes.principal;
			return (0.01 * principal) + (rate / 12) * principal;
		},

		// Calculate monthly payment for Stafford Loan based on minimum payment.
		staffordLoanMonthly: function() {
			var payment = this.calculateMonthly();
			return payment > 50.0 ? payment : payment != 0 ? 50.0 : 0;
		},

		// Calculate monthly payment for Perkins Loan based on minimum payment.
		perkinsLoanMonthly: function() {
			var payment = this.calculateMonthly();
			return payment > 40.0 ? payment : payment != 0 ? 40.0 : 0;
		},

		// Calculate monthly payment for Plus Loan based on minimum payment.
		plusLoanMonthly: function() {
			var payment = this.calculateMonthly();
			return payment > 50.0 ? payment : payment != 0 ? 50.0 : 0;
		},

		// Calculate monthly payment based on compounding interest formula.
		//  P = L*i / (1 - 1/(1 + i)^n)
		// 	L = Prinicpal 	
		// 	i = APR / 12
		// 	n = term in months
		calculateMonthly: function() {
			var i = (this.attributes.rate/100.0)/12;
			var L = this.attributes.principal;
			var n = this.attributes.repayment;

			return L*i / (1 - 1/Math.pow(1+i, n));
		}, 

		// Calculate total interest accrued over lifetime of this debt.
		calculateLifetimeInterest: function() {
			// TODO ((pmt - ir*Loan)*(ir + 1)^start +((ir*Loan - pmt)*(ir + 1)^end + ir*pmt*(end - start + 1))*(ir + 1))/(ir*(ir + 1)) 

			var intRate = (this.attributes.rate/100.0)/ 12;
			var monthlyPmt = this.attributes.monthly;
			var principal = this.attributes.principal;
			var start = 1;
			var end = this.attributes.repayment;

			var lifetime = ( (monthlyPmt - intRate*principal)*Math.pow((intRate + 1), start) + 
				((intRate*principal - monthlyPmt)*Math.pow((intRate + 1), end) + intRate*monthlyPmt*(end - start +1))*(intRate +1)) / 
				(intRate*(intRate + 1) );

			console.log('Calculated lifetime interest to be: ' + lifetime);
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
