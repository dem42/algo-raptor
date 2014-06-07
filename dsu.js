function find(a, data) {
    while(data[a].root != a) {
      a = data[a].root;
    }
    return a;
}
function union (a, b, data) {
    r1 = find(a);
    r2 = find(b);
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

(function chart() {
    var jsondata = 
	{"name": "a", "children": [
	    {"name": "b", "children": [
		{"name": "c"},
		{"name": "e"},
		{"name": "f"}
	]},
	{"name": "d"},
	{"name": "z", "children": [
	    {"name": "r"}
	]}
	]};

    var margin = { left: 10, top: 30, right: 10, bottom: 50};
    var height = 150;
    var width = 1600;
    var treew = 150;
    var svg = d3.select("#dsu-tab .graphics").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var o = [{"name": 0}, {"name": 1}, {"name": 2}, {"name": 3}, {"name": 4}, {"name": 5}, {"name": 6}, {"name": 7}, {"name": 8}, {"name": 9}, {"name": 10}, {"name": 11}];

    var data = []
    //linearize and add rank/root
    o.forEach(function(d) {
	d.rank = 0;
	d.root = d.name;
	data.push(d);
    });

    console.log("data", data);

    
    var selected = [];
    function selectNode(svgObj, d) {
	svgObj.setAttribute("class", "node selected");
	selected.push({"data":d, "obj":svgObj});
	if (selected.length == 2) {
	    setTimeout(function() { 	    
		console.log("kickoff");
		console.log(selected[0].data, data);
		var r1 = find(selected[0].data.name, data);
		var r2 = find(selected[1].data.name, data);
		union(r1, r2, data);
		console.log(data);
		selected.forEach(function (d) {d.obj.setAttribute("class", "node")});
		selected = [];
	    }, 1000);
	}
    }

    //var o = [{"name":"1", "children": [{"name":"7"}]},{"name":"2"},{"name":"3"},{"name":"4", "children": [{"name":"9"}]}, jsondata];

    
    function drawTreeFun(data, i) {

	console.log("in draw tree fun", data, i);

	tree = d3.layout.tree().size([treew - margin.right, height - margin.bottom])
	    .children(function(d) {
		return d.children;
	    });
	nodes = tree.nodes(data),
	links = tree.links(nodes);

	var tg = svg.append("g")
	   .attr("id", i + "-tree")
	   .attr("transform", "translate(" + i*treew + ",0)"); 


	var diagonal = d3.svg.diagonal();
	tg.selectAll(".link")
	    .data(links)
	    .enter().append("path")
	    .attr("class", "link")
	    .attr("d", diagonal);

	var nodes = tg.selectAll(".node")
	    .data(nodes)
	    .enter().append("g")
	    .attr("class", "node")
            .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
	    .on("click", function(d) {selectNode(this, d);});
	

	nodes.append("circle")
	    .attr("r", "1em")
	    .attr("cx", 0)
	    .attr("cy", 0);

	nodes.append("text")
            .attr("dx", "-0.25em")
            .attr("dy", "0.25em")
	    .text(function(d) { return d.name; });

    }

    // adding the shuffle function to array
    Array.prototype.shuffle = function(){ 
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x) ;
    };

    var cbsFind = {};
    var cbsUnion = {};
/*    cbsFind[14] = function(data,r1,r2,a,b) {
	console.log("r1=",r1,data[r1].rank,data[r1].root,a,b);
    }
    cbsFind[15] = function(data,r1,r2,a,b) {
	console.log("r2=",r2,data[r2].rank,data[r2].root,a,b);  
    }
    cbs[48] = function(data,r1,r2,a,b) {
	console.log("data=",data);  
    }
*/


    var dsuFind = new Algorithm(find, cbsFind);
    var dsuUnion = new Algorithm(union, cbsUnion);

    d3.select("#dsu-tab .code")
	.append("pre")
    //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuFind.toString());

    d3.select("#dsu-tab .code")
	.append("pre")
    //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuUnion.toString());

    /*calls google-prettify to make the code look nice*/
    prettyPrint();


    var iter = 3;
    while(iter > 0)
    {
	iter--;
	//data.shuffle();
	//union(data[0], data[1]);
    }

    data.forEach(function(d) { d.rank = 0;});

    o.forEach(drawTreeFun);

}());
