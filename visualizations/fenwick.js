ALGORITHM_MODULE.fenwick_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "fenwick-tab";
    var algorithmName = "Fenwick tree";

    /*********************/
    /*** fenwick functions ***/
    /*********************/
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

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded fenwick");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName, "fenwick", [7, 5]);


    var fenwick_read_algo = new _my.Algorithm(read, {}, "fen-read-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });
    var fenwick_update_algo = new _my.Algorithm(update, {}, "fen-update-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						function() { _my.AlgorithmUtils.resetControls(algorithmTabId); });

    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-read-code", fenwick_read_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-update-code", fenwick_update_algo);

    return {};
}(ALGORITHM_MODULE, jQuery, d3, bootbox));
