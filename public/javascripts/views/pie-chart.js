var app = app || {};

$(function( $ ) {
	'use strict';

	// PieChart View
	// ---------------

	// This view renders an interactive pie chart given a set of data.
	// Requires width and height to be passed in during construction.
	app.PieChartView = Backbone.View.extend({

		// The DOM element for a pie chart is a canvas
		tagName: 'canvas',

		// class
		className: 'pie-chart',
	
		// Delegated events
		events: {
		},

		// At initialization we bind to the relevant events in the 'Debts"
		// so that we can redraw this chart dynamically.
		initialize: function() {
			// TODO: Bind to only required events
			window.app.Debts.on( 'all', this.render, this );
		},

		// Rendering the pie chart means redrawing it based on data from the Debts collection.
		render: function( eventName ) {
			console.log( 'PieChart render() called with "' + eventName + '"' );

			// Only attempt to draw the pie char if there are models in the Debts collection.
			if ( app.Debts.length  > 0 ) {
				console.log('-- attempting to draw pie chart');

				// Map each debt type to a value that is the sum of all debts of that type.
				// Query the Debts collection for all models of a given type, and reduce the
				// resulting array down to one value.
				var totals = _.map(DEBT_TYPES, function(type) {
					return _.reduce(app.Debts.where({ type: type }), function(sum, debt) {
						return sum + debt.attributes.principal;
					}, 0);
				});

				// The values now need to be normalized to add up to 360.
				// Start by finding the sum of all the values, then iterate over each one
				// and normalize it.
				var totalSum = _.reduce(totals, function(sum, num) {
					return sum + num;
				});
				this.data = _.map(totals, function(num) {
					return (num/totalSum) * 360;
				});


				// TODO: Draw the Pie Chart
				// TODO: Set the width and height so the pie chart doesn't look funny
				this.el.width = 570;
				this.el.height = 290;			

				var canvas = this.el;
				var context = canvas.getContext("2d");

				this.colors = ['#FA2', '#999', 'FireBrick', 'Navy', 'DarkGreen', '#333', 'Purple'];
				for (var i = 0; i < this.data.length; i++) {
					this.drawSlice(canvas, context, i);
				}
			}
	
			return this;
		},

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.Debts.off( null, null, this );
		},

		// TODO: Document
		drawSlice: function( canvas, context, idx ) {
			context.save();
			var centerX = Math.floor(canvas.width / 2);
			var centerY = Math.floor(canvas.height / 2);
			var radius = Math.floor(canvas.width / 4);

			var startingAngle = this.toRadians(this.sumTo(this.data, idx));
			var arcSize = this.toRadians(this.data[idx]);
			var endingAngle = startingAngle + arcSize;

			context.beginPath();
			context.moveTo(centerX, centerY);
			context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
			context.closePath();

			context.fillStyle = this.colors[idx];
			context.fill();

			context.strokeStyle = 'GhostWhite';
			context.lineWidth = 1;
			context.stroke();

			context.restore();
		},

		// TODO: Document
		toRadians: function( degrees ) {
			return (degrees * Math.PI)/180;
		},

		// TODO: Document
		sumTo: function(a, i) {
			var sum = 0;
			for (var j = 0; j < i; j++) {
				sum += a[j];
			}
			return sum;
		}

	});
});
