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
                        this.$el.html( this.template() );

                        return this;
                },

        });
})
