ALGORITHM_MODULE.fenwick_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "fenwick-tab";
    var algorithmName = "Fenwick tree";
    var data = new Array(14);

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
	.data(data)
	.enter().append("span")
	.attr("class","fen-label")
	.text(function(d, i) { return i+1; });

    fen_forms.append("span").text("value:").attr("class", "fen-table-lbl");
    var forms = d3.select(".fen-forms").selectAll("input[type='text']")
	.data(data)
	.enter().append("input")
	.attr("type","text")
	.attr("class","fen-input-box")
	.attr("maxlength", 2);

    /*populate the inputs*/
    var inputs = document.querySelectorAll(".fen-forms > input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = 0;
    }
    /*********************/
    /*** fenwick functions ***/
    /*********************/
    function sumBetween(start, end, data, read) {
	var sum_to_end = read(end, data);
	var sum_upto_start = read(start - 1, data);
	var sum = sum_to_end - sum_upto_start;
	return sum;
    }

    function read(idx, data) {
	var result = 0;
	for (var i = idx; i > 0;) {
	    result += data[i];
	    var lowest_set_bit = (i & -i);
	    i -= lowest_set_bit;
	}
	return result;
    }
    function update(value, idx, data) {
	for (var i = idx; i < data.lenght;) {
	    data[idx] += value;
	    var lowest_set_bit = (i & -i);
	    i += lowest_set_bit;
	}
    }

    /*****************************/
    /*** svg setup and wiring ***/
    /*****************************/

    var fenwick_sum = new _my.Algorithm(sumBetween, {}, "fen-sum-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });

    var fenwick_read_algo = new _my.Algorithm(read, {}, "fen-read-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });
    var fenwick_update_algo = new _my.Algorithm(update, {}, "fen-update-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });


    
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
    });
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-sum-code", fenwick_sum);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-read-code", fenwick_read_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-update-code", fenwick_update_algo);

    return {};
}(ALGORITHM_MODULE, jQuery, d3, bootbox));
