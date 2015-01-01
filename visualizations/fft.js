ALGORITHM_MODULE.fft_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }
    var algorithmTabId = "fft-tab";
    var algorithmName = "Fast Fourier Transform";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded fft");


    _my.AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "fft");
    
    var row0 = d3.select("#algoContainer")
    	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
    	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-5")
    var controlsPanel = leftPanel.append("div").attr("class", "row controls")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");

    var leftPanelBody = controlsPanel.append("div").attr("class", "panel-body");
    var ops = leftPanelBody.append("div").attr("class", "options");
    _my.AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);
    _my.AlgorithmUtils.insertCustomControls(ops, algorithmTabId, algorithmName, "Select which algorithm you would like to see visualized:");
    var radios = ops.append("div").attr("class", "buttons")
	.append("div").attr("class", "btn-group-sm").attr("role", "group");

    radios.append("button").attr("id", "fft-trans-btn").attr("class", "btn btn-default fft-radio-button active").attr("type", "button")
	.text("FFT Transform Algorithm");
    radios.append("button").attr("id", "fft-mult-btn").attr("class", "btn btn-default fft-radio-button").attr("type", "button")
	.text("Polynomial Multiplication with FFT");
    
    var visPanel = leftPanel.append("div").attr("class", "row")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-7")
    	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");

    
    
    /*******************************/
    /*      Complex number type    */
    /*******************************/
    var Complex = {};
    Complex.create = function Complex(r, i) {
	if (this.constructor != Complex) {
	    return new Complex(r,i);
	}
	this.real = r;
	this.imaginary = i;
    };
    Complex.create.prototype.getAngle = function() {
	var angle = Math.atan2(this.imaginary, this.real);
	if (angle < 0) {
	    angle += 2*Math.PI;
	}
	return angle;
    }
    Complex.equals = function(c1, c2) {
	return (Math.abs(c1.real - c2.real) < 1e-6 && Math.abs(c1.imaginary - c2.imaginary) < 1e-6);
    }
    Complex.create.prototype.toString = function() {
	function addI(val) {
	    if (val == 1) {
		return "i";
	    }
	    if (val == -1) {
		return "-i";
	    }
	    return val + "i";
	}
	var ri = Math.round(this.imaginary, -2);
	var rr = Math.round(this.real, -2);
	if (ri == 0) {
	    return "" + rr;
	}
	if (rr == 0) {
	    return "" + addI(ri);
	}
	return "" + rr + " " + (this.imaginary >= 0 ? "+ " : "- ") + addI(Math.abs(ri));
    };
    Complex.ZERO = Complex.create(0,0);

    Complex.add = function add(a, b) {
	if (a == undefined && b == undefined) {
	    return Complex.create(0,0);
	}
	if (a == undefined) {
	    return b;
	}
	if (b == undefined) {
	    return a;
	}
    	return Complex.create(a.real + b.real,a.imaginary + b.imaginary);
    };

    Complex.sub = function sub(a, b) {
	if (a == undefined && b == undefined) {
	    return Complex.create(0,0);
	}
	if (a == undefined) {
	    return b;
	}
	if (b == undefined) {
	    return a;
	}
	return Complex.create(a.real - b.real, a.imaginary - b.imaginary);
    };

    Complex.mult = function mult(a, b) {
	if (a == undefined || b == undefined) {
	    return Complex.create(0,0);
	}
	return Complex.create(a.real*b.real - a.imaginary*b.imaginary, a.real*b.imaginary + a.imaginary*b.real);
    };

    Complex.calc_unity = function calc_unity(idx, N, Complex) {
	var coef = (2*Math.PI*idx) / N;
	return Complex.create(Math.cos(coef), Math.sin(coef));
    };
    
    /***********************
     **    Functions     ***
     **********************/
    function FFT_transform(poly, start, N, helper_arr, Complex) {
    	if (N == 1) {
	    return;
    	}
	var nearest2Pow = 1 << Math.ceil(Math.log2(N));
	if (N != nearest2Pow) {
	    //zero pad
	    for (var z = N; z < nearest2Pow; z++) { 
		poly.push(Complex.ZERO);
	    }
	    N = nearest2Pow;
	}
	var half_N = Math.floor(N / 2);
    	for(var i=0; i < half_N; i++) {
    	    var x = start + 2*i;
    	    helper_arr[i] = poly[x];
    	    helper_arr[i + (half_N)] = poly[x+1];
    	}
    	for(var j=0; j < N; j++) {
    	    poly[start + j] = helper_arr[j];
    	}
    	FFT_transform(poly, start, half_N, helper_arr, Complex);
    	FFT_transform(poly, start + half_N, half_N, helper_arr, Complex);
    	for (var k=0; k < half_N; k++) {
	    var unity = Complex.calc_unity(k, N, Complex);
    	    var temp = Complex.mult(unity,  poly[start + half_N + k]);
    	    helper_arr[k] = Complex.add(poly[start + k], temp);
    	    helper_arr[k + half_N] = Complex.sub(poly[start + k], temp);
    	}
    	for(var l=0; l < N; l++) {
    	    poly[start + l] = helper_arr[l];
    	}
    }

    function FFT_multiply(p, q, FFT_transform, Complex) {
	var N = p.length + q.length - 1;
    	var nearest2Pow = 1 << Math.ceil(Math.log2(N));
	/* zero pad */
	for (var z = p.length; z < nearest2Pow; z++) { 
	    p.push(Complex.ZERO);
	}
	for (var z = q.length; z < nearest2Pow; z++) { 
	    q.push(Complex.ZERO);
	}
    	FFT_transform(p, 0, nearest2Pow, [], Complex);
    	FFT_transform(q, 0, nearest2Pow, [], Complex);
    	var res = [];
    	for (var i=0; i < nearest2Pow; i++) {
    	    res[i] = Complex.mult(p[i], q[i]);
    	}
    	FFT_transform(res, 0, nearest2Pow, [], Complex);
    	// rearrange roots of unity
    	for (var i=1; i < nearest2Pow / 2; i++) {
    	    var temp = res[i];
    	    res[i] = res[nearest2Pow - i];
    	    res[nearest2Pow - i] = temp;
    	}
    	for (var i=0; i < nearest2Pow; i++) {
    	    res[i].real = (res[i]).real / (nearest2Pow);
    	}
	return res;
    }

    /**********************
     **   Set up SVG   ****
     *********************/
    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var width = 900;
    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  width + "px")
	.attr("height", "1050px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /**********************
     ** Wire up the Algos *
     **********************/
    var poly_ev = [Complex.create(-1,0), Complex.ZERO, Complex.create(-5,0)];
    var poly_p = [Complex.create(11,0), Complex.ZERO, Complex.create(-3,0), Complex.create(2,0)];
    var poly_q = [Complex.create(-3,0), Complex.create(3.4, 0), Complex.create(-7, 0)];

    var elem_between = 2;
    var btw_elem = 10;
    var per_width = (width - 100) / (poly_p.length + poly_q.length + elem_between);


    /***** this function creates a tree layout that we can then write the polynomials to and move them around in*/
    function prepareLayoutForPolys(N, node_size, svg, group_name, left_margin, top_margin, inverted) {
	N = 1 << Math.ceil(Math.log2(N));
	var node_num = 2*N - 1;
	var last_level = Math.floor(Math.log2(N)) + 2;
	var group = svg.append("g").attr("id", group_name). attr("transform", "translate(" + left_margin + ", " + top_margin + ")");
	var data = [];
	for (var i=1;i<=node_num;i++) {
	    data.push({id: i, label: 0});    
	};
	var lbl_cnt = 2;
	function preorder_label(node) {
	    if (node > data.length) return;
	    data[node - 1].label = lbl_cnt;
	    lbl_cnt++;
	    preorder_label(node*2);
	    preorder_label(node*2 + 1);
	};
	preorder_label(1);
	data.splice(0,0,{id: -1, label:0}, {id: 0, label:1});
	var tree = d3.layout.tree()
	    .children(function(d) {
		if (d.v.id <= 0) { return [{v: data[d.v.id + 2]}]; }
		if (2*d.v.id + 1 >= data.length-1) { return []; }
		return [{v: data[2*d.v.id + 1]}, {v: data[2*d.v.id + 2]}];
	    })
	    .nodeSize([node_size, 4*node_size])
	    //.size([500, 500])
	    .separation(function(a, b) {
		return (a.parent == b.parent ? ((a.depth == last_level) ? 1.5 : 6) : 2);
	    })
	var link_path_gen = (inverted === true) ? _my.vislib.interpolatableDiagonal("linear").inverted() : _my.vislib.interpolatableDiagonal("linear");
	var nodes = tree.nodes({v: data[0]})
	group.selectAll(".fft-link")
	    .data(tree.links(nodes))
	    .enter()
	    .append("path")
	    .attr("class", function(d) {return "fft-link " + "fft-link-to" + link_path_gen.target(d).v.label; })
	    .attr("d", link_path_gen)
	var node_gs = 
	    group.selectAll(".fft-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fft-node")
	    .attr("id", function(d) { return "fft-node-num" + d.v.label; })
	    .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")";})
	node_gs.append("circle").attr("class", "fft-node-circle").attr("r", node_size / 2);
    }// end of prepareLayout

    /**** this function places a polynomial into the tree */
    function drawCoefs(poly, elem_to_draw_into, invisible) {
	var elems = [];
	for(var i=0; i < poly.length; i++) {
	    elems.push({"val" : "" + poly[i], "key": i, 
			"sign": (poly[i].real < 0 ? ((i != poly.length-1) ? " - " : "-") : ((i != poly.length-1) ? " + " : ""))});
	}
	var textFields = elem_to_draw_into
	    .selectAll(".fft-coef-text-" + invisible)
	    .data([1]) // we just want this text field to be added once no mater how many times this function is called
	    .enter()
	    .append("text")
	    .attr("class", "fft-poly fft-coef-text-" + invisible)
	    .attr("font-size", "30")
	    .attr("dy", (invisible === true) ? "0em" : "-1em")
	    .attr("text-anchor", "middle")
	    .selectAll("tspan")
	    .data(elems)
	    .enter()
	    .append("tspan")
	    .attr("class", function(d) { return "fft-coef-" + d.key;})
	    .attr("style", (invisible === true) ? "visibility:hidden" : "visibility:visible")
	    .text(function(d){return d.val})
	    .append("tspan")
	    .attr("style", function(d, i) { return i == elems.length-1 ? "display:none" : "display:inline"; })
	    .text(",");
    }

    function drawPoly(poly, elem_to_draw_into, sin_zeroes) {
	var elems = [];
	for(var i=poly.length-1; i >= 0; i--) {
	    if (sin_zeroes === true && Complex.equals(poly[i], Complex.ZERO)) { 
		continue;
	    }
	    elems.push({"val" : Math.abs(poly[i].real), "key": i, 
			"sign": (poly[i].real < 0 ? ((i != poly.length-1) ? " - " : "-") : ((i != poly.length-1) ? " + " : ""))});
	}
	var text = elem_to_draw_into.append("text")
	    .attr("text-anchor", "middle")
	    .attr("font-size", "30")
	    .attr("dy", "-0.6em");
	var textFields = text
	    .selectAll(".fft-poly-elem")
	    .data(elems, function(d) { return d.key; })
	    .enter()
	    .append("tspan")
	    .attr("id", function(d) { return "fft-tspan" + d.key})
	    .attr("class", "fft-poly")
	    .text(function(d) { return d.sign + d.val + (d.key == 0 ? "" : "x"); });
	textFields.filter(function(d) { return d.key >= 2; })
	    .attr("class", "fft-poly fft-has-super")
	    .append("tspan")
	    .attr("class", "fft-super")
	    .attr("font-size", 15)
	    .attr("dy", -15)
	    .text(function(d) { return d.key < 2 ? " " : d.key; })
	//the dy is sticky and moves everything else up so we add another dy=20 to move down
	text.selectAll(".fft-has-super + tspan").attr("dy", 15);
    } // end of draw poly
     
    //drawPoly(poly_p, svg, "p-elem", 0);
    //drawPoly(poly_q, svg, "q-elem", 500);


    function radToDeg(val) { return val * 180 / Math.PI; }

    /******* this function draws a roots of unity circle and returns a diagonal that can be moved around the circle */
    function rootsOfUnityCircle(svg, N, radius, duration, group_name, left_margin, top_margin) {
	var data = [];

	var group = svg.append("g").attr("id", group_name). attr("transform", "translate(" + left_margin + ", " + top_margin + ")");

	for(var idx = 0; idx < N; idx++) {
	    var ci = Complex.calc_unity(idx, N, Complex);
	    data.push({angle: (ci.getAngle() + Math.PI/2), text: ci.toString()});
	}
	data.push({angle: 5*Math.PI/2}); //we need to close the circle

	var radial = d3.svg.arc().innerRadius(radius).outerRadius(radius)
	    .endAngle(function(d, i) { return data[(i+1) % data.length].angle; })
	    .startAngle(function(d, i) { return data[i].angle; })

	// this arc generator is only used to compute a point on the circle using arc.centroid so that we
	// can use this point to move around the circle
	var total_circle = d3.svg.arc().innerRadius(radius).outerRadius(radius)
	    .endAngle(function(d) { return 7*Math.PI/2 - 0.001; })
	    .startAngle(function(d) { return 3*Math.PI/2; })

	var point_on_crc = total_circle.centroid(data[0], 0);
	var center_of_crc = [point_on_crc[0] - total_circle.outerRadius()(), point_on_crc[1]];

	var d1 = d3.svg.diagonal()
	    .source(function() {
		return {"x": center_of_crc[0], "y": center_of_crc[1]}; })
	    .target(function() {
		return {"x": point_on_crc[0], "y": point_on_crc[1]}; })
	
    
	  var path = group.selectAll(".arc").data(data).enter().append("path").attr("class", "root-of-unity-circle").attr("d", radial).each(function(d, i) {
	      // the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	      _my.vislib.animatePath(d3.select(this), duration, (duration / 2) * i, false, 1);
	  });

	// our diagonal inside the circle that points at the roots of unity
	var diagonal = group.append("path").attr("d", d1(1)).attr("class","root-of-unity-arrow").attr("id", "unity-arrow")
	    .style("display", "none")
	    /*.transition()
	    .duration(duration)
	    .attr("transform", "rotate(359.99 " + center_of_crc[0] + " " + center_of_crc[1] + ")")*/


	/*var radial0 = d3.svg.line.radial().radius(10).angle(function(d,i) { return d.a; })*/
	var scale_factor = radius / 80;
	var unit_groups = group.selectAll("fft-unit-circle-roots")
	    .data(data.slice(0, data.length-1))
	    .enter()
	    .append("g")
	    .attr("class", "fft-unit-circle-roots")
	    .style("display", "none")
	
        unit_groups.append("circle")
	    .attr("class", "fft-root")
	    .attr("r", 10 * scale_factor);

	// the shadow adds a white shadow so that our text is visible no matter whats nearby
	var text_shadow = unit_groups.append("text")
	    .attr("class", "fft-text-shadow")
	    .attr("dx", (1 * scale_factor) + "em")
	    .attr("dy", (8 * scale_factor) + "px")
	    .attr("font-size", "1.5em")
	    .text(function(d) { return d.text; })
	    .attr("transform", function(d) { return "rotate(" + -radToDeg(d.angle - Math.PI/2) + ")"; })
	var text = unit_groups.append("text")
	    .attr("class", "fft-text")
	    .attr("id", function(d, i) { return "fft-root-of-unity" + i; })
	    .attr("dx", (1 * scale_factor) + "em")
	    .attr("dy", (8 * scale_factor) + "px")
	    .attr("font-size", "1.5em")
	    .text(function(d) { return d.text; })
	    .attr("transform", function(d) { return "rotate(" + -radToDeg(d.angle - Math.PI/2) + ")"; })

	unit_groups.transition()
	    .transition()
	    .duration(0)
	    .attr("transform", "translate(" + point_on_crc[0] + ", " + point_on_crc[1] + ")")
	    .transition() //chaining transitions here (same as doing each("end", )
	    .duration(0)
	    .delay(function(d, i) { return (duration/2) * i; })
	    .attr("transform", function(d) { return "rotate(" + radToDeg(d.angle - Math.PI/2) + " " + center_of_crc[0] + " " + center_of_crc[1] + ") translate(" + point_on_crc[0] + ", " + point_on_crc[1] + ")" ;})
	    .style("display", "inline");

	return diagonal;
    } // end of roots of unity

    function drawLayerLabel(svg, N, rec_depth, left_offset, top_offset) {
	svg.selectAll("#fft-layer-depth-node" + rec_depth)
	    .data([rec_depth]) // we attach data and enter so that if we run this multiple it only gets added once
	    .enter()
	    .append("text")
	    .attr("x", left_offset)
	    .attr("y", top_offset)
	    .attr("font-size", 35)
	    .attr("dy", "-1em")
	    .attr("id", "fft-layer-depth-node" + rec_depth)
	    .attr("class", "fft-n-value")
	    .text("N = " + N + ":");
    }

    /********* here we wire the callbacks ************/
    //rootsOfUnityCircle(svg, 4, 80, 3000, "test-circle", 200, 200);
    var ev_calls = [];
    var calc_calls = [];
    calc_calls[20] = function() {

	//
	
    }
    /*
    var emr = [{source: {x:10, y:10},target: {x:500, y:500}}];
   var ppp = svg.append("path").style({"stroke": "black", "fill": "white"})
	.attr("d", _my.vislib.interpolatableDiagonal("linear")(emr[0]))

    _my.vislib.animateGrowingArrow(svg, ppp, 2000, 0);
    */

    var recursion_depth = 0;
    var current_id = 1;
    var tree_x_offset = 310;
    var tree1_y_offset = 70;
    var tree2_y_offset = 1660;

    ev_calls[0] = function(poly, start, N) {
	recursion_depth++;
	if (recursion_depth == 1) {
	    current_id = 1;
	    svg.select("#fft-poly-tree").remove();
	    svg.select("#fft-poly-tree-upside-down").remove();
	    prepareLayoutForPolys(4, 50, svg, "fft-poly-tree", tree_x_offset, tree1_y_offset);
	    prepareLayoutForPolys(4, 50, svg, "fft-poly-tree-upside-down", 0, 0, true);
	    d3.select("#fft-poly-tree-upside-down").attr("transform", "translate(" + tree_x_offset + ", " + tree2_y_offset+") scale(-1,1) rotate(180)");
	    var top_down_tree = d3.select("#fft-poly-tree");
	    drawPoly(poly.slice(start, start + N), top_down_tree.select("#fft-node-num" + 0), true);
	}
	else {
	    current_id++;
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + current_id), 1000, 0, false, 0.7);
	    transition.each("end", function() {
		drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false);
	    });
	    drawLayerLabel(svg, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	}
    };
    ev_calls[10] = function(poly, start, N) {
	var top_down_tree = d3.select("#fft-poly-tree");
	var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + 1), 1000, 0, false, 0.7);
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	transition.each("end", function() {
	    drawPoly(poly.slice(start, start + N), elem_to_draw_into, false);
	});
	drawLayerLabel(svg, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
    }
    ev_calls[13] = { "pre" : function(poly, start, N) {
	if (recursion_depth == 1) {
	    current_id++;
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + current_id), 1000, 0, false, 0.7);
	    transition.each("end", function() {
		drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false);
		d3.select(this).transition().each("end", function() {
		    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
		});
	    });
	    drawLayerLabel(svg, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	}
	else {
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
	}
	return 1200;
    }};
    ev_calls[15] = function(poly, start, i, x, half_N) {
	var top_down_tree = d3.select("#fft-poly-tree");
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id)
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + i).text("" + poly[x] + ",").style("visibility", "visible");

	var ci = visible_coefs.select(".fft-coef-" + (x - start)).classed("fft-coefs-highlight", true)
	var cf = invisible_coefs.select(".fft-coef-" + i).classed("fft-coefs-highlight", true)
	setTimeout(function() {
	    ci.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	}, 400);
	return 400;
    };
    ev_calls[16] = function(poly, start, i, x, half_N, N) {
	var top_down_tree = d3.select("#fft-poly-tree");
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + (i + half_N)).text("" + poly[x+1] + ((i + half_N < N-1) ? "," : ""))
	    .style("visibility", "visible");

	var ci = visible_coefs.select(".fft-coef-" + (x+1-start)).classed("fft-coefs-highlight", true)
	var cf = invisible_coefs.select(".fft-coef-" + (i + half_N)).classed("fft-coefs-highlight", true)
	setTimeout(function() {
	    ci.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	}, 400);
	return 400;
    };
    ev_calls[22] = function(poly, start, N) {
	var lvl = Math.log2(N);
	var subtree_nodenum = (1 << (lvl + 1)) - 2;
	var our_id = current_id - subtree_nodenum;
	var down_top_tree = d3.select("#fft-poly-tree-upside-down");
	var elem_to_draw_into = down_top_tree.select("#fft-node-num" + our_id);

	var transition = _my.vislib.animateGrowingArrows(down_top_tree, down_top_tree.selectAll(".fft-link-to" + our_id), 1000, 0, false, 0.7);
	transition.each("end", function() {
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false)
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
	    elem_to_draw_into.selectAll("text").attr("transform", "scale(1,-1)");
	});
	return 1200;
    };
    ev_calls[23] = { "pre" : function(N) {
	var lvl = Math.log2(N);
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var y_pos = elem_to_draw_into.datum().y;
	rootsOfUnityCircle(svg, N, 80, 1000, "fft-circle-lvl" + lvl, tree_x_offset + 460, tree2_y_offset - y_pos - 1.25*80);
	/*    transition.each("end", function() {
		d3.select("#fft-circle-lvl" + lvl).remove();
	    });*/
    }};
    ev_calls[26] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var lvl = Math.log2(N);
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	var equa = "(" + poly[start+k] + ") + (" + unity + ") * (" + poly[start + half_N + k] + ")";
	invisible_coefs.select(".fft-coef-" + k).text(equa + ",")
	    .style("visibility", "visible");

	var ci1 = visible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true)
	var ci2 = visible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true)
	var cf = invisible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true)
	var target_bound_rect = cf.node().getBoundingClientRect();
	var text_root_unity_bound = svg.select("#fft-circle-lvl" + lvl + " #fft-root-of-unity" + k).node().getBoundingClientRect();
	var arc = d3.svg.diagonal()
	    .target(function() { return {"x": target_bound_rect.x, "y": target_bound_rect.y}; })
	    .source(function() { return {"x": text_root_unity_bound.x, "y": text_root_unity_bound.y}; });
	svg.select("#fft-poly-tree-upside-down").append("path").style("fill", "white").style("stroke", "black").attr("d", arc(1));
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	    ci2.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	    cf.text("" + helper_arr[k] + ",");
	}, 400);
	return 400;
    };
    ev_calls[27] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var lvl = Math.log2(N);
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	var equa = "(" + poly[start+k] + ") - (" + unity + ") * (" + poly[start + half_N + k] + ")";
	var comma = ((k + half_N < N-1) ? "," : "");
	invisible_coefs.select(".fft-coef-" + (k + half_N)).text(equa + comma)
	    .style("visibility", "visible");

	var ci1 = visible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true)
	var ci2 = visible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true)
	var cf = invisible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true)
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	    ci2.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	    cf.text("" + helper_arr[k + half_N] + comma);
	}, 400);
	return 400;
    };
    ev_calls[32] = ev_calls[2] = { 
	"pre": function() { 
	    recursion_depth--;
	}
    };
    var ev = new _my.Algorithm(FFT_transform, ev_calls, "eval-code", {default_animation_duration : 10}, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    }); 
    var calc = new _my.Algorithm(Complex.calc_unity, calc_calls, "calc-code", {default_animation_duration : 10}); 
    var fft_call = [];
    function digLen(val) {
	return ("" + val).length;
    }
    function getElemToDrawInto(tree_id, current_id, N) {
	var lvl = Math.log2(N);
	var subtree_nodenum = (1 << (lvl + 1)) - 2;
	var our_id = current_id - subtree_nodenum;
	var down_top_tree = svg.select(tree_id);
	var elem = down_top_tree.select("#fft-node-num" + our_id);
	return elem;
    }
    
    var fft = new _my.Algorithm(FFT_multiply, [], "fft-code", {default_animation_duration : 200}, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    }); 
    function cleanup() {
	svg.selectAll(".fft-n-value").remove();
    }

    // we need a kickoff function that will start the multiply algorithm
    function kickoff_fft_multiply(executionFunction) {
	console.log("Before fft multiply", "" + poly_p, "" + poly_q);
	cleanup();
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    return ev.run(poly, len, start, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.run(idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	var result = fft.startAnimation(poly_p.slice(), poly_q.slice(), sharedEv, Complex);
	//var result = ev.startAnimation(poly_ev, poly_ev.length, 0, [], Complex);
	console.log("After fft multiply", "" + result);
	executionFunction();
    };

    // we need a kickoff function that will start the transform algorithm
    function kickoff_fft_trans(executionFunction) {
	console.log("Before fft transform", "" + poly_ev);
	cleanup();
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    return ev.runWithSharedAnimationQueue(fft, poly, start, len, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.runWithSharedAnimationQueue(ev, idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	var p = poly_ev.slice();
	var result = ev.startAnimation(p, 0, p.length, [], Complex);
	console.log("After fft transform", "" + p);
	executionFunction();
    };

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "fft-code")
	.style("display", "none")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(fft.toString());

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "calc-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(calc.toString());

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "eval-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(ev.toString());

    $(".fft-radio-button").click(function() {
	$(this).addClass("active").siblings().removeClass("active");
    });

    d3.select("#fft-mult-btn").on("click", function() {
	var isActive = $("#fft-mult-btn").hasClass("active");
	$(".eval-code").css("display", "none");
	$(".calc-code").css("display", "none");
	$(".fft-code").css("display", "inline");
	//we attach the kickoff_fft_multiply to the default controls
	_my.AlgorithmUtils.attachAlgoToControls(fft, algorithmTabId, kickoff_fft_multiply);

    });

    // the default is the fft-transform algorithm so we attach it here
    _my.AlgorithmUtils.attachAlgoToControls(ev, algorithmTabId, kickoff_fft_trans);
    d3.select("#fft-trans-btn").on("click", function() {
	var isActive = $("#fft-trans-btn").hasClass("active");
	$(".eval-code").css("display", "inline");
	$(".calc-code").css("display", "inline");
	$(".fft-code").css("display", "none");
	//we attach the kickoff_fft_multiply to the default controls
	_my.AlgorithmUtils.attachAlgoToControls(ev, algorithmTabId, kickoff_fft_trans);
    });

    return {FFT_multiply : FFT_multiply, Complex : Complex, FFT_transform : FFT_transform};
})(ALGORITHM_MODULE, $, d3, bootbox);
