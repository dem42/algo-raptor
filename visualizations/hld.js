ALGORITHM_MODULE.hld_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {
    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }
    var algorithmTabId = "hld-tab";
    var algorithmName = "Heavy-Light Decomposition";

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded hld");


    _my.AlgorithmUtils.insertIntoHeaderList("#" + algorithmTabId, algorithmName, "hld");
    
    var row0 = d3.select("#algoContainer")
    	.append("div").attr("class", "tab-pane").attr("id", algorithmTabId)
        .append("div").attr("class", "container-fluid")
    	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-5")
    var controlsPanel = leftPanel.append("div").attr("class", "row controls")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");

    var leftPanelBody = controlsPanel.append("div").attr("class", "panel-body");
    var ops = leftPanelBody.append("div").attr("class", "options");
    var defaultControlsObj = _my.AlgorithmUtils.insertDefaultControls(ops, algorithmTabId);
    _my.AlgorithmUtils.insertCustomControls(ops, algorithmTabId, algorithmName);
    
    var visPanel = leftPanel.append("div").attr("class", "row")
    	.append("div").attr("class", "col-md-12")
    	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Algorithm Visualization");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-7")
    	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");


    /*********************/
    /*** HLD functions ***/
    /*********************/
    function heavyLightDecomposition(tree, current_node, current_chain, chainLengths, chainHeads, chainPos) {
	if (chainHeads[current_chain] === undefined) {
	    chainHeads[current_chain] = current_node;
	}
	chainPos[current_node] = chainLengths[current_chain];
	chainLengths[current_chain]++;
	
	var maxSubTreeSize = 0;
	var specialChild = -1;
	for (var idx = 0; idx < tree[current_node].children.length; idx++) {
	    if (tree[idx].subTreeSize > maxSubTreeSize) {
		maxSubTreeSize = tree[idx].subTreeSize;
		specialChild = idx;
	    }
	}
	heavyLightDecomposition(tree, specialChild, current_chain, chainLengths, chainHeads, chainPos);

	for (var idx = 0; idx < tree[current_node].children.length; idx++) {
	    if (idx != specialChild) {
		var new_chain_num = ++tree.numChains;
		heavyLightDecomposition(tree, idx, new_chain_num, chainLengths, chainHeads, chainPos);
	    }
	}
    }

    var hld_callbacks = [];
    var hld_context = _my.AlgorithmUtils.createAlgorithmContext(); // not linked to the controls object
    var hld_algo = new _my.Algorithm(heavyLightDecomposition, hld_callbacks, "hld-code", hld_context);

    d3.select("#" + algorithmTabId + " .code")
	.append("div")
	.attr("class", "quicksort-code")
        .append("div")
	.attr("class", "function-code-holder")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(hld_algo);


    d3.select("#" + algorithmTabId + " .options").append("button")
	.attr("class", "btn btn-default btn-sm")
	.attr("title", "Permute the tree input data. (You want to do this .. Trust me!")
        .on("click", function() {
	    sequence_to_sort.shuffle();
	    sequence_to_sort.forEach(function(d, i) {
		data[i].val = d;
		data[i].old_idx = i;
	    });
	    d3.selectAll(".circle-group").remove();
	    d3.selectAll("defs").remove();
	    init_circles(data);
	})
	.text("Shuffle Data");

    //return {"hld": heavyLightDecomposition, "hld-algo": hld_algo};

}(ALGORITHM_MODULE, jQuery, d3, bootbox));
