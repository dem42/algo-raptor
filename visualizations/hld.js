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
    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName, "hld", [5, 7]);

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

    _my.AlgorithmUtils.appendCode(algorithmTabId, "hld-code", hld_algo);

    layout.customControlsLayout.append("button")
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
