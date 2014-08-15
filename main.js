$(function () {
    
    $.ajaxSetup({
	cache: false
    });

    var loadedVisualizations = {};
    function updateVisualizations(data) {
	console.log("in update visualizations", data);
        var N = data.length;
        for (var i = 0; i < N; ++i) {
	    if (!loadedVisualizations.hasOwnProperty(data[i])) {
		loadedVisualizations[data[i]] = data[i];
		$.getScript("visualizations/" + data[i], function( data, textStatus, jqxhr ) {
		    console.log( textStatus ); // Success
		    console.log( "Load was performed." );
		});
		console.log("updating ", data[i]);
	    }
        }
    }

    $.ajax("visualizations").done(function(data) {
	updateVisualizations(data);
        $("#algoTabs a:first").tab("show");
        console.log(data);
	updater();
    });
    
    function updater() {
        setTimeout(function() {
            $.ajax("visualizations").done(function(data) {
		updateVisualizations(data);
            });
	    $(document).ajaxComplete(function() { prettyPrint(); });
	    updater();
        }, 5000);
    }
});
