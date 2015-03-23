/*** we want some functionality only available in ecma6 .. polyfill it **/
(function(Math) {
        /**
     * Decimal adjustment of a number.
     *
     * @param	{String}	type	The type of adjustment.
     * @param	{Number}	value	The number.
     * @param	{Integer}	exp		The exponent (the 10 logarithm of the adjustment base).
     * @returns	{Number}			The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
	// If the exp is undefined or zero...
	if (typeof exp === 'undefined' || +exp === 0) {
	    return Math[type](value);
	}
	value = +value;
	exp = +exp;
	// If the value is not a number or the exp is not an integer...
	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
	    return NaN;
	}
	// Shift
	value = value.toString().split('e');
	value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
	// Shift back
	value = value.toString().split('e');
	return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
	Math.round10 = function(value, exp) {
	    return decimalAdjust('round', value, exp);
	};
    }
    // Decimal floor
    if (!Math.floor10) {
	Math.floor10 = function(value, exp) {
	    return decimalAdjust('floor', value, exp);
	};
    }
    // Decimal ceil
    if (!Math.ceil10) {
	Math.ceil10 = function(value, exp) {
	    return decimalAdjust('ceil', value, exp);
	};
    }

    // fill is ecma6
    if (!Array.prototype.fill) {
	Array.prototype.fill = function(value) {
	    if (this === null) {
		throw new TypeError('this is null or not defined');
	    }
	    var O = Object(this);
	    var len = O.length >>> 0;
	    var k = 0;
	    while (k < len) {
		O[k] = value;
		k++;
	    }
	    return O;
	};
    }

    Math.log2 = Math.log2 || function(x) {
	return Math.log(x) / Math.LN2;
    };
}(Math));
;/////////////////////////////////////////////////////////////////
// Algorithm utilities class ///
/////////////////////////////////////////////////////////////////
/**
 * This class is a collection of static method that help 
 * can be used when creating new algorithm visualizations
 */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, $, d3) {

    // alias our algorithm module
    var _my = ALGORITHM_MODULE;

    console.debug("execution definitions of algo_utils.js");

    var AlgorithmUtils = {};

    // create a deep clone of obj
    AlgorithmUtils.clone = function clone(obj) {
	
	if (obj === null || typeof obj !== "object") {
	    // these are immutable and can be returned
	    return obj;
	}

	var cpy = new obj.constructor();
	for (var prop in obj) {
	    if (obj.hasOwnProperty(prop)) {
		//console.log(obj.constructor, cpy, obj);
		cpy[prop] = clone(obj[prop]);
	    }
	}
	return cpy;
    };

    AlgorithmUtils.insertCustomControls = function(layout, algorithmId, algorithmName, comments) {
	var customControlsHolder = layout.visPanelContents.append("div").attr("class", "custom-controls-holder");
	var customControlsHeader = customControlsHolder.append("div").attr("class", "custom-controls-header").text(algorithmName + " Controls:");

	if (comments !== undefined) {
	    customControlsHolder.append("div").attr("class", "custom-controls-comments-section")
		.append("p").attr("class", "controls-info-text").text(comments);
	}
	layout.customControlsLayout = customControlsHolder;
	layout.customControlsHeader = customControlsHeader;
    };

    // create and populate a section for standard algorithm controls
    AlgorithmUtils.insertDefaultControls = function(layout, algorithmId) {

	var controlsDiv = layout.ops;
	var controlsExp = controlsDiv.append("div").attr("class", "controls-expanded-view");
	var controlsColp = controlsDiv.append("div").attr("class", "controls-collapsed-view");
	function appendButton(div, classname, algorithmName, tooltip) {
	    var button = div.append("a").attr("href", "#").classed("a-btn enabled-btn", true).attr("id", classname + "-of-" + algorithmId);
	    button.append("span").attr("class", "a-btn-icon").attr("title", tooltip).append("span").attr("class", classname);
	}

	controlsExp.append("div").attr("class", "controls-header").text("General Controls:");
	var defaultControls = controlsExp.append("table").attr("class", "default-controls table").append("tr");
	var exRadioDiv = defaultControls.append("td")
	    .style("vertical-align", "top")
	    .append("div").attr("class", "execution-type-radios");
	exRadioDiv.append("p").attr("class", "controls-info-text").text("Choose how to execute the algorithm:");
	appendButton(exRadioDiv, "play-btn", algorithmId, "Start the algorithm in continuous mode (the algorithm will run on its own)");
	appendButton(exRadioDiv, "next-btn", algorithmId, "Take the next step in the algorithm in step-by-step mode (you have to click for the algorithm to keep going)");
	var speedDialCell = defaultControls.append("td").attr("id", algorithmId + "speed-dial-div");
	speedDialCell.append("p").attr("class", "controls-info-text").text("Adjust the speed at which to run the algorithm:");
//	speedDialCell.append("div")
	var gaugeObj = _my.vislib.addSpeedGauge("#" + algorithmId + "speed-dial-div", 0.6);
	layout.gaugeObj = gaugeObj;
	var buttonsDiv = speedDialCell.append("div").attr("class", "speed-controls-buttons-div");
	buttonsDiv.append("p").append("button").attr("class", "btn btn-info btn-sm")
	    .on("click", function() {
		var current = gaugeObj.getValue();
		gaugeObj.update(current + 1);
	    })
	    .append("span").attr("class", "glyphicon glyphicon-plus");
	buttonsDiv.append("p").append("button").attr("class", "btn btn-info btn-sm")
	    .on("click", function() {
		var current = gaugeObj.getValue();
		gaugeObj.update(current-1);
	    }).append("span").attr("class", "glyphicon glyphicon-minus");

	
	var miniBtn = controlsExp.append("button").attr("type","button").attr("class","btn btn-default btn-xs").attr("aria-label", "Toggle menu");
	miniBtn.append("span").attr("class", "glyphicon glyphicon-menu-right").attr("aria-hidden", "true");
	miniBtn.on("click", function(d) { 
	    controlsExp.style("display", "none");
	    controlsColp.style("display", "block");
	    layout.introHeader.attr("class", "col-md-11");
	    //layout.controlsPanelHolder.attr("class", "col-md-1");
	});
	controlsColp.style("display", "none");
	var maxiBtn = controlsColp.append("button").attr("type","button").attr("class","btn btn-default btn-xs maxi-btn").attr("aria-label", "Toggle menu");
	maxiBtn.append("span").attr("class", "glyphicon glyphicon-menu-left").attr("aria-hidden", "true");
	maxiBtn.on("click", function(d) { 
	    controlsExp.style("display", "block");
	    controlsColp.style("display", "none");
	    layout.introHeader.attr("class", "col-md-8");
	    //layout.controlsPanelHolder.attr("class", "col-md-4");
	});
	return {"speedGauge" : gaugeObj};
    };

    AlgorithmUtils.resetControls = function(algorithmId) {
	d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "play-btn");
	d3.select("#" + "play-btn-of-" + algorithmId + " span").attr("title", "Start the algorithm in continuous mode (the algorithm will run on its own)");
	d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", false);
	d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", true);
    };

    // connect the algorithm to default control callbacks
    // this is necessary if you want the default controls to kick the algorithm off
    // if you have some dialog that needs to query for input before the algorithm is started pass it as kickoffCallback
    // the argument passed as kickoffCallback must be either undefined or a function that accepts another function as
    // an argument. The function passed to kickoffCallback should be executed in kickoffCallback as the last step
    AlgorithmUtils.createAlgoAttacher = function() {
	var res = {};
	res.play_maker = function(algorithm, algorithmId) {
	    return function() {
		if (!algorithm.runningInContMode) {
		    d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "pause-btn");
		    d3.select("#" + "play-btn-of-" + algorithmId + " span").attr("title", "Pause the algorithm");
		    d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", true);
		    d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", false);
     		    algorithm.executeInContinuousMode();
		}
		else {
		    algorithm.runningInContMode = false; //stopping
		    AlgorithmUtils.resetControls(algorithmId);
		}
	    };
	};

	res.next_maker = function(algorithm, algorithmId) {
	    return function() {
		if (!algorithm.runningInContMode) {
     		    algorithm.executeNextRowInStepMode();
		}
	    };
	};

	// allows us to reattach the controls as we like
	res.attach = function(algorithm, algorithmId, kickoffCallback) {
	    d3.select("#" + "play-btn-of-" + algorithmId).on("click", function() {
		if (!algorithm.isRunning() && kickoffCallback !== undefined) {
		    kickoffCallback(res.play_maker(algorithm, algorithmId));
		}
		else {
		    (res.play_maker(algorithm, algorithmId))();
		}
	    });
	    d3.select("#" + "next-btn-of-" + algorithmId).on("click", function() {
		if (!algorithm.isRunning() && kickoffCallback !== undefined) {
		    kickoffCallback(res.next_maker(algorithm, algorithmId));
		}
		else {
		    (res.next_maker(algorithm, algorithmId))();
		}
	    });
	};
	return res;
    };

    AlgorithmUtils.attachAlgoToControls = function(algorithm, algorithmId, kickoffCallback) {
	var attacher = AlgorithmUtils.createAlgoAttacher();
	attacher.attach(algorithm, algorithmId, kickoffCallback);
    };

    // create an item for the algorithm in the list of all available algorithms 
    AlgorithmUtils.insertIntoHeaderList = function(tabId, headerText, menuConfig) {

	var listItemId = menuConfig.priority;
	var listItem = d3.select("#" + listItemId);
	listItem.append("a").data([listItemId]).attr("href", tabId).attr("role", "tab").attr("data-toggle", "tab")
	    .attr("data-tab-id", tabId)
	    .text(headerText);
    };

    function addStackFramePreview(codeContainerId) {
	var selector = "." + codeContainerId + " li";
	var lineClone = $(selector).filter(":first").clone();
	$("." + codeContainerId).prepend(lineClone);
	lineClone.wrap('<div class="preview-frame"><pre class="prettyprint lang-js linenums:1 prettyprinted" style=""><ol class="linenums" style="margin-left: 15px;"></ol></pre></div>');	
    }

    // for adding a new frame for a recursive algorithm
    AlgorithmUtils.visualizeNewStackFrame = function(codeContainerId, algorithmCtx) {
	var duration = 2 * algorithmCtx.getBaselineAnimationSpeed();
	var delay = algorithmCtx.getBaselineAnimationSpeed();
	setTimeout(function() {
	    addStackFramePreview(codeContainerId);
	}, delay);

	return delay;
    };

   //remove an old stack frame and expand the previous one
    AlgorithmUtils.popStackFrame = function(codeContainerId, algorithmCtx) {
	var duration = 2 * algorithmCtx.getBaselineAnimationSpeed();
	var delay = algorithmCtx.getBaselineAnimationSpeed();
	var selector = "." + codeContainerId + " .preview-frame";
	d3.select(selector).remove();
	return delay;
    };

    //remove dynamic comments (values of variables appended with // during execution of the algorithm)
    AlgorithmUtils.clearComments = function(codeContainerId) {
	var selector = "." + codeContainerId + " div:last-of-type";
	d3.select(selector).selectAll("span.com.dynamic").remove();
    };
 
    //comupte a viewBox to scale svg contents properly on smaller screen sizes
    AlgorithmUtils.calcViewBox = function(parentId, width, height) {
	var parentWidth = $(parentId).width() * 1.0;
	//ratio computed from parent width and made 10% smaller (smaller pixels than original) to fit inside the parent
	var vbx_ratio = (width / parentWidth); 
	return {"string" : "0 0 " + width + " " + (vbx_ratio * height), "width" : (parentWidth), "height" : height };
    };


    AlgorithmUtils.createAlgorithmContext = function(controlsObj) {
	if (controlsObj === undefined) {
	    return {
		getBaselineAnimationSpeed : function() { return 0; }
	    };
	}
	return { 
	    getBaselineAnimationSpeed : function() {
		return controlsObj.speedGauge.getSpeed();
	    }
	};
    };

    /**
     * this creates the layout for the algorithm page
     */
    AlgorithmUtils.setupLayout = function(algorithmTabId, algorithmName, menuConfig, columnWidths, comments) {
	var layout = {};
	
	AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, menuConfig);
	var tab = d3.select("#algoContainer")
    	    .append("div").attr("class", "tab-pane").attr("id", algorithmTabId);
	layout.container = tab.append("div").attr("class", "container-fluid");
	layout.row0 = layout.container.append("div").attr("class", "row");
	layout.introHeader = layout.row0.append("div").attr("class", "col-md-8");
	layout.introHeader.append("div").attr("class", "page-header").append("h4").text(algorithmName);
	layout.introduction = function() {
	    var introObject = Object.create(null);
	    introObject.tldr = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
	    introObject.readMore = "";
	    function tldrFun(tldr) {
		this.tldr = tldr;
		layout.introductionParagraph.html(tldr);
	    }
	    function readMoreFun(readMore) {
		this.readMore = readMore;
	    }
	    introObject.setIntroTlDr = tldrFun;
	    introObject.setIntroReadMore = readMoreFun;

	    layout.introductionParagraph = layout.introHeader.append("p").text(introObject.tldr);
	    var readMoreTxt = "Read more...";
	    var readMoreLink = layout.introHeader.append("p").append("a").attr("class", "read-more-lnk")
		.text(readMoreTxt);
	    var clicked = false;
	    readMoreLink.on("click", function() {
		if (!clicked) {
		    layout.introductionParagraph.html(introObject.tldr + introObject.readMore);
		    readMoreLink.text("tl;dr");
		}
		else {
		    layout.introductionParagraph.html(introObject.tldr);
		    readMoreLink.text(readMoreTxt);
		}
		clicked = !clicked;
	    });
	    return introObject;
	}();

	layout.controlsPanelHolder = tab.append("div").attr("class", "controls controls-affix").attr("data-spy", "affix").style("top","0%").style("right","0%");
    	layout.controlsPanel = layout.controlsPanelHolder.append("div").attr("class", "panel panel-default");

	layout.controlsPanelBody = layout.controlsPanel.append("div").attr("class", "panel-body");
	layout.ops = layout.controlsPanelBody.append("div").attr("class", "options");
	
	// row 1
	layout.row1 = layout.container.append("div").attr("class", "row");
	layout.visHeader = layout.row1.append("div").attr("class", "col-md-12");
	layout.visHeader.append("h4").attr("class", "page-header").text("Visualization");

	// row 2
	layout.row2 = layout.container.append("div").attr("class", "row");
	layout.leftPanel = layout.row2.append("div").attr("class", "col-md-" + columnWidths[0]);
	layout.visPanel = layout.leftPanel.append("div").attr("class", "row")
    	    .append("div").attr("class", "col-md-12")
    	    .append("div");
	layout.visPanelContents = layout.visPanel.append("div").attr("class", "graphics");
	
	layout.codePanel = layout.row2.append("div").attr("class", "col-md-" + columnWidths[1])
    	    .append("div");
	layout.codePanel.append("div").attr("class", "code");

	// insert the controls objects
	layout.defaultControlsObj = AlgorithmUtils.insertDefaultControls(layout, algorithmTabId);
	AlgorithmUtils.insertCustomControls(layout, algorithmTabId, algorithmName, comments);

	return layout;
    };

    AlgorithmUtils.appendCode = function(algorithmTabId, codeContainerId, algo) {
	var code_holder = d3.select("#" + algorithmTabId + " .code")
	    .append("div")
	    .attr("class", codeContainerId);
	code_holder.append("div")
	    .attr("class", "function-code-holder")
	    .append("pre")
            .attr("class", "prettyprint lang-js linenums:1")
	    .append("code")
            .attr("class", "language-js")
            .text(algo);
	return code_holder;
    };

    var pretty_print_callbacks = {};
    // attach any code you need to get executed after pretty print here
    AlgorithmUtils.attachPrettyPrintCallback = function(tab_id, callback) {
	var tab_id_with_hash = "#" + tab_id; // we store them with hash since that's how we'll call them
	(pretty_print_callbacks[tab_id_with_hash] = (pretty_print_callbacks[tab_id_with_hash] || [])).push(callback);
    };
    AlgorithmUtils.getPrettyPrintCallbacks = function(tab_id) {
	return pretty_print_callbacks[tab_id];
    };
    //return the augmented module
    _my.AlgorithmUtils = AlgorithmUtils;
    return _my;
})(ALGORITHM_MODULE || {}, $, d3);
;/*** this module contains helper functions for visualizations */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, d3, $) {
    var _my = ALGORITHM_MODULE;
    _my.vislib = {};

    /** animate the swapping of two selections 
      * NOTE: these selections need to support svg transform!
      */
    _my.vislib.swapSelections = function(sel1, coord1, sel2, coord2, durations, y_offset, x_offset) {
	var tran1 = sel1.transition()
	    .duration(durations[0])
	    .attr("transform", "translate(" + (coord1.x - x_offset) + " " + (coord1.y - y_offset) + ")");
	var tran2 = sel2.transition()
	    .duration(durations[0])
	    .attr("transform", "translate(" + (coord2.x + x_offset) + " " + (coord2.y + y_offset) + ")");

	//here we chain the transitions. this is a shorthand for transition.each("end")
	tran1 = tran1.transition()
	    .duration(durations[1])
	    .attr("transform", "translate(" + (coord2.x + x_offset) + " " + (coord1.y - y_offset) + ")");
	tran2 = tran2.transition()
	    .duration(durations[1])
	    .attr("transform", "translate(" + (coord1.x - x_offset) + " " + (coord2.y + y_offset) + ")");

	//here we chain the transitions. this is a shorthand for transition.each("end")
	tran1.transition()
	    .duration(durations[2])
	    .attr("transform", "translate(" + coord2.x + " " + coord1.y + ")");
	tran2.transition()
	    .duration(durations[2])
	    .attr("transform", "translate(" + coord1.x + " " + coord2.y + ")");
    };
    
    /** animate moving growing a path 
     *
     * it seems like this can randomly fail on firefox for bezier curves :/
     */
    _my.vislib.animatePath = function(path, duration, delay, make_proportional, length_to_show_percentage) {
	// the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	var totalLength = path.node().getTotalLength();
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	path.style("display", "inline");
	var transition = 
	path.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
            .duration(duration)        
	    .delay(delay)
            .ease("linear")
            .attr("stroke-dashoffset", (1-length_to_show_percentage)*totalLength);

	return transition;
    };

    /*** what it says ... cool growing arrow */
    _my.vislib.animateGrowingArrow = function(svg, path, duration, delay, make_proportional, length_to_show_percentage) {
	var arrow = svg.append("svg:path")
	    .attr("d", d3.svg.symbol().type("triangle-down")(10,1));

	_my.vislib.animatePath(path, duration, delay, make_proportional, length_to_show_percentage);
	var tran = _my.vislib.animateMovingAlongAPath(arrow, path, duration, delay, make_proportional, length_to_show_percentage, true, -90);
	return {"arrow": arrow, "transition": tran};
    };

    /*** ice cold coolness!! takes a selection which should be translateable and animates it moving along a path
     * .. with_rotate only works properly for straight paths .. we could calculate tangent more often too tho so
     * maybe in the future
     */
    _my.vislib.animateMovingAlongAPath = function(movable_selection, path, duration, delay, make_proportional, length_to_show_percentage, with_rotate, with_rotate_extra_angle) {
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	var transition = movable_selection.transition()
	    .duration(duration)
	    .delay(delay)
	    .ease("linear")
	    .attrTween("transform", translateAlong(path.node()));

	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
	    var l = path.getTotalLength() * length_to_show_percentage;
	    var rot_tran = "";
	    if (with_rotate !== undefined && with_rotate === true) {
		var ps = path.getPointAtLength(0);
		var pe = path.getPointAtLength(l);
		var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI);
		if (with_rotate_extra_angle !== undefined) {
		    angl += with_rotate_extra_angle;
		}
		rot_tran = "rotate(" + angl + ")";
	    }
	    return function(d, i, a) {
		return function(t) {
		    var p = path.getPointAtLength(t * l);
		    return "translate(" + p.x + "," + p.y + ")" + rot_tran;
		};
	    };
	}
	return transition;
    };
    
    /** return a diagonal generator where the interpolation can be set
      * so that various types of lines can be created */
    _my.vislib.interpolatableDiagonal = function(interpolateType) {
	// kudos to elusive-code on stackoverflow for this nice code
	var line = d3.svg.line()
            .x( function(point) { return point.lx; })
            .y( function(point) { return point.ly; });

	if (interpolateType !== undefined) {
	    line = line.interpolate(interpolateType);
	}

	function lineData(d){
	    // i'm assuming here that supplied datum 
	    // is a link between 'source' and 'target'
	    var points = [
		{lx: lineData.source(d).x, ly: lineData.source(d).y},
		{lx: lineData.target(d).x, ly: lineData.target(d).y}
	    ];
	    return line(points);
	}
	// default accessors
	lineData.source = function(d) { return d.source; };
	lineData.target = function(d) { return d.target; };
	lineData.inverted = function() {
	    var temp = lineData.source;
	    lineData.source = lineData.target;
	    lineData.target = temp;
	    return lineData;
	};
	return lineData;
    };

    /** add a svg:defs with an arrow market to be used with non-growing paths */
    _my.vislib.appendMarkerDefs = function(svg, marker_id, marker_path) {
	if (marker_path === undefined) {
	    marker_path = "M2,2 L2,11 L10,6 L2,2";
	}
	svg.append("svg:defs")
	    .append("svg:marker")
	    .attr("id", marker_id)	
	    .attr("refX", 2)
	    .attr("refY", 6)
	    .attr("markerWidth", 13)
	    .attr("markerHeight", 13)
	    .attr("orient", "auto")
	    .append("svg:path")
	    .attr("d", marker_path);
    };


    /******* EXPERIMENTAL ***********/
/** animate moving growing a path 
     *
     * it seems like this can randomly fail on firefox for bezier curves :/
     */
    _my.vislib.animatePaths = function(paths, duration, delay, make_proportional, length_to_show_percentage) {
	// the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	var totalLength = 0;
	paths.each(function(d, i) {
	    // the node() function is only available on the selection object and not its elements
	    var this_path = d3.select(this);
	    totalLength = Math.max(this_path.node().getTotalLength(), totalLength);
	});
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	paths.style("display", "inline");
	var transition = 
	paths.attr("stroke-dasharray", totalLength + " " + totalLength)
	    .attr("stroke-dashoffset", totalLength)
	    .transition()
            .duration(duration)        
	    .delay(delay)
            .ease("linear")
            .attr("stroke-dashoffset", (1-length_to_show_percentage)*totalLength);

	return transition;
    };

    var uniq_id = 0;
    /*** what it says ... cool growing arrow */
    _my.vislib.animateGrowingArrows = function(svg, paths, duration, delay, make_proportional, length_to_show_percentage) {
	var arrows = [];
	uniq_id++;
	paths.each(function() {
	    arrows.push(svg.append("svg:path")
		.attr("class", "fft-arrow fft-arrows-generated-with" + uniq_id) 
		.attr("d", d3.svg.symbol().type("triangle-down")(10,1)));
	});
	var movable_selections = svg.selectAll(".fft-arrow.fft-arrows-generated-with" + uniq_id);
	_my.vislib.animatePaths(paths, duration, delay, make_proportional, length_to_show_percentage);
	var transition = _my.vislib.animateMovingAlongPaths(movable_selections, paths, duration, delay, make_proportional, length_to_show_percentage, true, -90);
	var result = {};
	result.transition = transition;
	result.arrows = arrows;
	return result;
    };

    /*** ice cold coolness!! takes a selection which should be translateable and animates it moving along a path
     * .. with_rotate only works properly for straight paths .. we could calculate tangent more often too tho so
     * maybe in the future
     */
    _my.vislib.animateMovingAlongPaths = function(movable_selections, paths, duration, delay, make_proportional, length_to_show_percentage, with_rotate, with_rotate_extra_angle) {
	if (movable_selections.size() != paths.size()) {
	    throw "In animateMovingAlongPaths, the length of movable_selections must match the length of paths. " + movable_selections.size() + " != " + paths.size();
	} 
	if (make_proportional !== undefined && make_proportional === true) {
	    // make duration proportional to totalLength to create a smoother animation
	    duration = duration * totalLength;
	}
	var translateFunctions = [];
	paths.each(function(d, i) {
	    // the node() function is only available on the selection object and not its elements
	    var this_path = d3.select(this);
	    translateFunctions.push({ "translateAlong" : translateAlong(this_path.node())});
	});
	
	var transition = movable_selections
	    .data(translateFunctions)
	    .transition()
	    .duration(duration)
	    .delay(delay)
	    .ease("linear")
	    .attrTween("transform", function(d) { return d.translateAlong(); });

	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
	    var l = path.getTotalLength() * length_to_show_percentage;
	    var rot_tran = "";
	    if (with_rotate !== undefined && with_rotate === true) {
		var ps = path.getPointAtLength(0);
		var pe = path.getPointAtLength(l);
		var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI);
		if (with_rotate_extra_angle !== undefined) {
		    angl += with_rotate_extra_angle;
		}
		rot_tran = "rotate(" + angl + ")";
	    }
	    return function(d, i, a) {
		return function(t) {
		    var p = path.getPointAtLength(t * l);
		    return "translate(" + p.x + "," + p.y + ")" + rot_tran;
		};
	    };
	}
	return transition;
    };

    /** fetch the window coordinates of an element accounting for scroll */
    _my.vislib.getOffsetRect = function(elem) {
	// (1)
	var box = elem.getBoundingClientRect();
	
	var body = document.body;
	var docElem = document.documentElement;
	
	// (2)
	var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	
	// (3)
	var clientTop = docElem.clientTop || body.clientTop || 0;
	var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	
	// (4)
	var top  = box.top +  scrollTop - clientTop;
	var left = box.left + scrollLeft - clientLeft;
	
	return { y: Math.round(top), x: Math.round(left) };
    };
    _my.vislib.getCoordsInSvg = function(elem, svg_elem) {
	var document_coords_elem = _my.vislib.getOffsetRect(elem);
	var document_coords_svg = _my.vislib.getOffsetRect(svg_elem.node());
	return { "y": document_coords_elem.y - document_coords_svg.y, "x": document_coords_elem.x - document_coords_svg.x};
    };
    _my.vislib.getCoordWithTranApplied = function(shape_and_coord, svg) {
	console.log(svg);
	var matrix = shape_and_coord.shape.getCTM();
	// transform a point using the transformed matrix
	var position = svg.createSVGPoint();
	position.x = shape_and_coord.coord.x;
	position.y = shape_and_coord.coord.y;
	position = position.matrixTransform(matrix);
	return position;
    };
    
    /**** based off of a gist by msqr on github ****/
    // draws a speed gauge and returns an object to update and query the gauge for the speed values
    _my.vislib.addSpeedGauge = function(holder_selector, scale, speed_modifier) {
	var labelData = [{l:'Very Slow', o: '0.8em'},
			 {l:'Slow', o: '1.8em'},
			 {l:'Medium', o:'1.1em'},
			 {l:'Fast', o:'2.1em'},
			 {l:'Very Fast', o:'1em'}];
	var arcColorFn = ['#0eb149', '#8ac441', '#ffef00', '#f5801e', '#ee1e26'];

	var config = {};
	if (speed_modifier !== undefined) {
	    config.speed_modifier = speed_modifier;
	}
	if (scale !== undefined) {
	    config.scale = scale;
	}
	var gaugeObj = gauge(labelData, arcColorFn, holder_selector, config); 
	gaugeObj.render(5);

	function gauge(labelData, arcColorFn, container, configuration) {
	    var that = {};
	    var config = {size: 200,
			  clipWidth: 260,
			  clipHeight: 100,
			  ringInset: 20,
			  ringWidth: 20,
			  pointerWidth: 10,
			  pointerTailLength: 5,
			  pointerHeadLengthPercent: 0.9,
			  minAngle: -90,
			  maxAngle: 90,
			  transitionMs: 750,
			  fontSize: 8,
			  scale: 1,
			  speedModifier: 100
	    };
	    var range, r, pointerHeadLength;
	    var value = 0;
	    var majorTicks = labelData.length;
	    var minValue = 0;
	    var maxValue = 2*labelData.length;
	    
	    var svg, arc, scale, ticks, tickData, pointer;

	    function deg2rad(deg) {
		return deg * Math.PI / 180;
	    }
	    
	    function newAngle(d) {
		var ratio = scale(d);
		return config.minAngle + (ratio * range);
	    }
	    function getValue() {
		return value;
	    }
	    that.getValue = getValue;
	    function getSpeed() {
		return (maxValue - value) * config.speedModifier;
	    }
	    that.getSpeed = getSpeed;


	    function setSpeedModifier(speed) {
		config.speed_modifier = speed;
	    }
	    that.setSpeedModifier = setSpeedModifier;

	    var prop;
	    for ( prop in configuration ) {
		config[prop] = configuration[prop];
	    }
	    
	    range = config.maxAngle - config.minAngle;
	    r = config.size / 2;
	    pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

	    // a linear scale that maps domain values to a percent from 0..1
	    scale = d3.scale.linear()
		.range([0,1])
		.domain([minValue, maxValue]);
	    
	    ticks = scale.ticks(majorTicks);
	    tickData = d3.range(majorTicks).map(function() {return 1/majorTicks;});
	    
	    arc = d3.svg.arc()
		.innerRadius(r - config.ringWidth - config.ringInset)
		.outerRadius(r - config.ringInset)
		.startAngle(function(d, i) {
		    var ratio = d * i;
		    return deg2rad(config.minAngle + (ratio * range));
		})
		.endAngle(function(d, i) {
		    var ratio = d * (i+1);
		    return deg2rad(config.minAngle + (ratio * range));
		})
		.padAngle(0.01);

	    
	    function render(newValue) {
		svg = d3.select(container)
		    .append('svg:svg')
		    .attr('class', 'gauge')
		    .attr('width', config.clipWidth*config.scale)
		    .attr('height', config.clipHeight*config.scale)
		    .attr("viewBox", "0 0 " + config.clipWidth + " " + config.clipHeight)
		    .append("g")
		    .attr("transform", "translate(" + (r * 1) + "," + (r * 0.95) + ")");
		var defs = svg.append('defs');
		var arcs = svg.append('g')
		    .attr('class', 'arc');
		
		defs.selectAll('path')
		    .data(tickData)
		    .enter().append('path')
		    .attr('id', function(d, i) { return "mypath" + i + "-of(" + holder_selector + ")"; })
		    .attr('d', arc);
		arcs.selectAll('use')
		    .data(tickData)
		    .enter().append('use')
		    .attr('xlink:href', function(d, i) { return "#mypath" + i + "-of(" + holder_selector + ")"; })
		    .attr('fill', function(d, i) {
			return arcColorFn[i % arcColorFn.length];
		    });
		svg.selectAll('.arc-label')
		    .data(labelData)
		    .enter().append('text')
		    .attr('dx', function(d) { return d.o; })
		    .attr('dy', '-0.7em')
		    .attr('font-size', config.fontSize + "px")
		    .attr('class', 'arc-label')
		    .append('textPath')
		    .attr('xlink:href', function(d, i) { return "#mypath" + i + "-of(" + holder_selector + ")"; })
		    .text(function(d) { return d.l; });

		var lineData1 = [[0, -pointerHeadLength], 
				 [config.pointerWidth / 2, 0],
				 [0, config.pointerTailLength],
				 [0, -pointerHeadLength] ];
		var lineData2 = [[0, -pointerHeadLength], 
				 [-config.pointerWidth / 2, 0],
				 [0, config.pointerTailLength],
				 [0, -pointerHeadLength] ];
		var pointerLine = d3.svg.line().interpolate('monotone');
		pointer = svg.append('g')
		    .attr('transform', 'rotate(' +config.minAngle +')');
		pointer.append('circle').attr('class', 'circle-big')
		    .attr('r', config.pointerWidth / 2);
		var pg1 = pointer.append('g').data([lineData1])
		    .attr('class', 'pointer_dark');
		var pg2 = pointer.append('g').data([lineData2])
		    .attr('class', 'pointer_light');
		pointer.append('circle').attr('class', 'circle-small')
		    .attr('r', config.pointerWidth / 4);
		pg1.append('path')
		    .attr('d', pointerLine);
		pg2.append('path')
		    .attr('d', pointerLine);
		
		update(newValue === undefined ? 0 : newValue);
	    }
	    that.render = render;
	    
	    function update(newValue) {
		if (newValue > maxValue) {
		    newValue = maxValue;
		}
		if (newValue < minValue) {
		    newValue = minValue;
		}
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
		    .duration(config.transitionMs)
		    .ease('elastic')
		    .attr('transform', 'rotate(' +newAngle +')');
		value = newValue;
	    }
	    that.update = update;
	    return that;
	}

	return gaugeObj;
    };

    function createRaptorPopupTemplate(text) {
	var raptor_num = Math.floor(Math.random()*2) + 1;
	var temp =  "<div class='clearfix'><img class='pull-left raptor-img' src='assets/raptor_fade_sm" + raptor_num + ".jpg'><p>" + text + "</p></div>";
	console.log(temp);
	return temp;
    }

    // adding raptor heads using absolute positioning inside a relatively positioned code block
    _my.vislib.addRaptorHead = function(algorithmTabId, algorithmCodeClass, lineNum, text) {
	_my.AlgorithmUtils.attachPrettyPrintCallback(algorithmTabId, function() {
	    var algorithmCodeHolder =  "." + algorithmCodeClass + " .function-code-holder";
	    $(algorithmCodeHolder).css("position", "relative");
	    $(algorithmCodeHolder + " ol").css("margin-left", "15px");
	    lineNum = lineNum - 1; // pretify indexes li.L starting at 0, we start at 1
	    var lineR = lineNum % 10;
	    var lineQ = Math.floor(lineNum / 10);
	    var dvObj = $(algorithmCodeHolder)[0];
	    var lineObj = $(algorithmCodeHolder + " " + "li.L" + lineR)[lineQ]; 
	    var raptor_top = lineObj.getBoundingClientRect().top - dvObj.getBoundingClientRect().top;
	    var raptor_left = 0;
	    console.log("selecting", dvObj.getBoundingClientRect(), lineObj.getBoundingClientRect());

	    var img = $(algorithmCodeHolder).append('<img class="' + algorithmCodeClass + lineNum + '" src="assets/raptor24.png" style="position: absolute; margin-left: 2px; z-index:10; top: ' + 
						raptor_top + 'px; left: ' + raptor_left + 'px" data-toggle="popover" data-trigger="click focus" data-title="Dr.Raptor\'s Hint" data-placement="left" data-html="true" data-content="' + createRaptorPopupTemplate(text) +'"></img>');
	});
    };
    return _my;
}(ALGORITHM_MODULE || {}, d3, $));
;/////////////////////////////////////////////////////////////////
// Algorithm class ///
/////////////////////////////////////////////////////////////////
/**
 * This class represents source code which has been decorated
 * with user defined callbacks on arbitrary, user-defined code lines
 * This decorated source code can then be executed using Algorithm#run
 *
 * Callbacks added to the algorithm can bind to any local variable inside
 * the algorithm. The binding is by name, this means that when defining the
 * callback you should give the callback arguments the same name as the
 * name of the local variable that they should bind to.
 *
 * USAGE:
 * var algo = new Algorithm(..);
 * algo.runCodeAndPopulateAnimationQueue();
 * algo.executeInContinuousMode(); or algo.executeNextRowInStepMode();
 *
 * @author mpapanek
 */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, $, d3) {

    // alias our algorithm module
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }

    console.debug("executing definitions of algo.js");
    
    // used for transition refactoring from default to baseline speed
    function getAnimationDuration(algoContext) {
	var andur = algoContext.getBaselineAnimationSpeed !== undefined ? algoContext.getBaselineAnimationSpeed() : algoContext.default_animation_duration;
	return andur;
    }

    function Algorithm(func, callbacks, codeContainerId, algorithmContext, resetControlsFunction)
    {
	this.codeContainerId = codeContainerId;
	this.func = func;
	this.param = func.toString().match(/\(([^\(\)]*)\)/);
	this.callbacks = callbacks;
	this.var_map = {};
	this.varname_map = {};
	this.funcName = func.toString().match(/function\s*(.*?)\s*\(/)[1];
	this.animation_queue = [];
	// used by the executeInContinuousMode command to kick off the animation in continuous mode
	this.runningInContMode = false;
	// used by the executeInContinuousMode command to kick off the animation in step mode
	this.runningInStepMode = false;
	this.runningCodeStack = [];
	this.functionStack = [];
	this.return_rows = {};
	this.resetControls = resetControlsFunction;

	var tokens = func.toString().split("\n");
	var LN = tokens.length;
	this.lastRowNum = LN;
	var result;
	var i = 0;
	var args = this.param[1].split(",");
	for (i = 0;i < args.length; i++) {
	    this.varname_map[$.trim(args[i])] = {"row_num": 1, "idx": i};
	}

	var var_pat = /\s*var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/;
	var ret_pat = /^return\s*;|^return\s+.*|.*\s+return\s*;|.*\s+return\s+.*/;
	var _found_vars = args.length;
	for (i = 0; i < LN; i++) {
	    // direct eval uses the global context so the variable names are in global
	    var trimmed = $.trim(tokens[i]);
	    var strm = trimmed.substring(0,2);
	    if (strm === "//" || strm === "/*") {
		continue;
	    }
	    result = trimmed.match(var_pat);
	    if (result !== null) {
		args += "," + result[1];
		this.var_map[_found_vars] = {"row_num" : i+1, "name" : result[1]};
		this.varname_map[result[1]] = {"row_num" : i+1, "idx" : _found_vars};
		_found_vars++;
	    }
	    this.return_rows[i+1] = ret_pat.test(tokens[i]) || i === LN-1;
	}
	this.found_vars = args;
	/*
	 * Algorithm context which stores functions and variables accessible from inside the callbacks. 
	 */
	this.AlgorithmContext = algorithmContext;

	function getRowToHighlightSelector(rowNumber, codeContainerId) {
	    return "." + codeContainerId + " div:last-of-type li:nth-child(" + rowNumber + ")";
	}

	this.highlightRow = function highlightRow(codeContainerId, rowNumber, startDelay, durationOfHighlight) {
	    var rowToHighlightSelector = getRowToHighlightSelector(rowNumber, codeContainerId);
	    setTimeout(function() {
		$(rowToHighlightSelector).toggleClass("highlighted-row");
	    }, startDelay);
	    if (durationOfHighlight !== undefined) {
		setTimeout(function() {
		    $(rowToHighlightSelector).toggleClass("highlighted-row");
		}, startDelay + durationOfHighlight);
	    }
	    return startDelay + durationOfHighlight;
	};

	this.removeAllRowHighlighting = function(codeContainerId) {
	    d3.selectAll("." + codeContainerId + " .highlighted-row").classed("highlighted-row", false);
	};

	/*** we need a pre-row and a post-row because some rows like for loop and ifs may not get to the end 
             of the row if the condition fails but we would still like to see them executed **/
	this.preRowExecute = function(row_num, var_array0) {
	    var var_array = _my.AlgorithmUtils.clone(var_array0);
	    var selfie = this;
	    this.animation_queue.push(new AnimationFrame("pre", row_num, this.return_rows, this.codeContainerId, this.AlgorithmContext, function() {
		var animation_duration;
		if (row_num in selfie.callbacks && selfie.callbacks[row_num].pre !== undefined)
		{
		    var callback_obj = selfie.callbacks[row_num].pre;
		    var fun_param = callback_obj.toString().match(/\(([^\(\)]*)\)/);
		    var param_vals = [];
		    fun_param[1].split(",").forEach(function(p) {
			var trimmed = $.trim(p);
			if (trimmed === "") {
			    return;
			}
			if (selfie.varname_map[$.trim(p)].idx === undefined) {
			    console.error("Your callback is looking for a variable named", p, "which isn't defined in the function", selfie.funcName);
			}
	    		param_vals.push(var_array[selfie.varname_map[$.trim(p)].idx]);
		    });
		    animation_duration = callback_obj.apply(selfie.callbacks, param_vals);
		}
		else
		{
		    animation_duration = getAnimationDuration(selfie.AlgorithmContext);
		}
		return animation_duration;
	    }));
	};

	/**** post row does the printing debug info inside the algorithm and  keeping track of variable values **/
	this.postRowExecute = function(row_num, var_array0) {
	    
	    var var_array = _my.AlgorithmUtils.clone(var_array0);
	    var selfie = this;
	    this.animation_queue.push(new AnimationFrame("post", row_num, this.return_rows, this.codeContainerId, this.AlgorithmContext, function() {
		var animation_duration;
		var callback_obj = (row_num in selfie.callbacks) ? selfie.callbacks[row_num] : undefined;
		if (typeof callback_obj === "object") {
		    callback_obj = ("post" in callback_obj) ? callback_obj.post : undefined;
		}
		if (callback_obj !== undefined)
		{
		    var fun_param = callback_obj.toString().match(/\(([^\(\)]*)\)/);
		    var param_vals = [];
		    fun_param[1].split(",").forEach(function(p) {
			var trimmed = $.trim(p);
			if (trimmed === "") {
			    return;
			}
			if (selfie.varname_map[$.trim(p)].idx === undefined) {
			    console.error("Your callback is looking for a variable named", p, "which isn't defined in the function", selfie.funcName);
			}
	    		param_vals.push(var_array[selfie.varname_map[$.trim(p)].idx]);
		    });
		    animation_duration = callback_obj.apply(selfie.callbacks, param_vals);
		}
		else
		{
		    animation_duration = getAnimationDuration(selfie.AlgorithmContext);
		}

		if (animation_duration === undefined) {
		    animation_duration = getAnimationDuration(selfie.AlgorithmContext);
		}

		var_array.forEach(function(var_elem, idx) {
		    if (selfie.var_map[idx] === undefined) {
			return;
		    }
		    var rowToHighlightSelector = getRowToHighlightSelector(selfie.var_map[idx].row_num, codeContainerId);
		    /*** add or remove dynamic debugging info **/
		    if (var_elem === undefined) {
			setTimeout(function() {
			    var comment_span = d3.select(rowToHighlightSelector).select("code").select("span.com");
			    if (comment_span.empty()) {
				comment_span.remove();
			    }
			}, animation_duration);
		    }
		    else {
			setTimeout(function() {
			    var code = d3.select(rowToHighlightSelector).select("code");
			    var comment_span = code.select("span.com");
			    if (comment_span.empty()) {
				code.append("span").attr("class", "com dynamic");
			    }
			    code.select("span.com").text("  //" + selfie.var_map[idx].name + " = " + Algorithm.getTextForPrinting(var_elem));
			}, animation_duration);
		    }
		});
		return animation_duration;
	    }));
	};

	// variables that are used in callbacks must be set here
	this.callbacks.AlgorithmContext = this.AlgorithmContext;
	this.callbacks.var_map = this.var_map;
	this.codeContainerId = codeContainerId;
    }
    /* statics */
    Algorithm.getTextForPrinting = function(object) {
	/** testing strict equality of type to numeric and rounding to see if it is a double**/
	if (typeof object === "number" && Math.round(object) != object) {
	    return Math.round10(object, -4);
	}
	return object;
    };

    Algorithm.paramArg = function(N) {
	var res = "";
	for(var i=0;i<N;i++)
	{
	    res+="arguments["+i+"]";
	    if(i !== N-1)
		res+=",";
	}
	return res;
    };
    /********************************************************************************/
    /* methods .. passed to all objects of this class and called using the instance */
    /********************************************************************************/
    /**
     * decorates the string representation of a function
     * with callbacks on the provided lines
     */
    Algorithm.prototype.addDebugging = function(fstr) {
	var lmp = {}, i, nfun, tokens;
	if (typeof(fstr) !== "string")
	{
	    fstr = fstr.toString();
	}
	nfun = "";
	tokens = fstr.split("\n");
	for (i=0;i<tokens.length;i++)
	{
	    // preExecute is for rows like if or while conditions that get evaluated to false
	    if (i > 0 && $.trim(tokens[i]) !== "" && $.trim(tokens[i]).indexOf("{") !== 0 && $.trim(tokens[i]).indexOf("else") !== 0) {
		nfun += "self.preRowExecute(" + (i+1) + ", [" + this.found_vars + "]);";
	    }

   	    nfun += tokens[i];
	    if (i < tokens.length-1 && ($.trim(tokens[i+1]).indexOf("{") !== 0) && ($.trim(tokens[i+1]).indexOf("else") !== 0)) { 
		// add the handle row function to every row except for the first and last
		// this function will deal with row highlighting and var printing
		nfun += "self.postRowExecute(" + (i+1) + ", [" + this.found_vars + "]);";

	    }
	    nfun += "\n";
	}
	return nfun;
    };
    /**
     * Returns the number of parameters of the original function
     */
    Algorithm.prototype.getParams = function(){
	return this.param[1].split(",");
    };
    /**
     * Returns the string representation of the original undecorated function
     */
    Algorithm.prototype.toString = function(){
	return this.func.toString();
    };
    /**
     * Returns a string representation of the decorated function. 
     * A decorated function is one that has callbacks, preExecuteRow and postExecuteRows inserted in its source code
     */
    Algorithm.prototype.getDecorated = function() {
	return this.addDebugging(this.func);
    };

    Algorithm.prototype.getAnimationQueue = function() {
	return this.animation_queue;
    };

    /**
     * Start algorithm animation
     */
    Algorithm.prototype.runCodeAndPopulateAnimationQueue = function() {
	this.runningInContMode = false;
	this.runningCodeStack = [];
	this.functionStack = [];
	this.animation_queue = []; // reset the animation queue
	var result = this.run.apply(this, arguments);
	return result;
    };

    /** 
     * Execute the function with using animating the algorithm
     *
     * IF YOU WANT TO RUN WITH A SHARED ANIMATION QUEUE USE runWithSharedAnimationQueue TO WRAP THE INNER ALGO INSTEAD OF THIS
     */
    Algorithm.prototype.run = function() {
	var N = this.getParams().length;
	var c = "("+this.getDecorated()+")("+Algorithm.paramArg(N)+");";
	//preserve this for the eval inside var self
	var self = this;
	return eval(c);
    };

    // a visualization is always limited to just one animation queue
    // this will be the animation queue of the function that you started with runCodeAndPopulateAnimationQueue
    // if you have multiple functions and want to visualize the calling of these other functions you 
    // can use the runWithSharedAnimationQueue function to attach them
    //
    // This function is meant to be used inside a wrapper of your original function
    //
    // IF YOU DONT WANT TO RUN WITH A SHARED ANIMATION QUEUE USE run TO WRAP THE INNER ALGO INSTEAD OF THIS
    Algorithm.prototype.runWithSharedAnimationQueue = function(algorithmToShareWith) {
	if (!Algorithm.prototype.isPrototypeOf(algorithmToShareWith)) {
	    console.error("First argument to runWithSharedAnimationQueue must have a prototype of Algorithm");
	    return;
	}
	this.animation_queue = algorithmToShareWith.getAnimationQueue();
	var params = Array.prototype.slice.call(arguments);
	params.shift();
	return this.run.apply(this, params);
    };

    Algorithm.prototype.executeInContinuousMode = function() {
	this.runningInContMode = true;
	this.__executeNextRow();
    };

    Algorithm.prototype.executeNextRowInStepMode = function() {
	if (this.animation_queue.length > 0) {
	    var rownum = this.animation_queue[0].rowNumber;
	    var codeId = this.animation_queue[0].codeContainerId;

	    var lastFunc = this.runningCodeStack.pop();
	    this.removeAllRowHighlighting(lastFunc);
	    this.highlightRow(codeId, rownum, 0, undefined);
	    this.runningInStepMode = true;
	    this.__executeNextRow(rownum);
	}
    };

    Algorithm.prototype.isRunning = function() {
	return this.animation_queue.length > 0;
    };

    /*** __executeNextRow is shared by both step by step and continuous execution and does all the animation frame queueing
         and recursion frame shennanigans */
    Algorithm.prototype.__executeNextRow = function(prevRowNum) {
	
	if (this.animation_queue.length > 0) {
	    /* the algorithm_queue might be shared (see runWithSharedQueue) so we need to use pull the data about the algorithm from the animationFrame object */
	    var rownum = this.animation_queue[0].rowNumber;
	    var codeId = this.animation_queue[0].codeContainerId;
	    var frameAlgoCtx = this.animation_queue[0].algorithmCtx;

	    // only do one step in non-continuous mode
	    if (!this.runningInContMode && rownum !== prevRowNum) {
		return;
	    }

	    // stack frame visualization adds extra time because it takes a bit to animate
	    var preanimation_extra_time = 0;
	    if (rownum === 1) {
		if (existsOnTheStack(codeId, this.functionStack)) {
		    preanimation_extra_time += _my.AlgorithmUtils.visualizeNewStackFrame(codeId, frameAlgoCtx);
		}
		this.functionStack.push(codeId);
	    }
	    var doFrameRemoval = this.animation_queue[0].isReturnRow();

	    var animationFunction = this.animation_queue[0].animationFunction;
	    var frameAnimator = frameAnimatorGenerator(this, rownum, doFrameRemoval, codeId, frameAlgoCtx, prevRowNum, animationFunction);
	    setTimeout(frameAnimator, preanimation_extra_time);
	}
	else {
	    var lastFunc = this.runningCodeStack.pop();
	    this.removeAllRowHighlighting(lastFunc);
	    if(this.resetControls !== undefined) {
		this.resetControls(this.codeContainerId);
	    }
	    this.runningInContMode = false;
	    this.runningInStepMode = false;
	}

	function frameAnimatorGenerator(this_obj, rownum, doFrameRemoval, codeId, frameAlgoCtx, prevRowNum, animationFunction) { 
	    return function() {
		// this is where the animation frame is scheduled
		if (this_obj.runningInContMode && rownum !== prevRowNum) {
		    var lastFunc = this_obj.runningCodeStack.pop();
		    this_obj.removeAllRowHighlighting(lastFunc);
		    this_obj.highlightRow(codeId, rownum, 0, undefined);
		}

		this_obj.runningCodeStack.push(codeId);
		this_obj.animation_queue.shift();

		var animation_duration = animationFunction.call(this_obj);
		var removalAnimator = removalAnimatorGenerator(this_obj, rownum, doFrameRemoval, codeId, frameAlgoCtx);
		setTimeout(removalAnimator, animation_duration);
	    };
	}

	// this is what removes recursion frames
	function removalAnimatorGenerator(this_obj, rownum, doFrameRemoval, codeId, frameAlgoCtx) {
	    return function() {
		if (doFrameRemoval) {
		    // a function has returned so we need to handle that
		    if(isRecursionFrame(codeId, this_obj.functionStack)) {
			var removal_duration = _my.AlgorithmUtils.popStackFrame(codeId, frameAlgoCtx);
			setTimeout(function() {
			    this_obj.__executeNextRow(rownum);
			}, removal_duration);
		    }
		    else {
			_my.AlgorithmUtils.clearComments(codeId);
			this_obj.__executeNextRow(rownum);
		    }
		    this_obj.functionStack.pop();
		}
		else {
		    this_obj.__executeNextRow(rownum);
		}
	    };
	}
	
	function existsOnTheStack(codeId, stack) {
	    var N = stack.length;
	    for (var i=0;i<N;i++) {
		if (stack[i] === codeId) return true;
	    }
	    return false;
	}

	function isRecursionFrame(codeId, stack) {
	    var N = stack.length;
	    var cnt = 0;
	    for (var i=0;i<N;i++) {
		if (stack[i] === codeId) {
		    cnt++;
		}
	    }
	    return cnt > 1;
	}
    };

    function AnimationFrame(type, rowNumber, returnRows, codeContainerId, algorithmCtx, animationFunction) {
	this.type = type;
	this.rowNumber = rowNumber;
	this.animationFunction = animationFunction;
	this.codeContainerId = codeContainerId;
	this.returnRows = returnRows;
	this.algorithmCtx = algorithmCtx;
    }
    AnimationFrame.prototype.isReturnRow = function() {
	return this.returnRows[this.rowNumber];
    };
    _my.Algorithm = Algorithm;
    return _my;
})(ALGORITHM_MODULE, $, d3);
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
;ALGORITHM_MODULE.bsearch_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
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
		.attr("viewBox", viewBox.string);

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
	    var i = 0;
	    /* the gs have an old_i which is their old order .. we move the gs to where they are
	     * in the old order
	     */
	    var gs = svgg.selectAll(".bs-gs");
	    map_of_new_pos = {};
	    for (i = 0;i < data.length; i++) {
		map_of_new_pos[data[i].old_i] = i;
	    }

	    var translator_function = function(i) {
		return function(d) {
		    return "translate(" + (2*w*i) + "," + (2.5*Y) + ")";
		};
	    };
	    var single_iterm_anim_duration = animation_duration / data.length;
	    for (i = 0; i<data.length; i++) {
		svgg.select("#bs-item-" + data[i].old_i).transition()
		    .delay(i*single_iterm_anim_duration)
		    .duration(single_iterm_anim_duration)
		    .attr("transform", translator_function(i));
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
	forms.selectAll("input[type='text']")
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
			    };
			    console.log(prep_algo.runCodeAndPopulateAnimationQueue(data, tf, bs_wrapped));
			    executionFunction();
			}
		    }
		}
	    });
	    // this is a jquery object and therefore the .on function can be used
	    // to attach multiple handlers .. they will be called in order of addition
	    // unless one of them call e.stopImmediatePropagation
	    dialog.on("shown.bs.modal", function() { $("#bs-find").focus(); });
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

    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 5, "Notice that it says <code>low < high</code>. This is specific to the deferred evaluation binary search and is different to normal binary search where the condition is <code>low <= high</code>");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 7, "Hum, hum... Notice that we aren't checking <b>equality</b> here in the deferred equality binary search. Instead we check on line 14 after the loop... This is where the deferred equality name comes from, yah yah!");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 10, "In deferred evaluation binary search we only move the <code>low</code> pointer not the <code>high</code> one");
    _my.vislib.addRaptorHead(algorithmDefTabId, "bs-code-def", 14, "In deferred evaluation we check for equality outside of the <code>while</code> loop");

    _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 5, "Note that the check here is <code>low <= high</code> This is an easy one to get wrong to watch out!");
    _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 6, "This way of computing the mid value might seem odd, but it has an important advantage to the more common <code>(low + high) / 2</code>. If either your <code>low</code> or <code>high</code> value is close to the maximum integer value then the addition might overflow which will mess up your algorithm completely. Now this may not happen when you are searching an array, but if your search condition is something else then it could so it's not a bad habit to get into.");
   _my.vislib.addRaptorHead(algorithmNormTabId, "bs-code-norm", 16, "What you return can be important. Some versions of binary search choose for example to return the index where you would insert the value, but times negative one.");

    return {"bsearch": bsearch, "deferred_bsearch": deferred_bsearch, "bsearch-algorithm": balgo_def};

})(ALGORITHM_MODULE, $, d3, bootbox);

;ALGORITHM_MODULE.dsu_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "dsu-tab";
    var algorithmName = "Disjoint Set Union";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded dsu");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName, {priority: "graphs-1-dsu"}, [7, 5]);
    layout.customControlsLayout.style("display", "none");
    layout.introduction.setIntroTlDr("<p>This algorithm may not look like much. Basically all it is about is picking a captain, a leader of each group and joining groups by joining their leaders. The trick is in how we decide which to make the new leader. The DSU always makes the leader the one which has the largest rank. Surprisingly, this guarantees a logarithmic depth of the resulting groups, which means that from any node you can walk up to the leader in <var>log N</var> steps.</p>");
    layout.introduction.setIntroReadMore("<p>This is because the trees really always just grow by one level and the only time a tree grows is if we join it with a tree of the same size. Worst case is therefore join all two halfs, before that join quarters to get halfs etc.</p>");
    
    /*******************************/
    /*      Setup the svg stuff    */
    /*******************************/
    //var width = 1400;
    var treew = 200;
    var treeh = 450;
    var nodeRadius = 32;
    var margin = { left: 0, top: (1.5 * nodeRadius), right: 10, bottom: 100};

    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width", 1000)
	.attr("height", treeh + 10)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var coin_image_src = new Image();
    coin_image_src.src = "assets/coin_flip.gif";
    var coin_image = d3.select("#" + algorithmTabId + " .graphics").select("svg").append("g").attr("class", "coin")	
	.append("image")
	.attr("x", -110 + margin.left)
	.attr("y", -110 + margin.top)
	.attr("width", 220)
	.attr("height", 220)
	.attr("display", "none");

    var next_num = 5;
    var data = [];
    for (var j = 0; j < next_num; j++) {
	data.push({"name": j});
    }

    // the dsu find and union functions
    function find(a, data) {
	var ptr = a;
	while(data[ptr].root != ptr) {
	    ptr = data[ptr].root;
	}
	return ptr;
    }
    function union (a, b, data, find_function) {
	var r1 = find_function(a, data);
	var r2 = find_function(b, data);
	if(r1 !== r2) {
	    if(data[r1].rank > data[r2].rank) {
		data[r2].root = r1; 
	    }
	    else if(data[r1].rank < data[r2].rank) {
		data[r1].root = r2;
	    }
	    else {
		var prob = Math.random();
		if(prob > 0.5) {
		    data[r1].root = r2;
		    data[r2].rank++;
		}
		else {
		    data[r2].root = r1;
		    data[r1].rank++;  
		}
	    }
	}
    }

    /**
     * tree rendering function, called to draw a d3 tree hierarchy 
     */
    function drawTreeFun(data, i, algorithmContext, child) {
	var animation_duration = 2*algorithmContext.getBaselineAnimationSpeed();

	var tree = d3.layout.tree().size([treew - margin.right, treeh - margin.bottom])
	    .children(function(d) {
		return d.children;
	    });
	var nodes = tree.nodes(data);
	var links = tree.links(nodes);


	var diagonal = d3.svg.diagonal();
	var movers = d3.selectAll(".dsu-link-g")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name; });
	
	movers.transition()
	    .duration(animation_duration)
	    .attr("transform", "translate(" + data.order*treew + ",0)");

	movers.select(".dsu-link")
	    .transition()
	    .duration(animation_duration)
	    .attr("d", diagonal);

	var svgLinks = svg.selectAll(".dsu-link")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name; })
	    .enter()
	    .append("g")
	    .attr("class", "dsu-link-g")
	    .attr("transform", "translate(" + data.order*treew + ",0)")
	    .append("path")
	    .attr("class", "dsu-link")
	    .attr("id", function(d) { return "from-" + d.source.name + "-to-" + d.target.name; })
	    .transition()
	    .delay(animation_duration)
	    .attr("d", diagonal);

	var mover_nodes = svg.selectAll(".dsu-node")
	    .data(nodes, function(d) { return d.name; })
	    .transition()
	    .duration(animation_duration)
	    .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";});

	var svgNodes = svg.selectAll(".dsu-node")
	    .data(nodes, function(d) { return d.name; })
	    .enter().append("g")
	    .attr("class", "dsu-node")
	    .attr("id", function(d) { return "dsu-node-" + d.name; })
            .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";});

	
	var circles = svgNodes.append("circle")
	    .attr("cx", 0)
	    .attr("cy", 0)
	    .attr("r", "0")
	    .transition() //transitioning from 0em to 2em
	    .delay(animation_duration)
	    .duration(animation_duration)
	    .attr("r", nodeRadius);

	var texts = svgNodes.append("text")
	    .attr("class", "dsu-node-name")
	    .attr("onmousedown", "return false;")
	    .text(function(d) { return d.name; })
	    .attr("font-size", "0")
	    .transition()
	    .delay(2*animation_duration)
	    .attr("font-size", "20");

	var rankInfos = svgNodes.append("text")
	    .attr("class", "dsu-node-rank")
            .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .attr("onmousedown", "return false;")
	    .text(function(d) { return "Rank = " + d.rank; })
	    .attr("font-size", "0")
	    .transition()
	    .delay(2*animation_duration)
	    .attr("font-size", "12");

	// in svg the order of elements defines the z-index 
	// we added a moveToFront function to d3.selection that changes the order of elements
	setTimeout(function() {
	    svg.select("#dsu-node-" + data.name).moveToFront();
	    if (child !== undefined) svg.select("#dsu-node-" + child.name).moveToFront();
	}, animation_duration + 10);

	return 2*animation_duration;
    }
    // adds elem to the children list of obj
    function push(obj, elem) {
	(obj.children = obj.children || []).push(elem);
    }
    // draws the new winner tree and adds a new node in the place where the loser tree used to be
    function cleanup(winner_num, loser_num, algorithmContext) {
	var winner = d3.select("#dsu-node-" + winner_num).datum();
	var loser = d3.select("#dsu-node-" + loser_num).datum();
	//remove_merged_nodes([winner_num,loser_num]);
	push(winner, loser);
	drawTreeFun(winner, winner_num, algorithmContext, loser);
	// draw a new loser node
	var loser_order = loser.order;
	var new_node = {"name": next_num, "rank": 0, "root": next_num, "children": [], "order": loser_order};
	data.push(new_node);
	var animation_duration = drawTreeFun(_my.AlgorithmUtils.clone(new_node), next_num, algorithmContext);
	next_num++;

	return animation_duration;
    }

    var cbsFind = {};
    var cbsUnion = {};

    // processing and enhancing the data
    d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
	    this.parentNode.appendChild(this);
	});
    };

    // data is the global container of nodes used by the code
    //linearize and add "rank"/"root" and "order" which determines where they will be drawn
    data.forEach(function(d) {
	d.rank = 0;
	d.root = d.name;
	d.order = +d.name;
	if (!("children" in d)) {
	    d.children = [];
	}
    });

    cbsFind[3] = function(ptr, data) {
	var animationDuration = this.AlgorithmContext.getBaselineAnimationSpeed();
	setTimeout(function() {
	    d3.select("#from-" + data[ptr].root + "-to-" + ptr).classed("highlight-elem", true);
	}, animationDuration);
	return animationDuration;
    };
    cbsFind[4] = function(ptr, data) {
	var animationDuration = this.AlgorithmContext.getBaselineAnimationSpeed();
	setTimeout(function() {
	    d3.select("#dsu-node-" + ptr).classed("highlight-elem", true);
	}, animationDuration);
	return animationDuration;
    };
    cbsUnion[3] = function(r1,r2,a,b) {
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    cbsUnion[4] = function(r1, r2) {
	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").transition()
	    .attr("dx","-30")
	    .attr("dy","60")
	    .style("font-size", "26");
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").transition()
	    .attr("dx","-30")
	    .attr("dy","60")
	    .style("font-size", "26");
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    cbsUnion[6] = function(r1, r2) {
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").remove();
	return cleanup(r1, r2, this.AlgorithmContext);
    };
    cbsUnion[9] = function(r2, r1) {
	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").remove();
	return cleanup(r2, r1, this.AlgorithmContext);
    };

    cbsUnion[5] = cbsUnion[8] = cbsUnion[12] = function(data, r2, r1, prob) {

	var animation_duration = 4*this.AlgorithmContext.getBaselineAnimationSpeed();
	var transition_duration = this.AlgorithmContext.getBaselineAnimationSpeed;

	var data_r1 = d3.select("#dsu-node-" + r1).datum();
	var data_r2 = d3.select("#dsu-node-" + r2).datum();

	var xoff = ((data_r1.x + data_r1.order*treew) + (data_r2.x + data_r2.order*treew))/2 + 20;
	var yoff = data_r1.y + 60;
	var z1 = (data_r1.order < data_r2.order) ? r1 : r2;
	var z2 = (data_r1.order < data_r2.order) ? r2 : r1;
	var cmp_result = (data[z1].rank < data[z2].rank) ? 1 : (data[z1].rank > data[z2].rank) ? -1 : 0;
	var selfie = this;

	if (cmp_result == 1) {
	    svg.append("g").attr("class", "cmp_result").attr("transform", "translate(" + xoff + "," + yoff + ")").append("text").text("<");
	}
	else if (cmp_result == -1) {
	    svg.append("g").attr("class", "cmp_result").attr("transform", "translate(" + xoff + "," + yoff + ")").append("text").text(">");
	}
	else {
	    coin_image.attr("xlink:href", coin_image_src.src).attr("transform", "translate(" + xoff + "," + yoff + ")").attr("display", "block");
	    setTimeout(function() {
		coin_image.attr("display", "none");
	    }, animation_duration);

	}

	d3.select("#dsu-node-" + r1).select(".dsu-node-rank").transition().delay(animation_duration).duration(transition_duration)
	    .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .style("font-size", "8");
	d3.select("#dsu-node-" + r2).select(".dsu-node-rank").transition().delay(animation_duration).duration(transition_duration)
	    .attr("dx", (nodeRadius))
            .attr("dy", (-nodeRadius))
	    .style("font-size", "8");
	setTimeout(function() {
	    d3.select("g.cmp_result").remove();
	}, animation_duration);

	return animation_duration + transition_duration;
    };
    cbsUnion[14] = function(r2, r1, data) {
	return cleanup(r2, r1, this.AlgorithmContext);
    };
    cbsUnion[15] = cbsUnion[19] = function(r2, r1, data) {
	var a = r1, b = r2;
	if (data[r2].rank > data[r1].rank) {
	    a = r2;
	    b = r1;
	}
	d3.select("#dsu-node-" + a).select(".dsu-node-rank").transition().text("Rank = " + data[a].rank);
	d3.select("#dsu-node-" + b).select(".dsu-node-rank").remove();
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    cbsUnion[18] = function(r1, r2, data) {
	return cleanup(r1, r2, this.AlgorithmContext);
    };
    cbsUnion[22] = function(r1, r2, data) {
	d3.selectAll(".dsu-link").classed("highlight-elem", false);
	d3.selectAll(".dsu-node").classed("highlight-elem", false);
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    // this object determines the behaviour of the algorighm code
    var algorithmContext = _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj);
    var dsuFind = new _my.Algorithm(find, cbsFind, "dsu-find-code", algorithmContext);
    var dsuUnion = new _my.Algorithm(union, cbsUnion, "dsu-union-code", algorithmContext, function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    });

    _my.AlgorithmUtils.appendCode(algorithmTabId, "dsu-find-code", dsuFind);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "dsu-union-code", dsuUnion);

    function kickOff(executionFunction) {
	/* The function that starts the simulation.
	 * It creates a dialog and the dialog starts the execution
	 */
	var dialog_obj = {
	    title:"Start set union", 
	    message: '<p>Click "Proceed" and select two graph nodes by clicking on them.</p>' +
		'<p>The visualization will start after two nodes have been clicked</p>',
	    buttons: {
		cancel: {
		    label: "Cancel",
		    className: "btn-primary",
		    callback: function() {
		    }
		},
		success: {
		    label: "Proceed",
		    className: "btn-success",
		    callback: function() {
			svg.selectAll(".dsu-node").on("click", function(d) {selectNode(this, d);});
			/**
			 * node selection function, triggered when user clicks on a circle
			 */
			var selected = [];
			var select_mode = true;
			function selectNode(svgObj, d) {
			    //this is used to determine whether nodes can be selected or not
			    if (!select_mode) {
				return;
			    }
			    svgObj.setAttribute("class", "dsu-node highlight-elem");
			    selected.push({"data":d, "obj":svgObj});
			    if (selected.length == 2) {
				select_mode = false;
				setTimeout(function() { 	    
				    var selected1 = selected[0].data.name;
				    var selected2 = selected[1].data.name;
				    var findInClosure = function(node, data) {
					return dsuFind.runWithSharedAnimationQueue(dsuUnion, node, data);
				    };
				    dsuUnion.runCodeAndPopulateAnimationQueue(selected1, selected2, data, findInClosure);
				    selected = [];
				    // remove the click function
				    svg.selectAll(".dsu-node").on("click", function() {});
				    executionFunction();
				}, 200);
			    }
			}
		    }
		}
	    }
	};

	bootbox.dialog(dialog_obj);
    }
    _my.AlgorithmUtils.attachAlgoToControls(dsuUnion, algorithmTabId, kickOff);

    /*calls google-prettify to make the code look nice
      called automatically
    */
    //$(function(){prettyPrint()});
    // we set the viewBox parameters here since this is when the divs are ready (dom ready)
    data.forEach(function(d) { d.rank = 0;});
    data.forEach(function(d, i) {
	drawTreeFun(_my.AlgorithmUtils.clone(d), i, { getBaselineAnimationSpeed: function() { return 1000; }});
    });

    return {"find": find, "union": union,  "find-algorithm": dsuFind, "union-algorithm": dsuUnion};

})(ALGORITHM_MODULE, $, d3, bootbox);
;ALGORITHM_MODULE.fenwick_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "fenwick-tab";
    var algorithmName = "Fenwick tree";
    var N = 16;
    var tree = new Array(N + 1);
    var input_data = new Array(N);
    tree.fill(0);
    input_data.fill(0);
    var idxs = [];
    for (var i = 1; i <= N; i++) {
	idxs.push(i);
    }

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded fenwick");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName,  {priority:"fenwick"}, [7, 5], "You may modify the input array here:");
    var fen_container = layout.customControlsLayout.append("div").attr("class", "clearfix").style("width", "100%");
    var float_container = fen_container.append("div").attr("class", "fen-float-container pull-left");
    var fen_labels = float_container.append("div").attr("class", "fen-labels");
    var fen_forms = float_container.append("div").attr("class", "fen-forms");
    var fenIndexData = fen_container.append("div").attr("class", "fen-index-data");
    var dynamicData = resetFenIndexData(fenIndexData);
    fen_labels.append("span").text("index:").attr("class", "fen-table-lbl");
    var labels = d3.select(".fen-labels").selectAll("fen-label")
	.data(idxs)
	.enter().append("span")
	.attr("class","fen-label")
	.text(function(d, i) { return i+1; });

    fen_forms.append("span").text("value:").attr("class", "fen-table-lbl");
    var forms = d3.select(".fen-forms").selectAll("input[type='text']")
	.data(input_data)
	.enter().append("input")
	.attr("data-fen-index", function(d, i) {return i+1;})
	.attr("type","text")
	.attr("class","fen-input-box")
	.attr("maxlength", 1);

    layout.introduction.setIntroTlDr("<p>This datastructure is also known as the Binary Indexed Tree. One look into the visualization section will tell you why. Maybe... The idea is that we use the binary encoding of an index to compute the parents and children of this tree.</p>");
    layout.introduction.setIntroReadMore("<p>This algorithm helps you in computing prefix aggregates in <var>O(log N)</var> time on data that can be updated. This works because we store subtree sums inside parent nodes in the tree. To compute the aggregates we then travel diagonally through the tree. If you can compute prefix sums you can then compute the sum between any two arbitrary indices as shown in the <code>sumBetween</code> code.</p>");

    /*populate the inputs*/
    var inputs = document.querySelectorAll(".fen-forms > input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = 0;
    }
    /*********************/
    /*** fenwick functions ***/
    /*********************/
    function sumBetween(start, end, tree, read) {
	var sum_to_end = read(end, tree);
	var sum_upto_start = read(start - 1, tree);
	var sum = sum_to_end - sum_upto_start;
	return sum;
    }

    function read(idx, tree) {
	var result = 0;
	for (var i = idx; i > 0;) {
	    result += tree[i];
	    var lowest_set_bit = (i & -i);
	    i -= lowest_set_bit;
	}
	return result;
    }
    function update(value, idx, tree) {
	for (var i = idx; i < tree.length;) {
	    tree[i] += value;
	    var lowest_set_bit = (i & -i);
	    i += lowest_set_bit;
	}
    }

    /*****************************/
    /*** svg setup and wiring ***/
    /*****************************/
    function removeFenResultMessage(fenIndexData) {
	fenIndexData.selectAll(".fen-sum-result").remove();
    }
    function resetFenIndexData(fenIndexData) {
	var dynamicData = {};
	fenIndexData.selectAll("p:not(.fen-sum-result)").remove();
	dynamicData.summaryField = fenIndexData.append("p");
	dynamicData.summaryField.append("span").attr("class", "fen-dyn-lbl").text("");
	dynamicData.summaryField.append("span").attr("class", "fen-dyn-val").text("");
	dynamicData.currentField = fenIndexData.append("p");
	dynamicData.currentField.append("span").attr("class", "fen-dyn-lbl").text("index: ");
	dynamicData.currentField.append("span").attr("class", "fen-dyn-val").text("");
	dynamicData.minusCurrentField = fenIndexData.append("p");
	dynamicData.minusCurrentField.append("span").attr("class", "fen-dyn-lbl").text("-index: ");
	dynamicData.minusCurrentField.append("span").attr("class", "fen-dyn-val").text("");
	dynamicData.andCurrentField = fenIndexData.append("p");
	dynamicData.andCurrentField.append("span").attr("class", "fen-dyn-lbl").text("index & -index: ");
	dynamicData.andCurrentField.append("span").attr("class", "fen-dyn-val").text("");
	dynamicData.nextField = fenIndexData.append("p");
	dynamicData.nextField.append("span").attr("class", "fen-dyn-lbl").text("new index: ");
	dynamicData.nextField.append("span").attr("class", "fen-dyn-val").text("");
	return dynamicData;
    }
    var log2N = Math.ceil(Math.log2(N));
    function bitPattern(num) {
	var res = [];
	var i = 0;
	if (num > 0) {
	    for (i = 0; i <= log2N; i++) {
		res.push(num % 2);
		num = num >> 1;
	    }
	}
	else {
	    var carry = 1;
	    var nabs = Math.abs(num);
	    for (i = 0; i <= log2N; i++) {
		var e = 1 - num % 2;
		res.push((e + carry)%2);
		if (e + carry == 1) {
		    carry = 0;
		}
		num = num >> 1;
	    }
	}
	return res.reverse().join("");
    }
    var sum_callbacks = [];
    var read_callbacks = [];
    var update_callbacks = [];
    var svg_data = function init() {
	var margin = { left: 10, top: 70, right: 10, bottom: 100};
	var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  "600px")
	.attr("height", "850px")
	.style("float", "left")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("text").attr("class", "fen-text").text("Fenwick Tree:");
	var highest2Pow = 1 << log2N;
	var node_size = [471, 322];

	var cluster = d3.layout.cluster()
	    .children(function(node) {
		var lsb = (node.val & -node.val);

		node.children = [];
		var s = node.val - lsb;
		for (var i = lsb >> 1; i > 0; i = i >> 1) {
		    s += i;
		    node.children.push({val: s});
		}
		return node.children;
	    })
	    .size(node_size);

	var nodes = cluster.nodes({val: highest2Pow});
	var links = cluster.links(nodes);

	svg.selectAll("fen-link")
	    .data(links)
	    .enter()
	    .append("path").attr("class", "fen-link")
	    .attr("d", d3.svg.diagonal());

	var radius = 56;
	var fen_nodes = svg.selectAll("fen-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fen-node")
	    .attr("id", function(d) { return "fen-node-" + d.val; })
	    .attr("transform", function(d) { return "translate(" + d.x + ", " + d.y + ")"; });
	fen_nodes.append("rect")
	    .attr("class", "fen-rect")
	    .attr("x", -radius/2)
	    .attr("y", -radius/2)
	    .attr("width", radius)
	    .attr("height", radius);
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl")
	    .attr("dy", -radius/3)
	    .append("tspan")
	    .text(function(d) { return "Index: " + d.val; });
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl fen-bit")
	    .text(function(d) { return "(" + bitPattern(d.val) + ")" ; });
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl fen-sum")
	    .attr("dy", +radius/3)
	    .text(function(d) { return "Sum: " + (tree[d.val] || 0); });
	fen_nodes.append("line")
	    .attr("x1",-radius/2)
	    .attr("x2",radius/2)
	    .attr("y1",radius/6)
	    .attr("y2",radius/6);

	var arrow_holder = svg.insert("g", "g");

	result = {svg: svg, fen_nodes: nodes, arrow_holder: arrow_holder};
	return result;
    }();
    var svg = svg_data.svg;

    function highlighting(idx) {
	svg.select("#fen-node-" + idx + " > rect").classed("fen-rect-highlighted", true);
    }
    function arrowAnimate(old_idx, i) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	if (i === 0 || old_idx === 0 || i > N || old_idx > N) return this.AlgorithmContext.getBaselineAnimationSpeed();
	var arrow_gen = _my.vislib.interpolatableDiagonal("linear");
	var data = {"source": svg.select("#fen-node-" + old_idx).datum(), "target" : svg.select("#fen-node-" + i).datum()};
	var path = svg.insert("path", "g").attr("class", "fen-arrow").attr("d", arrow_gen(data));
	var arrow = _my.vislib.animateGrowingArrow(svg_data.arrow_holder, path, animation_duration, 0, false, 1).arrow;
	arrow.attr("class", "fen-arrow-head");
	setTimeout(function() {
	    highlighting(i);
	}, animation_duration);
	return animation_duration;
    }
    function commonStartup(idx) {
	d3.selectAll(".fen-arrow-head").remove();
	d3.selectAll(".fen-arrow").remove();
	svg.selectAll(".fen-rect-highlighted").classed("fen-rect-highlighted", false);
	highlighting(idx);
    } 

    function fadeIn(elem, duration) {
	elem.transition().duration(duration).style("opacity", "1");
	return elem;
    }
    function fadeOut(elem, duration, delay) {
	elem.transition().delay(delay).duration(duration).style("opacity", "0");
	return elem;
    }

    sum_callbacks[1] = function() {
	removeFenResultMessage(fenIndexData);
    };

    sum_callbacks[5] = {"pre": function(start, end, sum) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	var par = fenIndexData.append("p").attr("class", "fen-sum-result");
	par.append("span").text("The sum of array values in the index range: ");
	par.append("span").attr("class", "fen-sum-result-num").text("(" + start + ",");
	par.append("span").attr("class", "fen-sum-result-num").text(end + ")");
	par.append("span").text(" is equal to ");
	par.append("span").attr("class", "fen-sum-result-num").text(sum);
	fadeIn(par, animation_duration);
    }};

    read_callbacks[1] = function(idx) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	commonStartup(idx);
	fadeIn(dynamicData.summaryField, animation_duration).select("span:first-child").text("sum: ");
	dynamicData.summaryField.select("span:last-child").text(0);
	fadeIn(dynamicData.currentField, 1.2 * animation_duration).select("span:last-child").text(bitPattern(idx));
	return 1.2 * animation_duration;
    };
    update_callbacks[1] = function(idx, value) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	removeFenResultMessage(fenIndexData);
	commonStartup(idx);
	fadeIn(dynamicData.summaryField, animation_duration).select("span:first-child").text("increment: ");
	dynamicData.summaryField.select("span:last-child").text(value);
	fadeIn(dynamicData.currentField, 1.2 * animation_duration).select("span:last-child").text(bitPattern(idx));
	return 1.2 * animation_duration;
    };
    update_callbacks[4] = function(i) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(dynamicData.minusCurrentField, animation_duration).select("span:last-child").text(bitPattern(-i));
	fadeIn(dynamicData.andCurrentField, 2 * animation_duration).select("span:last-child").text(bitPattern(i & -i));
	return animation_duration * 2;
    };
    read_callbacks[3] = update_callbacks[2] = function(i) {
	dynamicData.currentField.select("span:last-child").text(bitPattern(i));
	highlighting(i);
    };
    read_callbacks[5] = function(i) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(dynamicData.minusCurrentField, animation_duration).select("span:last-child").text(bitPattern(-i));
	fadeIn(dynamicData.andCurrentField, 2 * animation_duration).select("span:last-child").text(bitPattern(i & -i));
	return animation_duration * 2;
    };
    read_callbacks[6] = function(i, lowest_set_bit) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(dynamicData.nextField, animation_duration).select("span:last-child").text(bitPattern(i));
	var duration = Math.max(animation_duration, arrowAnimate.call(this, i + lowest_set_bit, i));
	fadeOut(dynamicData.minusCurrentField, animation_duration, duration);
	fadeOut(dynamicData.andCurrentField, animation_duration, duration);
	fadeOut(dynamicData.nextField, animation_duration, duration);
	dynamicData.currentField.transition()
	    .delay(duration).duration(animation_duration).select("span:last-child").text(bitPattern(i));
	return duration + animation_duration;
    };
    update_callbacks[3] = function(tree, i) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	var node = svg.select("#fen-node-" + i).select(".fen-sum");
	node.classed("fen-text-highlight", true).text("Sum: " + (tree[i] || 0));
	setTimeout(function() {
	    node.classed("fen-text-highlight", false);
	}, animation_duration);
	return animation_duration;
    };
    update_callbacks[5] = function(i, lowest_set_bit) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(dynamicData.nextField, animation_duration).select("span:last-child").text(bitPattern(i));
	var duration = Math.max(animation_duration, arrowAnimate.call(this, i - lowest_set_bit, i));
	fadeOut(dynamicData.minusCurrentField, animation_duration, duration);
	fadeOut(dynamicData.andCurrentField, animation_duration, duration);
	fadeOut(dynamicData.nextField, animation_duration, duration);
	dynamicData.currentField.transition()
	    .delay(duration).duration(animation_duration).select("span:last-child").text(bitPattern(i));
	return duration + animation_duration;
    };

    function cleanup() {
	d3.selectAll(".fen-arrow-head").remove();
	d3.selectAll(".fen-arrow").remove();
	d3.selectAll(".fen-label").classed("fen-label-highlighted", false);
	svg.selectAll(".fen-rect-highlighted").classed("fen-rect-highlighted", false);
	_my.AlgorithmUtils.resetControls(algorithmTabId);
	reinitButtons();
	dynamicData = resetFenIndexData(fenIndexData);
    }
    var fenwick_sum = new _my.Algorithm(sumBetween, sum_callbacks, "fen-sum-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);

    var fenwick_read_algo = new _my.Algorithm(read, read_callbacks, "fen-read-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);
    var fenwick_update_algo = new _my.Algorithm(update, update_callbacks, "fen-update-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);


    var wrapped_read = function(idx, tree) {
	return fenwick_read_algo.runWithSharedAnimationQueue(fenwick_sum, idx, tree);
    };
    
    function initOnIndexSelection() {
	var clicked = 0;
	d3.selectAll(".fen-label").on("click", function(d) {
	    if(clicked == 1) {
		var start = d3.select(".fen-label-highlighted").datum();
		d3.select(this).classed("fen-label-highlighted", true);
		var end = d;
		console.log("starting fenwick index thing with", start, end);
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_sum, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_sum, algorithmTabId);
		fenwick_sum.run(+start, +end, tree, wrapped_read);
		play_function();
	    }
	    else {
		d3.select(this).classed("fen-label-highlighted", true);
	    }
	    clicked = (clicked + 1) % 2;
	    
	});
    }
    initOnIndexSelection();

    function initOnValueChanges() {
	$(".fen-input-box").on("input", function(d) {
	    var value = +$(this).val();
	    var index = +$(this).attr("data-fen-index");
	    if (!isNaN(value) && index <= input_data.length && value != input_data[index-1]) {
		var dif = value - input_data[index-1];
		input_data[index-1] = value;
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_update_algo, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_update_algo, algorithmTabId);
		fenwick_update_algo.run(dif, index, tree);
		play_function();
	    }
	});
    }
    initOnValueChanges();

    function reinitButtons() {
	_my.AlgorithmUtils.attachAlgoToControls(fenwick_read_algo, algorithmTabId, function kickOff(executionFunction) {
	    /* The function that starts the simulation.
	     * It creates a dialog and the dialog starts the execution
	     */
	    var dialog = bootbox.dialog({
		title:"Fenwick interaction", 
		message: '<span>To start the visualization, in the "Fenwick Controls " section either click on two indices or change a value</span>',
		buttons: {
		    success: {
			label: "Ok",
			className: "btn-primary",
			callback: function() {
			}
		    }
		}
	    });
	});
    }
    reinitButtons();
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-sum-code", fenwick_sum);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-read-code", fenwick_read_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-update-code", fenwick_update_algo);

    return {"read" : read, "update": update, "sumBetween": sumBetween};
}(ALGORITHM_MODULE, jQuery, d3, bootbox));
;ALGORITHM_MODULE.fft_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
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
    layout_tran.introduction.setIntroTlDr("<p>This algorithm uses the fact that a polynomial of degree <var>N</var> can be defined uniquely either using its coefficients or using <var>N</var> <var>(x, y)</var> pairs. This is because of <a href='http://en.wikipedia.org/wiki/Lagrange_polynomial#Definition'>Lagrange formula</a> which allows us to compute the coefficients uniquely from the <var>(x,y)</var> pairs.</p>");
    layout_tran.introduction.setIntroReadMore("<p>But evaluating a polynomial on <var>N</var> input points even with <a href='http://en.wikipedia.org/wiki/Horner%27s_method'>Horner's method</a> method is going to be <var>O(N<sup>2</sup>)</var>. The idea of the FFT is that on a special set of <var>N</var> input points this can be improved to <var>O(N log N)</var>. This speical set is most commonly the roots of unity, because when we square roots of unity of even number we get more roots of unity. This allows us to employ a great divide and conquer technique. Check out the visualization and the raptor heads for more, because this is a pretty complicated algorithm.</p>");
    var layout_mult = _my.AlgorithmUtils.setupLayout(algorithm2TabId, algorithm2Name,  {priority:"fft2-mult"}, [6, 6], "You may modify the input polynomials here:");
    layout_mult.gaugeObj.setSpeedModifier(30);
    var forms_holder = layout_mult.customControlsLayout.append("div");
    forms_holder.append("div").attr("class", "fft-mult-forms-left pull-left");
    forms_holder.append("div").attr("class", "fft-mult-forms-right pull-right");
    layout_mult.introduction.setIntroTlDr("<p>The normal way to multiply polynomials is pretty straighforward right? You take the first coefficient, multiply it with all the other coefficients, do this for every coefficient and then add up the results. Simple, but slow .. <var>O(N<sup>2</sup>)</var> no es bueno, amigo. Fortunately we already saw that we can evaluate a polynomial at <var>N</var> points in <var>N log N</var> time <a href='#fft-tab-tran'>here</a>.</p>");
    layout_mult.introduction.setIntroReadMore("<p>We could multiply two polynomials by multiplying these points individually and then if we just had a way to go from the points to the coefficients quickly as well we would be good! Fortuantely the FFT can also be used for that too because if applied on the points it will give the coefficients. Check out the raptor heads for more, once again.</p>");

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
	    .attr("value", function(d) { return d; });
	var labels = forms_spans.append("span")
	    .text(function(d, i) { return i < poly.length-1 ? "x" : "";});
	forms_spans.append("sup")
	    .text(function(d, i) { return i < poly.length-1 ? "" + (poly.length-i-1) : "";});
	forms_spans.append("span")
	    .text(function(d, i) { return i < poly.length-1 ? " +" : "";});
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
    };
    Complex.equals = function(c1, c2) {
	return (Math.abs(c1.real - c2.real) < 1e-6 && Math.abs(c1.imaginary - c2.imaginary) < 1e-6);
    };
    Complex.create.prototype.toString = function() {
	function addI(val) {
	    if (val === 1) {
		return "i";
	    }
	    if (val === -1) {
		return "-i";
	    }
	    return val + "i";
	}
	var ri = Math.round10(this.imaginary, -2);
	var rr = Math.round10(this.real, -2);
	if (ri === 0) {
	    return "" + rr;
	}
	if (rr === 0) {
	    return "" + addI(ri);
	}
	return "" + rr + " " + (this.imaginary >= 0 ? "+ " : "- ") + addI(Math.abs(ri));
    };
    Complex.ZERO = Complex.create(0,0);

    Complex.add = function add(a, b) {
	if (a === undefined && b === undefined) {
	    return Complex.create(0,0);
	}
	if (a === undefined) {
	    return b;
	}
	if (b === undefined) {
	    return a;
	}
    	return Complex.create(a.real + b.real,a.imaginary + b.imaginary);
    };

    Complex.sub = function sub(a, b) {
	if (a === undefined && b === undefined) {
	    return Complex.create(0,0);
	}
	if (a === undefined) {
	    return b;
	}
	if (b === undefined) {
	    return a;
	}
	return Complex.create(a.real - b.real, a.imaginary - b.imaginary);
    };

    Complex.mult = function mult(a, b) {
	if (a === undefined || b === undefined) {
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
    	if (N === 1) {
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
	.attr("height", "850px");
    var fft_group = svg_fft_elem.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svg_multiply_elem = d3.select("#" + algorithm2TabId + " .graphics").append("svg")
	.attr("width",  1.42*width + "px")
	.attr("height", "620px");
    var multiply_group = svg_multiply_elem.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
	    poly[poly.length - i - 1] = value !== 0 ? Complex.create(value,0) : Complex.ZERO;
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
	}
	var lbl_cnt = 2;
	function preorder_label(node) {
	    if (node > data.length) return;
	    data[node - 1].label = lbl_cnt;
	    lbl_cnt++;
	    preorder_label(node*2);
	    preorder_label(node*2 + 1);
	}
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
		return (a.parent === b.parent ? ((a.depth === last_level) ? 1.5 : 6) : 2);
	    });
	var link_path_gen = (inverted === true) ? _my.vislib.interpolatableDiagonal("linear").inverted() : _my.vislib.interpolatableDiagonal("linear");
	var nodes = tree.nodes({v: data[0]});
	group.selectAll(".fft-link")
	    .data(tree.links(nodes))
	    .enter()
	    .append("path")
	    .attr("class", function(d) {return "fft-link " + "fft-link-to" + link_path_gen.target(d).v.label; })
	    .attr("d", link_path_gen);
	var node_gs = 
	    group.selectAll(".fft-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fft-node")
	    .attr("id", function(d) { return "fft-node-num" + d.v.label; })
	    .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")";});
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
	    .text(function(d){return d.val;})
	    .append("tspan")
	    .attr("style", function(d, i) { return i === elems.length-1 ? "display:none" : "display:inline"; })
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
	    elems.push({"value": poly[i], "real_sign" : Math.sign(poly[i].real), "key": i, "has_img" : (Math.round10(poly[i].imaginary, -2) !== 0), "f_non_z" : f_non_zero});
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
	    .attr("id", function(d) { return "fft-tspan" + d.key;})
	    .attr("class", "fft-poly")
	    .text(function(d) { return signString(d, i) + wrapComplex(d) + (d.key === 0 ? "" : "x"); });
	textFields.filter(function(d) { return d.key >= 2; })
	    .attr("class", "fft-poly fft-has-super")
	    .append("tspan")
	    .attr("class", "fft-super")
	    .attr("font-size", 15)
	    .attr("dy", -15)
	    .text(function(d) { return d.key < 2 ? " " : d.key; });
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
	    .startAngle(function(d, i) { return data[i].angle; });

	// this arc generator is only used to compute a point on the circle using arc.centroid so that we
	// can use this point to move around the circle
	var total_circle = d3.svg.arc().innerRadius(radius).outerRadius(radius)
	    .endAngle(function(d) { return 7*Math.PI/2 - 0.001; })
	    .startAngle(function(d) { return 3*Math.PI/2; });

	var point_on_crc = total_circle.centroid(data[0], 0);
	var center_of_crc = [point_on_crc[0] - total_circle.outerRadius()(), point_on_crc[1]];

	var d1 = d3.svg.diagonal()
	    .source(function() {
		return {"x": center_of_crc[0], "y": center_of_crc[1]}; })
	    .target(function() {
		return {"x": point_on_crc[0], "y": point_on_crc[1]}; });
	
    
	  var path = group.selectAll(".arc").data(data).enter().append("path").attr("d", radial).each(function(d, i) {
	      // the stroke-dasharray trick to animate a line by decreasing the gap between in the stroke dashes
	      _my.vislib.animatePath(d3.select(this), duration, (duration / 2) * i, false, 1);
	  })
	      .attr("class", function(d, i) { return "root-of-unity-circle fft-root-of-unity-path-to-" + i;});

	// our diagonal inside the circle that points at the roots of unity
	var diagonal = group.append("path").attr("d", d1(1)).attr("class","root-of-unity-arrow").attr("id", "unity-arrow")
	    .style("display", "none");

	var scale_factor = radius / 80;
	var unit_groups = group.selectAll("fft-unit-circle-roots")
	    .data(data.slice(0, data.length-1))
	    .enter()
	    .append("g")
	    .attr("class", "fft-unit-circle-roots")
	    .attr("id", function(d, i) { return "fft-root-of-unity" + i; })
	    .style("display", "none");
	
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
	    .attr("transform", function(d) { return "rotate(" + -radToDeg(d.angle - Math.PI/2) + ")"; });
	var text = unit_groups.append("text")
	    .attr("class", "fft-text")
	    .attr("dx", (1 * scale_factor) + "em")
	    .attr("dy", (8 * scale_factor) + "px")
	    .attr("font-size", "1.5em")
	    .text(function(d) { return d.text; })
	    .attr("transform", function(d) { return "rotate(" + -radToDeg(d.angle - Math.PI/2) + ")"; });

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

    ev_calls[1] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree;
	recursion_depth++;
	if (recursion_depth === 1) {
	    current_id = 1;
	    var nearest2Pow = 1 << Math.ceil(Math.log2(N));
	    fft_group.select("#fft-poly-tree").remove();
	    fft_group.select("#fft-poly-tree-upside-down").remove();
	    prepareLayoutForPolys(nearest2Pow, 50, fft_group, "fft-poly-tree", tree_x_offset, tree1_y_offset);
	    prepareLayoutForPolys(nearest2Pow, 50, fft_group, "fft-poly-tree-upside-down", 0, 0, true);
	    d3.select("#fft-poly-tree-upside-down").attr("transform", "translate(" + tree_x_offset + ", " + tree2_y_offset+") scale(-1,1) rotate(180)");
	    top_down_tree = d3.select("#fft-poly-tree");
	    drawPoly(poly.slice(start, start + N), top_down_tree.select("#fft-node-num" + 0), true);
	}
	else {
	    current_id++;
	    top_down_tree = d3.select("#fft-poly-tree");
	    var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + current_id), animation_duration, 0, false, 0.7).transition;
	    transition.each("end", function() {
		drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false);
	    });
	    drawLayerLabel(fft_group, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	}
	return animation_duration;
    };
    ev_calls[11] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree = d3.select("#fft-poly-tree");
	var transition = _my.vislib.animateGrowingArrow(top_down_tree, top_down_tree.selectAll(".fft-link-to" + 1), animation_duration, 0, false, 0.7).transition;
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	transition.each("end", function() {
	    drawPoly(poly.slice(start, start + N), elem_to_draw_into, false);
	});
	drawLayerLabel(fft_group, N, recursion_depth, 2.5, elem_to_draw_into.datum().y + tree1_y_offset);
	return animation_duration;
    };
    ev_calls[14] = { "pre" : function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree, elem_to_draw_into;
	if (recursion_depth === 1) {
	    current_id++;
	    top_down_tree = d3.select("#fft-poly-tree");
	    elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
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
	    top_down_tree = d3.select("#fft-poly-tree");
	    elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true);
	}
	return 1.2 * animation_duration;
    }};
    ev_calls[16] = function(poly, start, i, x, half_N) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree = d3.select("#fft-poly-tree");
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + i).text("" + poly[x] + ",").style("visibility", "visible");

	var ci = visible_coefs.select(".fft-coef-" + (x - start)).classed("fft-coefs-highlight", true);
	var cf = invisible_coefs.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	setTimeout(function() {
	    ci.classed("fft-coefs-highlight", false);
	    cf.classed("fft-coefs-highlight", false);
	}, animation_duration);
	return animation_duration;
    };
    ev_calls[17] = function(poly, start, i, x, half_N, N) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var top_down_tree = d3.select("#fft-poly-tree");
	var elem_to_draw_into = top_down_tree.select("#fft-node-num" + current_id);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + (i + half_N)).text("" + poly[x+1] + ((i + half_N < N-1) ? "," : ""))
	    .style("visibility", "visible");

	var ci = visible_coefs.select(".fft-coef-" + (x+1-start)).classed("fft-coefs-highlight", true);
	var cf = invisible_coefs.select(".fft-coef-" + (i + half_N)).classed("fft-coefs-highlight", true);
	setTimeout(function() {
	    ci.classed("fft-coefs-highlight", false);
	    cf.classed("fft-coefs-highlight", false);
	}, animation_duration);
	return animation_duration;
    };
    ev_calls[23] = function(poly, start, N) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var lvl = Math.log2(N);
	var subtree_nodenum = (1 << (lvl + 1)) - 2;
	var our_id = current_id - subtree_nodenum;
	var down_top_tree = d3.select("#fft-poly-tree-upside-down");
	var elem_to_draw_into = down_top_tree.select("#fft-node-num" + our_id);

	var transition = _my.vislib.animateGrowingArrows(down_top_tree, down_top_tree.selectAll(".fft-link-to" + our_id), animation_duration, 0, false, 0.7).transition;
	transition.each("end", function() {
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, false, true);
	    drawCoefs(poly.slice(start, start + N), elem_to_draw_into, true, true);
	});
	return 1.2 * animation_duration;
    };
    ev_calls[24] = { "pre" : function(N) {
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
    ev_calls[27] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var lvl = Math.log2(N);
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	var equa = "(" + poly[start+k] + ") + (" + unity + ") * (" + poly[start + half_N + k] + ")";
	invisible_coefs.select(".fft-coef-" + k).text(equa + ",")
	    .style("visibility", "visible");

	var ci1 = visible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true);
	var ci2 = visible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true);
	var cf = invisible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true);
	var drawing = drawArrowFromCircle(elem_to_draw_into, lvl, k, animation_duration);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false);
	    ci2.classed("fft-coefs-highlight", false);
	    cf.classed("fft-coefs-highlight", false);
	    cf.text("" + helper_arr[k] + ",");
	    drawing.circle.remove();
	    drawing.path.remove();
	}, 2 * animation_duration);
	return 2 * animation_duration;
    };
    ev_calls[28] = function(poly, unity, k, start, N, half_N, helper_arr) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var lvl = Math.log2(N);
	var elem_to_draw_into = getElemToDrawInto("#fft-poly-tree-upside-down", current_id, N);
	var visible_coefs = elem_to_draw_into.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	var equa = "(" + poly[start+k] + ") - (" + unity + ") * (" + poly[start + half_N + k] + ")";
	var comma = ((k + half_N < N-1) ? "," : "");
	invisible_coefs.select(".fft-coef-" + (k + half_N)).text(equa + comma)
	    .style("visibility", "visible");
	var ci1 = visible_coefs.select(".fft-coef-" + (k)).classed("fft-coefs-highlight", true);
	var ci2 = visible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true);
	var cf = invisible_coefs.select(".fft-coef-" + (k + half_N)).classed("fft-coefs-highlight", true);
	var drawing = drawArrowFromCircle(elem_to_draw_into, lvl, k + half_N, animation_duration);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false);
	    ci2.classed("fft-coefs-highlight", false);
	    cf.classed("fft-coefs-highlight", false);
	    cf.text("" + helper_arr[k + half_N] + comma);
	    drawing.circle.remove();
	    drawing.path.remove();
	}, 2 * animation_duration);
	return 2 * animation_duration;
    };
    ev_calls[33] = ev_calls[3] = { 
	"pre": function(poly, N) { 
	    recursion_depth--;
	    if (recursion_depth === 0) {
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
	var root_unity = fft_group.select("#fft-circle-lvl" + lvl + " #fft-root-of-unity" + k);
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
	};
	var ComplexClone = _my.AlgorithmUtils.clone(Complex);
	ComplexClone.calc_unity = sharedCalc;
	var p = poly_ev.slice();
	var result = ev.runCodeAndPopulateAnimationQueue(p, 0, p.length, [], ComplexClone);
	console.log("After fft transform", "" + p);
	
	executionFunction();
    }

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
		return (a.parent === b.parent ? ((a.depth === last_level) ? 1.5 : 8) : 2);
	    });
	var link_path_gen = _my.vislib.interpolatableDiagonal("linear").inverted();
	var nodes = tree.nodes(data[0]);
	group.selectAll(".fft-link")
	    .data(tree.links(nodes))
	    .enter()
	    .append("path")
	    .attr("class", function(d) {return "fft-link " + "fft-link-to" + link_path_gen.target(d).v; })
	    .attr("d", link_path_gen);
	var node_gs = 
	    group.selectAll(".fft-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fft-node")
	    .attr("id", function(d) { return "fft-node-num" + d.v; })
	    .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")";});
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
    fft_calls[3] = function(p, q, N, nearest2Pow) {
	multiply_group.select("#multiply-poly-tree").remove();
	prepareMultiplyLayout(nearest2Pow, mult_node_size, multiply_group, "multiply-poly-tree", 0, 0);
	var mult_tree = d3.select("#multiply-poly-tree");
	mult_tree.attr("transform", "translate(" + tree_mult_offset_x + ", " + tree_mult_offset_y +") scale(-1,1) rotate(180)");
	var nodea = mult_tree.select("#fft-node-num5");
	drawPoly(p, nodea, true, true);
	var nodeb = mult_tree.select("#fft-node-num8");
	drawPoly(q, nodeb, true, true);
    };
    fft_calls[7] = function(p) {
	return animateNodeMultDrawing(4, drawPoly, p, false, this.AlgorithmContext);
    };
    fft_calls[10] = function(q) {
	return animateNodeMultDrawing(7, drawPoly, q, false, this.AlgorithmContext);
    };
    fft_calls[11] = function(p) {
	return animateNodeMultDrawing(3, drawCoefs, p, false, this.AlgorithmContext);
    };
    fft_calls[12] = function(q) {
	return animateNodeMultDrawing(6, drawCoefs, q, false, this.AlgorithmContext);
    };
    fft_calls[14] = {"pre" : function(nearest2Pow) {
	var empty_pol = new Array(nearest2Pow);
	empty_pol.fill(0);
	return animateNodeMultDrawing(2, drawCoefs, empty_pol, true, this.AlgorithmContext);
    }};
    fft_calls[15] = function(res, p, q, i, nearest2Pow) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_from1 = mult_tree.select("#fft-node-num3");
	var elem_to_draw_from2 = mult_tree.select("#fft-node-num6");
	var elem_to_draw_into = mult_tree.select("#fft-node-num2");
	var visible_coefs1 = elem_to_draw_from1.select(".fft-coef-text-false");
	var visible_coefs2 = elem_to_draw_from2.select(".fft-coef-text-false");
	var invisible_coefs = elem_to_draw_into.select(".fft-coef-text-true");
	invisible_coefs.select(".fft-coef-" + i).text("" + res[i] + (i!==nearest2Pow-1 ? "," : "")).style("visibility", "visible");

	var ci1 = visible_coefs1.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	var ci2 = visible_coefs2.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	var cf = invisible_coefs.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false);
	    ci2.classed("fft-coefs-highlight", false);
	    cf.classed("fft-coefs-highlight", false);
	}, animation_duration);
	return animation_duration;
    };
    fft_calls[17] = function(res) {
	return animateNodeMultDrawing(1, drawCoefs, res, false, this.AlgorithmContext);
    };
    fft_calls[22] = function(res, i, nearest2Pow, temp) {
	var animation_duration = (4/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_into = mult_tree.select("#fft-node-num1");
	var ci1 = elem_to_draw_into.select(".fft-coef-" + i).classed("fft-coefs-highlight", true);
	var ci2 = elem_to_draw_into.select(".fft-coef-" + (nearest2Pow - i)).classed("fft-coefs-highlight-green", true);
	setTimeout(function() {
	    ci1.text("" + res[i] + ",");
	    ci1.classed("fft-coefs-highlight", false).classed("fft-coefs-highlight-green", true);
	    ci2.text("" + res[nearest2Pow - i] + (i !== 0 ? "," : ""));
	    ci2.classed("fft-coefs-highlight-green", false).classed("fft-coefs-highlight", true);
	    setTimeout(function() {
		ci1.classed("fft-coefs-highlight-green", false);
		ci2.classed("fft-coefs-highlight", false);
	    }, animation_duration);
	}, animation_duration);
	return 2*animation_duration;
    };
    fft_calls[25] = function(res, i, nearest2Pow) {
	var animation_duration = (1/5) * this.AlgorithmContext.getBaselineAnimationSpeed();
	var idx = (i === 0) ? 0 : (i < nearest2Pow / 2) ? nearest2Pow - i : i;
	var mult_tree = d3.select("#multiply-poly-tree");
	var elem_to_draw_into = mult_tree.select("#fft-node-num1");
	var ci1 = elem_to_draw_into.select(".fft-coef-" + idx)
	    .text("" + Math.round10(res[i].real, -2) + (i !== nearest2Pow-1 ? "," : "")).classed("fft-coefs-highlight", true);
	setTimeout(function() {
	    ci1.classed("fft-coefs-highlight", false);
	}, animation_duration);
	return animation_duration;
    };
    fft_calls[27] = { "pre": function(res) {
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
	};
	var sharedCalc = function(idx, N, Complex) {
	    return calc.run(idx, N, Complex);
	};
	Complex.calc_unity = sharedCalc;
	var result = fft.runCodeAndPopulateAnimationQueue(poly_p.slice(), poly_q.slice(), sharedEv, Complex);
	//var result = ev.runCodeAndPopulateAnimationQueue(poly_ev, poly_ev.length, 0, [], Complex);
	console.log("After fft multiply", "" + result);
	executionFunction();
    }
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
;ALGORITHM_MODULE.hld_module = (function chart(ALGORITHM_MODULE, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }
    var algorithmTabId = "hld-tab";
    var algorithmName = "Heavy-Light Decomposition";
    var TREE_SIZE = 15;
    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded hld");
    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName,  {priority:"a-hld"}, [5, 7]);
    layout.introduction.setIntroTlDr("<p>Balanced trees are great, right? But what if you end up with an unbalanced tree? We probably don't want to restructure our tree to balance it, if the parent child relationships are important. This is where heavy light decomposition steps in. This algorithm is all about getting <var>O(log n)</var> out of unbalanced trees.</p>");
    layout.introduction.setIntroReadMore("<p>The idea is to build preferred paths by always picking the child node with the largest subtree size. We can then use these paths to quickly jump over a bunch of nodes without having to visit them. If we can make it so that from any leaf node we only have to traverse <var>log N</var> chains to get to the root then the tree is basically balanced.</p>");
    /*********************/
    /*** HLD functions ***/
    /*********************/
    function computeSubtreeSize(tree, current_node) {
	tree[current_node].subTreeSize = 1;
	var children = tree[current_node].children;
	for (var idx = 0; idx < children.length; idx++) {
	    var sub_result = computeSubtreeSize(tree, children[idx]);
	    tree[current_node].subTreeSize += sub_result;
	}
	return tree[current_node].subTreeSize;
    }
    function heavyLightDecomposition(tree, current_node, current_chain, chains) {
	if (chains.chainHeads[current_chain] === undefined) {
	    chains.chainHeads[current_chain] = current_node;
	}
	chains.chainIdx[current_node] = current_chain;
	chains.chainPos[current_node] = chains.chainLengths[current_chain];
	chains.chainLengths[current_chain]++;
	if (tree.isLeafNode(current_node)) {
	    return;
	}
	var maxSubTreeSize = -1;
	var specialChild = -1;
	var children = tree[current_node].children;
	var idx = 0;
	for (idx = 0; idx < children.length; idx++) {
	    if (tree[children[idx]].subTreeSize > maxSubTreeSize) {
		maxSubTreeSize = tree[children[idx]].subTreeSize;
		specialChild = children[idx];
	    }
	}
	heavyLightDecomposition(tree, specialChild, current_chain, chains);
	for (idx = 0; idx < children.length; idx++) {
	    if (children[idx] != specialChild) {
		var new_chain_num = ++chains.numChains;
		heavyLightDecomposition(tree, children[idx], new_chain_num, chains);
	    }
	}
    }
    /**********************/
    /** Visualizations  ***/
    /**********************/
    var hld_callbacks = [];
    var ss_callbacks = [];
    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  "900px")
	.attr("height", "636px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function createNodes(tree) {
	var nodes = [];
	for (var i = 0; i <= tree.size; i++) {
	    nodes.push(tree[i]);
	}
	return nodes;
    }
    function createLinks(tree) {
	var links = [];
	for (var i = 0; i < tree.size; i++) {
	    var ch = tree[i].children;
	    for (var j = 0; j < ch.length; j++) {
		links.push({source: tree[i], 
			    target: tree[ch[j]]});
	    }
	}
	return links;
    }
    var radius = 32;
    function initialize(tree) {
	var tree_group = svg.append("g").attr("id", "hld-tree-group");
	var nodes = createNodes(tree);
	var links = createLinks(tree);
	var force = d3.layout.force()
	    .size([800, 700])
	    .nodes(nodes)
	    .links(links)
	    .charge(-600)
	    .linkDistance(100)
	    .gravity(0.05)
	    .start();

	var diag = d3.svg.diagonal();
	var flinks = tree_group.selectAll("hld-link")
	    .data(links)
	    .enter()
	   .append("line")
	    .attr("class", "hld-link")
	    .attr("id", function(d) { return "hld-link-from-" + d.source.idx + "-to-" + d.target.idx; });

	var fnodes = tree_group.selectAll("hld-circle")
	    .data(nodes)
	    .enter()
	   .append("g")
	    .attr("id", function(d) { return "hld-node-" + d.idx; })
	    .call(force.drag());
	fnodes.append("circle")
	     .attr("class", "hld-circle")
	     .attr("r", radius);

	tree_group.select("#hld-node-" + 0).append("text").attr("class", "hld-root-id")
	    .attr("text-anchor", "middle").text("Root");

	// this function is called on tick events inside the force graph and it's how we simulate node movement
	force.on("tick", function() {
	    fnodes
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";});
	    flinks
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
	});
    }
    // compute subtree size callbacks -> show small number of subtree size and colorful edges that are done
    ss_callbacks[2] = function(tree, current_node) {
	svg.select("#hld-node-" + current_node).append("text").attr("class", "hld-size-label")
	    .attr("dx", -radius).attr("dy", -radius).attr("text-anchor", "middle").text(tree[current_node].subTreeSize);
    };
    ss_callbacks[5] = function(tree, current_node, idx, sub_result) {
	var id = tree[current_node].children[idx];
	svg.select("#hld-link-from-" + current_node + "-to-" + id).classed("hld-link-highlighted", true);
	svg.select("#hld-node-" + current_node + " .hld-size-label").text(tree[current_node].subTreeSize + " + " + sub_result);
	return this.AlgorithmContext.getBaselineAnimationSpeed();
    };
    ss_callbacks[6] = function(tree, current_node, idx) {
	svg.select("#hld-node-" + current_node + " .hld-size-label").text(tree[current_node].subTreeSize);	
    };

    // hld callbacks colors for chains and special child animation 
    var chain_colors = d3.scale.category10();
    hld_callbacks[5] = function(tree, current_chain, current_node, chains) {
	svg.selectAll(".hld-special-child-lbl").remove();
	svg.selectAll(".hld-special-child-rect").remove();
	svg.selectAll(".hld-new-chain-lbl").remove();
	var parent = tree[current_node].parent_idx;
	svg.select("#hld-node-" + current_node + " circle")
	    .style({"stroke": chain_colors(current_chain),
		   "stroke-width": "5"});
	if (parent !== undefined) {
	    svg.select("#hld-link-from-" + parent + "-to-" + current_node).classed("hld-link-highlighted", false)
		.style({"stroke": chain_colors(current_chain),
		       "stroke-width": "3px"});
	}
    };
    hld_callbacks[17] = function(tree, current_chain, specialChild) {
	svg.selectAll(".hld-special-child-rect").remove();
	svg.selectAll(".hld-special-child-lbl").remove();
	var node = svg.select("#hld-node-" + specialChild);
	node.append("rect")
	    .attr("class", "hld-special-child-rect")
	    .attr("width", 3*radius)
	    .attr("height", 3*radius)
	    .attr("x", -1.5*radius)
	    .attr("y", -1.5*radius);
	node.append("text")
	    .attr("class", "hld-special-child-lbl")
	    .attr("dy", -1.6*radius)
	    .text("Special child candidate");

    };
    hld_callbacks[20] = {"pre" : function() {
	svg.select(".hld-special-child-lbl").text("Special child winner!");
    }};
    hld_callbacks[23] = function(new_chain_num, children, idx) {
	var animation_duration = 1.5 * this.AlgorithmContext.getBaselineAnimationSpeed();
	var new_chain_lbl = svg.select("#hld-node-" + children[idx]).append("text")
	    .attr("class", "hld-new-chain-lbl")
	    .attr("dy", -1.6*radius)
	    .text("Starting new chain!");
	return animation_duration;
    };

    /******************/
    /** Wiring code ***/
    /******************/
    var remover = function() {
	_my.AlgorithmUtils.resetControls(algorithmTabId);
    };
    var context = _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj);
    var hld_algo = new _my.Algorithm(heavyLightDecomposition, hld_callbacks, "hld-code", context, remover);
    var ss_algo = new _my.Algorithm(computeSubtreeSize, ss_callbacks, "ss-code", context, remover);

    _my.AlgorithmUtils.appendCode(algorithmTabId, "ss-code", ss_algo);
    _my.vislib.addRaptorHead(algorithmTabId, "ss-code", 1, "To be able to decompose our unbalanced tree we first need to compute the subtree sizes using this depth first search");
    _my.AlgorithmUtils.appendCode(algorithmTabId, "hld-code", hld_algo);
    _my.vislib.addRaptorHead(algorithmTabId, "hld-code", 15, "To build a chain decomposition which guarantees <var>O(log N)</var> we always pick the largest subtree as the next node in the chain.");
    _my.vislib.addRaptorHead(algorithmTabId, "hld-code", 24, "Since we picked the largest subtree for the main chain, the other subtrees now have a size of at most half the size of the current subtree. This means that everytime we start a new chain the subtree sizes halves! That's where the <var>log N</var> comes from.");
    // the randomness here isn't good i think .. certain shapes are very improbable whereas
    // all shapes should have the same probablitity (maybe it's okay .. the prob of a every labelled shape is 
    // the same isn't it? at every stage the prob of picking the number we picked is the same 
    function createRandomTree(N) {
	var nodes = {};
	for (var i = 0; i < N; i++) {
	    nodes[i] = {idx: i, children: [], parent_idx: undefined};
	    if (i > 0) {
		nodes[i].parent_idx = Math.floor(Math.random() * (i - 1));
		nodes[nodes[i].parent_idx].children.push(i);
	    }
	}
	nodes.size = N - 1;
	nodes.isLeafNode = function(val) { return this[val].children.length === 0; };
	return nodes;
    }
    var tree = createRandomTree(TREE_SIZE);
    initialize(tree);
    layout.customControlsHeader.style("display", "inline-block");
    layout.customControlsLayout.append("button")
	.attr("class", "btn btn-info btn-sm hld-shuffle-btn")
	.attr("title", "Permute the tree input data. (You want to do this .. Trust me!")
        .on("click", function() {
	    d3.select("#hld-tree-group").remove();
	    tree = createRandomTree(TREE_SIZE);
	    initialize(tree);
	})
	.text("Shuffle Data");

    function cleanup() {
	console.log("running cleanup");
	var links = d3.selectAll(".hld-link");
	links.classed("hld-link-highlighted", false);
	links.attr("style", null);
	d3.selectAll(".hld-size-label").remove();
	d3.selectAll(".hld-circle").attr("style", null);
    }

    _my.AlgorithmUtils.attachAlgoToControls(ss_algo, algorithmTabId, function(play_callback){
	cleanup();
	ss_algo.run(tree, 0);
	chains = {chainLengths: undefined, 
		  chainHeads: undefined, 
		  chainPos:undefined, 
		  chainIdx:undefined, 
		  numChains:undefined};
	chains.numChains = 0;
	chains.chainLengths = new Array(tree.size);
	chains.chainLengths.fill(0);
	chains.chainHeads = new Array(tree.size);
	chains.chainHeads.fill(undefined);
	chains.chainPos = new Array(tree.size);
	chains.chainIdx = new Array(tree.size);
	chains.chainIdx.fill(undefined);
	hld_algo.runWithSharedAnimationQueue(ss_algo, tree, 0, 0, chains);
	console.log(tree, chains);
	play_callback();
    });

    //return {"hld": heavyLightDecomposition, "hld-algo": hld_algo};

}(ALGORITHM_MODULE, d3, bootbox));
;ALGORITHM_MODULE.quicksort_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
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
;// this is jquery syntax for adding this as a callback to run on a document ready event
$(function (ALGORITHM_MODULE) {


    // alias our algorithm module -- since we are running this as callback on doc ready it should already be defined
    var _my = ALGORITHM_MODULE;
    if (_my === undefined) {
	throw "Algorithm module is not defined!";
    }

    $.ajaxSetup({
	cache: false
    });

    // close popovers when we click elsewhere
    $('body').on('click', function (e) {
	$('[data-toggle="popover"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
		$(this).popover('hide');
            }
	});
    });
    // if we don't initially collapse it causes odd flickers in the ui
    var navMain = $(".navbar-collapse");
    navMain.collapse('hide');
    
    // using ready for now because load doesn't get triggered 
    // when our internet drops and the twitter/git imgs don't get loaded
    var prettification_complete = false;
    $(function() {
	console.debug("loaded");
	prettyPrint();
	postPrettificationTagging();
	prettification_complete = true;
	var current_tab = window.location.hash;
	if (current_tab !== undefined && current_tab !== null && current_tab !== "") {
	    raptoringItUp(current_tab);
	}
    });
    
    $('a[data-toggle="tab"]').off('shown.bs.tab');
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
	resizingSvg(e);
	raptorFromEvent(e);
    });
    $('a', "#algoTabs").off("click");
    $('a', "#algoTabs").on('click', function(e) {
    	// modify the history and the url
    	// although the firefox back button does look quite strange after this
    	//history.pushState(null, null, this.href);
    	// alternative solution
    	window.location.href = $(this).attr("href"); 
    	window.scrollBy(0, -window.pageYOffset);
	// close collapsed menu when clicking on items in a collapsed menu
       navMain.collapse('hide');

    });

    $('#my-logo').on("click", function() {
        $("#algoTabs a:first").tab("show");
    });
    /**
     * jQuery Plugin: Sticky Tabs
     * License: Public Domain
     * https://github.com/timabell/jquery.stickytabs/
     */
    (function ( $ ) {
	$.fn.stickyTabs = function() {
	    var context = this;
	    // Show the tab corresponding with the hash in the URL, or the first tab.
	    var showTabFromHash = function() {
		var hash = window.location.hash;
		var selector = hash ? 'a[href="' + hash + '"]' : 'li.active > a';
		$(selector, context).tab('show');
	    };
	    // Set the correct tab when the page loads
	    showTabFromHash(context);
	    // Set the correct tab when a user uses their back/forward button
	    window.addEventListener('hashchange', showTabFromHash, false);
	    // Change the URL when tabs are clicked
	    return this;
	};
    }( jQuery ));
    $("#algoTabs").stickyTabs(); // activating sticky tabs
    

    function raptorFromEvent(e) {
	var tabz =  $(e.target).attr("data-tab-id");
	raptoringItUp(tabz);
    }

    function raptoringItUp(tab_id) {
	if (!prettification_complete) {
	    return;
	}
	var tab = $(tab_id);
	if (tab.attr("data-raptored") == "true") {
	    return;
	}
	var callbacks = _my.AlgorithmUtils.getPrettyPrintCallbacks(tab_id);
	if (callbacks !== undefined) {
	    for (var i = 0; i < callbacks.length; i++) {
		callbacks[i]();
	    }
	}
	$('[data-toggle="popover"]').popover();
	$(tab).attr("data-raptored", true);
    }
    function resizingSvg(e) {
	var tabz =  $(e.target).attr("data-tab-id");
	$(tabz + " svg").each(function() {
	    if ($(this).attr("data-adjusted") == "true") {
		return;
	    }
	    if ($(this).attr("class") == "gauge") {
		return;
	    }
	    var viewBox = _my.AlgorithmUtils.calcViewBox(tabz + " .graphics", $(this).width(), $(this).height());
	    d3.select(this).attr("width", viewBox.width)
		.attr("height", viewBox.height)
		.attr("viewBox", viewBox.string)
		.attr("data-adjusted", "true");
	});
    }

    function postPrettificationTagging() {
	console.log("calling this thing");
	$("span.pun:contains(()").prev().addClass("function");
    }
}(ALGORITHM_MODULE));
