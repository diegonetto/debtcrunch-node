var app = app || {};

//
// PieChart generation library
//
// Dependencies:
//		Paper.js
//		Underscore.js
//		Accounting.js
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

			// Setup Label to be used

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
                                // Reset slices to their original positions and styles
                               	resetSlices();

				// Perform hit test and verify that their was a resulting item and
				// that the item is one of the slices.
                                var hitResult = paper.project.hitTest(event.point, hitOptions);
                                if (hitResult && hitResult.item && context.slices.indexOf(hitResult.item) >= 0) {
                                        // Re-stroke, calculate vector and translate item
                                        hitResult.item.strokeColor = '#333';
                                        hitResult.item.strokeWidth = 2;
                                        var viewCenter = paper.view.center;
                                        var idx = paper.project.activeLayer.children.indexOf(hitResult.item);
                                        var vector = new paper.Point(context.halfwayPos[idx].subtract([viewCenter.x, viewCenter.y]));
                                        var destination = vector.normalize().transform(new paper.Matrix(10, 0, 0, 10, 0, 0));
                                        hitResult.item.translate(destination);

					// Show items label
					context.labels[idx].firstChild.visible = true;

					// Show amount label
					context.labels[idx].lastChild.visible = true;
                                }

                        };
			
			// Helper function resets the pie slices to their original position
			// and hides their labels.
                        var resetSlices = function() {
                                for(var i = 0; i < context.slices.length; i++) {
					var slice = context.slices[i];
                                        slice.position = context.originalPos[i];
	                                slice.strokeColor = 'GhostWhite';
        	                        slice.strokeWidth = 1;
					context.labels[i].firstChild.visible = false;
					context.labels[i].lastChild.visible = false;
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
		this.update = function(values, colors, labels) {
                        if (colors.length != values.length || labels.length != values.length) {
                                throw 'There must be an equal number of colors and labels as there are values!';
                        }

                        // TODO: Consider removing this. For now remove all active layer children
                        //       before adding new paths.
                        paper.project.activeLayer.removeChildren();

			// Update the view, in case canvas element changed sizes
			paper.view = new paper.View(paper.view.canvas);

                        // The values now need to be normalized to add up to 360.
                        // Start by finding the sum of all the values, then iterate over each one
                        // and normalize it.
                        var totalSum = _.reduce(values, function(sum, num) {
                                return sum + num;
                        });
                        var data = _.map(values, function(num) {
                                return (num/totalSum) * 360;
                        });

		      	// TODO: Consider removing this. For now remove all active layer children
                        //       before adding new paths.
                        paper.project.activeLayer.removeChildren();

                        // Clear interaction variables
                        this.originalPos = [];
                        this.halfwayPos = [];
			this.slices = [];
			this.labels = [];

                        // Pre-compute points that will be used by all paths
                        // Use the dimensions of the canvas view to calculate the center of the chart.
                        var radius = Math.floor(paper.view.size.width / 5);
                        var center = paper.view.center;

                        // Set up a point that corresponds to 0 degrees
                        var zero = new paper.Point(center.add([radius, 0]));

                        _.each(data, function(value, idx, data) {
                                // Only draw arcs if there is more than 1 value, otherwise draw a circle
                                if ( data.length >  1) {
                                        // Create a new path and set up a few configuration attributes
                                        var path = new paper.Path();
                                        path.fillColor = colors[idx];
                                        path.strokeColor = 'GhostWhite';
                                        path.closed = true;

                                        // Calculate the offset degrees by summing previous data values
                                        var offset = sumTo(data, idx);

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
					this.slices.push(path);
                                } else {
                                        var circle = new paper.Path.Circle(center, radius);
                                        circle.fillColor = colors[idx];
                                }
                        }, this);

			// Update color, values, and add create PointText for each label and dollar value.
			// Add them to a custom group, and push to this.labels for interaction handling.
                        this.colors = colors;
			this.dataValues = values;
			for(var i = 0; i < values.length; i++) {
				var title = new paper.PointText(new paper.Point(5, paper.view.size.height/3));
				var percent = (values[i] / totalSum) * 100;
				title.content = labels[i] + '  ' + accounting.toFixed(percent, 1) + '%';
				title.visible = false;
				title.paragraphStyle.justification = 'left';
				title.characterStyle = {
					fontSize: 14,
					font: 'Pacifico',
					fillColor: '#333',
				};
			
				var amount = new paper.PointText(new paper.Point(title.position.add([0, 30])));
				amount.content = accounting.formatMoney(values[i]);
				amount.visible = false;
				amount.paragraphStyle.justification = 'left';
				amount.characterStyle = {
					fontSize: 12,
					font: 'Ubuntu',
					fillColor: 'FireBrick',
				};

				var group = new paper.Group([title, amount]);
				this.labels.push(group);
			}

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
