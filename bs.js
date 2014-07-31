(function chart() {

    var margin = { left: 10, top: 10, right: 10, bottom: 10},
    height = 150,
    width = 800,
    w = 20,
    h = 20,
    N = 15,
    Y = 50;
    var cbs = {};
    var arrow = false;
    var svg = null;

    function bsearch(data, key) {
	var high = data.length-1;
	var low = 0;
	var mid = 0;

	data.sort(function(a,b) { return a.val - b.val;});

	while (low < high) {
	    mid = Math.floor((high + low)/2);
	    if (data[mid].val < +key) {
		low = mid + 1;
	    } else {
		high = mid;
	    }
	}
	if (low == high && data[low].val == key) {
	    console.log("found");
	} else {
	    console.log("not found");
	}
    }

    /* callback called right after entering the function
     * it initializes the data
     */
    cbs[0] = function(data) { 
	data.forEach(function (v,i) { v.old_i = i; });
	return 0;
    };
    /* callback called after the array has been sorted
     * it draws the data
     */
    cbs[5] = function(data) { 
	var animation_duration = 1000;

	svg = d3.select("#bsearch-tab .graphics").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/* the gs have an old_i which is their old order .. we move the gs to where they are
	 * in the old order
	 */
	var gs = svg.selectAll(".gs")
	    .data(data)
	    .enter().append("g")
	    .attr("class", "gs")
	    .attr("transform", function(d, i) { return "translate(" + 2*w*d.old_i + "," + Y + ")";});
	/*add rectangles and text into the groups*/  
	gs.append("rect")
	    .attr("width", w)
	    .attr("height", h)
	    .attr("class", "svg-input-box");
	gs.append("text")
	    .attr("dx", function(d) { if(d.val.length == 2) return 2; else return 5;})
	    .attr("dy", 15)
	    .text(function(d) { return d.val; });

	/*interpolating works with transforms too .. so cool -> move to new spot*/
	gs.transition().delay(this.AlgorithmContext.cumulative_delay).duration(animation_duration).attr("transform", function(d, i) {
	    return "translate(" + 2*w*i + "," + Y + ")";
	});

	/* setup the arrow data */
	arrow = svg.append("image")
	    .style("display","none")
	    .attr("y",0)
	    .attr("x",0)
	    .attr("width",30)
	    .attr("height",30)
	    .attr("xlink:href", "arrow2.svg");
	
	return animation_duration;
    };
    /*callback called inside every iteration
     * updates the arrow pointer
     */
    cbs[8] = function(mid) { 
	var animation_duration = 1000;
	arrow.style("display","block").transition().delay(this.AlgorithmContext.cumulative_delay).duration(animation_duration).attr("x",2*w*mid-3);
	return animation_duration;
    };
    /*callback called after a match was found
     */
    cbs[16] = function(low) { 
	var animation_duration = 1000;
	arrow.style("display","block").transition().delay(this.AlgorithmContext.cumulative_delay).duration(animation_duration).attr("x",2*w*low-3);
	svg.append("text")
	    .attr("dy", "100px")
	    .attr("class", "not-found-label")
	    .transition().delay(this.AlgorithmContext.cumulative_delay).duration(animation_duration).text("Found!");
	return animation_duration;
    };
    /*callback called if a match was NOT found
     */
    cbs[18] = function() { 
	var animation_duration = 1000;
	svg.append("text")
	    .attr("dy", "100px")
	    .attr("class", "not-found-label")
	    .transition().delay(this.AlgorithmContext.cumulative_delay).duration(animation_duration).text("Not Found!");
	return animation_duration;
    };

    /*setup the data*/	 
    var data = new Array(N);

    /*setup the DOM elements*/
    var forms = d3.select(".forms").selectAll("input[type='text']")
	.data(data)
	.enter().append("input")
	.attr("type","text")
	.attr("class","input-box")
	.attr("maxlength", 2);

    /*populate the inputs*/
    var inputs = document.querySelectorAll("input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = Math.floor(Math.random()*99);
    }

    /* create an Algorithm instance wired with callbacks */
    var balgo = new Algorithm(bsearch, cbs, "bs-code");
    
    d3.select(".options").append("span")
	.text("Find value : ");

    d3.select(".options").append("input")
	.attr("id", "find")
	.attr("type","text")
	.attr("class","input-box")
	.attr("maxlength", 2);

    d3.select(".options").append("button")
	.on("click", function(d) { kickoff(); })
	.text("start");

    d3.select("#bsearch-tab .code")
	.append("pre")
	.attr("class", "prettyprint lang-js linenums:1")
    	.attr("id", "bs-code")
	.append("code")
	.attr("class", "language-js")
	.text(balgo.toString());
    
    /*the function that starts the simulation*/
    var kickoff = function kickOff() {
	var lo = 0, hi = N, m, tf = document.getElementById("find").value;
	console.log(data);
	d3.selectAll(".forms .input-box").each(function(v, i, a) {
	    data[i] = { val: this.value};
	});
	balgo.run(data,tf,lo,hi,m);
    }
}());
