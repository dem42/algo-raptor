ALGORITHM_MODULE.fenwick_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "fenwick-tab";
    var algorithmName = "Fenwick tree";
    var N = 14;
    var tree = new Array(N + 1);
    var input_data = new Array(N);
    tree.fill(0);
    input_data.fill(0);
    var idxs = [];
    for (var i = 1; i <= N; i++) {
	idxs.push(i);
    }

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded fenwick");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName, "fenwick", [7, 5], "You may modify the input array here:");
    var float_container = layout.customControlsLayout.append("div").attr("class", "fen-float-container")
    var fen_labels = float_container.append("div").attr("class", "fen-labels");
    var fen_forms = float_container.append("div").attr("class", "fen-forms");
    
    fen_labels.append("span").text("index:").attr("class", "fen-table-lbl");
    var labels = d3.select(".fen-labels").selectAll("fen-label")
	.data(idxs)
	.enter().append("span")
	.attr("class","fen-label")
	.text(function(d, i) { return i+1; });

    fen_forms.append("span").text("value:").attr("class", "fen-table-lbl");
    var forms = d3.select(".fen-forms").selectAll("input[type='text']")
	.data(input_data)
	.enter().append("input")
	.attr("data-fen-index", function(d, i) {return i+1;})
	.attr("type","text")
	.attr("class","fen-input-box")
	.attr("maxlength", 1);

    /*populate the inputs*/
    var inputs = document.querySelectorAll(".fen-forms > input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = 0;
    }
    /*********************/
    /*** fenwick functions ***/
    /*********************/
    function sumBetween(start, end, tree, read) {
	var sum_to_end = read(end, tree);
	var sum_upto_start = read(start - 1, tree);
	var sum = sum_to_end - sum_upto_start;
	return sum;
    }

    function read(idx, tree) {
	var result = 0;
	for (var i = idx; i > 0;) {
	    result += tree[i];
	    var lowest_set_bit = (i & -i);
	    i -= lowest_set_bit;
	}
	return result;
    }
    function update(value, idx, tree) {
	for (var i = idx; i < tree.length;) {
	    tree[i] += value;
	    var lowest_set_bit = (i & -i);
	    i += lowest_set_bit;
	}
    }

    /*****************************/
    /*** svg setup and wiring ***/
    /*****************************/

    function cleanup() {
	d3.selectAll(".fen-label").classed("fen-label-highlighted", false);
	_my.AlgorithmUtils.resetControls(algorithmTabId);
	reinitButtons();
    }
    var fenwick_sum = new _my.Algorithm(sumBetween, {}, "fen-sum-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);

    var fenwick_read_algo = new _my.Algorithm(read, {}, "fen-read-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);
    var fenwick_update_algo = new _my.Algorithm(update, {}, "fen-update-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);


    var wrapped_read = function(idx, tree) {
	return fenwick_read_algo.runWithSharedAnimationQueue(fenwick_sum, idx, tree);
    }
    
    function initOnIndexSelection() {
	var clicked = 0;
	d3.selectAll(".fen-label").on("click", function(d) {
	    if(clicked == 1) {
		var start = d3.select(".fen-label-highlighted").datum();
		d3.select(this).classed("fen-label-highlighted", true);
		var end = d;
		console.log("starting fenwick index thing with", start, end);
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_sum, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_sum, algorithmTabId);
		fenwick_sum.run(+start, +end, tree, wrapped_read);
		play_function();
	    }
	    else {
		console.log("fenwick clicked", clicked);
		d3.select(this).classed("fen-label-highlighted", true);
	    }
	    clicked = (clicked + 1) % 2;
	    
	});
    };
    initOnIndexSelection();

    function initOnValueChanges() {
	$(".fen-input-box").on("input", function(d) {
	    var value = $(this).val();
	    var index = $(this).attr("data-fen-index");
	    console.log("calling on input", value, index);
	    if (!isNaN(+value)) {
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_update_algo, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_update_algo, algorithmTabId);
		fenwick_update_algo.run(+value, +index, tree);
		play_function();
		console.log(tree);
	    }
	});
    }
    initOnValueChanges();

    function reinitButtons() {
	_my.AlgorithmUtils.attachAlgoToControls(fenwick_read_algo, algorithmTabId, function kickOff(executionFunction) {
	    /* The function that starts the simulation.
	     * It creates a dialog and the dialog starts the execution
	     */
	    var dialog = bootbox.dialog({
		title:"Fenwick interaction", 
		message: '<span>To start the visualization, in the "Fenwick Controls " section either click on two indices or change a value</span>',
		buttons: {
		    success: {
			label: "Ok",
			className: "btn-primary",
			callback: function() {
			}
		    }
		}
	    });
	})
    };
    reinitButtons();
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-sum-code", fenwick_sum);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-read-code", fenwick_read_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-update-code", fenwick_update_algo);

    return {};
}(ALGORITHM_MODULE, jQuery, d3, bootbox));
