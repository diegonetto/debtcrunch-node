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

		// DOM id
		id: 'overview-chart',

		// class
		className: 'pie-chart',
	
		// Delegated events
		events: {
		},

		// At initialization we bind to the relevant events in the 'Debts"
		// so that we can update this chart appropriately. Also create a new
		// PieChart object that we will use to draw the overview chart.
		initialize: function() {
			window.app.Debts.on( 'reset add destroy sync', this.render, this );

			// TODO: Set the width and height and modify when window resizes
			this.el.width = 570;
			this.el.height = 290;	

			this.overviewChart = new app.PieChart();
			this.overviewChart.setup(this.el);
		},

		// Rendering the pie chart means redrawing it based on data from the Debts collection.
		render: function( eventName ) {
			console.log( 'PieChartView render() called with "' + eventName + '"' );

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

				// Add the lifetime interest sum to the totals so it will be included in the chart
				totals.push(app.Debts.sumLifetimeInterest());

				// The values now need to be normalized to add up to 360.
				// Start by finding the sum of all the values, then iterate over each one
				// and normalize it.
				var totalSum = _.reduce(totals, function(sum, num) {
					return sum + num;
				});
				var data = _.map(totals, function(num) {
					return (num/totalSum) * 360;
				});

				// Draw the Pie Chart, giving it a compacted (no falsy values) data and color array.
				var colors = ['#FA2', '#999', 'FireBrick', 'Navy', 'DarkGreen', 'GoldenRod', 'Purple', 'DarkCyan'];
				this.overviewChart.update( _.compact(data), colors );
			}

			return this;
		},

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.Debts.off( null, null, this );
		},

	});
});
