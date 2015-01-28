ALGORITHM_MODULE.fft_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }
    var algorithm1TabId = "fft-tab-tran";
    var algorithm2TabId = "fft-tab-mult";
    var algorithm1Name = "Fast Fourier Transform";
    var algorithm2Name = "Fast Fourier Multiplication";
    console.debug("downloaded fft");
    /*******************************/
    /*      Setup the panels       */
    /*******************************/

    var layout_tran = _my.AlgorithmUtils.setupLayout(algorithm1TabId, algorithm1Name, {priority:"fft1-tran"}, [5, 7], "You may modify the input polynomial here:");
    layout_tran.customControlsLayout.append("div").attr("class", "fft-trans-forms");
    layout_tran.gaugeObj.setSpeedModifier(30);
    var layout_mult = _my.AlgorithmUtils.setupLayout(algorithm2TabId, algorithm2Name,  {priority:"fft2-mult"}, [6, 6], "You may modify the input polynomials here:");
    layout_mult.gaugeObj.setSpeedModifier(30);
    var forms_holder = layout_mult.customControlsLayout.append("div");
    forms_holder.append("div").attr("class", "fft-mult-forms-left pull-left");
    forms_holder.append("div").attr("class", "fft-mult-forms-right pull-right");

    /*function to create the input boxes for the polynomial .. you also have to read from them before kicking it off*/
    function createInputBoxes(formClass, inputBoxClass, poly) {
	var reversed_poly = [];
	for (var j = poly.length-1; j >=0; j--) {
	    reversed_poly.push(poly[j]);
	}
	var forms_spans = d3.select("." + formClass).selectAll("input[type='text']")
	    .data(reversed_poly)
	    .enter().append("span");
	forms_spans.append("input")
	    .attr("type","text")
	    .attr("class",inputBoxClass)
	    .attr("maxlength", 2)
	    .attr("value", function(d) { return d; })
	var labels = forms_spans.append("span")
	    .text(function(d, i) { return i < poly.length-1 ? "x" : ""});
	forms_spans.append("sup")
	    .text(function(d, i) { return i < poly.length-1 ? "" + (poly.length-i-1) : ""});
	forms_spans.append("span")
	    .text(function(d, i) { return i < poly.length-1 ? " +" : ""});
    }
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
	var ri = Math.round10(this.imaginary, -2);
	var rr = Math.round10(this.real, -2);
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
    	// rearrange coefficients after the inverse fft transform
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
    var svg_fft_elem = d3.select("#" + algorithm1TabId + " .graphics").append("svg")
	.attr("width",  width + "px")
	.attr("height", "1050px")
    var fft_group = svg_fft_elem.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var svg_multiply_elem = d3.select("#" + algorithm2TabId + " .graphics").append("svg")
	.attr("width",  1.42*width + "px")
	.attr("height", "1050px")
    var multiply_group = svg_multiply_elem.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    /**********************
     ** Wire up the Algos *
     **********************/
    var poly_ev = [Complex.create(-1,0), Complex.ZERO, Complex.create(-5,0)];
    createInputBoxes("fft-trans-forms", "fft-input-box fft-trans-box", poly_ev);
    var poly_p = [Complex.create(11,0), Complex.ZERO, Complex.create(-3,0), Complex.create(2,0)];
    createInputBoxes("fft-mult-forms-left", "fft-input-box fft-mult-box-left", poly_p);
    var poly_q = [Complex.create(-3,0), Complex.create(3.4, 0), Complex.create(-7, 0)];
    createInputBoxes("fft-mult-forms-right", "fft-input-box fft-mult-box-right", poly_q);

    function populate(poly, boxClass) {
	d3.selectAll("." + boxClass).each(function(d, i) {
	    var value = +this.value;
	    poly[poly.length - i - 1] = value != 0 ? Complex.create(value,0) : Complex.ZERO;
	});
    }

    var elem_between = 2;
    var btw_elem = 10;
    var per_width = (width - 100) / (poly_p.length + poly_q.length + elem_between);

    /***** this function creates a tree layout that we can then write the polynomials to and move them around in*/
    function prepareLayoutForPolys(N, node_size, fft_group, group_name, left_margin, top_margin, inverted) {
	N = 1 << Math.ceil(Math.log2(N));
	var node_num = 2*N - 1;
	var last_level = Math.floor(Math.log2(N)) + 2;
	var group = fft_group.append("g").attr("id", group_name). attr("transform", "translate(" + left_margin + ", " + top_margin + ")");
	var data = [];
	for (var i=1;i<=node_num;i++) {
	    data.push({id: i, label: 0, node_width: node_size});    
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
    function drawCoefs(poly, elem_to_draw_into, invisible, invert) {
	var elems = [];
	for(var i=0; i < poly.length; i++) {
	    elems.push({"val" : "" + poly[i], "key": i});
	}
	var textField = elem_to_draw_into
	    .selectAll(".fft-coef-text-" + invisible)
	    .data([1]) // we just want this text field to be added once no mater how many times this function is called
	    .enter()
	    .append("text")
	    .attr("class", "fft-poly fft-coef-text-" + invisible)
	    .attr("font-size", "30")
	    .attr("dy", (invisible === true) ? "0em" : "-1em")
	    .attr("text-anchor", "middle");
	textField.selectAll("tspan")
	    .data(elems)
	    .enter()
	    .append("tspan")
	    .attr("class", function(d) { return "fft-coef-" + d.key;})
	    .attr("style", (invisible === true) ? "visibility:hidden" : "visibility:visible")
	    .text(function(d){return d.val})
	    .append("tspan")
	    .attr("style", function(d, i) { return i == elems.length-1 ? "display:none" : "display:inline"; })
	    .text(",");

	if (invert === true) {
	    textField.attr("transform", "scale(1,-1)");
	}
	var max_width = 6 * elem_to_draw_into.datum().node_width;
	var text_width = elem_to_draw_into.select(".fft-coef-text-" + invisible).node().getComputedTextLength();
	var cut_num = Math.round(text_width / max_width);
	//console.log(max_width, text_width, cut_num, "cut this");
	if (text_width > max_width) {
	    var cut_offset = Math.round(elems.length / cut_num);
	    for (var cn = cut_offset; cn  < elems.length; cn+=cut_offset) {
		var sel_val = textField.select(".fft-coef-" + cn);
		sel_val.attr("x", 0).attr("dy", "1.4em");
	    }
	}
    }

    function drawPoly(poly, elem_to_draw_into, sin_zeroes, invert) {
	var elems = [];
	var f_non_zero = true;
	for(var i=poly.length-1; i >= 0; i--) {
	    if (sin_zeroes === true && Complex.equals(poly[i], Complex.ZERO)) { 
		continue;
	    }
	    elems.push({"value": poly[i], "real_sign" : Math.sign(poly[i].real), "key": i, "has_img" : (Math.round10(poly[i].imaginary, -2) != 0), "f_non_z" : f_non_zero});
	    f_non_zero = false;
	}
	function signString(elem) {
	    return (elem.real_sign > 0 || elem.has_img) ? (elem.f_non_z ? "" : " + ") : (elem.f_non_z ? "-" : " - ");
	}
	function wrapComplex(elem) {
	    return elem.has_img ? "(" + elem.value + ")" : "" + Math.abs(Math.round10(elem.value.real, -2));
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
	    .text(function(d) { return signString(d, i) + wrapComplex(d) + (d.key == 0 ? "" : "x"); });
	textFields.filter(function(d) { return d.key >= 2; })
	    .attr("class", "fft-poly fft-has-super")
	    .append("tspan")
	    .attr("class", "fft-super")
	    .attr("font-size", 15)
	    .attr("dy", -15)
	    .text(function(d) { return d.key < 2 ? " " : d.key; })
	//the dy is sticky and moves everything else up so we add another dy=20 to move down
	text.selectAll(".fft-has-super + tspan").attr("dy", 15);

	if (invert === true) {
	    text.attr("transform", "scale(1,-1)");
	}
    } // end of draw poly

    function radToDeg(val) { return val * 180 / Math.PI; }

    /******* this function draws a roots of unity circle and returns a diagonal that can be moved around the circle */
    function rootsOfUnityCircle(fft_group, N, radius, duration, group_name, left_margin, top_margin, invert) {
	if (fft_group.select("#" + group_name).size() >= 1) {
	    return;
	}
	var data = [];

	var transform_string = "translate(" + left_margin + ", " + top_margin + ")";
	if (invert === true) {
	    transform_string = transform_string + " scale(1,-1)";
	}
	var group = fft_group.append("g").attr("id", group_name). attr("transform", transform_string);

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
	
    
	  var path = group.selectAll(".arc").data(data).enter().append("path").attr("d", radial).each(function(d, i) {
	      // the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	      _my.vislib.animatePath(d3.select(this), duration, (duration / 2) * i, false, 1);
	  })
	      .attr("class", function(d, i) { return "root-of-unity-circle fft-root-of-unity-path-to-" + i});

	// our diagonal inside the circle that points at the roots of unity
	var diagonal = group.append("path").attr("d", d1(1)).attr("class","root-of-unity-arrow").attr("id", "unity-arrow")
	    .style("display", "none")

	var scale_factor = radius / 80;
	var unit_groups = group.selectAll("fft-unit-circle-roots")
	    .data(data.slice(0, data.length-1))
	    .enter()
	    .append("g")
	    .attr("class", "fft-unit-circle-roots")
	    .attr("id", function(d, i) { return "fft-root-of-unity" + i; })
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

    function drawLayerLabel(fft_group, N, rec_depth, left_offset, top_offset) {
	fft_group.selectAll("#fft-layer-depth-node" + rec_depth)
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
    var ev_calls = [];
    var recursion_depth = 0;
    var current_id = 1;
    var tree_x_offset = 310;
    var tree1_y_offset = 70;
    var tree2_y_offset = 1660;

    ev_calls[0] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	recursion_depth++;
	if (recursion_depth == 1) {
	    current_id = 1;
	    var nearest2Pow = 1 << Math.ceil(Math.log2(N));
	    fft_group.select("#fft-poly-tree").remove();
	    fft_group.select("#fft-poly-tree-upside-down").remove();
	    prepareLayoutForPolys(nearest2Pow, 50, fft_group, "fft-poly-tree", tree_x_offset, tree1_y_offset);
	    prepareLayoutForPolys(nearest2Pow, 50, fft_group, "fft-poly-tree-upside-down", 0, 0, true);
	    d3.select("#fft-poly-tree-upside-down").attr("transform", "translate(" + tree_x_offset + ", " + tree2_y_offset+") scale(-1,1) rotate(180)");
	    var top_down_tree = d3.select("#fft-poly-tree");
	    drawPoly(poly.slice(start, start + N), top_down_tree.select("#fft-node-num" + 0), true);
	}
	else {
	    current_id++;
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + current_id), animation_duration, 0, false, 0.7).transition;
	    transition.each("end", function() {
		drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false);
	    });
	    drawLayerLabel(fft_group, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	}
	return animation_duration;
    };
    ev_calls[10] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree = d3.select("#fft-poly-tree");
	var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + 1), animation_duration, 0, false, 0.7).transition;
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	transition.each("end", function() {
	    drawPoly(poly.slice(start, start + N), elem_to_draw_into, false);
	});
	drawLayerLabel(fft_group, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	return animation_duration;
    }
    ev_calls[13] = { "pre" : function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	if (recursion_depth == 1) {
	    current_id++;
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + current_id), animation_duration, 0, false, 0.7).transition;
	    transition.each("end", function() {
		drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false);
		d3.select(this).transition().each("end", function() {
		    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
		});
	    });
	    drawLayerLabel(fft_group, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	}
	else {
	    var top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
	}
	return 1.2 * animation_duration;
    }};
    ev_calls[15] = function(poly, start, i, x, half_N) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
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
	}, animation_duration);
	return animation_duration;
    };
    ev_calls[16] = function(poly, start, i, x, half_N, N) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
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
	}, animation_duration);
	return animation_duration;
    };
    ev_calls[22] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var lvl = Math.log2(N);
	var subtree_nodenum = (1 << (lvl + 1)) - 2;
	var our_id = current_id - subtree_nodenum;
	var down_top_tree = d3.select("#fft-poly-tree-upside-down");
	var elem_to_draw_into = down_top_tree.select("#fft-node-num" + our_id);

	var transition = _my.vislib.animateGrowingArrows(down_top_tree, down_top_tree.selectAll(".fft-link-to" + our_id), animation_duration, 0, false, 0.7).transition;
	transition.each("end", function() {
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false, true)
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true, true);
	});
	return 1.2 * animation_duration;
    };
    ev_calls[23] = { "pre" : function(N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var lvl = Math.log2(N);
	var down_top_tree = d3.select("#fft-poly-tree-upside-down");
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var y_pos = elem_to_draw_into.datum().y;
	rootsOfUnityCircle(down_top_tree, N, 80, animation_duration, "fft-circle-lvl" + lvl, 450, y_pos, true);
	/*    transition.each("end", function() {
		d3.select("#fft-circle-lvl" + lvl).remove();
	    });*/
	return 1.1 * animation_duration;
    }};
    ev_calls[26] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
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
	var drawing = drawArrowFromCircle(elem_to_draw_into, lvl, k, animation_duration);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	    ci2.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	    cf.text("" + helper_arr[k] + ",");
	    drawing.circle.remove();
	    drawing.path.remove();
	}, 2 * animation_duration);
	return 2 * animation_duration;
    };
    ev_calls[27] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
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
	var drawing = drawArrowFromCircle(elem_to_draw_into, lvl, k + half_N, animation_duration);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	    ci2.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	    cf.text("" + helper_arr[k + half_N] + comma);
	    drawing.circle.remove();
	    drawing.path.remove();
	}, 2 * animation_duration);
	return 2 * animation_duration;
    };
    ev_calls[32] = ev_calls[2] = { 
	"pre": function(poly, N) { 
	    recursion_depth--;
	    if (recursion_depth == 0) {
		var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
		var lvl = Math.log2(N);
		var down_top_tree = d3.select("#fft-poly-tree-upside-down");
		var elem_to_draw_into = down_top_tree.select("#fft-node-num1");

		var transition = _my.vislib.animateGrowingArrows(down_top_tree, down_top_tree.selectAll(".fft-link-to1"), animation_duration, 0, false, 0.7).transition;
		transition.each("end", function() {
		    drawCoefs(poly, elem_to_draw_into, false, true);
		});
		return 1.2 * animation_duration;
	    }
	}
    };
    var fft_algo_context = _my.AlgorithmUtils.createAlgorithmContext(layout_tran.defaultControlsObj);
    var ev = new _my.Algorithm(FFT_transform, ev_calls, "eval-code", fft_algo_context, function() {
	_my.AlgorithmUtils.resetControls(algorithm1TabId);
    }); 
    var calc = new _my.Algorithm(Complex.calc_unity, [], "calc-code", fft_algo_context); 
    var fft_call = [];

    function drawArrowFromCircle(elem_to_draw_into, lvl, k, animation_duration) {
	var target_bound_rect = elem_to_draw_into.datum();
	var root_unity = fft_group.select("#fft-circle-lvl" + lvl + " #fft-root-of-unity" + k)
	var text_root_traned = fft_group.select("#fft-circle-lvl" + lvl + " .fft-root-of-unity-path-to-" + k).node().getPointAtLength(0);
	var text_root_unity_bound = {x:450 + text_root_traned.x,y: elem_to_draw_into.datum().y - text_root_traned.y};
	var highlight_circ = root_unity.insert("circle", "circle").attr("class", "fft-highlight-circle").attr("r", "40");

	var arc = d3.svg.diagonal()
	    .target(function() { return {"x": target_bound_rect.x, "y": target_bound_rect.y}; })
	    .source(function() { return {"x": text_root_unity_bound.x, "y": text_root_unity_bound.y}; });
	var path = fft_group.select("#fft-poly-tree-upside-down").append("path").style({"fill": "none", "stroke": "black"}).attr("d", arc(1));
	_my.vislib.animatePath(path, animation_duration, 0, false, 0.85);
	return {path: path, circle: highlight_circ};
    }
    function digLen(val) {
	return ("" + val).length;
    }
    function getElemToDrawInto(tree_id, current_id, N) {
	var lvl = Math.log2(N);
	var subtree_nodenum = (1 << (lvl + 1)) - 2;
	var our_id = current_id - subtree_nodenum;
	var down_top_tree = fft_group.select(tree_id);
	var elem = down_top_tree.select("#fft-node-num" + our_id);
	return elem;
    }
    function cleanup() {
	fft_group.selectAll(".fft-n-value").remove();
    }
    // we need a kickoff function that will start the transform algorithm
    function kickoff_fft_trans(executionFunction) {
	populate(poly_ev, "fft-trans-box");
	console.log("Before fft transform", "" + poly_ev);
	cleanup();
	var sharedCalc = function(idx, N, Complex) {
	    return calc.runWithSharedAnimationQueue(ev, idx, N, Complex);
	}
	var ComplexClone = _my.AlgorithmUtils.clone(Complex);
	ComplexClone.calc_unity = sharedCalc;
	var p = poly_ev.slice();
	var result = ev.startAnimation(p, 0, p.length, [], ComplexClone);
	console.log("After fft transform", "" + p);
	
	executionFunction();
    };

    function prepareMultiplyLayout(N, node_size, fft_group, group_name, left_margin, top_margin) {
	var node_num = 2*N - 1;
	var node_width_coef = 1.57;
	var last_level = Math.floor(Math.log2(N)) + 2;
	var group = fft_group.append("g").attr("id", group_name). attr("transform", "translate(" + left_margin + ", " + top_margin + ")");
	var data = [{v:0, children:[1]}, {v:1, children:[2]}, {v:2, children:[3,6]}, {v:3, children:[4]},
		   {v:4, children: [5]}, {v:5, children:[]}, {v:6, children: [7]}, {v:7, children: [8]}, {v:8, children: []}];
	data.forEach(function(d) { d.node_width = node_width_coef * node_size; });

	var tree = d3.layout.tree()
	    .children(function(d) {
		var children = [];
		for (var idx=0; idx < d.children.length; idx++) {
		    children.push(data[d.children[idx]]);
		}
		return children;
	    })
	    .nodeSize([node_width_coef*node_size, 4*node_size])
	    .separation(function(a, b) {
		return (a.parent == b.parent ? ((a.depth == last_level) ? 1.5 : 8) : 2);
	    })
	var link_path_gen = _my.vislib.interpolatableDiagonal("linear").inverted();
	var nodes = tree.nodes(data[0]);
	group.selectAll(".fft-link")
	    .data(tree.links(nodes))
	    .enter()
	    .append("path")
	    .attr("class", function(d) {return "fft-link " + "fft-link-to" + link_path_gen.target(d).v; })
	    .attr("d", link_path_gen)
	var node_gs = 
	    group.selectAll(".fft-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fft-node")
	    .attr("id", function(d) { return "fft-node-num" + d.v; })
	    .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")";})
	node_gs.append("circle").attr("class", "fft-node-circle").attr("r", node_size / 2);
    }// end of prepareMultiplyLayout
    function animateNodeMultDrawing(node_id, draw_function, polynom, third_argument_bool_value, algo_ctx) {
	var animation_duration = 2 * algo_ctx.getBaselineAnimationSpeed();
    	var mult_tree = d3.select("#multiply-poly-tree");
	var nodea = mult_tree.select("#fft-node-num" + node_id);
	var transition = _my.vislib.animateGrowingArrows(mult_tree, mult_tree.selectAll(".fft-link-to" + node_id), animation_duration, 0, false, 0.7).transition;
	transition.each("end", function() {
	    draw_function.call(null, polynom, nodea, third_argument_bool_value, true); // in non-strict mode if this==null it's replaced by global
	});
	return animation_duration;
    }

    var tree_mult_offset_x = 600;
    var tree_mult_offset_y = 1080;
    var mult_node_size = 50;
    var fft_calls = [];
    fft_calls[2] = function(p, q, N, nearest2Pow) {
	multiply_group.select("#multiply-poly-tree").remove();
	prepareMultiplyLayout(nearest2Pow, mult_node_size, multiply_group, "multiply-poly-tree", 0, 0);
	var mult_tree = d3.select("#multiply-poly-tree");
	mult_tree.attr("transform", "translate(" + tree_mult_offset_x + ", " + tree_mult_offset_y +") scale(-1,1) rotate(180)");
	var nodea = mult_tree.select("#fft-node-num5");
	drawPoly(p, nodea, true, true);
	var nodeb = mult_tree.select("#fft-node-num8");
	drawPoly(q, nodeb, true, true);
    }
    fft_calls[6] = function(p) {
	return animateNodeMultDrawing(4, drawPoly, p, false, this.AlgorithmContext);
    };
    fft_calls[9] = function(q) {
	return animateNodeMultDrawing(7, drawPoly, q, false, this.AlgorithmContext);
    };
    fft_calls[10] = function(p) {
	return animateNodeMultDrawing(3, drawCoefs, p, false, this.AlgorithmContext);
    };
    fft_calls[11] = function(q) {
	return animateNodeMultDrawing(6, drawCoefs, q, false, this.AlgorithmContext);
    };
    fft_calls[13] = {"pre" : function(nearest2Pow) {
	var empty_pol = new Array(nearest2Pow);
	empty_pol.fill(0);
	return animateNodeMultDrawing(2, drawCoefs, empty_pol, true, this.AlgorithmContext);
    }};
    fft_calls[14] = function(res, p, q, i, nearest2Pow) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_from1 = mult_tree.select("#fft-node-num3")
	var elem_to_draw_from2 = mult_tree.select("#fft-node-num6")
	var elem_to_draw_into = mult_tree.select("#fft-node-num2")
	var visible_coefs1 = elem_to_draw_from1.select(".fft-coef-text-false");
	var visible_coefs2 = elem_to_draw_from2.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + i).text("" + res[i] + (i!=nearest2Pow-1 ? "," : "")).style("visibility", "visible");

	var ci1 = visible_coefs1.select(".fft-coef-" + i).classed("fft-coefs-highlight", true)
	var ci2 = visible_coefs2.select(".fft-coef-" + i).classed("fft-coefs-highlight", true)
	var cf = invisible_coefs.select(".fft-coef-" + i).classed("fft-coefs-highlight", true)
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	    ci2.classed("fft-coefs-highlight", false)
	    cf.classed("fft-coefs-highlight", false)
	}, animation_duration);
	return animation_duration;
    };
    fft_calls[16] = function(res) {
	return animateNodeMultDrawing(1, drawCoefs, res, false, this.AlgorithmContext);
    };
    fft_calls[21] = function(res, i, nearest2Pow, temp) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_into = mult_tree.select("#fft-node-num1")
	var ci1 = elem_to_draw_into.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	var ci2 = elem_to_draw_into.select(".fft-coef-" + (nearest2Pow - i)).classed("fft-coefs-highlight-green", true);
	setTimeout(function() {
	    ci1.text("" + res[i] + ",");
	    ci1.classed("fft-coefs-highlight", false).classed("fft-coefs-highlight-green", true)
	    ci2.text("" + res[nearest2Pow - i] + (i != 0 ? "," : ""));
	    ci2.classed("fft-coefs-highlight-green", false).classed("fft-coefs-highlight", true)
	    setTimeout(function() {
		ci1.classed("fft-coefs-highlight-green", false)
		ci2.classed("fft-coefs-highlight", false)
	    }, animation_duration);
	}, animation_duration);
	return 2*animation_duration;
    };
    fft_calls[24] = function(res, i, nearest2Pow) {
	var animation_duration = (1/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var idx = (i == 0) ? 0 : (i < nearest2Pow / 2) ? nearest2Pow - i : i;
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_into = mult_tree.select("#fft-node-num1")
	var ci1 = elem_to_draw_into.select(".fft-coef-" + idx)
	    .text("" + Math.round10(res[i].real, -2) + (i != nearest2Pow-1 ? "," : "")).classed("fft-coefs-highlight", true);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false)
	}, animation_duration);
	return animation_duration;
    };
    fft_calls[26] = { "pre": function(res) {
	return animateNodeMultDrawing(0, drawPoly, res, true, this.AlgorithmContext);
    }};
    var mult_algo_ctx = _my.AlgorithmUtils.createAlgorithmContext(layout_mult.defaultControlsObj);
    var fft = new _my.Algorithm(FFT_multiply, fft_calls, "fft-code", mult_algo_ctx, function() {
	_my.AlgorithmUtils.resetControls(algorithm2TabId);
    });

    // we need a kickoff function that will start the multiply algorithm
    function kickoff_fft_multiply(executionFunction) {
	populate(poly_p, "fft-mult-box-left");
	populate(poly_q, "fft-mult-box-right");
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
    _my.AlgorithmUtils.appendCode(algorithm1TabId, "calc-code", calc);
    _my.AlgorithmUtils.appendCode(algorithm1TabId, "eval-code", ev);
    _my.AlgorithmUtils.appendCode(algorithm2TabId, "fft-code", fft);

    $(".fft-radio-button").click(function() {
	$(this).addClass("active").siblings().removeClass("active");
    });

    _my.AlgorithmUtils.attachAlgoToControls(fft, algorithm2TabId, kickoff_fft_multiply);
    _my.AlgorithmUtils.attachAlgoToControls(ev, algorithm1TabId, kickoff_fft_trans);

    return {FFT_multiply : FFT_multiply, Complex : Complex, FFT_transform : FFT_transform};
})(ALGORITHM_MODULE, $, d3, bootbox);
