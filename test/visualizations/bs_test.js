QUnit.test("Bsearch test", function(assert) {
    function test(expected, data, key_to_find, search_function) {
	var fancy_data = data.map(function(e) {
	    return {val: e};
	});
	assert.deepEqual(ALGORITHM_MODULE.bsearch_module[search_function](fancy_data, key_to_find), expected, "Testing find " + key_to_find + " using " + search_function);
    }
    var search_functions = ["bsearch", "deferred_bsearch"];
    for (var i = 0; i < search_functions.length; i++) {
	test(0, [1,2,5], 1, search_functions[i]);
	test(1, [1,2,5], 2, search_functions[i]);
	test(2, [1,2,5], 5, search_functions[i]);
	test(-1, [1,2,5], 4, search_functions[i]);
	test(-1, [1,2,5], 0, search_functions[i]);
	test(-1, [1,2,5], 6, search_functions[i]);
    }

    for (var i = 0; i < search_functions.length; i++) {
	test(-1, [0,2,4,5], 1, search_functions[i]);
	test(0, [0,2,4,5], 0, search_functions[i]);
	test(-1, [0,2,4,5], 7, search_functions[i]);
	test(2, [0,2,4,5], 4, search_functions[i]);
    }

    for (var i = 0; i < search_functions.length; i++) {
	test(-1, [0,14], 1, search_functions[i]);
	test(0, [0,14], 0, search_functions[i]);
	test(1, [0,14], 14, search_functions[i]);
	test(-1, [0,14], 99, search_functions[i]);
    }

    for (var i = 0; i < search_functions.length; i++) {
	test(-1, [13], 1, search_functions[i]);
	test(0, [13], 13, search_functions[i]);
	test(-1, [13], 41, search_functions[i]);
    }
});
