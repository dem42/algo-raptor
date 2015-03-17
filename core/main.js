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

    // close popovers when we click elsewhere
    $('body').on('click', function (e) {
	$('[data-toggle="popover"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
		$(this).popover('hide');
            }
	});
    });
    // if we don't initially collapse it causes odd flickers in the ui
    var navMain = $(".navbar-collapse");
    navMain.collapse('hide');
    
    // using ready for now because load doesn't get triggered 
    // when our internet drops and the twitter/git imgs don't get loaded
    var prettification_complete = false;
    $(function() {
	console.debug("loaded");
	prettyPrint();
	postPrettificationTagging();
	prettification_complete = true;
	var current_tab = window.location.hash;
	if (current_tab !== undefined && current_tab !== null && current_tab !== "") {
	    raptoringItUp(current_tab);
	}
    });
    
    $('a[data-toggle="tab"]').off('shown.bs.tab');
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
	resizingSvg(e)
	raptorFromEvent(e);
    });
    $('a', "#algoTabs").off("click");
    $('a', "#algoTabs").on('click', function(e) {
    	// modify the history and the url
    	// although the firefox back button does look quite strange after this
    	//history.pushState(null, null, this.href);
    	// alternative solution
    	window.location.href = $(this).attr("href"); 
    	window.scrollBy(0, -window.pageYOffset);
	// close collapsed menu when clicking on items in a collapsed menu
       navMain.collapse('hide');

    });

    $('#my-logo').on("click", function() {
        $("#algoTabs a:first").tab("show");
    });
    /**
     * jQuery Plugin: Sticky Tabs
     * License: Public Domain
     * https://github.com/timabell/jquery.stickytabs/
     */
    (function ( $ ) {
	$.fn.stickyTabs = function() {
	    var context = this;
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
	    // Change the URL when tabs are clicked
	    return this;
	};
    }( jQuery ));
    $("#algoTabs").stickyTabs(); // activating sticky tabs
    

    function raptorFromEvent(e) {
	var tabz =  $(e.target).attr("data-tab-id");
	raptoringItUp(tabz);
    }

    function raptoringItUp(tab_id) {
	if (!prettification_complete) {
	    return;
	}
	var tab = $(tab_id);
	if (tab.attr("data-raptored") == "true") {
	    return;
	}
	var callbacks = _my.AlgorithmUtils.getPrettyPrintCallbacks(tab_id);
	if (callbacks !== undefined) {
	    for (var i = 0; i < callbacks.length; i++) {
		callbacks[i]();
	    }
	}
	$('[data-toggle="popover"]').popover()
	$(tab).attr("data-raptored", true);
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

    function postPrettificationTagging() {
	console.log("calling this thing");
	$("span.pun:contains(()").prev().addClass("function");
    }
}(ALGORITHM_MODULE));
