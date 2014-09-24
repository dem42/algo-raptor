/////////////////////////////////////////////////////////////////
// Algorithm utilities class ///
/////////////////////////////////////////////////////////////////
/**
 * This class is a collection of static method that help 
 * can be used when creating new algorithm visualizations
 */
function AlgorithmUtils() {
}

// statics
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
