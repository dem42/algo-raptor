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

AlgorithmUtils.insertCustomControls = function(controlsDiv, algorithmName) {
    controlsDiv.append("div").attr("class", "custom-controls-header").text(algorithmName + " Controls:");
}

// create and populate a section for standard algorithm controls
AlgorithmUtils.insertDefaultControls = function(controlsDiv) {
    controlsDiv.append("div").attr("class", "controls-header").text("General Controls:");
    var defaultControls = controlsDiv.append("div").attr("class", "default-controls");
    var exRadioDiv = defaultControls.append("div").attr("class", "execution-type-radios");
    exRadioDiv.append("p").attr("class", "controls-info-text").text("Choose how to execute the algorithm:");
    var form = exRadioDiv.append("form");
    form.append("input").attr("type", "radio").attr("value", "continuous");
    form.append("span").attr("class", "controls-info-text").text("Immediate Execution");
    form.append("input").attr("type", "radio").attr("value", "step-by-step");
    form.append("span").attr("class", "controls-info-text").text("Step by Step Exectuion");    
    defaultControls.append("button").attr("id", "default-controls-next-btn").text("Next step");
}

// connect the algorithm to default control callbacks
AlgorithmUtils.attachAlgoToControls = function(algorithm) {
    if (!Algorithm.prototype.isPrototypeOf(algorithm)) {
	console.error("First argument to attachAlgoToControls must have a prototype of Algorithm");
	return;
    }

    d3.select("#default-controls-next-btn").on("click", function() {
	algorithm.executeNextAnimationQueueItem();
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
