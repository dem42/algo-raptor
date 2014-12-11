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
    Complex.create.prototype.toString = function() {
	return "" + Math.round10(this.real, -4) + " " + (this.imaginary >= 0 ? "+ " : "- ") + Math.abs(Math.round10(this.imaginary, -4)) + "i";
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
	return Complex.create(Math.cos((2*Math.PI*idx) / N), Math.sin((2*Math.PI*idx) / N));
    };
    
    /***********************
     **    Functions     ***
     **********************/
    function FFT_transform(poly, len, start, helper_arr, Complex) {
    	if (len == 1) {
	    return;
    	}
	var half_len = Math.floor(len / 2);
    	for(var i=0; i < half_len; i++) {
    	    var x = start + 2*i;
    	    helper_arr[i] = poly[x];
    	    helper_arr[i + (half_len)] = poly[x+1];
    	}
    	for(var j=0; j < len; j++) {
    	    poly[start + j] = helper_arr[j];
    	}
    	FFT_transform(poly, half_len, start, helper_arr, Complex);
    	FFT_transform(poly, half_len, start + half_len, helper_arr, Complex);
    	for (var k=0; k < half_len; k++) {
    	    var temp = Complex.mult(Complex.calc_unity(k, len, Complex),  poly[start + half_len + k]);
    	    helper_arr[k] = Complex.add(poly[start + k], temp);
    	    helper_arr[k + half_len] = Complex.sub(poly[start + k], temp);
    	}
    	for(var l=0; l < len; l++) {
    	    poly[start + l] = helper_arr[l];
    	}
    }

    function FFT_multiply(p, q, FFT_transform, Complex) {
	var N = p.length + q.length - 1;
    	var nearest2Pow = 1 << Math.ceil(Math.log2(N));
	/* zero pad */
	p.fill(Complex.ZERO, p.length, nearest2Pow);
	q.fill(Complex.ZERO, q.length, nearest2Pow);
    	FFT_transform(p, nearest2Pow, 0, [], Complex);
    	FFT_transform(q, nearest2Pow, 0, [], Complex);
    	var res = [];
    	for (var i=0; i < nearest2Pow; i++) {
    	    res[i] = Complex.mult(p[i], q[i]);
    	}
    	FFT_transform(res, nearest2Pow, 0, [], Complex);
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
    var ev = new _my.Algorithm(FFT_transform, {}, "eval-code", {default_animation_duration : 200}, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    }); 
    var calc = new _my.Algorithm(Complex.calc_unity, {}, "calc-code", {default_animation_duration : 200}); 
    var fft_call = [];
    function digLen(val) {
	return ("" + val).length;
    }

    var poly_ev = [Complex.create(-1,0), Complex.ZERO, Complex.create(-5,0), Complex.ZERO];
    var poly_p = [Complex.create(11,0), Complex.ZERO, Complex.create(-3,0), Complex.create(2,0)];
    var poly_q = [Complex.create(-3,0), Complex.create(3.4, 0), Complex.create(-7, 0)];

    var elem_between = 2;
    var btw_elem = 10;
    var per_width = (width - 100) / (poly_p.length + poly_q.length + elem_between);

    function drawPoly(poly, svg, classname, left_margin) {
	var elems = [];
	for(var i=poly.length-1; i >= 0; i--) {
	    elems.push({"val" : Math.abs(poly[i].real), "key": i, 
			"sign": (poly[i].real < 0 ? ((i != poly.length-1) ? " - " : "-") : ((i != poly.length-1) ? " + " : ""))});
	}
	var textFields = svg.append("g")
	    .attr("id", classname + "-line1")
	    .attr("transform", function(d) { return "translate(" + left_margin + ", 20)"; })
	    .attr("class", "coef-line")
	    .append("text")
	    .attr("class", "poly-elem " + classname)
	    .selectAll("." + classname)
	    .data(elems, function(d) { return d.key; })
	    .enter()
	    .append("tspan")
	    .attr("y", 0)
	    .attr("class", "fft-poly")
	    .text(function(d) { return d.sign + d.val + (d.key == 0 ? "" : "x"); })
	textFields.filter(function(d) { return d.key >= 2; })
	    .append("tspan")
	    .attr("class", "fft-super")
	    .attr("dy", -20)
	    .text(function(d) { return d.key < 2 ? " " : d.key; });
    }
    
    drawPoly(poly_p, svg, "p-elem", 0);
    drawPoly(poly_q, svg, "q-elem", 500);

    fft_call[0] = function(p, q) {
	
    };
    fft_call[20] = function(res) { 

    };
    
    var fft = new _my.Algorithm(FFT_multiply, fft_call, "fft-code", {default_animation_duration : 200}, function() {
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
	    return ev.runWithSharedAnimationQueue(fft, poly, len, start, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    return calc.runWithSharedAnimationQueue(ev, idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	var result = ev.startAnimation(poly_ev, poly_ev.length, 0, [], Complex);
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
