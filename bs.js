function bsearch(data, tf, h, l, m)
{
    h = data.length-1;
    l = 0;

    data.sort(function(a,b) { return a.val - b.val;});

    while (l < h)
    {
	m = Math.floor((h + l)/2);
	if (data[m].val < +tf)
	    l = m + 1;
	else
	    h = m;
    }
    if (l == h && data[l].val == tf)
    {
	console.log("found");
    }
    else
    {
	console.log("not found");
    }
}

(function chart() {

    var margin = { left: 10, top: 10, right: 10, bottom: 10},
    height = 150,
    width = 800,
    w = 20,
    h = 20,
    N = 15,
    Y = 50;
    var cbs = {};
    arrow = false;
    svg = null;
    /* callback called right after entering the function
     * it initializes the data
     */
    cbs[2] = function(data) { 
	data.forEach(function (v,i) { v.old_i = i; });
    };
    /* callback called after the array has been sorted
     * it draws the data
     */
    cbs[6] = function(data) { 
	var animation_duration = 1000;
	var initial_delay = 1000;
	this.cumulative_delay = initial_delay;
	Algorithm.highlightRow("bs-code", 6, this.cumulative_delay, animation_duration + initial_delay);

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
	gs.transition().delay(initial_delay).duration(animation_duration).attr("transform", function(d, i) {
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
	
	this.cumulative_delay += animation_duration;
    };
    /*callback called inside every iteration
     * updates the arrow pointer
     */
    cbs[10] = function(data, tf, h, l, m) { 
	var animation_duration = 1000;
	var initial_delay = 1000;
	Algorithm.highlightRow("bs-code", 10, this.cumulative_delay, animation_duration + initial_delay);
	this.cumulative_delay += initial_delay;
	arrow.style("display","block").transition().delay(this.cumulative_delay).duration(animation_duration).attr("x",2*w*m-3);
	this.cumulative_delay += animation_duration;
    };
    /*callback called after a match was found
     */
    cbs[18] = function(data, tf, h, l, m) { 
	var animation_duration = 1000;
	var initial_delay = 1000;
	Algorithm.highlightRow("bs-code", 18, this.cumulative_delay, animation_duration + initial_delay);
	this.cumulative_delay += initial_delay;
	arrow.style("display","block").transition().delay(this.cumulative_delay).duration(animation_duration).attr("x",2*w*l-3);
	svg.append("text")
	    .attr("dy", "20px")
	    .attr("class", "not-found-label")
	    .transition().delay(this.cumulative_delay).duration(animation_duration).text("Found!");
	this.cumulative_delay += animation_duration;
    };
    /*callback called if a match was NOT found
     */
    cbs[22] = function(data, tf, h, l, m) { 
	var animation_duration = 1000;
	var initial_delay = 1000;
	Algorithm.highlightRow("bs-code", 22, this.cumulative_delay, animation_duration + initial_delay);
	this.cumulative_delay += initial_delay;
	svg.append("text")
	    .attr("dy", "20px")
	    .attr("class", "not-found-label")
	    .transition().delay(this.cumulative_delay).duration(animation_duration).text("Not Found!");
	this.cumulative_delay += animation_duration;
    };

    /* create an Algorithm instance wired with callbacks */
    var balgo = new Algorithm(bsearch,cbs);
    
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
    //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
	.attr("class", "prettyprint lang-js linenums:1")
    	.attr("id", "bs-code")
	.append("code")
	.attr("class", "language-js")
	.text(balgo.toString());
    /*calls google-prettify to make the code look nice
      called automatically with new loader script
      prettyPrint();
    */
    
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
