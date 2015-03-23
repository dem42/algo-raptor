/////////////////////////////////////////////////////////////////
// Algorithm utilities class ///
/////////////////////////////////////////////////////////////////
/**
 * This class is a collection of static method that help 
 * can be used when creating new algorithm visualizations
 */
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, $, d3) {

    // alias our algorithm module
    var _my = ALGORITHM_MODULE;

    console.debug("execution definitions of algo_utils.js");

    var AlgorithmUtils = {};

    // create a deep clone of obj
    AlgorithmUtils.clone = function clone(obj) {
	
	if (obj === null || typeof obj !== "object") {
	    // these are immutable and can be returned
	    return obj;
	}

	var cpy = new obj.constructor();
	for (var prop in obj) {
	    if (obj.hasOwnProperty(prop)) {
		//console.log(obj.constructor, cpy, obj);
		cpy[prop] = clone(obj[prop]);
	    }
	}
	return cpy;
    };

    AlgorithmUtils.insertCustomControls = function(layout, algorithmId, algorithmName, comments) {
	var customControlsHolder = layout.visPanelContents.append("div").attr("class", "custom-controls-holder");
	var customControlsHeader = customControlsHolder.append("div").attr("class", "custom-controls-header").text(algorithmName + " Controls:");

	if (comments !== undefined) {
	    customControlsHolder.append("div").attr("class", "custom-controls-comments-section")
		.append("p").attr("class", "controls-info-text").text(comments);
	}
	layout.customControlsLayout = customControlsHolder;
	layout.customControlsHeader = customControlsHeader;
    };

    // create and populate a section for standard algorithm controls
    AlgorithmUtils.insertDefaultControls = function(layout, algorithmId) {

	var controlsDiv = layout.ops;
	var controlsExp = controlsDiv.append("div").attr("class", "controls-expanded-view");
	var controlsColp = controlsDiv.append("div").attr("class", "controls-collapsed-view");
	function appendButton(div, classname, algorithmName, tooltip) {
	    var button = div.append("a").attr("href", "#").classed("a-btn enabled-btn", true).attr("id", classname + "-of-" + algorithmId);
	    button.append("span").attr("class", "a-btn-icon").attr("title", tooltip).append("span").attr("class", classname);
	}

	controlsExp.append("div").attr("class", "controls-header").text("General Controls:");
	var defaultControls = controlsExp.append("table").attr("class", "default-controls table").append("tr");
	var exRadioDiv = defaultControls.append("td")
	    .style("vertical-align", "top")
	    .append("div").attr("class", "execution-type-radios");
	exRadioDiv.append("p").attr("class", "controls-info-text").text("Choose how to execute the algorithm:");
	appendButton(exRadioDiv, "play-btn", algorithmId, "Start the algorithm in continuous mode (the algorithm will run on its own)");
	appendButton(exRadioDiv, "next-btn", algorithmId, "Take the next step in the algorithm in step-by-step mode (you have to click for the algorithm to keep going)");
	var speedDialCell = defaultControls.append("td").attr("id", algorithmId + "speed-dial-div");
	speedDialCell.append("p").attr("class", "controls-info-text").text("Adjust the speed at which to run the algorithm:");
//	speedDialCell.append("div")
	var gaugeObj = _my.vislib.addSpeedGauge("#" + algorithmId + "speed-dial-div", 0.6);
	layout.gaugeObj = gaugeObj;
	var buttonsDiv = speedDialCell.append("div").attr("class", "speed-controls-buttons-div");
	buttonsDiv.append("p").append("button").attr("class", "btn btn-info btn-sm")
	    .on("click", function() {
		var current = gaugeObj.getValue();
		gaugeObj.update(current + 1);
	    })
	    .append("span").attr("class", "glyphicon glyphicon-plus");
	buttonsDiv.append("p").append("button").attr("class", "btn btn-info btn-sm")
	    .on("click", function() {
		var current = gaugeObj.getValue();
		gaugeObj.update(current-1);
	    }).append("span").attr("class", "glyphicon glyphicon-minus");

	
	var miniBtn = controlsExp.append("button").attr("type","button").attr("class","btn btn-default btn-xs").attr("aria-label", "Toggle menu");
	miniBtn.append("span").attr("class", "glyphicon glyphicon-menu-right").attr("aria-hidden", "true");
	miniBtn.on("click", function(d) { 
	    controlsExp.style("display", "none");
	    controlsColp.style("display", "block");
	    layout.introHeader.attr("class", "col-md-11");
	    //layout.controlsPanelHolder.attr("class", "col-md-1");
	});
	controlsColp.style("display", "none");
	var maxiBtn = controlsColp.append("button").attr("type","button").attr("class","btn btn-default btn-xs maxi-btn").attr("aria-label", "Toggle menu");
	maxiBtn.append("span").attr("class", "glyphicon glyphicon-menu-left").attr("aria-hidden", "true");
	maxiBtn.on("click", function(d) { 
	    controlsExp.style("display", "block");
	    controlsColp.style("display", "none");
	    layout.introHeader.attr("class", "col-md-8");
	    //layout.controlsPanelHolder.attr("class", "col-md-4");
	});
	return {"speedGauge" : gaugeObj};
    };

    AlgorithmUtils.resetControls = function(algorithmId) {
	d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "play-btn");
	d3.select("#" + "play-btn-of-" + algorithmId + " span").attr("title", "Start the algorithm in continuous mode (the algorithm will run on its own)");
	d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", false);
	d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", true);
    };

    // connect the algorithm to default control callbacks
    // this is necessary if you want the default controls to kick the algorithm off
    // if you have some dialog that needs to query for input before the algorithm is started pass it as kickoffCallback
    // the argument passed as kickoffCallback must be either undefined or a function that accepts another function as
    // an argument. The function passed to kickoffCallback should be executed in kickoffCallback as the last step
    AlgorithmUtils.createAlgoAttacher = function() {
	var res = {};
	res.play_maker = function(algorithm, algorithmId) {
	    return function() {
		if (!algorithm.runningInContMode) {
		    d3.select("#" + "play-btn-of-" + algorithmId + " span span").attr("class", "pause-btn");
		    d3.select("#" + "play-btn-of-" + algorithmId + " span").attr("title", "Pause the algorithm");
		    d3.select("#" + "next-btn-of-" + algorithmId).classed("disabled-btn", true);
		    d3.select("#" + "next-btn-of-" + algorithmId).classed("enabled-btn", false);
     		    algorithm.executeInContinuousMode();
		}
		else {
		    algorithm.runningInContMode = false; //stopping
		    AlgorithmUtils.resetControls(algorithmId);
		}
	    };
	};

	res.next_maker = function(algorithm, algorithmId) {
	    return function() {
		if (!algorithm.runningInContMode) {
     		    algorithm.executeNextRowInStepMode();
		}
	    };
	};

	// allows us to reattach the controls as we like
	res.attach = function(algorithm, algorithmId, kickoffCallback) {
	    d3.select("#" + "play-btn-of-" + algorithmId).on("click", function() {
		if (!algorithm.isRunning() && kickoffCallback !== undefined) {
		    kickoffCallback(res.play_maker(algorithm, algorithmId));
		}
		else {
		    (res.play_maker(algorithm, algorithmId))();
		}
	    });
	    d3.select("#" + "next-btn-of-" + algorithmId).on("click", function() {
		if (!algorithm.isRunning() && kickoffCallback !== undefined) {
		    kickoffCallback(res.next_maker(algorithm, algorithmId));
		}
		else {
		    (res.next_maker(algorithm, algorithmId))();
		}
	    });
	};
	return res;
    };

    AlgorithmUtils.attachAlgoToControls = function(algorithm, algorithmId, kickoffCallback) {
	var attacher = AlgorithmUtils.createAlgoAttacher();
	attacher.attach(algorithm, algorithmId, kickoffCallback);
    };

    // create an item for the algorithm in the list of all available algorithms 
    AlgorithmUtils.insertIntoHeaderList = function(tabId, headerText, menuConfig) {

	var listItemId = menuConfig.priority;
	var listItem = d3.select("#" + listItemId);
	listItem.append("a").data([listItemId]).attr("href", tabId).attr("role", "tab").attr("data-toggle", "tab")
	    .attr("data-tab-id", tabId)
	    .text(headerText);
    };

    function addStackFramePreview(codeContainerId) {
	var selector = "." + codeContainerId + " li";
	var lineClone = $(selector).filter(":first").clone();
	$("." + codeContainerId).prepend(lineClone);
	lineClone.wrap('<div class="preview-frame"><pre class="prettyprint lang-js linenums:1 prettyprinted" style=""><ol class="linenums" style="margin-left: 15px;"></ol></pre></div>');	
    }

    // for adding a new frame for a recursive algorithm
    AlgorithmUtils.visualizeNewStackFrame = function(codeContainerId, algorithmCtx) {
	var duration = 2 * algorithmCtx.getBaselineAnimationSpeed();
	var delay = algorithmCtx.getBaselineAnimationSpeed();
	setTimeout(function() {
	    addStackFramePreview(codeContainerId);
	}, delay);

	return delay;
    };

   //remove an old stack frame and expand the previous one
    AlgorithmUtils.popStackFrame = function(codeContainerId, algorithmCtx) {
	var duration = 2 * algorithmCtx.getBaselineAnimationSpeed();
	var delay = algorithmCtx.getBaselineAnimationSpeed();
	var selector = "." + codeContainerId + " .preview-frame";
	d3.select(selector).remove();
	return delay;
    };

    //remove dynamic comments (values of variables appended with // during execution of the algorithm)
    AlgorithmUtils.clearComments = function(codeContainerId) {
	var selector = "." + codeContainerId + " div:last-of-type";
	d3.select(selector).selectAll("span.com.dynamic").remove();
    };
 
    //comupte a viewBox to scale svg contents properly on smaller screen sizes
    AlgorithmUtils.calcViewBox = function(parentId, width, height) {
	var parentWidth = $(parentId).width() * 1.0;
	//ratio computed from parent width and made 10% smaller (smaller pixels than original) to fit inside the parent
	var vbx_ratio = (width / parentWidth); 
	return {"string" : "0 0 " + width + " " + (vbx_ratio * height), "width" : (parentWidth), "height" : height };
    };


    AlgorithmUtils.createAlgorithmContext = function(controlsObj) {
	if (controlsObj === undefined) {
	    return {
		getBaselineAnimationSpeed : function() { return 0; }
	    };
	}
	return { 
	    getBaselineAnimationSpeed : function() {
		return controlsObj.speedGauge.getSpeed();
	    }
	};
    };

    /**
     * this creates the layout for the algorithm page
     */
    AlgorithmUtils.setupLayout = function(algorithmTabId, algorithmName, menuConfig, columnWidths, comments) {
	var layout = {};
	
	AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, menuConfig);
	var tab = d3.select("#algoContainer")
    	    .append("div").attr("class", "tab-pane").attr("id", algorithmTabId);
	layout.container = tab.append("div").attr("class", "container-fluid");
	layout.row0 = layout.container.append("div").attr("class", "row");
	layout.introHeader = layout.row0.append("div").attr("class", "col-md-8");
	layout.introHeader.append("div").attr("class", "page-header").append("h4").text(algorithmName);
	layout.introduction = function() {
	    var introObject = Object.create(null);
	    introObject.tldr = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
	    introObject.readMore = "";
	    function tldrFun(tldr) {
		this.tldr = tldr;
		layout.introductionParagraph.html(tldr);
	    }
	    function readMoreFun(readMore) {
		this.readMore = readMore;
	    }
	    introObject.setIntroTlDr = tldrFun;
	    introObject.setIntroReadMore = readMoreFun;

	    layout.introductionParagraph = layout.introHeader.append("p").text(introObject.tldr);
	    var readMoreTxt = "Read more...";
	    var readMoreLink = layout.introHeader.append("p").append("a").attr("class", "read-more-lnk")
		.text(readMoreTxt);
	    var clicked = false;
	    readMoreLink.on("click", function() {
		if (!clicked) {
		    layout.introductionParagraph.html(introObject.tldr + introObject.readMore);
		    readMoreLink.text("tl;dr");
		}
		else {
		    layout.introductionParagraph.html(introObject.tldr);
		    readMoreLink.text(readMoreTxt);
		}
		clicked = !clicked;
	    });
	    return introObject;
	}();

	layout.controlsPanelHolder = tab.append("div").attr("class", "controls controls-affix").attr("data-spy", "affix").style("top","0%").style("right","0%");
    	layout.controlsPanel = layout.controlsPanelHolder.append("div").attr("class", "panel panel-default");

	layout.controlsPanelBody = layout.controlsPanel.append("div").attr("class", "panel-body");
	layout.ops = layout.controlsPanelBody.append("div").attr("class", "options");
	
	// row 1
	layout.row1 = layout.container.append("div").attr("class", "row");
	layout.visHeader = layout.row1.append("div").attr("class", "col-md-12");
	layout.visHeader.append("h4").attr("class", "page-header").text("Visualization");

	// row 2
	layout.row2 = layout.container.append("div").attr("class", "row");
	layout.leftPanel = layout.row2.append("div").attr("class", "col-md-" + columnWidths[0]);
	layout.visPanel = layout.leftPanel.append("div").attr("class", "row")
    	    .append("div").attr("class", "col-md-12")
    	    .append("div");
	layout.visPanelContents = layout.visPanel.append("div").attr("class", "graphics");
	
	layout.codePanel = layout.row2.append("div").attr("class", "col-md-" + columnWidths[1])
    	    .append("div");
	layout.codePanel.append("div").attr("class", "code");

	// insert the controls objects
	layout.defaultControlsObj = AlgorithmUtils.insertDefaultControls(layout, algorithmTabId);
	AlgorithmUtils.insertCustomControls(layout, algorithmTabId, algorithmName, comments);

	return layout;
    };

    AlgorithmUtils.appendCode = function(algorithmTabId, codeContainerId, algo) {
	var code_holder = d3.select("#" + algorithmTabId + " .code")
	    .append("div")
	    .attr("class", codeContainerId);
	code_holder.append("div")
	    .attr("class", "function-code-holder")
	    .append("pre")
            .attr("class", "prettyprint lang-js linenums:1")
	    .append("code")
            .attr("class", "language-js")
            .text(algo);
	return code_holder;
    };

    var pretty_print_callbacks = {};
    // attach any code you need to get executed after pretty print here
    AlgorithmUtils.attachPrettyPrintCallback = function(tab_id, callback) {
	var tab_id_with_hash = "#" + tab_id; // we store them with hash since that's how we'll call them
	(pretty_print_callbacks[tab_id_with_hash] = (pretty_print_callbacks[tab_id_with_hash] || [])).push(callback);
    };
    AlgorithmUtils.getPrettyPrintCallbacks = function(tab_id) {
	return pretty_print_callbacks[tab_id];
    };
    //return the augmented module
    _my.AlgorithmUtils = AlgorithmUtils;
    return _my;
})(ALGORITHM_MODULE || {}, $, d3);
