ALGORITHM_MODULE.hld_module = (function chart(ALGORITHM_MODULE, d3, bootbox) {
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
    layout.customControlsLayout.append("button")
	.attr("class", "btn btn-default btn-sm")
	.attr("title", "Permute the tree input data. (You want to do this .. Trust me!")
        .on("click", function() {

	})
	.text("Shuffle Data");
    /*********************/
    /*** HLD functions ***/
    /*********************/
    function computeSubtreeSize(tree, current_node) {
	tree[current_node].subTreeSize = 1;
	for (var idx = 0; idx < tree[current_node].children.length; idx++) {
	    tree[current_node].subTreeSize += computeSubtreeSize(tree, tree[current_node].children[idx]);
	}
	return tree[current_node].subTreeSize;
    }
    function heavyLightDecomposition(tree, current_node, current_chain, chains) {
	if (chains.chainHeads[current_chain] === undefined) {
	    chains.chainHeads[current_chain] = current_node;
	}
	chains.chainIdx[current_node] = current_chain;
	chains.chainPos[current_node] = chains.chainLengths[current_chain];
	chains.chainLengths[current_chain]++;
	
	if (tree.isLeafNode(current_node)) {
	    return;
	}

	var maxSubTreeSize = -1;
	var specialChild = -1;
	var children = tree[current_node].children;
	for (var idx = 0; idx < children.length; idx++) {
	    if (tree[children[idx]].subTreeSize > maxSubTreeSize) {
		maxSubTreeSize = tree[children[idx]].subTreeSize;
		specialChild = children[idx];
	    }
	}
	heavyLightDecomposition(tree, specialChild, current_chain, chains);

	for (var idx = 0; idx < children.length; idx++) {
	    if (children[idx] != specialChild) {
		var new_chain_num = ++chains.numChains;
		heavyLightDecomposition(tree, children[idx], new_chain_num, chains);
	    }
	}
    }

    /******************/
    /** Wiring code ***/
    /******************/
    var hld_callbacks = [];
    var hld_context = _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj);
    var hld_algo = new _my.Algorithm(heavyLightDecomposition, hld_callbacks, "hld-code", hld_context);

    var ss_callbacks = [];
    var ss_context = _my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj);
    var ss_algo = new _my.Algorithm(computeSubtreeSize, ss_callbacks, "ss-code", ss_context);

    _my.AlgorithmUtils.appendCode(algorithmTabId, "ss-code", ss_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "hld-code", hld_algo);

    var tree = {};
    tree[0] = {idx: 0, children: [1, 3, 5]};
    tree[1] = {idx: 1, children: [2, 4]};
    tree[2] = {idx: 2, children: []};
    tree[3] = {idx: 3, children: []};
    tree[4] = {idx: 4, children: [6]};
    tree[5] = {idx: 5, children: [7]};
    tree[6] = {idx: 6, children: [8]};
    tree[7] = {idx: 7, children: []};
    tree[8] = {idx: 8, children: []};
    tree.size = 8;
    tree.isLeafNode = function(val) { return this[val].children.length == 0; };

    _my.AlgorithmUtils.attachAlgoToControls(ss_algo, algorithmTabId, function(){
	ss_algo.run(tree, 0);
	chains = {chainLengths: undefined, 
		  chainHeads: undefined, 
		  chainPos:undefined, 
		  chainIdx:undefined, 
		  numChains:undefined};
	chains.numChains = 0;
	chains.chainLengths = new Array(tree.size);
	chains.chainLengths.fill(0);
	chains.chainHeads = new Array(tree.size);
	chains.chainHeads.fill(undefined);
	chains.chainPos = new Array(tree.size);
	chains.chainIdx = new Array(tree.size);
	chains.chainIdx.fill(undefined);
	hld_algo.runWithSharedAnimationQueue(ss_algo, tree, 0, 0, chains);
	console.log(tree, chains);
    });

    //return {"hld": heavyLightDecomposition, "hld-algo": hld_algo};

}(ALGORITHM_MODULE, d3, bootbox));
