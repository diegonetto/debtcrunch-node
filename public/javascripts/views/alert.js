var app = app || {};

$(function() {
        'use strict';

        // Alert View
        // --------------

        // The DOM element for an alert...
        app.AlertView = Backbone.View.extend({

                //... is a div
                tagName: 'div',
	
		className: 'alert alert-block alert-error fade in',

                // Cache the template function for a single alert.
                template: _.template( $('#alert-template').html() ),


                // Re-render the alert
                render: function() {
                        this.$el.html( this.template({ msgs: this.collectMsgs() }) );

                        return this;
                },

		// Reduce all the error messages from the various fields
		// into one array for easier manipulation in the View Template.
		collectMsgs: function() {
			return _.reduce( this.options.errors, function(memo, error) { 
				return memo.concat(error.msgs);
			}, [] );
		}

        });
})
