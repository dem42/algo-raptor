(function chart() {

    function swap_function(data, i, j) {
	var tmp = data[i];
	data[i] = data[j];
	data[j] = tmp;
    }

    function quicksort(data, left, right, swap_function) {
	
	console.log(data, left, right);
	if (left >= right) 
	{
	    return;
	}

	var pivot = Math.floor((left + right)/2);
	var sorted_end = left + 1;
	console.log(data, left, right, pivot);
	swap_function(data, left, pivot);

	for (var i=left+1;i<right;++i) {
	    if (data[i] <= data[left]) {
		swap_function(data, sorted_end, i);
		sorted_end++;
	    }
	}
	swap_function(data, left, sorted_end-1);
	quicksort(data, left, sorted_end-1, swap_function);
	quicksort(data, sorted_end, right, swap_function);
    }

    var algo_context = {
	default_animation_duration : 500,
	cumulative_delay : 0
    };

    var q_callbacks = [];

    var qual_algo = new Algorithm(quicksort, q_callbacks, "quicksort-code", algo_context);

    console.log(qual_algo.decorated());

    var swap_algo = new Algorithm(swap_function, [], "swap_function-code", algo_context);

    d3.select("#quicksort-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "quicksort-code")
	.append("code")
        .attr("class", "language-js")
        .text(qual_algo);
    d3.select("#quicksort-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "swap_function-code")
	.append("code")
        .attr("class", "language-js")
        .text(swap_algo);

    d3.select("#quicksort-tab .options").append("button")
	.on("click", function(d) {
	    var data = [1,4,5,2,8,10];
	    qual_algo.run(data, 0, data.length, function(data, i, j) { return swap_algo.run(data, i, j); });
	    console.log("hello");
	})
	.text("start");

}());
