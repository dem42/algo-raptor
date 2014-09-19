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
		$.getScript("visualizations/" + data[i], function( data, textStatus, jqxhr ) {
		    console.debug( "Download of algo:", textStatus ); // Success
		});
	    }
        }
	$(document).ajaxComplete(function() { 
	    if (needPrettyPrint) {
		prettyPrint.call({});
	    }
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
});
