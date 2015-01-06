/*** this module contains helper functions for visualizations */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, d3, $) {
    console.log("loaded vislib");
    var _my = ALGORITHM_MODULE;
    _my.vislib = {};

    /** animate the swapping of two selections 
      * NOTE: these selections need to support svg transform!
      */
    _my.vislib.swapSelections = function(sel1, coord1, sel2, coord2, durations, y_offset, x_offset) {
	var tran1 = sel1.transition()
	    .duration(durations[0])
	    .attr("transform", "translate(" + (coord1.x - x_offset) + " " + (coord1.y - y_offset) + ")");
	var tran2 = sel2.transition()
	    .duration(durations[0])
	    .attr("transform", "translate(" + (coord2.x + x_offset) + " " + (coord2.y + y_offset) + ")");

	//here we chain the transitions. this is a shorthand for transition.each("end")
	tran1 = tran1.transition()
	    .duration(durations[1])
	    .attr("transform", "translate(" + (coord2.x + x_offset) + " " + (coord1.y - y_offset) + ")");
	tran2 = tran2.transition()
	    .duration(durations[1])
	    .attr("transform", "translate(" + (coord1.x - x_offset) + " " + (coord2.y + y_offset) + ")");

	//here we chain the transitions. this is a shorthand for transition.each("end")
	tran1.transition()
	    .duration(durations[2])
	    .attr("transform", "translate(" + coord2.x + " " + coord1.y + ")");
	tran2.transition()
	    .duration(durations[2])
	    .attr("transform", "translate(" + coord1.x + " " + coord2.y + ")");
    };
    
    /** animate moving growing a path 
     *
     * it seems like this can randomly fail on firefox for bezier curves :/
     */
    _my.vislib.animatePath = function(path, duration, delay, make_proportional, length_to_show_percentage) {
	// the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	var totalLength = path.node().getTotalLength();
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	path.style("display", "inline");
	var transition = 
	path.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
            .duration(duration)        
	    .delay(delay)
            .ease("linear")
            .attr("stroke-dashoffset", (1-length_to_show_percentage)*totalLength);

	return transition;
    };

    /*** what it says ... cool growing arrow */
    _my.vislib.animateGrowingArrow = function(svg, path, duration, delay, make_proportional, length_to_show_percentage) {
	var arrow = svg.append("svg:path")
	    .attr("d", d3.svg.symbol().type("triangle-down")(10,1));

	_my.vislib.animatePath(path, duration, delay, make_proportional, length_to_show_percentage);
	return _my.vislib.animateMovingAlongAPath(arrow, path, duration, delay, make_proportional, length_to_show_percentage, true, -90);
    }

    /*** ice cold coolness!! takes a selection which should be translateable and animates it moving along a path
     * .. with_rotate only works properly for straight paths .. we could calculate tangent more often too tho so
     * maybe in the future
     */
    _my.vislib.animateMovingAlongAPath = function(movable_selection, path, duration, delay, make_proportional, length_to_show_percentage, with_rotate, with_rotate_extra_angle) {
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	var transition = movable_selection.transition()
	    .duration(duration)
	    .delay(delay)
	    .ease("linear")
	    .attrTween("transform", translateAlong(path.node()))

	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
	    var l = path.getTotalLength() * length_to_show_percentage;
	    var rot_tran = "";
	    if (with_rotate !== undefined && with_rotate === true) {
		var ps = path.getPointAtLength(0);
		var pe = path.getPointAtLength(l);
		var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI);
		if (with_rotate_extra_angle !== undefined) {
		    angl += with_rotate_extra_angle;
		}
		rot_tran = "rotate(" + angl + ")";
	    }
	    return function(d, i, a) {
		return function(t) {
		    var p = path.getPointAtLength(t * l);
		    return "translate(" + p.x + "," + p.y + ")" + rot_tran;
		};
	    };
	}
	return transition;
    };
    
    /** return a diagonal generator where the interpolation can be set
      * so that various types of lines can be created */
    _my.vislib.interpolatableDiagonal = function(interpolateType) {
	// kudos to elusive-code on stackoverflow for this nice code
	var line = d3.svg.line()
            .x( function(point) { return point.lx; })
            .y( function(point) { return point.ly; })

	if (interpolateType !== undefined) {
	    line = line.interpolate(interpolateType);
	}

	function lineData(d){
	    // i'm assuming here that supplied datum 
	    // is a link between 'source' and 'target'
	    var points = [
		{lx: lineData.source(d).x, ly: lineData.source(d).y},
		{lx: lineData.target(d).x, ly: lineData.target(d).y}
	    ];
	    return line(points);
	}
	// default accessors
	lineData.source = function(d) { return d.source; };
	lineData.target = function(d) { return d.target; };
	lineData.inverted = function() {
	    var temp = lineData.source;
	    lineData.source = lineData.target;
	    lineData.target = temp;
	    return lineData;
	};
	return lineData;
    };

    /** add a svg:defs with an arrow market to be used with non-growing paths */
    _my.vislib.appendMarkerDefs = function(svg, marker_id, marker_path) {
	if (marker_path === undefined) {
	    marker_path = "M2,2 L2,11 L10,6 L2,2";
	}
	svg.append("svg:defs")
	    .append("svg:marker")
	    .attr("id", marker_id)	
	    .attr("refX", 2)
	    .attr("refY", 6)
	    .attr("markerWidth", 13)
	    .attr("markerHeight", 13)
	    .attr("orient", "auto")
	    .append("svg:path")
	    .attr("d", marker_path);
    };


    /******* EXPERIMENTAL ***********/
/** animate moving growing a path 
     *
     * it seems like this can randomly fail on firefox for bezier curves :/
     */
    _my.vislib.animatePaths = function(paths, duration, delay, make_proportional, length_to_show_percentage) {
	// the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	var totalLength = 0;
	paths.each(function(d, i) {
	    // the node() function is only available on the selection object and not its elements
	    var this_path = d3.select(this);
	    totalLength = Math.max(this_path.node().getTotalLength(), totalLength);
	});
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	paths.style("display", "inline");
	var transition = 
	paths.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
            .duration(duration)        
	    .delay(delay)
            .ease("linear")
            .attr("stroke-dashoffset", (1-length_to_show_percentage)*totalLength);

	return transition;
    };

    var uniq_id = 0;
    /*** what it says ... cool growing arrow */
    _my.vislib.animateGrowingArrows = function(svg, paths, duration, delay, make_proportional, length_to_show_percentage) {
	var arrows = [];
	uniq_id++;
	paths.each(function() {
	    arrows.push(svg.append("svg:path")
		.attr("class", "fft-arrow fft-arrows-generated-with" + uniq_id) 
		.attr("d", d3.svg.symbol().type("triangle-down")(10,1)));
	});
	var movable_selections = svg.selectAll(".fft-arrow.fft-arrows-generated-with" + uniq_id);
	_my.vislib.animatePaths(paths, duration, delay, make_proportional, length_to_show_percentage);
	return _my.vislib.animateMovingAlongPaths(movable_selections, paths, duration, delay, make_proportional, length_to_show_percentage, true, -90);
    }

    /*** ice cold coolness!! takes a selection which should be translateable and animates it moving along a path
     * .. with_rotate only works properly for straight paths .. we could calculate tangent more often too tho so
     * maybe in the future
     */
    _my.vislib.animateMovingAlongPaths = function(movable_selections, paths, duration, delay, make_proportional, length_to_show_percentage, with_rotate, with_rotate_extra_angle) {
	if (movable_selections.size() != paths.size()) {
	    throw "In animateMovingAlongPaths, the length of movable_selections must match the length of paths. " + movable_selections.size() + " != " + paths.size();
	} 
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	var translateFunctions = [];
	paths.each(function(d, i) {
	    // the node() function is only available on the selection object and not its elements
	    var this_path = d3.select(this);
	    translateFunctions.push({ "translateAlong" : translateAlong(this_path.node())});
	});
	
	var transition = movable_selections
	    .data(translateFunctions)
	    .transition()
	    .duration(duration)
	    .delay(delay)
	    .ease("linear")
	    .attrTween("transform", function(d) { return d.translateAlong(); })

	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
	    var l = path.getTotalLength() * length_to_show_percentage;
	    var rot_tran = "";
	    if (with_rotate !== undefined && with_rotate === true) {
		var ps = path.getPointAtLength(0);
		var pe = path.getPointAtLength(l);
		var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI);
		if (with_rotate_extra_angle !== undefined) {
		    angl += with_rotate_extra_angle;
		}
		rot_tran = "rotate(" + angl + ")";
	    }
	    return function(d, i, a) {
		return function(t) {
		    var p = path.getPointAtLength(t * l);
		    return "translate(" + p.x + "," + p.y + ")" + rot_tran;
		};
	    };
	}
	return transition;
    };

    /** fetch the window coordinates of an element accounting for scroll */
    _my.vislib.getOffsetRect = function(elem) {
	// (1)
	var box = elem.getBoundingClientRect()
	
	var body = document.body
	var docElem = document.documentElement
	
	// (2)
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
	
	// (3)
	var clientTop = docElem.clientTop || body.clientTop || 0
	var clientLeft = docElem.clientLeft || body.clientLeft || 0
	
	// (4)
	var top  = box.top +  scrollTop - clientTop
	var left = box.left + scrollLeft - clientLeft
	
	return { y: Math.round(top), x: Math.round(left) }
    }
    _my.vislib.getCoordsInSvg = function(elem, svg_elem) {
	var document_coords_elem = _my.vislib.getOffsetRect(elem);
	var document_coords_svg = _my.vislib.getOffsetRect(svg_elem.node());
	return { "y": document_coords_elem.y - document_coords_svg.y, "x": document_coords_elem.x - document_coords_svg.x};
    }
    _my.vislib.getCoordWithTranApplied = function(shape_and_coord, svg) {
	console.log(svg);
	var matrix = shape_and_coord.shape.getCTM();
	// transform a point using the transformed matrix
	var position = svg.createSVGPoint();
	position.x = shape_and_coord.coord.x;
	position.y = shape_and_coord.coord.y;
	position = position.matrixTransform(matrix);
	return position;
    }

    _my.vislib.addSpeedGauge = function(holder_selector, scale) {
	var labelData = [{l:'Very Slow', o: '0.8em'},
			 {l:'Slow', o: '1.8em'},
			 {l:'Medium', o:'1.1em'},
			 {l:'Fast', o:'2.1em'},
			 {l:'Very Fast', o:'1em'}];
	var arcColorFn = ['#0eb149', '#8ac441', '#ffef00', '#f5801e', '#ee1e26'];

	var gaugeObj = gauge(labelData, arcColorFn, holder_selector, {scale: scale}); 
	gaugeObj.render(5);

	function gauge(labelData, arcColorFn, container, configuration) {
	    var that = {};
	    var config = {size: 200,
			  clipWidth: 260,
			  clipHeight: 100,
			  ringInset: 20,
			  ringWidth: 20,
			  pointerWidth: 10,
			  pointerTailLength: 5,
			  pointerHeadLengthPercent: 0.9,
			  minAngle: -90,
			  maxAngle: 90,
			  transitionMs: 750,
			  fontSize: 8,
			  scale: 1
	    };
	    var range = undefined;
	    var r = undefined;
	    var pointerHeadLength = undefined;
	    var value = 0;
	    var majorTicks = labelData.length;
	    var minValue = 0;
	    var maxValue = 2*labelData.length;
	    
	    var svg = undefined;
	    var arc = undefined;
	    var scale = undefined;
	    var ticks = undefined;
	    var tickData = undefined;
	    var pointer = undefined;

	    function deg2rad(deg) {
		return deg * Math.PI / 180;
	    }
	    
	    function newAngle(d) {
		var ratio = scale(d);
		var newAngle = config.minAngle + (ratio * range);
		return newAngle;
	    }
	    function getValue() {
		return value;
	    }
	    that.getValue = getValue();
	    
	    var prop = undefined;
	    for ( prop in configuration ) {
		config[prop] = configuration[prop];
	    }
	    
	    range = config.maxAngle - config.minAngle;
	    r = config.size / 2;
	    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

	    // a linear scale that maps domain values to a percent from 0..1
	    scale = d3.scale.linear()
		.range([0,1])
		.domain([minValue, maxValue]);
	    
	    ticks = scale.ticks(majorTicks);
	    tickData = d3.range(majorTicks).map(function() {return 1/majorTicks;});
	    
	    arc = d3.svg.arc()
		.innerRadius(r - config.ringWidth - config.ringInset)
		.outerRadius(r - config.ringInset)
		.startAngle(function(d, i) {
		    var ratio = d * i;
		    return deg2rad(config.minAngle + (ratio * range));
		})
		.endAngle(function(d, i) {
		    var ratio = d * (i+1);
		    return deg2rad(config.minAngle + (ratio * range));
		})
		.padAngle(0.01)

	    
	    function render(newValue) {
		svg = d3.select(container)
		    .append('svg:svg')
		    .attr('class', 'gauge')
		    .attr('width', config.clipWidth*config.scale)
		    .attr('height', config.clipHeight*config.scale)
		    .attr("transform", "scale(" + config.scale + ")")
		    .append("g")
		    .attr("transform", "translate(" + (r*1) + "," + (r*.95) + ")");		
		var defs = svg.append('defs')
		var arcs = svg.append('g')
		    .attr('class', 'arc')
		
		defs.selectAll('path')
		    .data(tickData)
		    .enter().append('path')
		    .attr('id', function(d, i) { return "mypath" + i + "-of(" + holder_selector + ")"; })
		    .attr('d', arc);
		arcs.selectAll('use')
		    .data(tickData)
		    .enter().append('use')
		    .attr('xlink:href', function(d, i) { return "#mypath" + i + "-of(" + holder_selector + ")"; })
		    .attr('fill', function(d, i) {
			return arcColorFn[i % arcColorFn.length];
		    })
		svg.selectAll('.arc-label')
		    .data(labelData)
		    .enter().append('text')
		    .attr('dx', function(d) { return d.o; })
		    .attr('dy', '-0.7em')
		    .attr('font-size', config.fontSize + "px")
		    .attr('class', 'arc-label')
		    .append('textPath')
		    .attr('xlink:href', function(d, i) { return "#mypath" + i + "-of(" + holder_selector + ")"; })
		    .text(function(d) { return d.l; });

		var lineData1 = [[0, -pointerHeadLength], 
				 [config.pointerWidth / 2, 0],
				 [0, config.pointerTailLength],
				 [0, -pointerHeadLength] ];
		var lineData2 = [[0, -pointerHeadLength], 
				 [-config.pointerWidth / 2, 0],
				 [0, config.pointerTailLength],
				 [0, -pointerHeadLength] ];
		var pointerLine = d3.svg.line().interpolate('monotone');
		pointer = svg.append('g')
		    .attr('transform', 'rotate(' +config.minAngle +')')
		pointer.append('circle').attr('class', 'circle-big')
		    .attr('r', config.pointerWidth / 2);
		var pg1 = pointer.append('g').data([lineData1])
		    .attr('class', 'pointer_dark')
		var pg2 = pointer.append('g').data([lineData2])
		    .attr('class', 'pointer_light')
		pointer.append('circle').attr('class', 'circle-small')
		    .attr('r', config.pointerWidth / 4);
		pg1.append('path')
		    .attr('d', pointerLine)
		pg2.append('path')
		    .attr('d', pointerLine)
		
		update(newValue === undefined ? 0 : newValue);
	    }
	    that.render = render;
	    
	    function update(newValue) {
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
		    .duration(config.transitionMs)
		    .ease('elastic')
		    .attr('transform', 'rotate(' +newAngle +')');
	    }
	    that.update = update;
	    return that;
	};

	return gaugeObj;
    };

    return _my;
}(ALGORITHM_MODULE || {}, d3, $));
