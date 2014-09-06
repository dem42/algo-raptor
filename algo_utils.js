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
	console.log(tabId, "is last", otherAlgos);
	listItem = d3.select("#algoTabs").append("li");	
    }
    else {
	console.log(tabId, "goes before", otherAlgos[indexInAlgos + 1], otherAlgos);
	listItem = d3.select("#algoTabs").insert("li", "#" + otherAlgos[indexInAlgos + 1]);
    }

    listItem.attr("id", listItemId);
    listItem.append("a").data([listItemId]).attr("href", tabId).attr("role", "tab").attr("data-toggle", "tab")
	.text(headerText);
}
