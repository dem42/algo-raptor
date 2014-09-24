/////////////////////////////////////////////////////////////////
// Algorithm class begin ///
/////////////////////////////////////////////////////////////////
/**
 * This class represents source code which has been decorated
 * with user defined callbacks on arbitrary, user-defined code lines
 * This decorated source code can then be executed using Algorithm#run
 *
 * Callbacks added to the algorithm can bind to any local variable inside
 * the algorithm. The binding is by name, this means that when defining the
 * callback you should give the callback arguments the same name as the
 * name of the local variable that they should bind to.
 *
 * @author mpapanek
 */
function Algorithm(func, callbacks, codeContainerId, algorithmContext)
{
    this.func = func;
    this.param = func.toString().match(/\(([^\(\)]*)\)/);
    this.callbacks = callbacks;
    this.var_map = {};
    this.varname_map = {};
    this.funcName = func.toString().match(/function\s*(.*?)\s*\(/)[1];
    this.animation_queue = [];

    var tokens = func.toString().split("\n");
    var LN = tokens.length;
    var result = undefined;
    var args = this.param[1].split(",");
    for (var i=0;i < args.length; i++) {
	this.varname_map[$.trim(args[i])] = {"row_num": 0, "idx": i};
    }

    var var_pat = /\s*var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/;
    var _found_vars = args.length;
    for (var i=0; i < LN; i++) {
	// direct eval uses the global context
	var trimmed = $.trim(tokens[i]);
	var result = trimmed.match(var_pat);
	if (result != null) {
	    args += "," + result[1];
	    this.var_map[_found_vars] = {"row_num" : i, "name" : result[1]};
	    this.varname_map[result[1]] = {"row_num" : i, "idx" : _found_vars};
	    _found_vars++;
	}
    }
    this.found_vars = args;
    /*
     * Algorithm context which stores functions and variables accessible from inside the callbacks. 
     */
    this.AlgorithmContext = algorithmContext;

    function getRowToHighlightSelector(rowNumber, codeContainerId) {
	return "#" + codeContainerId + " li:nth-child(" + (rowNumber + 1) +")";
    }

    function highlightRow(rowNumber, startDelay, durationOfHighlight) {
	var rowToHighlightSelector = getRowToHighlightSelector(rowNumber, codeContainerId);
	setTimeout(function() {
	    $(rowToHighlightSelector).toggleClass("highlighted-row");
	}, startDelay);
	if (durationOfHighlight != undefined) {
	    setTimeout(function() {
		$(rowToHighlightSelector).toggleClass("highlighted-row");
	    }, startDelay + durationOfHighlight);
	}
    };

    this.preRowExecute = function(row_num) {
	var self = this;
	this.animation_queue.push(function() {
	    var highlight_start_time = self.AlgorithmContext.cumulative_delay;
	    highlightRow(row_num, highlight_start_time, self.AlgorithmContext.default_animation_duration);
	    self.AlgorithmContext.cumulative_delay += self.AlgorithmContext.default_animation_duration;
	});
    }

    this.postRowExecute = function(row_num, var_array0) {
	
	var var_array = AlgorithmUtils.clone(var_array0);
	var selfie = this;
	this.animation_queue.push(function() {
	    var animation_duration;
	    if (row_num in selfie.callbacks)
	    {
		var fun_param = selfie.callbacks[row_num].toString().match(/\(([^\(\)]*)\)/);
		var param_vals = [];
		fun_param[1].split(",").forEach(function(p) {
		    var trimmed = $.trim(p);
		    if (trimmed == "") {
			return;
		    }
	    	    param_vals.push(var_array[selfie.varname_map[$.trim(p)].idx]);
		});
		animation_duration = selfie.callbacks[row_num].apply(selfie.callbacks, param_vals);
	    }
	    else
	    {
		animation_duration = ((row_num == 0) ? selfie.AlgorithmContext.default_animation_duration : 0);
	    }

	    if (animation_duration == undefined) {
		animation_duration = selfie.AlgorithmContext.default_animation_duration;
	    }

	    var highlight_start_time = selfie.AlgorithmContext.cumulative_delay;
	    highlightRow(row_num, highlight_start_time, animation_duration);

	    selfie.AlgorithmContext.cumulative_delay = highlight_start_time + animation_duration;

	    var_array.forEach(function(var_elem, idx) {
		if (selfie.var_map[idx] == undefined) {
		    return;
		}
		var rowToHighlightSelector = getRowToHighlightSelector(selfie.var_map[idx].row_num, codeContainerId);
		if (var_elem == undefined) {
		    setTimeout(function() {
			var comment_span = d3.select(rowToHighlightSelector).select("code").select("span.com");
			if (comment_span.empty()) {
			    comment_span.remove();
			}
		    }, selfie.AlgorithmContext.cumulative_delay);
		}
		else {
		    setTimeout(function() {
			var code = d3.select(rowToHighlightSelector).select("code");
			var comment_span = code.select("span.com");
			if (comment_span.empty()) {
			    code.append("span").attr("class", "com");
			}
			code.select("span.com").text("  //" + selfie.var_map[idx].name + " = " + var_elem);
		    }, selfie.AlgorithmContext.cumulative_delay);
		}
	    });
	});
    }

    // variables that are used in callbacks must be set here
    this.callbacks["AlgorithmContext"] = this.AlgorithmContext;
    this.callbacks["var_map"] = this.var_map;
    this.codeContainerId = codeContainerId;
}
/* statics */
Algorithm.paramArg = function(N) {
    var res = "";
    for(var i=0;i<N;i++)
    {
	res+="arguments["+i+"]";
	if(i != N-1)
	    res+=",";
    }
    return res;
};
/********************************************************************************/
/* methods .. passed to all objects of this class and called using the instance */
/********************************************************************************/
/**
 * decorates the string representation of a function
 * with callbacks on the provided lines
 */
Algorithm.prototype.addDebugging = function(fstr) {
    var lmp = {}, i, nfun, tokens;
    if (typeof(fstr) != "string")
    {
	fstr = fstr.toString();
    }
    nfun = "";
    tokens = fstr.split("\n");
    for (i=0;i<tokens.length;i++)
    {
	if (i > 0 && $.trim(tokens[i]) != "" && $.trim(tokens[i]).indexOf("{") != 0 && $.trim(tokens[i]).indexOf("else") != 0) {
	    nfun += "self.preRowExecute(" + i + ");";
	}

   	nfun += tokens[i];
	if (i < tokens.length-1 && ($.trim(tokens[i+1]).indexOf("{") != 0) && ($.trim(tokens[i+1]).indexOf("else") != 0)) { 
	    // add the handle row function to every row except for the first and last
	    // this function will deal with row highlighting and var printing
	    nfun += "self.postRowExecute(" + i;
	    nfun += ", [" + this.found_vars + "]);";

	}
	nfun += "\n";
    }
    return nfun;
}
/**
 * Returns the number of parameters of the original function
 */
Algorithm.prototype.getParams = function(){
    return this.param[1].split(",");
}
/**
 * Returns the string representation of the original undecorated function
 */
Algorithm.prototype.toString = function(){
    return this.func.toString();
}
/**
 * Returns a string representation of the decorated function. 
 * A decorated function is one that has callbacks, preExecuteRow and postExecuteRows inserted in its source code
 */
Algorithm.prototype.decorated = function() {
    return this.addDebugging(this.func);
}

Algorithm.prototype.getAnimationQueue = function() {
    return this.animation_queue;
}

/**
 * Start algorithm animation
 */
Algorithm.prototype.startAnimation = function() {
    this.animation_queue = []; // reset the animation queue
    this.AlgorithmContext.cumulative_delay = 0;
    this.run.apply(this, arguments);

    var self = this;
    setTimeout(function() {
	self.runStack();
	}, 1000);
}

/** 
 * Execute the function with using animating the algorithm using the cumulative delay 
 */
Algorithm.prototype.run = function() {
    var N = this.getParams().length;
    var c = "("+this.decorated()+")("+Algorithm.paramArg(N)+");";
    //preserve this for the eval inside var self
    var self = this;
    //console.log(c);
    return eval(c);
}

Algorithm.prototype.runWithSharedAnimationQueue = function(algorithmToShareWith) {
    if (!Algorithm.prototype.isPrototypeOf(algorithmToShareWith)) {
	console.error("First argument to runWithSharedAnimationQueue must have a prototype of Algorithm");
	return;
    }
    this.animation_queue = algorithmToShareWith.getAnimationQueue();
    var params = Array.prototype.slice.call(arguments);
    params.shift();
    return this.run.apply(this, params);
}

Algorithm.prototype.runStack = function() {
    for (var i=0;i<this.animation_queue.length;i++) {
	this.animation_queue[i].call(this);
    }
}
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
