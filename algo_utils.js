/////////////////////////////////////////////////////////////////
// Algorithm utilities class ///
/////////////////////////////////////////////////////////////////
/**
 * This class is a collection of static method that help 
 * can be used when creating new algorithm visualizations
 */
function AlgorithmUtils() {
}

//////////////////////////////
// statics
//////////////////////////////
// create a deep clone of obj
AlgorithmUtils.clone = function clone(obj) {
    
    if (obj == null || typeof obj != "object") {
	// these are immutable and can be returned
	return obj;
    }

    var cpy = obj.constructor();

    for (prop in obj) {
	if (obj.hasOwnProperty(prop)) {
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
	var button = div.append("a").attr("href", "#").attr("class", "a-btn").attr("id", classname + "-of-" + algorithmId);
	button.append("span").attr("class", "a-btn-icon").append("span").attr("class", classname);
    }

    controlsDiv.append("div").attr("class", "controls-header").text("General Controls:");
    var defaultControls = controlsDiv.append("div").attr("class", "default-controls");
    var exRadioDiv = defaultControls.append("div").attr("class", "execution-type-radios");
    exRadioDiv.append("p").attr("class", "controls-info-text").text("Choose how to execute the algorithm:");
    appendButton(exRadioDiv, "play-btn", algorithmId);
    appendButton(exRadioDiv, "next-btn", algorithmId);
}

// connect the algorithm to default control callbacks
AlgorithmUtils.attachAlgoToControls = function(algorithm, algorithmId) {
    if (!Algorithm.prototype.isPrototypeOf(algorithm)) {
	console.error("First argument to attachAlgoToControls must have a prototype of Algorithm");
	return;
    }

    d3.select("#" + "play-btn-of-" + algorithmId).on("click", function() {
     	algorithm.runStack();
    });
    d3.select("#" + "next-btn-of-" + algorithmId).on("click", function() {
     	algorithm.executeNextRow();
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
	.text(headerText);
}

// for adding a new frame for a recursive algorithm
AlgorithmUtils.visualizeNewStackFrame = function(algorithm) {
    if (!Algorithm.prototype.isPrototypeOf(algorithm)) {
	console.error("First argument to visualizeNewStackFrame must have a prototype of Algorithm");
	return;
    }
    var duration = 1000;
    var delay = 500;
    var selector = "." + algorithm.codeContainerId + " div:last-of-type";
    var height = $(selector).height();
    var frow_height = $(selector + " li:nth-child(1)").height();
    var clone = $(selector).clone();
    var ds = d3.select(selector);
    ds.style({"overflow": "hidden", "margin-bottom": "5px"}).attr("data-oldheight", height + "px");
    ds.transition().duration(duration).style("height", frow_height + "px");
    setTimeout(function() {
	clone.insertAfter(selector);
	d3.select(selector).selectAll("span.com").remove();
	//$("#" + algorithmTabId + " .code").append(clone);
    }, duration + delay);

    return duration + delay;
}

//remove an old stack frame and expand the previous one
AlgorithmUtils.popStackFrame = function(algorithm) {
    if (!Algorithm.prototype.isPrototypeOf(algorithm)) {
	console.error("First argument to popStackFrame must have a prototype of Algorithm");
	return;
    }
    var duration = 1000;
    var delay = 500;
    var selector = "." + algorithm.codeContainerId + " div:last-of-type";
    d3.select(selector).remove();
    var ds = d3.select(selector);
    var oldh = ds.attr("data-oldheight");
    ds.transition().delay(delay).duration(duration).style("height", oldh);

    return duration + delay;
}
