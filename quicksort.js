(function chart() {

    function swap_function(data, i, j) {
	var tmp = data[i];
	data[i] = data[j];
	data[j] = tmp;
    }

    function quicksort(data, left, right, swap_function) {

	if (left >= right) {
	    return;
	}

	var pivot = Math.floor((left + right)/2);
	var sorted_end = left + 1;
	swap_function(data, left, pivot);

	for (var i=left+1;i<right;++i) {
	    if (data[i].val <= data[left].val) {
		swap_function(data, sorted_end, i);
		sorted_end++;
	    }
	}
	swap_function(data, left, sorted_end-1);
	quicksort(data, left, sorted_end-1, swap_function);
	quicksort(data, sorted_end, right, swap_function);
    }

    /*************************/
    /**  Initialize svg   ****/
    /*************************/
    var data = [2,4,5,3,8,6,2].map(function(d, i) {
	return {val : d, old_idx: i};
    });
    console.log(data);
    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var height = 450;
    var width = 1600;
    var svg = d3.select("#quicksort-tab .graphics").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var smallestCircle = 12;
    var mini = Math.min.apply(null, data.map(function(d) {return d.val;}));
    var maxi = Math.max.apply(null, data.map(function(d) {return d.val;}));
    var maxi_width = computeWidth(maxi);
    var gap = 15;
    function computeWidth(elem) {
	return elem * (smallestCircle / mini);
    }
    function sumUpTo(array, index) {
	var sum = 0;
	var N = array.length;
	for (var i = 0; i < index && i < N; ++i) {
	    sum += 2*computeWidth(array[i].val) + gap;
	}
	return sum + gap + computeWidth(array[index].val);
    }
    function randomColor() { 
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
	    color += letters[Math.floor(Math.random() * 16)];
	}
	return color; 
    }

    var widthSum = 0;
    svg.append("defs").selectAll(".gradients")
	.data(data)
	.enter()
	.append("radialGradient")
	.attr("class", "gradients")
	.attr("id", function(d, i) { return "gradient-" + i; })
	.attr("fx", "25%")
	.attr("fy", "25%")
	.append("stop")
	.attr("offset", "5%")
	.attr("stop-color", randomColor);

    svg.selectAll(".gradients")
    	.append("stop")
	.attr("offset", "95%")
	.attr("stop-color", "black");


    svg.selectAll(".circle")
	.data(data)
	.enter()
	.append("g")
	.attr("id", function(d, i) { return "q-g-" + i; })
	.attr("transform", function(d, i) { return "translate(" + sumUpTo(data, i) + " " + maxi_width + ")"; })
	.append("circle")
	.attr("id", function(d, i) { return "q-circle-" + i; })
	.attr("class", "quicksort-circle")
	.attr("fill", function(d, i) { return "url(#gradient-" + i +")";})
	.attr("r", function(d) {
	    return computeWidth(d.val);
	});



    /*************************/
    /**  Setup algorithms ****/
    /*************************/
    var algo_context = {
	default_animation_duration : 500,
	cumulative_delay : 0
    };

    var q_callbacks = [];
    q_callbacks[0] = function() {
	return this.AlgorithmContext.default_animation_duration;
    }
    q_callbacks[6] = function(pivot, data) {
	
	var pi = data[pivot].old_idx;
	var g = d3.select("#q-g-" + pi)
	var radius = g.select(".quicksort-circle").attr("r");

	setTimeout(function() {
	    g.append("rect")
		.attr("id", "pivot-rect")
		.attr("fill", "none")
		.attr("stroke", "red")
		.attr("width", 2*radius)
		.attr("height", 2*radius)
		.attr("x", -radius)
		.attr("y", -radius);
	    }, this.AlgorithmContext.cumulative_delay);

	return 100;
    }
    q_callbacks[8] = function() {
	return 200;
    }
    q_callbacks[16] = function() {
	setTimeout(function() {
	    svg.selectAll("#pivot-rect").remove();
	}, this.AlgorithmContext.cumulative_delay);
	return 100;
    }

    var qual_algo = new Algorithm(quicksort, q_callbacks, "quicksort-code", algo_context);

    var swap_callbacks = [];
    swap_callbacks[0] = function(data, i, j) {
	var gi = d3.select("#q-g-" + data[i].old_idx)
	var gj = d3.select("#q-g-" + data[j].old_idx)

	//console.log("In swap with", i, j);
	return 0;
    }
    var swap_algo = new Algorithm(swap_function, swap_callbacks, "swap_function-code", {default_animation_duration: 0, cumulative_delay: 0});

    d3.select("#quicksort-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "quicksort-code")
	.append("code")
        .attr("class", "language-js")
        .text(qual_algo);

    
    d3.select("#quicksort-tab .options").append("button")
	.on("click", function(d) {
	    qual_algo.run(data, 0, data.length, function(data, i, j) { return swap_algo.run(data, i, j); });
	    console.log("hello");
	    
	})
	.text("start");

}());
