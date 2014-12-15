/*** this module contains helper functions for visualizations */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, d3, $) {
    var _my = ALGORITHM_MODULE;
    _my.vislib = {};
    
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
	path.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
            .duration(duration)        
	    .delay(delay)
            .ease("linear")
            .attr("stroke-dashoffset", (1-length_to_show_percentage)*totalLength);
    };

    /*** what it says ... cool growing arrow */
    _my.vislib.animateGrowingArrow = function(svg, path, duration, delay, make_proportional, length_to_show_percentage) {
	var arrow = svg.append("svg:path")
	    .attr("d", d3.svg.symbol().type("triangle-down")(10,1));

	_my.vislib.animatePath(path, duration, delay, make_proportional, length_to_show_percentage);
	_my.vislib.animateMovingAlongAPath(arrow, path, duration, delay, make_proportional, length_to_show_percentage, true, -90);
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
	movable_selection.transition()
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
	    // default accessors
	    lineData.source = function(d) { return d.source; }
	    lineData.target = function(d) { return d.target; }
	    // i'm assuming here that supplied datum 
	    // is a link between 'source' and 'target'
	    var points = [
		{lx: lineData.source(d).x, ly: lineData.source(d).y},
		{lx: lineData.target(d).x, ly: lineData.target(d).y}
	    ];
	    return line(points);
	}
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
    return _my;
}(ALGORITHM_MODULE || {}, d3, $));
