$(function () {
    
    $.ajaxSetup({
	cache: false
    });

    var loadedVisualizations = {};
    function updateVisualizations(data) {
        var N = data.length;
	var needPrettyPrint = false;
        for (var i = 0; i < N; ++i) {
	    if (!loadedVisualizations.hasOwnProperty(data[i])) {
		loadedVisualizations[data[i]] = data[i];
		needPrettyPrint = true;
		// these get script functions will be processed one at a time by the browser because they will be tasks
		// on a work queue and will be processed when the browser is ready
		// that means we don't have to worry about race conditions between multiple visualizations scripts 
		$('head').append('<link rel="stylesheet" href="visualizations/' + data[i] + '.css" type="text/css" />');
		$.getScript("visualizations/" + data[i] + ".js", function( data, textStatus, jqxhr ) {
		    console.debug( "Download of algo:", textStatus ); // Success
		});
	    }
        }
	$(document).ajaxComplete(function() { 
	    if (needPrettyPrint) {
		prettyPrint.call({});
	    }
	    // attach a callback on shown tab to adjust svg sizes dynamically
	    // this is needed to make sure our visualizations fit onto smaller screens
	    $('a[data-toggle="tab"]').on('shown.bs.tab', resizingSvg);
	});
    }

    $.ajax("visualizations").done(function(data) {
	updateVisualizations(data);
        $("#algoTabs a:first").tab("show");
        console.debug(data);
	updater();
    });
    
    function updater() {
        setTimeout(function() {
            $.ajax("visualizations").done(function(data) {
		updateVisualizations(data);
            });
	    updater();
        }, 5000);
    }

    function resizingSvg(e) {
	var tabz =  $(e.target).attr("data-tab-id");

	$(tabz + " svg").each(function() {
	    if ($(this).attr("data-adjusted") == "true") {
		return;
	    }
	    var viewBox = AlgorithmUtils.calcViewBox(tabz + " .graphics", $(this).width(), $(this).height());
	    d3.select(this).attr("width", viewBox.width)
		.attr("height", viewBox.height)
		.attr("viewBox", viewBox.string)
		.attr("data-adjusted", "true");
	});
    }
});
