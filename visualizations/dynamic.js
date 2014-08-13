(function() {

    d3.select("#algoTabs").append("li").append("a").attr("href", "#dynamic-tab").attr("role", "tab").attr("data-toggle", "tab")
	.text("Dynamic or not?");
 
    var row0 = d3.select("#algoContainer")
	.append("div").attr("class", "tab-pane").attr("id", "dynamic-tab")
        .append("div").attr("class", "row")
    row0.append("div").attr("class", "col-md-12")
        .append("button").on("click", function() { window.alert("hello"); });

    console.log("downloaded here ");
}());
    
