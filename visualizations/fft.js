(function chart() {
    var algorithmTabId = "fft-tab";
    var algorithmName = "Fast Fourier Transform";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded fft");

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

})();
