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
		// update its 'monthly' attribute value.
		initialize: function() {
			this.on( 'add change:type change:principal change:rate change:repayment', this.updateMonthly, this );
		},

		// Helper function that will update the model's 'monthly' attribute
		// based on the current 'type' value. Use the 'silent: true' option
		// when setting so that another 'change' event is not triggered on the model.
		updateMonthly: function( eventName ) {
			console.log('--updateMonthly() called');
			var payment = 0.0;

			switch( this.attributes.type ) {
				case 'Credit Card':
					payment = this.creditCardMonthly();
					break;
				case 'Stafford Loan':
					payment=  this.staffordLoanMonthly();
					break;
				case 'Perkins Loan':
					payment = this.perkinsLoanMonthly();
					break;
				case 'Plus Loan':
					payment = this.plusLoanMonthly();
					break
				default:
					payment = this.calculateMonthly(); 
					break;
			}

			// If the monthly payment is greater than the principal, 
			// simply use the principal. This also covers the specific
			// minimum payment stipulations for the various loan programs
			// and credit cards because their adjustments result in a higher
			// payment amount.
			if ( payment > this.attributes.principal ) {
				this.set( { monthly: this.attributes.principal }, { silent: true } );
			} else {
				this.set( { monthly: payment }, { silent: true } );
			}
		},

		// Function that calculates monthly payment for Credit Card debts.
		// Pick the maximum of the monthly payment as calculated by banks
		// (which doesn't care about repayment time) and the normal monthly
		// payment calculation. Adjust the repayment time if necessary.
		creditCardMonthly: function() {
			// payment = (1% * principal) + (rate / 12) * principal
			var rate = this.attributes.rate / 100.0;
			var principal = this.attributes.principal;
			var payment = (0.01 * principal) + (rate / 12) * principal;

			var maxPayment = _.max([this.calculateMonthly(), payment]);

			this.fixRepayment( maxPayment );

			return maxPayment;
		},

		// Calculate monthly payment for Stafford Loan based on minimum payment.
		staffordLoanMonthly: function() {
			var payment = this.calculateMonthly();
			
			// Check to see if payment is less than loan agreement.
			// If so, adjust it and update the repayment time.
			if ( payment < STAFFORD_LOAN_MIN ) {
				this.fixRepayment( STAFFORD_LOAN_MIN );
				return STAFFORD_LOAN_MIN;
			} else {
				return payment;
			}
		},

		// Calculate monthly payment for Perkins Loan based on minimum payment.
		perkinsLoanMonthly: function() {
			var payment = this.calculateMonthly();
			
			// Check to see if payment is less than loan agreement.
			// If so, adjust it and update the repayment time.
			if ( payment < PERKINS_LOAN_MIN ) {
				this.fixRepayment( PERKINS_LOAN_MIN );
				return PERKINS_LOAN_MIN;
			} else {
				return payment;
			}
		},

		// Calculate monthly payment for Plus Loan based on minimum payment.
		plusLoanMonthly: function() {
			var payment = this.calculateMonthly();
			
			// Check to see if payment is less than loan agreement.
			// If so, adjust it and update the repayment time.
			if ( payment < PLUS_LOAN_MIN ) {
				this.fixRepayment( PLUS_LOAN_MIN );
				return PLUS_LOAN_MIN;
			} else {
				return payment;
			}
		},

		// Update the repayment time for this debt based on a minimum payment.
		// Used to correct repayment time for debts with minimum payment stipulations.
		// Only change the repayment time if the newly calculated months value is smaller.
		fixRepayment: function( payment ) {
			var rate = (this.attributes.rate/100.0)/12.0;
			var interest = 0.0;
			var months = 0;
			var principal = this.attributes.principal;
			var curMonths = this.attributes.repayment;			

			while ( principal > 0 ) {
				principal = principal + (principal * rate) - payment;
				months++;
			}

			if ( months < curMonths ) {
				this.set( { repayment: months }, { silent: true } );
			}
		},

		// Calculate monthly payment based on compounding interest formula.
		//  P = L*i / (1 - 1/(1 + i)^n)
		// 	L = prinicpal 	
		// 	i = APR / 12
		// 	n = term in months
		calculateMonthly: function() {
			var i = (this.attributes.rate/100.0)/12.0;
			var L = this.attributes.principal;
			var n = this.attributes.repayment;

			return L*i / (1 - 1/Math.pow(1+i, n));
		}, 

		// Calculate interest gained today
		calculateDailyInterest: function() {
			// TODO Make this more efficient by caching lifetimeInterest calculations
			return this.calculateLifetimeInterest() / this.attributes.repayment / 
				new Date(0,0,0).getDate();
		},

		// Calculate total lifetime interest paid on this debt.
		// http://en.wikipedia.org/wiki/Interest
		calculateLifetimeInterest: function() {
			var B = this.attributes.principal;
			var p = this.attributes.monthly;
			var n = this.attributes.repayment;
			
			return n*p - B;
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
				// TODO: Re-work this
				window.app.Debts.trigger('creation-error', this, errors);

				this.trigger('error:msgs', this, errors);
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
