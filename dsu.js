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

(function chart() {
    var cbsFind = {};
    var cbsUnion = {};
    cbsFind[3] = function(a, data) {
	console.log("in find with a=",a,"and root =",data[a].root);
    }
    cbsUnion[3] = function(r1,r2,a,b) {
	console.log("for a=",a,"parent=",r1,"for b=",b,"parent=",r2);  
    }
    cbsUnion[8] = function(b) {
	console.log("the new root is parent of ",b);  
    }
    cbsUnion[12] = function(a) {
	console.log("the new root is parent of ",a);  
    }
    cbsUnion[16] = function(prob) {
	console.log("both trees have the same size, we rolled a die and got", prob);  
    }

    var dsuFind = new Algorithm(find, cbsFind);
    var dsuUnion = new Algorithm(union, cbsUnion);


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
		console.log(selected[1].data, data);
		var selected1 = selected[0].data.name;
		var selected2 = selected[1].data.name;
		var findInClosure = function(node, data) {
		    return dsuFind.run(node, data);
		}
		dsuUnion.run(selected1, selected2, data, findInClosure);
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



    d3.select("#dsu-tab .code")
	.append("pre")
    //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuFind.decorated());

    d3.select("#dsu-tab .code")
	.append("pre")
    //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
        .attr("class", "prettyprint lang-js linenums:1")
	.append("code")
        .attr("class", "language-js")
        .text(dsuUnion.decorated());

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
