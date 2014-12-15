ALGORITHM_MODULE.fft_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }
    console.log(_my)
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
	p.fill(Complex.ZERO, p.length, nearest2Pow);
	q.fill(Complex.ZERO, q.length, nearest2Pow);
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

    /* reusable arrow marker to add to diagonals */
    svg.append("svg:defs")
	.append("svg:marker")
	.attr("id", "arrow")
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", 15)
	.attr("refY", -1.5)
	.attr("markerWidth", 6)
	.attr("markerHeight", 6)
	.attr("orient", "auto")
	.append("svg:path")
	.attr("d", "M0,-5L10,0L0,5");

    /**********************
     ** Wire up the Algos *
     **********************/
    var poly_ev = [Complex.create(-1,0), Complex.ZERO, Complex.create(-5,0), Complex.ZERO];
    var poly_p = [Complex.create(11,0), Complex.ZERO, Complex.create(-3,0), Complex.create(2,0)];
    var poly_q = [Complex.create(-3,0), Complex.create(3.4, 0), Complex.create(-7, 0)];

    var elem_between = 2;
    var btw_elem = 10;
    var per_width = (width - 100) / (poly_p.length + poly_q.length + elem_between);


    /***** this function creates a tree layout that we can then write the polynomials to and move them around in*/
    function prepareLayoutForPolys(N, node_size, svg, group_name, left_margin, top_margin) {
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
	var nodes = tree.nodes({v: data[0]})
	console.log(data, nodes);
	group.selectAll(".fft-link")
	    .data(tree.links(nodes))
	    .enter()
	    .append("path")
	    .attr("class", "fft-link")
	    .attr("id", function(d) { return "fft-link-to" + d.target.v.label; })
	    .attr("marker-end", function(d) { return "url(#" + "marker" + ")"; })
	    .attr("d", d3.svg.diagonal())
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
    function drawCoefs(poly, elem_to_draw_into) {
	var elems = [];
	for(var i=0; i < poly.length; i++) {
	    elems.push({"val" : Math.abs(poly[i].real), "key": i, 
			"sign": (poly[i].real < 0 ? ((i != poly.length-1) ? " - " : "-") : ((i != poly.length-1) ? " + " : ""))});
	}
	var textFields = elem_to_draw_into.append("text")
	    .attr("class", "fft-poly")
	    .attr("text-anchor", "middle")
	    .text("" + poly);
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
	    .attr("dy", -20)
	    .text(function(d) { return d.key < 2 ? " " : d.key; })
	//the dy is sticky and moves everything else up so we add another dy=20 to move down
	text.selectAll(".fft-has-super + tspan").attr("dy", 20);
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
	    console.log("" + ci, ci.getAngle());
	    data.push({angle: (ci.getAngle() + Math.PI/2), text: ci.toString()});
	}
	data.push({angle: 5*Math.PI/2}); //we need to close the circle
	console.log(data);

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
	      _my.vislib.animatePath(d3.select(this), duration, (duration / 2) * i);
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
	svg.selectAll("fft-layer-depth-node" + rec_depth)
	    .data([rec_depth]) // we attach data and enter so that if we run this multiple it only gets added once
	    .enter()
	    .append("text")
	    .attr("x", left_offset)
	    .attr("y", top_offset)
	    .attr("class", "fft-n-value")
	    .text("N = " + N + ":");
    }

    /********* here we wire the callbacks ************/
    rootsOfUnityCircle(svg, 4, 80, 3000, "test-circle", 200, 200);
    var ev_calls = [];
    var calc_calls = [];
    calc_calls[20] = function() {

	//
	
    }
    var recursion_depth = 0;
    var current_id = 1;
    ev_calls[0] = function(poly, start, N) {
	var tree_x_offset = 310;
	var tree1_y_offset = 70;
	var tree2_y_offset = 1900;
	if (recursion_depth == 0) {
	    prepareLayoutForPolys(4, 50, svg, "fft-poly_tree", tree_x_offset, tree1_y_offset);
	    prepareLayoutForPolys(4, 50, svg, "fft-poly_tree_upside_down", 0, 0);
	    d3.select("#fft-poly_tree_upside_down").attr("transform", "translate(" + tree_x_offset + ", " + tree2_y_offset+") scale(-1,1) rotate(180)");

	    drawPoly(poly.slice(start, start + N), d3.select("#fft-node-num" + 0), true);
	    drawPoly(poly.slice(start, start + N), d3.select("#fft-node-num" + 1), false);
	}
	current_id++;
	var elem_to_draw_into = d3.select("#fft-node-num" + current_id);
	drawCoefs(poly.slice(start, start + N), elem_to_draw_into);
	drawLayerLabel(svg, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);

	recursion_depth++;
    };
    ev_calls[24] = ev_calls[2] = { 
	"pre": function() { 
	    recursion_depth--;
	}
    };
    var ev = new _my.Algorithm(FFT_transform, ev_calls, "eval-code", {default_animation_duration : 200}, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    }); 
    var calc = new _my.Algorithm(Complex.calc_unity, calc_calls, "calc-code", {default_animation_duration : 200}); 
    var fft_call = [];
    function digLen(val) {
	return ("" + val).length;
    }
    
    var fft = new _my.Algorithm(FFT_multiply, [], "fft-code", {default_animation_duration : 200}, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    }); 

    // we need a kickoff function that will start the multiply algorithm
    function kickoff_fft_multiply(executionFunction) {
	console.log("Before fft multiply", "" + poly_p, "" + poly_q);
	
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    return ev.run(poly, len, start, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.run(idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	var result = fft.startAnimation(poly_p, poly_q, sharedEv, Complex);
	//var result = ev.startAnimation(poly_ev, poly_ev.length, 0, [], Complex);
	console.log("After fft multiply", "" + result);
	executionFunction();
    };

    // we need a kickoff function that will start the transform algorithm
    function kickoff_fft_trans(executionFunction) {
	console.log("Before fft transform", "" + poly_ev);
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    return ev.runWithSharedAnimationQueue(fft, poly, start, len, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.runWithSharedAnimationQueue(ev, idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	var result = ev.startAnimation(poly_ev, 0, poly_ev.length, [], Complex);
	console.log("After fft transform", "" + poly_ev);
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
