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

		// Set up the type of alert, if specified, and bind to the 'app:resize' event
		// from the EventAggregator so that we can re-render the alert messages.
		initialize: function() {
			window.app.EventAggregator.on( 'app:resize', this.render, this );

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

		// Re-render the alert, dynamically setting its width to the value of the main content's width
		// minus the size of its padding and borders - 51 px.
                render: function() {
			this.$el.html( this.template({ heading: this.heading, msgs: this.collectMsgs() }) );
			this.$el.width( $('#main').width() - 51 );

                        return this;
                },

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.EventAggregator.off( null, null, this );
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
