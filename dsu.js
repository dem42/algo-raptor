var jsondata = {name: "a", children: [
{name: "b", children: [
{name: "c"}
]},
{name: "d"}
]},
margin = { left: 10, top: 10, right: 10, bottom: 10},
height = 150,
width = 800,
o = [{name:"1"},{name:"2"},{name:"3"},{name:"4"}],
tree = d3.layout.tree().size([width-20, height-20])
  .children(function(d) {
    return d.children;
  // var res = [];
  // for(var i=o.length-1;i>=0;i--) 
  //   if(o[i].root === d)
  //     res.push(i);
  // console.log(res);
  // return res;
}),
nodes = tree.nodes(jsondata),
links = tree.links(nodes);

var svg = d3.select("#dsu-tab .graphics").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var diagonal = d3.svg.diagonal();
svg.selectAll(".link")
  .data(links)
 .enter().append("path")
  .attr("class", "link")
  .attr("d", diagonal);
svg.selectAll(".node")
  .data(nodes)
 .enter().append("g")
  .attr("class", "node")
 .append("circle")
  .attr("r", 4.5)
  .attr("cx", function(d) { return d.x; })
  .attr("cy", function(d) { return d.y; });

Array.prototype.shuffle = function(){ 
    for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x) ;
};

function dsu(data, r1, r2, a, b) {

  data.forEach(function(d) { d.rank = 0;});
  var data_c = [];
  for(var i=0;i<data.length;i++) data_c.push(i);
  var N = data.length-1;
  var find = function(a) {
    while(data[a] !== undefined && data[a].root !== undefined)
      a = data[a].root;
    return a;
  }

  var union = function (a, b) {
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

  var iter = 3;
  while(iter > 0)
  {
    iter--;
    data_c.shuffle();
    union(data_c[0], data_c[1]);
    console.log(data_c);
  }
}

var cbs = {};
cbs[14] = function(data,r1,r2,a,b) {
  console.log("r1=",r1,data[r1].rank,data[r1].root,a,b);
}
cbs[15] = function(data,r1,r2,a,b) {
  console.log("r2=",r2,data[r2].rank,data[r2].root,a,b);  
}
cbs[48] = function(data,r1,r2,a,b) {
  console.log("data=",data);  
}


var dsugo = new Algorithm(dsu, cbs);

d3.select("#dsu-tab .code")
      .append("pre")
        //to get line numbering use .attr("class", "prettyprint lang-js linenums:1 highlight:10")
         .attr("class", "prettyprint lang-js linenums:1")
      .append("code")
         .attr("class", "language-js")
         .text(dsugo.decorated());
  /*calls google-prettify to make the code look nice*/
  prettyPrint();


dsugo.run(o);