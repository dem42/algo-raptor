ALGORITHM_MODULE.quicksort_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }
    var algorithmTabId = "quicksort-tab";
    var algorithmName = "Quicksort";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded quicksort");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName,  {priority:"sorting-quick"}, [6, 6]);
    layout.introduction.setIntroTlDr("<p>This is the most famous sorting algorithm, although contrary to the name not really the quickest. In the worst case scenario the algorithm sorts in <var>O(N<sup>2</sup>)</var> time, even though on average you can expect <var>O(N log N)</var>. The choice of the pivot affects the worst case probability.</p>");
    layout.introduction.setIntroReadMore("<p>This implementation of quicksort sorts in place by swapping elements around. Maintaining a left and right pointer to find elements which are either larger or smaller than the pivot element and moving them to the left or right of the pivot accordingly.</p>");
    
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
    var LEN = 8, MAX_VAL = 12, MIN_VAL = 3;
    var sequence_to_sort = getRandomArray(LEN, MAX_VAL, MIN_VAL);
    // create data which includes an old index that is used to identify the circle group an element belongs to
    var data = sequence_to_sort.map(function(d, i) {
	return {val : d, old_idx: i};
    });

    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  "900px")
	.attr("height", "478px")
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
    var defs_id = "qsort-circle-gradient-defs";
    var init_circles = function(data) {
	svg.append("defs").attr("id", defs_id).selectAll(".gradients")
	    .data(data)
	    .enter()
	    .append("radialGradient")
	    .attr("class", "qsort-gradients")
	    .attr("id", function(d, i) { return "qsort-gradient-" + i; })
	    .attr("fx", "50%")
	    .attr("fy", "50%")
	    .attr("r", "70%")
	    .append("stop")
	    .attr("offset", "25%")
	    .attr("stop-color", "white");

	svg.selectAll(".qsort-gradients")
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
	    .attr("fill", function(d, i) { return "url(#qsort-gradient-" + i +")";})
	    .attr("r", function(d) {
		return computeWidth(d.val);
	    });
	svg.selectAll(".circle-group").each(function(d, i) { d.x_off = sumUpTo(data, i); d.y_off = maxi_width;})
	    .append("text")
	    .attr("class", "quicksort-text")
	    .style("font-size", function(d) { return ((computeWidth(d.val) / mini_width) * 100) + "%"; })
	    .text(function(d) { return d.val; });
    };
    // now call the initialization
    init_circles(data);

    /*************************/
    /**  Setup algorithms ****/
    /*************************/
    var q_callbacks = [];
    var recursion_depth = -1; // this is used by the callbacks to determine the depth of the recursion
    q_callbacks[1] = function(data, left, right) {
	var animationDuration = this.AlgorithmContext.getBaselineAnimationSpeed();
        recursion_depth++; // a new stack frame has been added so we increase the recursion depth
	d3.selectAll("text.q-left-text").remove();
	d3.selectAll("text.q-right-text").remove();
	d3.selectAll("image.q-arrow").remove();
	if (left === 0 && right === data.length - 1) {
	    return animationDuration; // we don't want to move the entire array down, only subarrays
	}
	var layer_y = (2.5 * maxi_width) * recursion_depth;
	var depth_label_id = "q-rec-label-depth-" + recursion_depth;
	if (svg.select("#" + depth_label_id).size() === 0) {
	    svg.insert("text", "#qsort-circle-gradient-defs")
		.attr("x", 20)
		.attr("y", layer_y)
		.attr("class", "q-rec-depth-label")
		.attr("id", depth_label_id)
		.text("Recursion Depth = " + recursion_depth + ":");
	}
	for (var i=left; i<=right; i++) {
	    var gi = d3.select("#q-g-" + data[i].old_idx);
	    var dat = gi.datum();
	    gi.transition()
		.duration(animationDuration)
		.attr("transform", "translate(" + dat.x_off + ", " + (dat.y_off + 2.5 * maxi_width) + ")");
	    dat.y_off = 2.5 * maxi_width + dat.y_off;
	}

	return animationDuration;
    };
    // pivot animation
    q_callbacks[5] = function(pivot, data) {
	var pi = data[pivot].old_idx;
	var g = d3.select("#q-g-" + pi);
	var radius = g.select(".quicksort-circle").attr("r");

	var pivot_dom_elem = g.append("g").attr("id", "qsort-pivot");
	pivot_dom_elem.append("rect")
	    .attr("width", 2*radius)
	    .attr("height", 2*radius)
	    .attr("x", -radius)
	    .attr("y", -radius);
	pivot_dom_elem.append("text")
	    .text("Pivot")
	    .attr("dy", -(1.1)*radius);
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    // left animation
    function updateLeft(data, new_left) {
	if (new_left >= data.length) {
	    return 0;
	}
	return updateArrow.call(this, data, new_left, "left", "q-left-text", "Left");
    }
    //right animation
    function updateRight(data, new_right) {
	if (new_right < 0) {
	    return 0;
	}
	return updateArrow.call(this, data, new_right, "right", "q-right-text", "Right");
    }
    function updateArrow(data, pos, class_name, text_class, text) {
	if (pos >= data.length) {
	    return 0;
	}
	var pos_i = data[pos].old_idx;
	var g = d3.select("#q-g-" + pos_i);
	var radius = g.select("circle").attr("r");
	var gleft = d3.selectAll("g." + class_name)
	    .classed(class_name, false);
	gleft.select("image.q-arrow")
	    .remove();
	gleft.select("text." + text_class)
	    .remove();
	g.append("image")
	    .attr("class", "q-arrow")
	    .attr("y",-(maxi_width * 1.7))
	    .attr("x",-15)
	    .attr("width",30)
	    .attr("height",30)
	    .attr("xlink:href", "assets/arrow2.png")
	    .attr("transform", "rotate(180)");
	g.append("text")
	    .attr("class", text_class + " quicksort-text")
	    .attr("dy", (maxi_width * 1.7) + 18).text(text);
	g.classed(class_name, true);
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    }
    q_callbacks[7] = q_callbacks[11] = q_callbacks[20] = function(data, new_left) {
	return updateLeft.apply(this, arguments);
    };
    q_callbacks[8] = q_callbacks[14] = q_callbacks[21] = function(data, new_right) {
	return updateRight.apply(this, arguments);
    };
    // end of while cleanup
    q_callbacks[23] = function() {
	svg.selectAll("#qsort-pivot").remove();
	return 0.5 * this.AlgorithmContext.getBaselineAnimationSpeed();
    };

    // move subarray back
    q_callbacks[25] = q_callbacks[2] = function(data, left, right) {
	var animationDuration = this.AlgorithmContext.getBaselineAnimationSpeed();
	if (left === 0 && right === data.length - 1) {
	    return animationDuration; // we don't want to move the entire array up, only subarrays
	}
	for (var i=left; i<=right; i++) {
	    var gi = d3.select("#q-g-" + data[i].old_idx);
	    var dat = gi.datum();
	    gi.transition()
		.duration(animationDuration)
		.attr("transform", "translate(" + dat.x_off + ", " + (dat.y_off - 2.5*maxi_width) + ")");
	    dat.y_off = dat.y_off - 2.5 * maxi_width;
	}
	svg.select("#q-rec-label-depth-" + recursion_depth).remove();
	recursion_depth--; // these are return statements so we want to decrease the recursion depth
	return animationDuration;
    };
    // we are going to do the animation inside swap and return the length of that
    // animation in the post swap callbacks to correctly animate the delay
    q_callbacks[17] = {
	post: function(data, new_left, new_right) {
	    var animationDuration = 6 * this.AlgorithmContext.getBaselineAnimationSpeed();
	    updateLeft.call(this, data, new_left);
	    updateRight.call(this, data, new_right);
	    return animationDuration;
	},
	pre: function(data, new_left, new_right) {
	    var step_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	    var i = new_left;
	    var j = new_right;
	    if (i == j) return;

	    var gi = d3.select("#q-g-" + data[i].old_idx);
	    var gj = d3.select("#q-g-" + data[j].old_idx);

	    var di = gi.datum();
	    var dj = gj.datum();

	    var trns1 = {x: di.x_off, y: di.y_off};
	    var trns2 = {x: dj.x_off, y: dj.y_off};

	    _my.vislib.swapSelections(gi, trns1, gj, trns2, [step_duration, step_duration, step_duration], maxi_width, 0);

	    di.x_off = trns2.x;
	    di.y_off = trns1.y;

	    dj.x_off = trns1.x;
	    dj.y_off = trns2.y;
	    // the swapping animation duration is returned in the post callback
	    return 0;
	}
    };
    var algo_context = _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj);
    var qual_algo = new _my.Algorithm(quicksort, q_callbacks, "quicksort-code", algo_context, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
	recursion_depth = -1;
    });

    var swap_callbacks = [];
    var swap_context = _my.AlgorithmUtils.createAlgorithmContext(); // not linked to the controls object
    var swap_algo = new _my.Algorithm(swap_function, swap_callbacks, "swap_function-code", swap_context);

    _my.AlgorithmUtils.appendCode(algorithmTabId, "quicksort-code", qual_algo);

    function kickoff(executionFunction) {
	console.log("Before", data.map(function(d) { return d.val; }));
	qual_algo.runCodeAndPopulateAnimationQueue(data, 0, data.length - 1, function(data, i, j) {
	    return swap_algo.run(data, i, j); 
	});
	console.log("After", data.map(function(d) { return d.val; }));
	executionFunction();
    }
    // setup the controls
    _my.AlgorithmUtils.attachAlgoToControls(qual_algo, algorithmTabId, kickoff);

    function getRandomArray(len, max_val, min_val) {
	var result = [];
	for (var i = 0; i < len; i++) {
	    result.push(Math.floor(Math.random() * (max_val - min_val) + min_val));
	}
	return result;
    }

    layout.customControlsHeader.style("display", "inline-block");
    layout.customControlsLayout.append("button")
	.attr("class", "btn btn-info btn-sm quick-shuffle-btn")
	.attr("title", "Permute the quicksort input data. (The balls!)")
        .on("click", function() {
	    sequence_to_sort = getRandomArray(LEN, MAX_VAL, MIN_VAL);
	    sequence_to_sort.forEach(function(d, i) {
		data[i].val = d;
		data[i].old_idx = i;
	    });
	    d3.selectAll(".circle-group").remove();
	    d3.select("#" + defs_id).remove();
	    init_circles(data);
	})
	.text("Randomize");

    _my.vislib.addRaptorHead(algorithmTabId, "quicksort-code", 5, "Here our pivot selection strategy is to simply pick the middle element as the pivot. Feh!! This will lead to quadratic performance for example with an array like <code>[3, 0, 1, 2]</code>");
    _my.vislib.addRaptorHead(algorithmTabId, "quicksort-code", 10, "Move the left pointer right until we find an element larger than pivot. Elementary my dear Tyranosaurus.");
    _my.vislib.addRaptorHead(algorithmTabId, "quicksort-code", 13, "Move the right pointer left until we find an element smaller than pivot. Elementary my dear Brachiosaurus.");

    return {"quicksort": quicksort, "swap_function": swap_function, "quicksort-algorithm": qual_algo, "getRandomArray" : getRandomArray};

})(ALGORITHM_MODULE, $, d3, bootbox);
