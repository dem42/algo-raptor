(function chart() {

    function myswap(data, i, j) {
	var tmp = data[i];
	data[i] = data[j];
	data[j] = tmp;
    }

    function quicksort(data, left, right) {
	
	console.log(data, left, right);
	if (left >= right) {
	    return;
	}

	var pivot = Math.floor((left + right)/2);
	var sorted_end = left + 1;
	console.log(data, left, right, pivot);
	myswap(data, left, pivot);

	for (var i=left+1;i<right;++i) {
	    if (data[i] <= data[left]) {
		myswap(data, sorted_end, i);
		sorted_end++;
	    }
	}
	myswap(data, left, sorted_end-1);
	quicksort(data, left, sorted_end-1);
	quicksort(data, sorted_end, right);
    }


    d3.select("#quicksort-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "dsu-union-code")
	.append("code")
        .attr("class", "language-js")
        .text(quicksort.toString());
    d3.select("#quicksort-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "dsu-find-code")
	.append("code")
        .attr("class", "language-js")
        .text(myswap.toString());

    d3.select("#quicksort-tab .options").append("button")
	.on("click", function(d) {
	    var data = [1,4,5,2,8,10];
	    quicksort(data, 0, data.length);
	    console.log("hello");
	})
	.text("start");

}());
