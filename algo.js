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

    var tokens = func.toString().split("\n");
    var LN = tokens.length;
    var result = undefined;
    var args = this.param[1].split(",");
    
    var var_pat = /\s*var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/;
    var _found_vars = args.length;
    for (var i=0; i < LN; i++) {
	// direct eval uses the global context
	var trimmed = $.trim(tokens[i]);
	var result = trimmed.match(var_pat);
	if (result != null) {
	    args += "," + result[1];
	    this.var_map[_found_vars] = {"row_num" : i, "name" : result[1]};
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
	setTimeout(function() {
	    $(rowToHighlightSelector).toggleClass("highlighted-row");
	}, startDelay + durationOfHighlight);
    };

    this.preRowExecute = function(row_num) {
	//console.log("in pre exec for row ", row_num, codeContainerId);
	var highlight_start_time = this.AlgorithmContext.cumulative_delay;
	highlightRow(row_num, highlight_start_time, this.AlgorithmContext.default_animation_duration);
	this.AlgorithmContext.cumulative_delay += this.AlgorithmContext.default_animation_duration;
    }

    this.postRowExecute = function(row_num, animation_duration, var_array) {
	
	if (animation_duration == undefined) {
	    animation_duration = this.AlgorithmContext.default_animation_duration;
	}

	var highlight_start_time = this.AlgorithmContext.cumulative_delay;
	highlightRow(row_num, highlight_start_time, animation_duration);

	this.AlgorithmContext.cumulative_delay = highlight_start_time + animation_duration;

	var selfie = this;
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
	    if (i in this.callbacks)
	    {
		var fun_param = this.callbacks[i].toString().match(/\(([^\(\)]*)\)/);
		nfun += ", self.callbacks["+i+"]("+fun_param[1].split(",")+")";
	    }
	    else
	    {
		nfun += ", " + ((i == 0) ? this.AlgorithmContext.default_animation_duration : 0);
	    }
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

/**
 * Start algorithm animation
 */
Algorithm.prototype.startAnimation = function() {
    this.AlgorithmContext.cumulative_delay = 0;
    this.run.apply(this, arguments);
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
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
