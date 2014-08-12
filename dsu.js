(function chart() {
    var margin = { left: 10, top: 30, right: 10, bottom: 100};
    var height = 450;
    var width = 1600;
    var treew = 200;
    var svg = d3.select("#dsu-tab .graphics").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var data = [{"name": 0}, {"name": 1}, {"name": 2}, {"name": 3}, {"name": 4}, {"name": 5}, {"name": 6}];
    var next_num = 7;

    // the dsu find and union functions
    function find(a, data) {
	while(data[a].root != a) {
	    a = data[a].root;
	}
	return a;
    }
    function union (a, b, data, find_function) {
	r1 = find_function(a, data);
	r2 = find_function(b, data);
	if(r1 !== r2)
	{
	    if(data[r1].rank > data[r2].rank)
	    {
		data[r2].root = r1; 
	    }
	    else if(data[r1].rank < data[r2].rank)
	    {
		data[r1].root = r2;
	    }
	    else
	    {
		var prob = Math.random();
		if(prob > 0.5) 
		{
		    data[r1].root = r2;
		    data[r2].rank++;
		}
		else
		{
		    data[r2].root = r1;
		    data[r1].rank++;  
		}
	    }
	}
    }


    /**
     * node selection function, triggered when user clicks on a circle
     */
    var selected = [];
    function selectNode(svgObj, d) {
	svgObj.setAttribute("class", "node highlight-elem");
	selected.push({"data":d, "obj":svgObj});
	if (selected.length == 2) {
	    setTimeout(function() { 	    
		console.log("kickoff");
		console.log(selected[0].data, data);
		console.log(selected[1].data, data);
		var selected1 = selected[0].data.name;
		var selected2 = selected[1].data.name;
		var findInClosure = function(node, data) {
		    return dsuFind.run(node, data);
		}
		dsuUnion.startAnimation(selected1, selected2, data, findInClosure);
		console.log(data);
		//selected.forEach(function (d) {d.obj.setAttribute("class", "node")});
		selected = [];
	    }, 200);
	}
    }

    /**
     * tree rendering function, called to draw a d3 tree hierarchy 
     */
    function drawTreeFun(delay, data, i, child) {

	var animation_duration = 1600;

	console.log("in draw tree fun", data, i);

	var tree = d3.layout.tree().size([treew - margin.right, height - margin.bottom])
	    .children(function(d) {
		return d.children;
	    });
	var nodes = tree.nodes(data);
	var links = tree.links(nodes);


	var diagonal = d3.svg.diagonal();
	var movers = d3.selectAll(".link-g")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name })
	
	movers.transition()
	    .delay(delay)
	    .duration(animation_duration)
	    .attr("transform", "translate(" + data.order*treew + ",0)");

	movers.select(".link")
	    .transition()
	    .delay(delay)
	    .duration(animation_duration)
	    .attr("d", diagonal)

	var svgLinks = svg.selectAll(".link")
	    .data(links, function (d) { return d.source.name + "-to-" + d.target.name })
	    .enter()
	    .append("g")
	    .attr("class", "link-g")
	    .attr("transform", "translate(" + data.order*treew + ",0)")
	    .append("path")
	    .attr("class", "link")
	    .attr("id", function(d) { return "from-" + d.source.name + "-to-" + d.target.name; })
	    .transition()
	    .delay(delay + animation_duration)
	    .attr("d", diagonal);

	var mover_nodes = svg.selectAll(".node")
	    .data(nodes, function(d) { return d.name; })
	    .transition()
	    .delay(delay)
	    .duration(animation_duration)
	    .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";});

	var svgNodes = svg.selectAll(".node")
	    .data(nodes, function(d) { return d.name; })
	    .enter().append("g")
	    .attr("class", "node")
	    .attr("id", function(d) { return "node-" + d.name; })
            .attr("transform", function(d) {return "translate(" + (d.x + data.order*treew) + "," + d.y + ")";})
	    .on("click", function(d) {selectNode(this, d);});
	

	var circles = svgNodes.append("circle")
	    .attr("cx", 0)
	    .attr("cy", 0)
	    .attr("r", "0px")
	    .transition() //transitioning from 0em to 2em
	    .delay(delay + animation_duration)
	    .duration(animation_duration)
	    .attr("r", "20px");

	var texts = svgNodes.append("text")
            .attr("dx", "-5px")
            .attr("dy", "5px")
	    .attr("onmousedown", "return false;")
	    .style("cursor", "not-allowed")
	    .text(function(d) { return d.name; })
	    .attr("font-size", "0pt")
	    .transition()
	    .delay(delay + 2*animation_duration)
	    .attr("font-size", "12pt")

	// in svg the order of elements defines the z-index 
	// we added a moveToFront function to d3.selection that changes the order of elements
	setTimeout(function() {
	    svg.select("#node-" + data.name).moveToFront();
	    if (child != undefined) svg.select("#node-" + child.name).moveToFront();
	}, delay + animation_duration + 10);

	console.log("after draw tree fun", data, i);

	return 2*animation_duration;
    }

    function push(obj, elem) {
	(obj.children = obj.children || []).push(elem);
    }
    function cleanup(delay, winner, winner_num, loser, loser_num) {
	//remove_merged_nodes([winner_num,loser_num]);
	push(winner, loser);
	drawTreeFun(delay, winner, winner_num, loser);
	var loser_order = loser.order;
	var new_node = {"name": next_num, "rank": 0, "root": next_num, "children": [], "order": loser_order};
	data.push(new_node);
	var animation_duration = drawTreeFun(delay, new_node, next_num);
	next_num++;

	return animation_duration;
    }

    var cbsFind = {};
    var cbsUnion = {};

    // processing and enhancing the data
    d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
	    this.parentNode.appendChild(this);
	});
    };

    // data is the global container of nodes used by the code
    //linearize and add "rank"/"root" and "order" which determines where they will be drawn
    data.forEach(function(d) {
	d.rank = 0;
	d.root = d.name;
	d.order = +d.name;
	if (!("children" in d)) {
	    d.children = [];
	}
    });
    console.log("data", data);


    cbsFind[1] = function(a, data) {
	console.log("in find with a=",a,"and root =",data[a].root,"#from-" + data[a].root + "-to-" + a);
	setTimeout(function() {
	    d3.select("#from-" + data[a].root + "-to-" + a).classed("highlight-elem", true);
	}, this.AlgorithmContext.cumulative_delay + 200);
	return 200;
    }
    cbsFind[2] = function(a, data) {
	console.log("in find with a=",a,"and root =",data[a].root);
	setTimeout(function() {
	    d3.select("#node-" + a).classed("highlight-elem", true);
	}, this.AlgorithmContext.cumulative_delay + 200);
	return 200;
    }
    cbsUnion[2] = function(r1,r2,a,b) {
	console.log("for a=",a,"parent=",r1,"for b=",b,"parent=",r2);  
	return 100;
    }
    cbsUnion[7] = function(b, r1, r2, data) {
	console.log("the new root of ", r2," is ",r1);
	return cleanup(this.AlgorithmContext.cumulative_delay, data[r1], r1, data[r2], r2);
    }
    cbsUnion[11] = function(a, r2, r1, data) {
	console.log("the new root of ", r1," is ",r2);
	return cleanup(this.AlgorithmContext.cumulative_delay, data[r2], r2, data[r1], r1);
    }
    cbsUnion[18] = function(r2, r1, data) {
	console.log("the new root of ", r1," is ",r2);
	return cleanup(this.AlgorithmContext.cumulative_delay, data[r2], r2, data[r1], r1);
    }
    cbsUnion[23] = function(r1, r2, data) {
	console.log("the new root of ", r2," is ",r1);
	return cleanup(this.AlgorithmContext.cumulative_delay, data[r1], r1, data[r2], r2);
    }
    cbsUnion[27] = function(r1, r2) {
	setTimeout(function() {
	    d3.selectAll(".link").classed("highlight-elem", false);
	    d3.selectAll(".node").classed("highlight-elem", false);
	}, this.AlgorithmContext.cumulative_delay);
	return this.AlgorithmContext.default_animation_duration;
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

    var dsuFind = new Algorithm(find, cbsFind, "dsu-find-code", algorithmContext);
    var dsuUnion = new Algorithm(union, cbsUnion, "dsu-union-code", algorithmContext);



    d3.select("#dsu-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "dsu-find-code")
	.append("code")
        .attr("class", "language-js")
        .text(dsuFind);

    d3.select("#dsu-tab .code")
	.append("pre")
        .attr("class", "prettyprint lang-js linenums:1")
	.attr("id", "dsu-union-code")
	.append("code")
        .attr("class", "language-js")
        .text(dsuUnion);

    /*calls google-prettify to make the code look nice
      called automatically
    prettyPrint();
    */

    data.forEach(function(d) { d.rank = 0;});
    data.forEach(function(d, i) {
	drawTreeFun(100, d, i);
    });

})();
