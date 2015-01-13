// this is jquery syntax for adding this as a callback to run on a document ready event
$(function (ALGORITHM_MODULE) {


    // alias our algorithm module -- since we are running this as callback on doc ready it should already be defined
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    $.ajaxSetup({
	cache: false
    });

    if (_my.RUNNING_IN_STATIC_MODE === true) {
	prettyPrint.call({});
	$('a[data-toggle="tab"]').off('shown.bs.tab');
	$('a[data-toggle="tab"]').on('shown.bs.tab', resizingSvg);
    }


    /**
     * jQuery Plugin: Sticky Tabs
     * License: Public Domain
     * https://github.com/timabell/jquery.stickytabs/
     */
    (function ( $ ) {
	$.fn.stickyTabs = function() {
	    var context = this;
	    console.log(context);
	    // Show the tab corresponding with the hash in the URL, or the first tab.
	    var showTabFromHash = function() {
		var hash = window.location.hash;
		var selector = hash ? 'a[href="' + hash + '"]' : 'li.active > a';
		$(selector, context).tab('show');
	    }
	    // Set the correct tab when the page loads
	    showTabFromHash(context)
	    // Set the correct tab when a user uses their back/forward button
	    window.addEventListener('hashchange', showTabFromHash, false);
	    return this;
	};
    }( jQuery ));

    var loadedVisualizations = {};
    var newAlgoAdded = false;
    // this callback fires whenever an ajax event completes
    $(document).ajaxComplete(function() { 
	if (newAlgoAdded) {
	    prettyPrint.call({});

	    console.log("registering callback", newAlgoAdded);
	    //first deregister old event listeners so that we don't have the same fnc attached many times
	    $('a[data-toggle="tab"]').off('shown.bs.tab');
	    // attach a callback on shown tab to adjust svg sizes dynamically
	    // this is needed to make sure our visualizations fit onto smaller screens
	    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		resizingSvg(e);
		window.location.hash = $(this).attr("href");
	    });
	}
    });
    $("#algoTabs").stickyTabs(); // activating sticky tabs

    function updateVisualizations(data) {
        var N = data.length;
	newAlgoAdded = false;
        for (var i = 0; i < N; ++i) {
	    if (!loadedVisualizations.hasOwnProperty(data[i])) {
		loadedVisualizations[data[i]] = data[i];
		newAlgoAdded = true;
		console.log("new", data[i]);
		// these get script functions will be processed one at a time by the browser because they will be tasks
		// on a work queue and will be processed when the browser is ready
		// that means we don't have to worry about race conditions between multiple visualizations scripts 
		$('head').append('<link rel="stylesheet" href="visualizations/' + data[i] + '.css" type="text/css" />');

		(function(algo_name) { 
		    var url = "visualizations/" + algo_name + ".js";
		    $.getScript(url)
			.done(function( data, textStatus, jqxhr ) {
			    console.debug( "Download of algo :" + algo_name, textStatus ); // Success
			})
			.fail(function(jqxhr, settings, exception) {
			    bootbox.alert("Problem loading algorithm: \"" + algo_name + "\".<br \><br \>" + exception);
			});
		}(data[i]));
	    }
        }
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
}(ALGORITHM_MODULE));
