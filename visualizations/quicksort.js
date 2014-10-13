(function chart() {
    var algorithmTabId = "quicksort-tab";
    var algorithmName = "Quicksort";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded quicksort");

    AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "sorting-1-quicksort");
 
    var row0 = d3.select("#algoContainer")
	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-6")
    var controlsPanel = leftPanel.append("div").attr("class", "row")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");
    var ops = controlsPanel.append("div").attr("class", "panel-body")
	.append("div").attr("class", "options");
    AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);
    AlgorithmUtils.insertCustomControls(ops, algorithmTabId, algorithmName);
    
    var visPanel = leftPanel.append("div").attr("class", "row")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-6")
	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");


    /*******************************/
    /*      Define the functions   */
    /*******************************/
    function swap_function(data, i, j) {
	if (i == j) return;
	var tmp = data[i];
	data[i] = data[j];
	data[j] = tmp;
    }
    function quicksort(data, left, right, swap_function) {
	if (right <= left) {
	    return;
	}
	var pivot = Math.floor(left + (right - left)/2);
	var pivot_value = data[pivot].val;
	var new_left = left;
	var new_right = right;
	while (new_left <= new_right) {
	    while (data[new_left].val < pivot_value) {
		new_left = new_left + 1;
	    }
	    while (data[new_right].val > pivot_value) {
		new_right = new_right - 1;
	    }
	    if (new_left < new_right) {
		swap_function(data, new_left, new_right);
	    }
	    if (new_left <= new_right) {
		new_left = new_left + 1;
		new_right = new_right - 1;
	    }
	}
	quicksort(data, left, new_right, swap_function);
	quicksort(data, new_left, right, swap_function);
    }

    /*************************/
    /**  Initialize svg   ****/
    /*************************/
    var sequence_to_sort = [12, 8, 9, 4, 3, 5, 10, 5];
    // create data which includes an old index that is used to identify the circle group an element belongs to
    var data = sequence_to_sort.map(function(d, i) {
	return {val : d, old_idx: i};
    });;

    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  "100%")
	.attr("height", "1050px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var smallestCircle = 12;
    var mini = Math.min.apply(null, data.map(function(d) {return d.val;}));
    var maxi = Math.max.apply(null, data.map(function(d) {return d.val;}));
    var maxi_width = computeWidth(maxi);
    var mini_width = computeWidth(mini);
    var gap = 15;
    function computeWidth(elem) {
	return elem * (smallestCircle / mini);
    }
    function sumUpTo(array, index) {
	return (index * (2*maxi_width + gap) + maxi_width);
    }
    function randomColor() { 
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
	    color += letters[Math.floor(Math.random() * 16)];
	}
	return color; 
    }

    var init_circles = function(data) {
	svg.append("defs").selectAll(".gradients")
	    .data(data)
	    .enter()
	    .append("radialGradient")
	    .attr("class", "gradients")
	    .attr("id", function(d, i) { return "gradient-" + i; })
	    .attr("fx", "50%")
	    .attr("fy", "50%")
	    .attr("r", "70%")
	    .append("stop")
	    .attr("offset", "25%")
	    .attr("stop-color", "white");

	svg.selectAll(".gradients")
    	    .append("stop")
	    .attr("offset", "75%")
	    .attr("stop-color", randomColor);


	svg.selectAll(".circle")
	    .data(data)
	    .enter()
	    .append("g")
	    .attr("class", "circle-group")
	    .attr("id", function(d, i) { return "q-g-" + i; })
	    .attr("transform", function(d, i) { return "translate(" + sumUpTo(data, i) + " " + maxi_width + ")"; })
	    .append("circle")
	    .attr("id", function(d, i) { return "q-circle-" + i; })
	    .attr("class", "quicksort-circle")
	    .attr("fill", function(d, i) { return "url(#gradient-" + i +")";})
	    .attr("r", function(d) {
		return computeWidth(d.val);
	    });
	svg.selectAll(".circle-group").each(function(d, i) { d.x_off = sumUpTo(data, i); d.y_off = maxi_width;})
	    .append("text")
	    .style("font-size", function(d) { return ((computeWidth(d.val) / mini_width) * 100) + "%"; })
	    .attr("dx", function(d) { return ((d.val > 9 ? 2 : 1)*-0.30) + "em"; })
	    .attr("dy", function(d) { return "0.22em"; })
	    .text(function(d) { return d.val; });
    }
    // now call the initialization
    init_circles(data);

    /*************************/
    /**  Setup algorithms ****/
    /*************************/
    var q_callbacks = [];
    q_callbacks[0] = function(data, left, right) {
	d3.selectAll("text.left-text").remove();
	d3.selectAll("text.right-text").remove();
	if (left == 0 && right == data.length - 1) {
	    return this.AlgorithmContext.default_animation_duration; // we don't want to move the entire array down, only subarrays
	}
	for (var i=left; i<=right; i++) {
	    var gi = d3.select("#q-g-" + data[i].old_idx);
	    var dat = gi.datum();
	    gi.transition()
		.duration(this.AlgorithmContext.default_animation_duration)
		.attr("transform", "translate(" + dat.x_off + ", " + (dat.y_off + 2.5*maxi_width) + ")");
	    dat.y_off = 2.5 * maxi_width + dat.y_off;
	}

	return this.AlgorithmContext.default_animation_duration;
    }
    // pivot animation
    q_callbacks[4] = function(pivot, data) {
	
	var pi = data[pivot].old_idx;
	var g = d3.select("#q-g-" + pi)
	var radius = g.select(".quicksort-circle").attr("r");

	g.append("rect")
	    .attr("id", "pivot-rect")
	    .attr("fill", "none")
	    .attr("stroke", "red")
	    .attr("width", 2*radius)
	    .attr("height", 2*radius)
	    .attr("x", -radius)
	    .attr("y", -radius);

	return this.AlgorithmContext.default_animation_duration;
    }
    // left animation
    function updateLeft(data, new_left) {
	if (new_left >= data.length) {
	    return 0;
	}
	var new_left_i = data[new_left].old_idx;
	var g = d3.select("#q-g-" + new_left_i);
	var radius = g.select("circle").attr("r");

	d3.selectAll("g.left")
	    .classed("left", false)
	    .select("text.left-text")
	    .remove();

	g.append("text")
	    .attr("class", "left-text")
	    .attr("dx", -radius)
	    .attr("dy", -radius)
	    .text("Left");
	g.classed("left", true);

	return this.AlgorithmContext.default_animation_duration;
    };
    q_callbacks[6] = q_callbacks[10] = q_callbacks[19] = function(data, new_left) {
	return updateLeft.apply(this, arguments);
    };
    //right animation
    function updateRight(data, new_right) {
	if (new_right < 0) {
	    return 0;
	}
	var new_right_i = data[new_right].old_idx;
	var g = d3.select("#q-g-" + new_right_i);
	var radius = g.select("circle").attr("r");
	d3.selectAll("g.right")
	    .classed("right", false)
	    .select("text.right-text")
	    .remove();

	g.append("text")
	    .attr("class", "right-text")
	    .attr("dx", radius)
	    .attr("dy", radius)
	    .text("Right");
	g.classed("right", true);
	return this.AlgorithmContext.default_animation_duration;
    };
    q_callbacks[7] = q_callbacks[13] = q_callbacks[20] = function(data, new_right) {
	return updateRight.apply(this, arguments);
    }
    // end of while cleanup
    q_callbacks[22] = function() {
	svg.selectAll("#pivot-rect").remove();
	return 10;
    };

    function visualizeStack(data, left, right) {


    }

    q_callbacks[23] = function(data, left, right) {
	visualizeStack.apply(this, arguments);
    }
    // move subarray back
    q_callbacks[24] = q_callbacks[1] = function(data, left, right) {
	if (left == 0 && right == data.length - 1) {
	    return this.AlgorithmContext.default_animation_duration; // we don't want to move the entire array up, only subarrays
	}
	for (var i=left; i<=right; i++) {
	    var gi = d3.select("#q-g-" + data[i].old_idx);
	    var dat = gi.datum();
	    gi.transition()
		.duration(this.AlgorithmContext.default_animation_duration)
		.attr("transform", "translate(" + dat.x_off + ", " + (dat.y_off - 2.5*maxi_width) + ")");
	    dat.y_off = dat.y_off - 2.5 * maxi_width;
	}
	return this.AlgorithmContext.default_animation_duration;
    }
    // we are going to do the animation inside swap and return the length of that
    // animation in the post swap callbacks to correctly animate the delay
    var swapping_animation_duration = 3000;
    q_callbacks[16] = {
	post: function(data, new_left, new_right) {
	    var self = this;
	    updateLeft.call(self, data, new_left);
	    updateRight.call(self, data, new_right);
	    return swapping_animation_duration;
	},
	pre: function(data, new_left, new_right) {
	    var step_duration = 1000;
	    var i = new_left;
	    var j = new_right;
	    if (i == j) return;

	    var gi = d3.select("#q-g-" + data[i].old_idx)
	    var gj = d3.select("#q-g-" + data[j].old_idx)

	    var di = gi.datum();
	    var dj = gj.datum();

	    var trns1 = [di.x_off, di.y_off];
	    var trns2 = [dj.x_off, dj.y_off];
	    gi.transition().duration(step_duration).attr("transform", "translate(" + trns1[0] + " " + (trns1[1] - maxi_width) + ")");
	    gj.transition().duration(step_duration).attr("transform", "translate(" + trns2[0] + " " + (trns2[1] + maxi_width) + ")");

	    gi.transition().delay(step_duration).duration(step_duration).attr("transform", "translate(" + trns2[0] + " " + (trns1[1] - maxi_width) + ")");
	    gj.transition().delay(step_duration).duration(step_duration).attr("transform", "translate(" + trns1[0] + " " + (trns2[1] + maxi_width) + ")");

	    gi.transition().delay(2*step_duration).duration(step_duration).attr("transform", "translate(" + trns2[0] + " " + trns1[1] + ")");
	    gj.transition().delay(2*step_duration).duration(step_duration).attr("transform", "translate(" + trns1[0] + " " + trns2[1] + ")");

	    di.x_off = trns2[0];
	    di.y_off = trns1[1];

	    dj.x_off = trns1[0];
	    dj.y_off = trns2[1];

	    return 0;
	}
    };
    var algo_context = {
	default_animation_duration : 300,
    };
    var qual_algo = new Algorithm(quicksort, q_callbacks, "quicksort-code", algo_context);
    AlgorithmUtils.attachAlgoToControls(qual_algo, algorithmTabId);

    var swap_callbacks = [];
    var swap_context = {
	default_animation_duration: 0, 
    }
    var swap_algo = new Algorithm(swap_function, swap_callbacks, "swap_function-code", swap_context);

    d3.select("#" + algorithmTabId + " .code")
	.append("div")
	.attr("class", "quicksort-code")
        .append("div")
	.attr("class", "function-code-holder")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(qual_algo);

    
    d3.select("#" + algorithmTabId + " .options").append("button")
	.on("click", function(d) {
	    console.log("Before", data.map(function(d) { return d.val; }));
	    qual_algo.startAnimation(data, 0, data.length - 1, function(data, i, j) {
		return swap_algo.run(data, i, j); 
	    });
	    console.log("After", data.map(function(d) { return d.val; }));
	})
	.text("Sort");

    Array.prototype.shuffle = function() {
	var N = this.length;
	for (var i = 0, j = N - 1, x = 0; j >= 0; j--) {
	    i = Math.floor(Math.random() * (j+1));
	    x = this[j]; 
	    this[j] = this[i];
	    this[i] = x;
	}
    };
    var shrunk = 1;
    d3.select("#" + algorithmTabId + " .options").append("button")
	.attr("style", "margin-left: 10px")
        .on("click", function(d) {
	    if (shrunk % 3 != 0) {
		AlgorithmUtils.visualizeNewStackFrame(qual_algo);
	    }
	    else {
		AlgorithmUtils.popStackFrame(qual_algo);
	    }
	    shrunk++;
	})
	.text("Shrink!");

    d3.select("#" + algorithmTabId + " .options").append("button")
	.attr("style", "margin-left: 10px")
        .on("click", function(d) {
	    sequence_to_sort.shuffle();
	    sequence_to_sort.forEach(function(d, i) {
		data[i].val = d;
		data[i].old_idx = i;
	    });
	    d3.selectAll(".circle-group").remove();
	    d3.selectAll("defs").remove();
	    init_circles(data);
	})
    .text("Shuffle Data");
})();
