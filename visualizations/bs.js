ALGORITHM_MODULE.bsearch_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmNormTabId = "bsearch-norm-tab";
    var algorithmNormName = "Classical Binary Search";
    var algorithmDefTabId = "bsearch-def-tab";
    var algorithmDefName = "Deferred Evaluation Binary Search";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded bs", _my);

    var layout_def = _my.AlgorithmUtils.setupLayout(algorithmDefTabId, algorithmDefName,  {priority:"bin-search-def"}, [6, 6], "Algorithm input data may be modified below:");
    var forms_def = layout_def.customControlsLayout.append("div").attr("class", "bs-forms");
    layout_def.introduction.setIntroTlDr("<p>The lesser known version of binary search is the deferred evaluation version. The advantage of this version is that it finds the first index where our condition holds.</p> ");
    layout_def.introduction.setIntroReadMore("<p>This is important and often super useful because in classical binary search the returned index is any index that matches our condition. The disadvantage is that we never terminate sooner than in <var>log N</var> steps</p><p>In the deferred evaluation version the equality-to-the-key check is not performed inside the loop. Instead we just check whether the value at the current position is smaller than the key.</p>");

    var layout_norm = _my.AlgorithmUtils.setupLayout(algorithmNormTabId, algorithmNormName,  {priority:"bin-search-norm"}, [6, 6], "Algorithm input data may be modified below:");
    var forms_norm = layout_norm.customControlsLayout.append("div").attr("class", "bs-forms");
    layout_norm.introduction.setIntroTlDr("<p>Binary search is the big kahuna. The idea is simple enough; if you have a sorted sequence you can find an element in only <var>log N</var> steps by jumping to the middle of the sequence, checking the value there against the element you are searching for and then repeating the process on either the top or lower half of the sequence.</p>");
    layout_norm.introduction.setIntroReadMore("<p>The classical version of binary search, which is presented on this page, will terminate as soon as it finds the first element that matches the sought-after condition. In case you want to find the first such element you should check out <a href=#bsearch-def-tab>Deferred Evaluation Binary Search</a>.</p>");

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
    var cbs_norm = [];
    var cbs_def = [];
    var prep_calls_def = [];
    var prep_calls_norm = [];
    // used to store new position, this var is here because we cannot store it on data since the callbacks
    // receive their own copy of data and any changes they make won't be preserved
    var map_of_new_pos = {}; 
    var arrow = false;
    var svg_def = d3.select("#" + algorithmDefTabId + " .graphics").append("svg")
	.attr("width", width)
	.attr("height", 0);
    var svg_norm = d3.select("#" + algorithmNormTabId + " .graphics").append("svg")
	.attr("width", width)
	.attr("height", 0);
    var svgg_def = svg_def.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +  ")"); //current svg group
    var svgg_norm = svg_norm.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +  ")"); //current svg group

    function preprocess(data, key, bsearch) {
	//data must be sorted before we can binary search
	data.sort(function(a,b) { return a.val - b.val;});
	return bsearch(data, key);
    }

    function bsearch(data, key) {
	var high = data.length-1;
	var low = 0;
	var mid = 0;
	while (low <= high) {
	    mid = low + Math.floor((high - low)/2);
	    if (data[mid].val == +key) {
		return mid;
	    }
	    else if (data[mid].val < +key) {
		low = mid + 1;
	    } else {
		high = mid - 1;
	    }
	}
	return -1;
    }

    function deferred_bsearch(data, key) {
	var high = data.length-1;
	var low = 0;
	var mid = 0;
	while (low < high) {
	    mid = low + Math.floor((high - low)/2);
	    if (data[mid].val < +key) {
		low = mid + 1;
	    } else {
		high = mid;
	    }
	}
	mid = low;
	if (mid == high && data[mid].val == key) {
	    return mid;
	} else {
	    return -1;
	}
    }

    function prep_fun_gen(svg, svgg, algorithmTabId) {
	return function(data, key) {
	    svgg.selectAll("*").remove();
	    var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
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
		.attr("class", "bs-svg-input-box");
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

	    svgg.append("text").attr("class", "bs-big-red-warning").attr("dx", -10)
		.text("We can only binary search a ")
		.append("tspan").attr("class", "bs-warning-bold-tspan").text("sorted")
		.append("tspan").attr("class", "bs-warning-normal-tspan").text(" array. Thus, we must sort.");

	    return animation_duration;
	};
    }
    function prep_sort_gen(svgg) {
	return function(data, key) { 
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
		svgg.select("#bs-item-" + data[i].old_i).transition()
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
    }

    function bs_enter_gen(svgg) {
	return function(key) {
	    svgg.select(".bs-big-red-warning").remove();
	    svgg.append("text").attr("id", "bs-what-to-find-lbl")
		.attr("dy", -25)
		.attr("dx", -10)
		.text("Searching for: ").append("tspan").text(key);
	};
    }

    function mid_gen(svgg) {
	return function(mid) { 
	    var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	    arrow.style("visibility","visible").transition().duration(animation_duration).attr("x",2*w*mid-3-w/2);
	    return animation_duration;
	};
    }
    function low_up_gen(svgg) {
	return function(low) {
	    var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	    svgg.selectAll(".bs-gs").filter(function(d, i) { return map_of_new_pos[d.old_i] < low;})
		.transition(animation_duration).style("opacity", 0);
	    return animation_duration;
	};
    }
    function high_up_gen(svgg) {
	return function(high) {
	    var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	    svgg.selectAll(".bs-gs").filter(function(d, i) { return map_of_new_pos[d.old_i] > high;})
		.transition(animation_duration).style("opacity", 0);
	    return animation_duration;
	};
    }
    function res_check_gen(svgg) {
	return { "pre" : function(mid) { 
	    var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	    arrow.style("visibility","visible").transition().duration(animation_duration).attr("x",2*w*mid-3-w/2);
	    svgg.append("text")
		.attr("dy", -25)
		.attr("dx", 140)
		.attr("class", "not-found-label")
		.transition().duration(animation_duration).text("Found!");
	    return animation_duration;
	}};
    }
    function not_found_gen(svgg) {
	return { "pre" : function() { 
	    var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	    svgg.append("text")
		.attr("dy", -25)
		.attr("dx", 140)
		.attr("class", "not-found-label")
		.transition().duration(animation_duration).text("Not Found!");
	    return animation_duration;
	}};
    }
    /* callback called right after entering the function
     * it initializes the data
     */
    prep_calls_def[1] = prep_fun_gen(svg_def, svgg_def, algorithmDefTabId);
    prep_calls_norm[1] = prep_fun_gen(svg_norm, svgg_norm, algorithmNormTabId);
    /* callback called after the array has been sorted
     * it draws the data
     */
    prep_calls_def[3] = prep_sort_gen(svgg_def);
    prep_calls_norm[3] = prep_sort_gen(svgg_norm);
    /*callback called inside every iteration
     * updates the arrow pointer
     */
    cbs_def[1] = bs_enter_gen(svgg_def);
    cbs_norm[1] = bs_enter_gen(svgg_norm);
    cbs_def[6] = cbs_def[13] = mid_gen(svgg_def);
    cbs_norm[6] = mid_gen(svgg_norm);
    cbs_def[8] = low_up_gen(svgg_def);
    cbs_norm[11] = low_up_gen(svgg_norm);
    cbs_def[10] = high_up_gen(svgg_def);
    cbs_norm[13] = high_up_gen(svgg_norm);
    /*callback called after a match was found
     */
    cbs_def[15] = res_check_gen(svgg_def);
    cbs_norm[8] = res_check_gen(svgg_norm);
    /*callback called if a match was NOT found
     */
    cbs_def[17] = not_found_gen(svgg_def);
    cbs_norm[16] = not_found_gen(svgg_norm);

    /*setup the data*/	 
    var data_def = new Array(N);
    var data_norm = new Array(N);


    function initialize(forms, data) {
	/*setup the DOM elements*/
	var forms = forms.selectAll("input[type='text']")
	    .data(data)
	    .enter().append("input")
	    .attr("type","text")
	    .attr("class","bs-input-box")
	    .attr("maxlength", 2)
	    .attr("value", function(d) { return Math.floor(Math.random()*99); });
    }
    initialize(forms_def, data_def);
    initialize(forms_norm, data_norm);

    function bootbox_gen(forms, balgo, prep_algo, data) {
	return function kickOff(executionFunction) {
	    /* The function that starts the simulation.
	     * It creates a dialog and the dialog starts the execution
	     */
	    var dialog = bootbox.dialog({
		title:"Start binary search", 
		message: '<span>Enter a value to search for:</span>' + 
		    '<input id="bs-find" type="text" class="bs-input-box" maxlength="2" />',
		buttons: {
		    cancel: {
			label: "Cancel",
			className: "btn-primary",
			callback: function() {
			}
		    },
		    success: {
			label: "Start",
			className: "btn-success",
			callback: function() {
			    var lo = 0, hi = N, m, tf = document.getElementById("bs-find").value;
			    forms.selectAll(".bs-forms .bs-input-box").each(function(v, i, a) {
				data[i] = { val: this.value};
			    });
			    console.log("starting", data);
			    data.forEach(function (v,i) { v.old_i = i; });
			    var bs_wrapped = function(data, tf) {
				return balgo.runWithSharedAnimationQueue(prep_algo, data, tf);
			    }
			    console.log(prep_algo.startAnimation(data, tf, bs_wrapped));
			    executionFunction();
			}
		    }
		}
	    });
	    // this is a jquery object and therefore the .on function can be used
	    // to attach multiple handlers .. they will be called in order of addition
	    // unless one of them call e.stopImmediatePropagation
	    dialog.on("shown.bs.modal", function() { $("#bs-find").focus(); })
	};
    }

    /* create an Algorithm instance wired with callbacks */
    var prep_algo_def = new _my.Algorithm(preprocess, prep_calls_def, "prep-code-def", _my.AlgorithmUtils.createAlgorithmContext(layout_def.defaultControlsObj), function() { _my.AlgorithmUtils.resetControls(algorithmDefTabId); });

    var balgo_def = new _my.Algorithm(deferred_bsearch, cbs_def, "bs-code-def", _my.AlgorithmUtils.createAlgorithmContext(layout_def.defaultControlsObj), function() { _my.AlgorithmUtils.resetControls(algorithmDefTabId); });

    var prep_algo_norm = new _my.Algorithm(preprocess, prep_calls_norm, "prep-code-norm", _my.AlgorithmUtils.createAlgorithmContext(layout_norm.defaultControlsObj), function() { _my.AlgorithmUtils.resetControls(algorithmNormTabId); });

    var balgo_norm = new _my.Algorithm(bsearch, cbs_norm, "bs-code-norm", _my.AlgorithmUtils.createAlgorithmContext(layout_norm.defaultControlsObj), function() { _my.AlgorithmUtils.resetControls(algorithmNormTabId); });


    

    _my.AlgorithmUtils.attachAlgoToControls(prep_algo_def, algorithmDefTabId, bootbox_gen(forms_def, balgo_def, prep_algo_def, data_def));
    _my.AlgorithmUtils.attachAlgoToControls(prep_algo_norm, algorithmNormTabId, bootbox_gen(forms_norm, balgo_norm, prep_algo_norm, data_norm));


    _my.AlgorithmUtils.appendCode(algorithmDefTabId, "prep-code-def", prep_algo_def).style("display", "none");
    _my.AlgorithmUtils.appendCode(algorithmDefTabId, "bs-code-def", balgo_def);

    _my.AlgorithmUtils.appendCode(algorithmNormTabId, "prep-code-norm", prep_algo_norm).style("display", "none");
    _my.AlgorithmUtils.appendCode(algorithmNormTabId, "bs-code-norm", balgo_norm);

    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 4, "Notice that it says <code>low < high</code>. This is specific to the deferred evaluation binary search and is different to normal binary search where the condition is <code>low <= high</code>");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 6, "Hum, hum... Notice that we aren't checking <b>equality</b> here in the deferred equality binary search. Instead we check on line 14 after the loop... This is where the deferred equality name comes from, yah yah!");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 9, "In deferred evaluation binary search we only move the <code>low</code> pointer not the <code>high</code> one");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 13, "In deferred evaluation we check for equality outside of the <code>while</code> loop");

    _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 4, "Note that the check here is <code>low <= high</code> This is an easy one to get wrong to watch out!");
    _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 5, "This way of computing the mid value might seem odd, but it has an important advantage to the more common <code>(low + high) / 2</code>. If either your <code>low</code> or <code>high</code> value is close to the maximum integer value then the addition might overflow which will mess up your algorithm completely. Now this may not happen when you are searching an array, but if your search condition is something else then it could so it's not a bad habit to get into.");
   _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 15, "What you return can be important. Some versions of binary search choose for example to return the index where you would insert the value, but times negative one.");

    return {"bsearch": bsearch, "bsearch-algorithm": balgo_def};

})(ALGORITHM_MODULE, $, d3, bootbox);

