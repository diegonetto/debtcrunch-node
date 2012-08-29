var app = app || {};

$(function() {
        'use strict';

        // Alert View
        // --------------

        // The DOM element for an alert...
        app.AlertView = Backbone.View.extend({

                //... is a div
                tagName: 'div',
	
		className: 'alert alert-block fade in',

                // Cache the template function for a single alert.
                template: _.template( $('#alert-template').html() ),

		// Set up the type of alert, if specified
		initialize: function() {
			if ( this.options.type ) {
				// TODO: Perform some error checking before adding class
				this.$el.addClass(' alert-' + this.options.type);
			}
		},

                // Re-render the alert
                render: function() {
                        this.$el.html( this.template({ msgs: this.collectMsgs() }) );

                        return this;
                },

		// Reduce all the messages passed into this view into one array
		// for easier manipulation in the View Template.
		collectMsgs: function() {
			return _.reduce( this.options.msgData, function(memo, data) { 
				return memo.concat(data.msgs);
			}, [] );
		}

        });
})
