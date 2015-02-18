ALGORITHM_MODULE.fenwick_module = (function chart(ALGORITHM_MODULE, $, d3, bootbox) {

    // alias our algorithm module -- since we are running this code from main it must be ready
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    var algorithmTabId = "fenwick-tab";
    var algorithmName = "Fenwick tree";
    var N = 16;
    var tree = new Array(N + 1);
    var input_data = new Array(N);
    tree.fill(0);
    input_data.fill(0);
    var idxs = [];
    for (var i = 1; i <= N; i++) {
	idxs.push(i);
    }

    /*******************************/
    /*      Setup the panels       */
    /*******************************/
    console.debug("downloaded fenwick");

    var layout = _my.AlgorithmUtils.setupLayout(algorithmTabId, algorithmName,  {priority:"fenwick"}, [7, 5], "You may modify the input array here:");
    var fen_container = layout.customControlsLayout.append("div").attr("class", "clearfix").style("width", "100%");
    var float_container = fen_container.append("div").attr("class", "fen-float-container pull-left")
    var fen_labels = float_container.append("div").attr("class", "fen-labels");
    var fen_forms = float_container.append("div").attr("class", "fen-forms");
    var fenIndexData = fen_container.append("div").attr("class", "fen-index-data");
    var summaryField = fenIndexData.append("p");
    summaryField.append("span").attr("class", "fen-dyn-lbl").text("");
    summaryField.append("span").attr("class", "fen-dyn-val").text("");
    var currentField = fenIndexData.append("p");
    currentField.append("span").attr("class", "fen-dyn-lbl").text("index: ");
    currentField.append("span").attr("class", "fen-dyn-val").text("");
    var minusCurrentField = fenIndexData.append("p");
    minusCurrentField.append("span").attr("class", "fen-dyn-lbl").text("-index: ");
    minusCurrentField.append("span").attr("class", "fen-dyn-val").text("");
    var andCurrentField = fenIndexData.append("p");
    andCurrentField.append("span").attr("class", "fen-dyn-lbl").text("index & -index: ");
    andCurrentField.append("span").attr("class", "fen-dyn-val").text("");
    var nextField = fenIndexData.append("p");
    nextField.append("span").attr("class", "fen-dyn-lbl").text("new index: ");
    nextField.append("span").attr("class", "fen-dyn-val").text("");

    fen_labels.append("span").text("index:").attr("class", "fen-table-lbl");
    var labels = d3.select(".fen-labels").selectAll("fen-label")
	.data(idxs)
	.enter().append("span")
	.attr("class","fen-label")
	.text(function(d, i) { return i+1; });

    fen_forms.append("span").text("value:").attr("class", "fen-table-lbl");
    var forms = d3.select(".fen-forms").selectAll("input[type='text']")
	.data(input_data)
	.enter().append("input")
	.attr("data-fen-index", function(d, i) {return i+1;})
	.attr("type","text")
	.attr("class","fen-input-box")
	.attr("maxlength", 1);

    layout.introductionParagraph.html("<p>This datastructure is also known as the Binary Indexed Tree. One look into the visualization section will tell you why. Maybe... The idea is that we use the binary encoding of an index to compute the parents and children of this tree.</p><p> This algorithm helps you in computing prefix aggregates in <var>O(log N)</var> time on data that can be updated. This works because we store subtree sums inside parent nodes in the tree. To compute the aggregates we then travel diagonally through the tree. If you can compute prefix sums you can then compute the sum between any two arbitrary indices as shown in the <code>sumBetween</code> code.");

    /*populate the inputs*/
    var inputs = document.querySelectorAll(".fen-forms > input[type='text']");
    for(var j=inputs.length-1;j >= 0;j--)
    {
	inputs[j].value = 0;
    }
    /*********************/
    /*** fenwick functions ***/
    /*********************/
    function sumBetween(start, end, tree, read) {
	var sum_to_end = read(end, tree);
	var sum_upto_start = read(start - 1, tree);
	var sum = sum_to_end - sum_upto_start;
	return sum;
    }

    function read(idx, tree) {
	var result = 0;
	for (var i = idx; i > 0;) {
	    result += tree[i];
	    var lowest_set_bit = (i & -i);
	    i -= lowest_set_bit;
	}
	return result;
    }
    function update(value, idx, tree) {
	for (var i = idx; i < tree.length;) {
	    tree[i] += value;
	    var lowest_set_bit = (i & -i);
	    i += lowest_set_bit;
	}
    }

    /*****************************/
    /*** svg setup and wiring ***/
    /*****************************/
    var log2N = Math.ceil(Math.log2(N));
    function bitPattern(num) {
	var res = [];
	if (num > 0) {
	    for (var i = 0; i <= log2N; i++) {
		res.push(num % 2);
		num = num >> 1;
	    }
	}
	else {
	    var carry = 1;
	    var nabs = Math.abs(num);
	    for (var i = 0; i <= log2N; i++) {
		var e = 1 - num % 2;
		res.push((e + carry)%2);
		if (e + carry == 1) {
		    carry = 0;
		}
		num = num >> 1;
	    }
	}
	return res.reverse().join("");
    }
    var sum_callbacks = [];
    var read_callbacks = [];
    var update_callbacks = [];
    var svg_data = function init() {
	var margin = { left: 10, top: 70, right: 10, bottom: 100};
	var svg = d3.select("#" + algorithmTabId + " .graphics").append("svg")
	.attr("width",  "600px")
	.attr("height", "850px")
	.style("float", "left")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("text").attr("class", "fen-text").text("Fenwick Tree:")
	var highest2Pow = 1 << log2N;
	var node_size = [461, 322];

	var cluster = d3.layout.cluster()
	    .children(function(node) {
		var lsb = (node.val & -node.val);

		node.children = [];
		var s = node.val - lsb;
		for (var i = lsb >> 1; i > 0; i = i >> 1) {
		    s += i;
		    node.children.push({val: s});
		}
		return node.children;
	    })
	    .size(node_size);

	var nodes = cluster.nodes({val: highest2Pow});
	var links = cluster.links(nodes);

	svg.selectAll("fen-link")
	    .data(links)
	    .enter()
	    .append("path").attr("class", "fen-link")
	    .attr("d", d3.svg.diagonal());

	var radius = 56;
	var fen_nodes = svg.selectAll("fen-node")
	    .data(nodes)
	    .enter()
	    .append("g")
	    .attr("class", "fen-node")
	    .attr("id", function(d) { return "fen-node-" + d.val; })
	    .attr("transform", function(d) { return "translate(" + d.x + ", " + d.y + ")"; });
	fen_nodes.append("rect")
	    .attr("class", "fen-rect")
	    .attr("x", -radius/2)
	    .attr("y", -radius/2)
	    .attr("width", radius)
	    .attr("height", radius);
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl")
	    .attr("dy", -radius/3)
	    .append("tspan")
	    .text(function(d) { return "Index: " + d.val; });
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl fen-bit")
	    .text(function(d) { return "(" + bitPattern(d.val) + ")" ; });
	fen_nodes.append("text")
	    .attr("class", "fen-node-lbl fen-sum")
	    .attr("dy", +radius/3)
	    .text(function(d) { return "Sum: " + (tree[d.val] || 0); });
	fen_nodes.append("line")
	    .attr("x1",-radius/2)
	    .attr("x2",radius/2)
	    .attr("y1",radius/6)
	    .attr("y2",radius/6);

	var arrow_holder = svg.insert("g", "g");

	result = {svg: svg, fen_nodes: nodes, arrow_holder: arrow_holder};
	return result;
    }();
    var svg = svg_data.svg;

    function highlighting(idx) {
	svg.select("#fen-node-" + idx + " > rect").classed("fen-rect-highlighted", true);
    }
    function arrowAnimate(old_idx, i) {
	var animation_duration = 2 * this.AlgorithmContext.getBaselineAnimationSpeed();
	if (i == 0 || old_idx == 0 || i > N || old_idx > N) return this.AlgorithmContext.getBaselineAnimationSpeed(); 
	var arrow_gen = _my.vislib.interpolatableDiagonal("linear");
	var data = {"source": svg.select("#fen-node-" + old_idx).datum(), "target" : svg.select("#fen-node-" + i).datum()}
	var path = svg.insert("path", "g").attr("class", "fen-arrow").attr("d", arrow_gen(data));
	var arrow = _my.vislib.animateGrowingArrow(svg_data.arrow_holder, path, animation_duration, 0, false, 1).arrow;
	arrow.attr("class", "fen-arrow-head");
	setTimeout(function() {
	    highlighting(i);
	}, animation_duration);
	return animation_duration;
    }
    function commonStartup(idx) {
	d3.selectAll(".fen-arrow-head").remove();
	d3.selectAll(".fen-arrow").remove();
	svg.selectAll(".fen-rect-highlighted").classed("fen-rect-highlighted", false);
	highlighting(idx);
    } 

    function fadeIn(elem, duration) {
	elem.transition().duration(duration).style("opacity", "1");
	return elem;
    }
    function fadeOut(elem, duration) {
	elem.transition().duration(duration).style("opacity", "0");
	return elem;
    }

    read_callbacks[0] = function(idx) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	commonStartup(idx);
	fadeIn(summaryField, animation_duration).select("span:first-child").text("sum: ");
	summaryField.select("span:last-child").text(0);
	fadeIn(currentField, animation_duration).select("span:last-child").text(bitPattern(idx));
	return animation_duration;
    }
    update_callbacks[0] = function(idx, value) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	commonStartup(idx);
	fadeIn(summaryField, animation_duration).select("span:first-child").text("increment: ");
	summaryField.select("span:last-child").text(value);
	fadeIn(currentField, animation_duration).select("span:last-child").text(bitPattern(idx));
    }
    update_callbacks[3] = function(i) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(minusCurrentField, animation_duration).select("span:last-child").text(bitPattern(-i));
	fadeIn(andCurrentField, 2 * animation_duration).select("span:last-child").text(bitPattern(i & -i));
	return animation_duration * 2;
    }
    read_callbacks[2] = update_callbacks[1] = function(i) {
	currentField.select("span:last-child").text(bitPattern(i));
	highlighting(i);
    }
    read_callbacks[4] = function(i) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(minusCurrentField, animation_duration).select("span:last-child").text(bitPattern(-i));
	fadeIn(andCurrentField, 2 * animation_duration).select("span:last-child").text(bitPattern(i & -i));
	return animation_duration * 2;
    }
    read_callbacks[5] = function(i, lowest_set_bit) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(nextField, animation_duration).select("span:last-child").text(bitPattern(i));
	return arrowAnimate.call(this, i + lowest_set_bit, i);
    }
    update_callbacks[2] = function(tree, i) {
	var animation_duration = this.AlgorithmContext.getBaselineAnimationSpeed();
	var node = svg.select("#fen-node-" + i).select(".fen-sum");
	node.classed("fen-text-highlight", true).text("Sum: " + (tree[i] || 0));
	setTimeout(function() {
	    node.classed("fen-text-highlight", false);
	}, animation_duration);
	return animation_duration;
    }
    update_callbacks[4] = function(i, lowest_set_bit) {
	var animation_duration = (1/2) * this.AlgorithmContext.getBaselineAnimationSpeed();
	fadeIn(nextField, animation_duration).select("span:last-child").text(bitPattern(i));
	return arrowAnimate.call(this, i - lowest_set_bit, i);
    }

    function cleanup() {
	d3.selectAll(".fen-arrow-head").remove();
	d3.selectAll(".fen-arrow").remove();
	d3.selectAll(".fen-label").classed("fen-label-highlighted", false);
	svg.selectAll(".fen-rect-highlighted").classed("fen-rect-highlighted", false);
	_my.AlgorithmUtils.resetControls(algorithmTabId);
	reinitButtons();
    }
    var fenwick_sum = new _my.Algorithm(sumBetween, sum_callbacks, "fen-sum-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);

    var fenwick_read_algo = new _my.Algorithm(read, read_callbacks, "fen-read-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);
    var fenwick_update_algo = new _my.Algorithm(update, update_callbacks, "fen-update-code", 
						_my.AlgorithmUtils.createAlgorithmContext(layout.defaultControlsObj),
						cleanup);


    var wrapped_read = function(idx, tree) {
	return fenwick_read_algo.runWithSharedAnimationQueue(fenwick_sum, idx, tree);
    }
    
    function initOnIndexSelection() {
	var clicked = 0;
	d3.selectAll(".fen-label").on("click", function(d) {
	    if(clicked == 1) {
		var start = d3.select(".fen-label-highlighted").datum();
		d3.select(this).classed("fen-label-highlighted", true);
		var end = d;
		console.log("starting fenwick index thing with", start, end);
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_sum, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_sum, algorithmTabId);
		fenwick_sum.run(+start, +end, tree, wrapped_read);
		play_function();
	    }
	    else {
		d3.select(this).classed("fen-label-highlighted", true);
	    }
	    clicked = (clicked + 1) % 2;
	    
	});
    };
    initOnIndexSelection();

    function initOnValueChanges() {
	$(".fen-input-box").on("input", function(d) {
	    var value = $(this).val();
	    var index = $(this).attr("data-fen-index");
	    if (!isNaN(+value)) {
		var attacher = _my.AlgorithmUtils.createAlgoAttacher();
		attacher.attach(fenwick_update_algo, algorithmTabId);
		var play_function = attacher.play_maker(fenwick_update_algo, algorithmTabId);
		fenwick_update_algo.run(+value, +index, tree);
		play_function();
	    }
	});
    }
    initOnValueChanges();

    function reinitButtons() {
	_my.AlgorithmUtils.attachAlgoToControls(fenwick_read_algo, algorithmTabId, function kickOff(executionFunction) {
	    /* The function that starts the simulation.
	     * It creates a dialog and the dialog starts the execution
	     */
	    var dialog = bootbox.dialog({
		title:"Fenwick interaction", 
		message: '<span>To start the visualization, in the "Fenwick Controls " section either click on two indices or change a value</span>',
		buttons: {
		    success: {
			label: "Ok",
			className: "btn-primary",
			callback: function() {
			}
		    }
		}
	    });
	})
    };
    reinitButtons();
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-sum-code", fenwick_sum);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-read-code", fenwick_read_algo);
    _my.AlgorithmUtils.appendCode(algorithmTabId, "fen-update-code", fenwick_update_algo);

    return {};
}(ALGORITHM_MODULE, jQuery, d3, bootbox));
