var app = app || {};

//
// PieChart generation library
//
// Dependencies:
//		Paper.js
//		Underscore.js
{
	'use strict';

	app.PieChart = function() {
		
		//
		//  Setup
		//
		this.setup = function(canvas) {
                        // Create an empty project and a view for the canvas:
                        paper.setup(canvas);

			// Save context
			var context = this;

                        // Define hit options, create a new tool, and define a mouse move handler
                        // TODO: Optimize hit test options (including bounds)
                        var hitOptions = {
                                //segments: true,
                                //stroke: true,
                                fill: true,
                                tolerance: 0
                        };

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
		
		//
		//  Update
		//
                // Draw a pie chart using Paper.js vector graphics scripting library.
                // Create a new path for each non-zero entry in the data array
                // TODO: Interaction: MouseOver (or click) to scale and transform
                // TOOD: Animation: onFrame handler to animate scale and transform
		this.update = function(values, colors) {
		      	// TODO: Consider removing this. For now remove all active layer children
                        //       before adding new paths.
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
                                        var offset = sumTo(values, idx);

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

                                        // Add slice to active layer
                                        paper.project.activeLayer.addChild(path);

                                        // Set interaction variables
                                        this.originalPos.push(paper.project.activeLayer.children[idx].position);
                                        this.halfwayPos.push(halfway);
                                } else {
                                        var circle = new paper.Path.Circle(center, radius);
                                        circle.fillColor = this.colors[idx];
                                }
                        }, this);

                        // Draw the view initially. Can be removed if an onFrame handler is used for animation.
                        paper.view.draw();
		},

                // TODO: Document
                sumTo = function(a, i) {
                        var sum = 0;
                        for (var j = 0; j < i; j++) {
                                sum += a[j];
                        }
                        return sum;
                }
	}
}
