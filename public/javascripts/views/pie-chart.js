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
		// so that we can update this chart appropriately. Also setup the 
		// Paper.js canvas object.
		initialize: function() {
			window.app.Debts.on( 'reset add destroy sync', this.render, this );

			this.setupPaper();
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
				this.drawPieChart( _.compact(data), colors );
			}

			return this;
		},

		// On view close, we unbind all callbacks previously bound in initialize().
		onClose: function() {
			window.app.Debts.off( null, null, this );
		},

		// Sets up the Paperjs project and view for the desired canvas element.
		// Creates a mouse tool and registers an onMouseUp handler.
		setupPaper: function() {
			// TODO: Set the width and height and modify when window resizes
			this.el.width = 570;
			this.el.height = 290;	

			// Create an empty project and a view for the canvas:
			paper.setup(this.el);

			// Define hit options, create a new tool, and define a mouse move handler
			// TODO: Optimize hit test options (including bounds)
			var hitOptions = {
				//segments: true,
				//stroke: true,
				fill: true,
				tolerance: 0
			};

			// Save 'this' context so it can be included in closure.
			var context = this;

			var tool = new paper.Tool();
			tool.onMouseMove = function(event) {
				paper.project.activeLayer.strokeColor = 'GhostWhite';
				paper.project.activeLayer.strokeWidth = 1;

				// Move all items to their original positions every time a click happens
				moveItems(paper.project.activeLayer.children, context.originalPos);

				var hitResult = paper.project.hitTest(event.point, hitOptions);
				if (hitResult && hitResult.item) {
					// Re-stroke item, calculate vector and translate item
					hitResult.item.strokeColor = '#333';
					hitResult.item.strokeWidth = 2;
					var viewCenter = paper.view.center;
					var idx = paper.project.activeLayer.children.indexOf(hitResult.item);
					var vector = new paper.Point(context.halfwayPos[idx].subtract([viewCenter.x, viewCenter.y]));
					var destination = vector.normalize().transform(new paper.Matrix(10, 0, 0, 10, 0, 0));		
					hitResult.item.translate(destination);
				}
			};

			// Helper function that given an array of items and positions
			// will update the items' positions accordingly.
			var moveItems = function( items, positions ) {
				for(var i = 0; i < positions.length; i++) {
					items[i].position = positions[i];
				}
			};

		},

		// Draw a pie chart using Paper.js vector graphics scripting library.
		// Create a new path for each non-zero entry in the data array
		// TODO: Interaction: MouseOver (or click) to scale and transform
		// TOOD: Animation: onFrame handler to animate scale and transform
		drawPieChart: function(values, colors) {
			// TODO: Consider removing this. For now remove all active layer children
			// 	 before adding new paths.
			paper.project.activeLayer.removeChildren();

			// Clear interaction variables
			this.originalPos = [];
			this.halfwayPos = [];

			// Pre-compute points that will be used by all paths
			// Use the dimensions of the canvas view to calculate the center of the chart.		
			var radius = Math.floor(paper.view.size.width / 5);
			var center = paper.view.center;

			// Set up a point that corresponds to 0 degrees
			var zero = new paper.Point(center.add([radius, 0]));
			this.colors = colors;		

			_.each(values, function(value, idx, values) {
				// Only draw arcs if there is more than 1 value, otherwise draw a circle
				if ( values.length >  1) {
					// Create a new path and set up a few configuration attributes
					var path = new paper.Path();
					path.fillColor = this.colors[idx];
					path.strokeColor = 'GhostWhite';
					path.closed = true;

					// Calculate the offset degrees by summing previous data values
					var offset = this.sumTo(values, idx);

					// Calculate the first slice corner by rotating the zero point around the center
					// by the offset degrees
					var sliceCorner1 = zero.rotate(offset, center);

					// Calculate the half way point between the first and second slice corners
					var halfway = zero.rotate(offset + value / 2, center);			

					// Calculate the second slice corner by rotating the first by the amount 
					// for this data value
					var sliceCorner2 = sliceCorner1.rotate(value, center);

					// Add the points to the path
					path.add(center);
					path.add(sliceCorner1);
					path.arcTo(halfway, sliceCorner2);

					// Add path to active layer
					paper.project.activeLayer.addChild(path);

					// Set interaction variables
					this.originalPos.push(paper.project.activeLayer.children[idx].position);
					this.halfwayPos.push(halfway);
				} else {
					var circle = new paper.Path.Circle(center, radius);
					circle.fillColor = this.colors[idx];
				}
			}, this);

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
