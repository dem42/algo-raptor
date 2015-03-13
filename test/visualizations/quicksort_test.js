(function() {
    function valEnhancer(arr) {
	return arr.map(function(d) {
	    return {val: d};
	});
    }
    var randomize = ALGORITHM_MODULE.quicksort_module.getRandomArray;
    var qsort = ALGORITHM_MODULE.quicksort_module.quicksort;
    var swapper = ALGORITHM_MODULE.quicksort_module.swap_function;

    QUnit.test("Test correct sorting", function(assert) {
	var data = valEnhancer([3, 0, 1, 2]);
	qsort(data, 0, data.length-1, swapper);
	assert.deepEqual(data, valEnhancer([0, 1, 2, 3]));

	data = valEnhancer([1, 2, 3, 4, 5, 6, 7]);
	qsort(data, 0, data.length-1, swapper);
	assert.deepEqual(data, valEnhancer([1, 2, 3, 4, 5, 6, 7]));

	data = valEnhancer([1314, 11]);
	qsort(data, 0, data.length-1, swapper);
	assert.deepEqual(data, valEnhancer([11, 1314]));

	data = valEnhancer([7, 1, 1, 8, 2, 5, 13]);
	qsort(data, 0, data.length-1, swapper);
	assert.deepEqual(data, valEnhancer([1, 1, 2, 5, 7, 8, 13]));
	
	data =  valEnhancer([55,17,6,53,62,78]);
	qsort(data, 0, data.length-1, swapper);
	assert.deepEqual(data, valEnhancer([6, 17, 53, 55, 62, 78]));
    });

    QUnit.test("Randomized sorting test", function(assert) {
	var NUM_TEST = 10;
	for (var i = 0; i < NUM_TEST; i++) {
	    var size = Math.floor(Math.random() * 10);
	    var arr = randomize(size, 100, 0);
	    var cpy_arr = arr.slice();
	    cpy_arr.sort(function(a, b) { return a - b; });
	    var data = valEnhancer(arr);
	    qsort(data, 0, arr.length-1, swapper);
	    assert.deepEqual(data, valEnhancer(cpy_arr), "For input array: " + arr);
	}
    });

}())
