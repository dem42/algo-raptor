(function() {
    var fread = ALGORITHM_MODULE.fenwick_module.read;
    var fupdate = ALGORITHM_MODULE.fenwick_module.update;
    var fsum = ALGORITHM_MODULE.fenwick_module.sumBetween;
    
    QUnit.test("Fenwick tree queries test", function(assert) {
	var tree = new Array(10);
	tree.fill(0);

	assert.deepEqual(fsum(0, 9, tree, fread), 0);
	fupdate(2, 3, tree);
	assert.deepEqual(fsum(0, 9, tree, fread), 2);
	assert.deepEqual(fsum(3, 3, tree, fread), 2);
	assert.deepEqual(fsum(0, 2, tree, fread), 0);
	fupdate(5, 5, tree);
	assert.deepEqual(fsum(0, 9, tree, fread), 7);
    });
}());
