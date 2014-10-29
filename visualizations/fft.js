(function chart() {
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
    ops.append("div").attr("class", "forms");
    

    
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

    Complex.add = function(a, b) {
    	return {
    	    real: a.real + b.real,
    	    imaginary: a.imaginary + b.imaginary
    	};
    };

    Complex.substract = function(a, b) {
    	return {
    	    real: a.real - b.real,
    	    imaginary: a.imaginary - b.imaginary
    	};
    };

    Complex.mult = function(a, b) {
    	return {
    	    real: a.real*b.real - a.imaginary*b.imaginary,
    	    imaginary: a.real*b.imaginary + a.imaginary*b.real
    	};
    };

    Complex.calc_unity = function(idx, N, Complex) {
    	return {
    	    real: Math.cos(2*Math.PI*idx / (N + 1)),
    	    imaginary: Math.sin(2*Math.PI*idx / (N + 1))
    	};
    };
    
    function FFT(p, q, eval_roots_of_unity, Complex) {
    	var N = 10;
    	var outN = 2*N - 1;
    	var helper_arr = [];
    	eval_at_roots_of_unity(p, outN, 0, outN, helper_arr, Complex);
    	eval_at_roots_of_unity(q, outN, 0, outN, helper_arr, Complex);
    	var res = [];
    	for (var i=0; i < outN; i++) {
    	    res[i] = Complex.mult(p[i], q[i]);
    	}
    	eval_at_roots_of_unity(r, outN, 0, outN, helper_arr, Complex);
    	// rearrange roots of unity
    	for (var i=1; i < N; i++) {
    	    var temp = res[i];
    	    res[i] = res[outN + 1 - i];
    	    res[outN + 1 - i] = temp;
    	}
    	for (var i=0; i < outN; i++) {
    	    res[i].real = res[i].real / (outN + 1);
    	}
    }

    function eval_at_roots_of_unity(poly, len, start, outN, helper_arr, Complex) {
    	if (N == 1) {
    	    var temp0 = p[start];
    	    var temp1 = p[start+1];
    	    p[start] = Complex.add(temp0, temp1);
    	    p[start+1] = Complex.substract(temp0, temp1);
    	}
    	else {
    	    for(var i=0; i < (len / 2); i++) {
    		var x = start + 2*i;
    		helper_arr[i] = poly[x];
    		helper_arr[i + 1 + (len/2)] = poly[x+1];
    	    }
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
    	    eval_at_roots_of_unity(poly, len/2, start, outN, helper_arr, Complex);
    	    eval_at_roots_of_unity(poly, len/2, start + 1 + (len/2), outN, helper_arr, Complex);
    	    var j = (outN + 1) / (N+1);
    	    for (var i=0; i < (len / 2); i++) {
    		var temp = Complex.mult(Complex.calc_unity(i*j, len),  poly[start + (len/2) + 1 + i]);
    		helper_arr[i] = Complex.add(poly[start + i], temp);
    		helper_arr[start + (len/2) + 1] = Complex.substract(poly[start + i], temp);
    	    }
    	    for(var i=0; i < len; i++) {
    		poly[start + i] = helper_arr[i];
    	    }
    	}
    }

    var ev = new Algorithm(eval_at_roots_of_unity, {}, "eval-code", {}); 
    var calc = new Algorithm(Complex.calc_unity, {}, "calc-code", {}); 
    var fft = new Algorithm(FFT, {}, "fft-code", {}); 

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
})();
