var FFT_A = (function chart() {
    var algorithmTabId = "fft-tab";
    var algorithmName = "Fast Fourier Transform";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded fft");


    AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "fft");
    
    var row0 = d3.select("#algoContainer")
    	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
    	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-4")
    var controlsPanel = leftPanel.append("div").attr("class", "row controls")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");

    var leftPanelBody = controlsPanel.append("div").attr("class", "panel-body");
    var ops = leftPanelBody.append("div").attr("class", "options");
    AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);
    AlgorithmUtils.insertCustomControls(ops, algorithmTabId, algorithmName);
    
    var visPanel = leftPanel.append("div").attr("class", "row")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-8")
    	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");

    
    
    /*******************************/
    /*      Functions              */
    /*******************************/
    var Complex = {};
    Complex.create = function Complex(r, i) {
	this.real = r;
	this.imaginary = i;
	this.toString = function() {return "(" + this.real + ", " + this.imaginary + ")"};
    };

    Complex.add = function add(a, b) {
    	return new Complex.create(a.real + b.real,a.imaginary + b.imaginary);
    };

    Complex.sub = function sub(a, b) {
	return new Complex.create(a.real - b.real, a.imaginary - b.imaginary);
    };

    Complex.mult = function mult(a, b) {
	return new Complex.create(a.real*b.real - a.imaginary*b.imaginary, a.real*b.imaginary + a.imaginary*b.real);
    };

    Complex.calc_unity = function calc_unity(idx, N, Complex) {
	return new Complex.create(Math.cos((2*Math.PI*idx) / N), Math.sin((2*Math.PI*idx) / N));
    };
    
    function FFT(p, q, eval_roots_of_unity, Complex) {
    	var N = p.length > q.length ? p.length : q.length;
    	var outN = 2*N - 1;
    	var helper_arr = [];
    	eval_at_roots_of_unity(p, outN, 0, helper_arr, Complex);
    	eval_at_roots_of_unity(q, outN, 0, helper_arr, Complex);
    	var res = [];
    	for (var i=0; i < outN; i++) {
    	    res[i] = Complex.mult(p[i], q[i]);
    	}
    	eval_at_roots_of_unity(r, outN, 0, helper_arr, Complex);
    	// rearrange roots of unity
    	for (var i=1; i < N; i++) {
    	    var temp = res[i];
    	    res[i] = res[outN + 1 - i];
    	    res[outN + 1 - i] = temp;
    	}
    	for (var i=0; i < outN; i++) {
    	    res[i].real = res[i].real / (outN + 1);
    	}
	return res;
    }

    function eval_at_roots_of_unity(poly, len, start, helper_arr, Complex) {
    	if (len == 2) {
    	    var temp0 = poly[start];
    	    var temp1 = poly[start+1];
    	    poly[start] = Complex.add(temp0, temp1);
    	    poly[start+1] = Complex.sub(temp0, temp1);
    	}
    	else {
	    console.log("before perm", poly.slice(start, start + len), len, start);
    	    for(var i=0; i < (len / 2); i++) {
    		var x = start + 2*i;
    		helper_arr[i] = poly[x];
    		helper_arr[i + (len/2)] = poly[x+1];
    	    }
	    console.log("permuted", helper_arr.slice(0, len), len, start);
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
    	    eval_at_roots_of_unity(poly, len/2, start, helper_arr, Complex);
    	    eval_at_roots_of_unity(poly, len/2, start + (len/2), helper_arr, Complex);
	    console.log("before eval", poly.slice(start, start + len), len, start);
    	    for (var i=0; i < (len / 2); i++) {
    		var temp = Complex.mult(Complex.calc_unity(i, len),  poly[start + (len/2) + i], Complex);
    		helper_arr[i] = Complex.add(poly[start + i], temp);
    		helper_arr[i + (len/2)] = Complex.sub(poly[start + i], temp);
    	    }
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
    	}
    }

    var ev = new Algorithm(eval_at_roots_of_unity, {}, "eval-code", {}); 
    var calc = new Algorithm(Complex.calc_unity, {}, "calc-code", {}); 
    var fft_call = [];
    fft_call[20] = function(res) { 
	res.forEach(function(d) { console.log(d.toString()); });
    };
    var fft = new Algorithm(FFT, fft_call, "fft-code", {default_animation_duration : 10}); 
    var poly_p = [(new Complex.create(1,0)), (new Complex.create(4,0))];
    var poly_q = [new Complex.create(3,0)];
    // we need a kickoff function that will start the algorithm
    function kickoff(executionFunction) {
	console.log("Before fft");
	var sharedEv = function(poly, len, start, helper_arr, Complex) {
	    ev.runWithSharedAnimationQueue(fft, poly, len, start, helper_arr, Complex);
	}
	var sharedCalc = function(idx, N, Complex) {
	    ev.runWithSharedAnimationQueue(fft, idx, N, Complex);
	}
	Complex.calc_unity = sharedCalc;
	fft.startAnimation(poly_p, poly_q, sharedEv, Complex);
	console.log("After fft");
	executionFunction();
    };
    // we attach the kickoff to the default controls
    AlgorithmUtils.attachAlgoToControls(fft, algorithmTabId, kickoff);

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

    d3.select("#" + algorithmTabId + " .code")
    	.append("div")
    	.attr("class", "fft-code")
        .append("div")
    	.attr("class", "function-code-holder")
    	.append("pre")
    	.attr("class", "prettyprint lang-js linenums:1")
    	.append("code")
    	.attr("class", "language-js")
    	.text(fft.toString());

    return {FFT : FFT, Complex : Complex, eval_at_roots_of_unity : eval_at_roots_of_unity};
})();
