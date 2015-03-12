function test() {
    var i = 15;
    i = i * 2;
    return i;
}

QUnit.test("Test algorithm runCode functionality", function(assert) {
    
    assert.expect(1); // specifying how many calls we want to see

    // callbacks not expected since we are only calling runCode but not executeInCont or other mode
    var callbacks = [];
    callbacks[1] = function() { assert.ok(true); }
    callbacks[2] = function() { assert.ok(true); }
    callbacks[3] = function() { assert.ok(true); }
    callbacks[4] = {"pre": function() { assert.ok(true); }}
    var algo = new ALGORITHM_MODULE.Algorithm(test, callbacks, "test", {}, function() {
	assert.ok(true); // cleanup not expected in this case
    });

    assert.deepEqual(algo.runCodeAndPopulateAnimationQueue(), 30);
});


QUnit.test("Test algorithm execute callbacks functionality in continuous mode", function(assert) {
    assert.expect(5); // specifying how many calls we want to see
    var done = assert.async();
    var callbacks = [];
    callbacks[1] = function() { assert.ok(true); }
    callbacks[2] = function() { assert.ok(true); }
    callbacks[3] = function() { assert.ok(true); }
    callbacks[4] = {"pre": function() { assert.ok(true); }}

    var algo = new ALGORITHM_MODULE.Algorithm(test, callbacks, "test", {}, function() {
	assert.ok(true); // cleanup invoked
	done();
    });

    algo.runCodeAndPopulateAnimationQueue();
    algo.executeInContinuousMode();
});
