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
			switch ( this.options.type ) {
				case 'error':
					this.$el.addClass('alert-error');
					this.heading = 'Oops!';
					break;
				case 'success':
					this.$el.addClass('alert-success');
					this.heading = 'Woohoo!';
					break;
				case 'info':
					this.$el.addClass('alert-info');
					this.heading = 'Heads up!';
					break;
				default:
					this.heading = 'Warning!';
					break;
			}
		},

		// TODO: Fire off a timer to automatically dismiss alerts that aren't super important.

                // Re-render the alert
                render: function() {
                        this.$el.html( this.template({ heading: this.heading, msgs: this.collectMsgs() }) );

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
