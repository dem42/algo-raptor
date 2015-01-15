ALGORITHM_MODULE.bsearch_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "bsearch-tab";
    var algorithmName = "Binary Search";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded bs", _my);

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName, "search-1-binary", [6, 6], "Algorithm input data may be modified below:");
    layout.customControlsLayout.append("div").attr("class", "forms");
    /*******************************/
    /*      Setup the svg stuff    */
    /*******************************/
    var margin = { left: 20, top: 45, right: 10, bottom: 10},
    height = 200,
    width = 600,
    w = 20,
    h = 20,
    N = 15,
    Y = 50;
    var cbs = {};
    // used to store new position, this var is here because we cannot store it on data since the callbacks
    // receive their own copy of data and any changes they make won't be preserved
    var map_of_new_pos = {}; 
    var arrow = false;
    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width", width)
	.attr("height", 0);
    var svgg = undefined; //current svg group

    function bsearch(data, key) {
	//data must be sorted before we can binary search
	data.sort(function(a,b) { return a.val - b.val;});

	var high = data.length-1;
	var low = 0;
	var mid = 0;
	while (low < high) {
	    mid = Math.floor((high + low)/2);
	    if (data[mid].val < +key) {
		low = mid + 1;
	    } else {
		high = mid;
	    }
	}
	mid = low;
	if (mid == high && data[mid].val == key) {
	    console.log("found");
	} else {
	    console.log("not found");
	}
    }

    /* callback called right after entering the function
     * it initializes the data
     */
    cbs[0] = function(data, key) {
	if (svgg !== undefined) {
	    svgg.remove();
	    svgg = undefined;
	}
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	svgg = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");
	svgg.append("text").attr("id", "bs-what-to-find-lbl")
	    .attr("dy", -25)
	    .attr("dx", -10)
	    .text("Searching for: ").append("tspan").text(key);
	var viewBox = _my.AlgorithmUtils.calcViewBox("#" + algorithmTabId + " .graphics", width, height);
	svg.attr("width", viewBox.width)
	    .attr("height", viewBox.height)
	    .attr("viewBox", viewBox.string)

	/* the gs have an old_i which is their old order .. we move the gs to where they are
	 * in the old order
	 */
	var gs = svgg.selectAll(".bs-gs")
	    .data(data)
	    .enter().append("g")
	    .attr("class", "bs-gs")
	    .attr("id", function(d, i) { return "bs-item-" + i; })
	    .attr("transform", function(d, i) { return "translate(" + 2*w*d.old_i + "," + Y + ")";});
	/*add rectangles and text into the groups*/  
	gs.append("rect")
	    .attr("x", -w/2)
	    .attr("width", w)
	    .attr("height", h)
	    .attr("class", "svg-input-box");
	gs.append("text")
	    .attr("class", "bs-text")
	    .attr("dy", 15)
	    .text(function(d) { return d.val; });

	/* setup the arrow data */
	arrow = svgg.append("image")
	    .style("visibility","hidden")
	    .attr("y",0)
	    .attr("x",0)
	    .attr("width",30)
	    .attr("height",30)
	    .attr("xlink:href", "assets/arrow2.png");

	return animation_duration;
    };
    /* callback called after the array has been sorted
     * it draws the data
     */
    cbs[2] = function(data) { 
	var animation_duration = 4 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var move_up_animation_duration = (1/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	/* the gs have an old_i which is their old order .. we move the gs to where they are
	 * in the old order
	 */
	var gs = svgg.selectAll(".bs-gs");
	map_of_new_pos = {};
	for (var i=0;i < data.length; i++) {
	    map_of_new_pos[data[i].old_i] = i;
	}

	var single_iterm_anim_duration = animation_duration / data.length;
	for (var i=0; i<data.length; i++) {
	    svg.select("#bs-item-" + data[i].old_i).transition()
		.delay(i*single_iterm_anim_duration)
		.duration(single_iterm_anim_duration)
		.attr("transform", function(d) {
		    return "translate(" + (2*w*i) + "," + (2.5*Y) + ")";
		});
	}

	/*interpolating works with transforms too .. so cool -> move to new spot*/
	gs.attr("id", function(d, i) { return "bs-item-" + map_of_new_pos[i]; })
	    .transition().delay(animation_duration).duration(move_up_animation_duration)
	    .attr("transform", function(d, i) {
		return "translate(" + (2*w*map_of_new_pos[i]) + "," + Y + ")";
	    });
	
	return animation_duration + move_up_animation_duration;
    };
    /*callback called inside every iteration
     * updates the arrow pointer
     */
    cbs[8] = cbs[15] = function(mid) { 
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	arrow.style("visibility","visible").transition().duration(animation_duration).attr("x",2*w*mid-3-w/2);
	return animation_duration;
    };
    cbs[10] = function(low) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	svgg.selectAll(".bs-gs").filter(function(d, i) { return map_of_new_pos[d.old_i] < low;})
	    .transition(animation_duration).style("opacity", 0);
	return animation_duration;
    }
    cbs[12] = function(high) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	svgg.selectAll(".bs-gs").filter(function(d, i) { return map_of_new_pos[d.old_i] > high;})
	    .transition(animation_duration).style("opacity", 0);
	return animation_duration;
    }
    /*callback called after a match was found
     */
    cbs[17] = function(low) { 
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	arrow.style("visibility","visible").transition().duration(animation_duration).attr("x",2*w*low-3-w/2);
	svgg.append("text")
	    .attr("dy", "100px")
	    .attr("class", "not-found-label")
	    .transition().duration(animation_duration).text("Found!");
	return animation_duration;
    };
    /*callback called if a match was NOT found
     */
    cbs[19] = function() { 
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	svgg.append("text")
	    .attr("dy", "100px")
	    .attr("class", "not-found-label")
	    .transition().duration(animation_duration).text("Not Found!");
	return animation_duration;
    };

    /*setup the data*/	 
    var data = new Array(N);

    /*setup the DOM elements*/
    var forms = d3.select(".forms").selectAll("input[type='text']")
	.data(data)
	.enter().append("input")
	.attr("type","text")
	.attr("class","input-box")
	.attr("maxlength", 2);

    /*populate the inputs*/
    var inputs = document.querySelectorAll("input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = Math.floor(Math.random()*99);
    }


    /* create an Algorithm instance wired with callbacks */
    var balgo = new _my.Algorithm(bsearch, cbs, "bs-code", _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
				  function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });
    _my.AlgorithmUtils.attachAlgoToControls(balgo, algorithmTabId, function kickOff(executionFunction) {
	/* The function that starts the simulation.
	 * It creates a dialog and the dialog starts the execution
	 */
	var dialog = bootbox.dialog({
	    title:"Start binary search", 
	    message: '<span>Enter a value to search for:</span>' + 
		'<input id="bs-find" type="text" class="input-box" maxlength="2" />',
	    buttons: {
		success: {
		    label: "Start",
		    className: "btn-success",
		    callback: function() {
			var lo = 0, hi = N, m, tf = document.getElementById("bs-find").value;
			d3.selectAll(".forms .input-box").each(function(v, i, a) {
			    data[i] = { val: this.value};
			});
			data.forEach(function (v,i) { v.old_i = i; });
			balgo.startAnimation(data,tf,lo,hi,m);
			executionFunction();
		    }
		},
		cancel: {
		    label: "Cancel",
		    className: "btn-primary",
		    callback: function() {
		    }
		}
	    }
	});
	// this is a jquery object and therefore the .on function can be used
	// to attach multiple handlers .. they will be called in order of addition
	// unless one of them call e.stopImmediatePropagation
	dialog.on("shown.bs.modal", function() { $("#bs-find").focus(); })
    });
    _my.AlgorithmUtils.appendCode(algorithmTabId, "bs-code", balgo);
    
    return {"bsearch": bsearch, "bsearch-algorithm": balgo};

})(ALGORITHM_MODULE, $, d3, bootbox);
