/////////////////////////////////////////////////////////////////
// Algorithm utilities class ///
/////////////////////////////////////////////////////////////////
/**
 * This class is a collection of static method that help 
 * can be used when creating new algorithm visualizations
 */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, $, d3, Math) {

    // alias our algorithm module
    var _my = ALGORITHM_MODULE;

    console.debug("execution definitions of algo_utils.js");

    var AlgorithmUtils = {};

    // create a deep clone of obj
    AlgorithmUtils.clone = function clone(obj) {
	
	if (obj == null || typeof obj != "object") {
	    // these are immutable and can be returned
	    return obj;
	}

	var cpy = new obj.constructor();
	for (prop in obj) {
	    if (obj.hasOwnProperty(prop)) {
		//console.log(obj.constructor, cpy, obj);
		cpy[prop] = clone(obj[prop]);
	    }
	}
	return cpy;
    }

    AlgorithmUtils.insertCustomControls = function(controlsDiv, algorithmId, algorithmName) {
	controlsDiv.append("div").attr("class", "custom-controls-header").text(algorithmName + " Controls:");
    }

    // create and populate a section for standard algorithm controls
    AlgorithmUtils.insertDefaultControls = function(controlsDiv, algorithmId) {

	function appendButton(div, classname, algorithmName) {
	    var button = div.append("a").attr("href", "#").classed("a-btn enabled-btn", true).attr("id", classname + "-of-" + algorithmId);
	    button.append("span").attr("class", "a-btn-icon").append("span").attr("class", classname);
	}

	controlsDiv.append("div").attr("class", "controls-header").text("General Controls:");
	var defaultControls = controlsDiv.append("div").attr("class", "default-controls");
	var exRadioDiv = defaultControls.append("div").attr("class", "execution-type-radios");
	exRadioDiv.append("p").attr("class", "controls-info-text").text("Choose how to execute the algorithm:");
	appendButton(exRadioDiv, "play-btn", algorithmId);
	appendButton(exRadioDiv, "next-btn", algorithmId);
    }

    AlgorithmUtils.resetControls = function(algorithmId) {
	d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "play-btn");
	d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", false);
	d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", true);
    }

    // connect the algorithm to default control callbacks
    // this is necessary if you want the default controls to kick the algorithm off
    // if you have some dialog that needs to query for input before the algorithm is started pass it as kickoffCallback
    // the argument passed as kickoffCallback must be either undefined or a function that accepts another function as
    // an argument. The function passed to kickoffCallback should be executed in kickoffCallback as the last step
    AlgorithmUtils.attachAlgoToControls = function(algorithm, algorithmId, kickoffCallback) {
	var play_function = function() {
	    if (!algorithm.runningInContMode) {
		d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "pause-btn");
		d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", true);
		d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", false);
     		algorithm.runStack();
	    }
	    else {
		algorithm.runningInContMode = false; //stopping
		AlgorithmUtils.resetControls(algorithmId);
	    }
	};
	var next_function = function() {
	    if (!algorithm.runningInContMode) {
     		algorithm.executeNextRowInStepMode();
	    }
	};

	d3.select("#" + "play-btn-of-" + algorithmId).on("click", function() {
	    if (!algorithm.isRunning() && kickoffCallback != undefined) {
		kickoffCallback(play_function);
	    }
	    else {
		play_function();
	    }
	});
	d3.select("#" + "next-btn-of-" + algorithmId).on("click", function() {
	    if (!algorithm.isRunning() && kickoffCallback != undefined) {
		kickoffCallback(next_function);
	    }
	    else {
		next_function();
	    }
	});
    }

    // create an item for the algorithm in the list of all available algorithms 
    AlgorithmUtils.insertIntoHeaderList = function(tabId, headerText, listItemId) {

	var otherAlgos = [listItemId];
	d3.selectAll("#algoTabs li a").each(function(d) { 
	    if (d != undefined) {
		otherAlgos.push(d);
	    }
	});
	otherAlgos.sort();
	var indexInAlgos = otherAlgos.indexOf(listItemId);
	var listItem = null;
	if (indexInAlgos == otherAlgos.length - 1) {
	    listItem = d3.select("#algoTabs").append("li");	
	}
	else {
	    listItem = d3.select("#algoTabs").insert("li", "#" + otherAlgos[indexInAlgos + 1]);
	}

	listItem.attr("id", listItemId);
	listItem.append("a").data([listItemId]).attr("href", tabId).attr("role", "tab").attr("data-toggle", "tab")
	    .attr("data-tab-id", tabId)
	    .text(headerText);
    }

    // for adding a new frame for a recursive algorithm
    AlgorithmUtils.visualizeNewStackFrame = function(codeContainerId) {
	var duration = 1000;
	var delay = 500;
	var selector = "." + codeContainerId + " div:last-of-type";
	var height = $(selector).height();
	var frow_height = $(selector + " li:nth-child(1)").height();
	var clone = $(selector).clone();
	var ds = d3.select(selector);
	ds.style({"overflow": "hidden", "margin-bottom": "5px"}).attr("data-oldheight", height + "px");
	ds.transition().duration(duration).style("height", frow_height + "px");
	setTimeout(function() {
	    clone.insertAfter(selector);
	    AlgorithmUtils.clearComments(codeContainerId);
	}, duration + delay);

	return duration + delay;
    }

    //remove dynamic comments (values of variables appended with // during execution of the algorithm)
    AlgorithmUtils.clearComments = function(codeContainerId) {
	var selector = "." + codeContainerId + " div:last-of-type";
	d3.select(selector).selectAll("span.com.dynamic").remove();
    }

    //remove an old stack frame and expand the previous one
    AlgorithmUtils.popStackFrame = function(codeContainerId) {
	var duration = 1000;
	var delay = 500;
	var selector = "." + codeContainerId + " div:last-of-type";
	d3.select(selector).remove();
	var ds = d3.select(selector);
	var oldh = ds.attr("data-oldheight");
	ds.transition().delay(delay).duration(duration).style("height", oldh);

	return duration + delay;
    }

    //comupte a viewBox to scale svg contents properly on smaller screen sizes
    AlgorithmUtils.calcViewBox = function(parentId, width, height) {
	var parentWidth = $(parentId).width() * 1.0;
	//ratio computed from parent width and made 10% smaller (smaller pixels than original) to fit inside the parent
	var vbx_ratio = (width / parentWidth); 
	return {"string" : "0 0 " + width + " " + (vbx_ratio * height), "width" : (parentWidth), "height" : height };
    }


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

    //return the augmented module
    _my.AlgorithmUtils = AlgorithmUtils;
    return _my;
})(ALGORITHM_MODULE || {}, $, d3, Math);
