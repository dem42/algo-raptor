(function chart() {
    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.log("downloaded bs");

    AlgorithmUtils.insertIntoHeaderList("#bsearch-tab", "Binary Search", "search-1-binary");
 
    var row0 = d3.select("#algoContainer")
	.append("div").attr("class", "tab-pane").attr("id", "bsearch-tab")
	.append("div").attr("class", "row")
    var leftPanel = row0.append("div").attr("class", "col-md-6")
    var controlsPanel = leftPanel.append("div").attr("class", "row controls")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    controlsPanel.append("div").attr("class", "panel-heading").text("Controls:");
    var leftPanelBody = controlsPanel.append("div").attr("class", "panel-body");
    leftPanelBody.append("div").attr("class", "forms");
    leftPanelBody.append("div").attr("class", "options");

    
    var visPanel = leftPanel.append("div").attr("class", "row")
	.append("div").attr("class", "col-md-12")
	.append("div").attr("class", "panel panel-default");
    visPanel.append("div").attr("class", "panel-heading").text("Visualization Goes Here:");
    visPanel.append("div").attr("class", "panel-body graphics");

    var codePanel = row0.append("div").attr("class", "col-md-6")
	.append("div").attr("class", "panel panel-default");
    codePanel.append("div").attr("class", "panel-heading").text("Code");
    codePanel.append("div").attr("class", "panel-body code");

    
    /*******************************/
    /*      Setup the svg stuff    */
    /*******************************/
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
	return this.AlgorithmContext.default_animation_duration;
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
	    .attr("xlink:href", "assets/arrow2.svg");
	
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


    // this object determines the behaviour of the algorighm code
    var algorithmContext = {
	// animation duration for row highlights
	default_animation_duration : 500,
	/*
	 * This delay counter can be accessed from within the callbacks.
	 * It is meant to be used to sync the visualization transitions
	 * this means you would say d3.select(..).transition().delay(this.cumulative_delay).duration(animation_duration)
	 */
	cumulative_delay : 0
    };
    /* create an Algorithm instance wired with callbacks */
    var balgo = new Algorithm(bsearch, cbs, "bs-code", algorithmContext);
    
    d3.select("#bsearch-tab .options").append("span")
	.text("Find value : ");

    d3.select("#bsearch-tab .options").append("input")
	.attr("id", "find")
	.attr("type","text")
	.attr("class","input-box")
	.attr("maxlength", 2);

    d3.select("#bsearch-tab .options").append("button")
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
	balgo.startAnimation(data,tf,lo,hi,m);
    }
})();
