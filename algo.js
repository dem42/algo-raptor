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
function Algorithm(func, callbacks, codeContainerId)
{
    this.func = func;
    this.param = func.toString().match(/\(([^\(\)]*)\)/);
    this.callbacks = callbacks;

    var tokens = func.toString().split("\n");
    var LN = tokens.length;
    var result = undefined;
    var args = this.param[1].split(",");
    
    var var_pat = /\s+var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s+=/;
    var _found_vars = args.length;
    for (var i=0; i < LN; i++) {
	// direct eval uses the global context
	var trimmed = $.trim(tokens[i]);
	var result = trimmed.match(var_pat);
	if (result != null) {
	    args += "," + result[1];
	    _found_vars++;
	}
    }
    this.found_vars = args;
    console.log("in build vars : ", args);

    /*
     * Algorithm context which stores functions and variables accessible from inside the callbacks. 
     */
    this.AlgorithmContext = {
	// animation duration for row highlights
	default_animation_duration : 500,
	// callback html code row highlighting function
	highlightRow : function(rowNumber, startDelay, durationOfHighlight) {
	    var rowToHighlightSelector = "#" + codeContainerId + " li:nth-child(" + (rowNumber + 1) +")";
	    setTimeout(function() {
		$(rowToHighlightSelector).toggleClass("highlighted-row");
	    }, startDelay);
	    setTimeout(function() {
		$(rowToHighlightSelector).toggleClass("highlighted-row");
	    }, startDelay + durationOfHighlight);
	},
	/*
	 * This delay counter can be accessed from within the callbacks.
	 * It is meant to be used to sync the visualization transitions
	 * this means you would say d3.select(..).transition().delay(this.cumulative_delay).duration(animation_duration)
	 */
	cumulative_delay : 1000,
    };

    this.handleRow = function(row_num, animation_duration) {
	
	var highlight_start_time = this.AlgorithmContext.cumulative_delay;
	this.AlgorithmContext.highlightRow(row_num, highlight_start_time, animation_duration);

	this.AlgorithmContext.cumulative_delay = highlight_start_time + animation_duration;
	console.log("called for row", row_num, "and animation duration", animation_duration);

    }

    this.callbacks["AlgorithmContext"] = this.AlgorithmContext;
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

//Algorithm.highlightRow = 

/* methods .. passed to all objects of this class and called using the instance */
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
   	nfun += tokens[i];
	if (i < tokens.length-1 && ($.trim(tokens[i+1]).indexOf("{") != 0) && ($.trim(tokens[i+1]).indexOf("else") != 0)) { 
	    // add the handle row function to every row except for the first and last
	    // this function will deal with row highlighting and var printing
	    nfun += "self.handleRow(" + i;
	    if (i in this.callbacks)
	    {
		var fun_param = this.callbacks[i].toString().match(/\(([^\(\)]*)\)/);
		nfun += ", self.callbacks["+i+"]("+fun_param[1].split(",")+")";
	    }
	    else
	    {
		nfun += ", " + this.AlgorithmContext.default_animation_duration;
	    }
	    nfun += ", " + this.found_vars + ");";

	}
	nfun += "\n";
    }
    return nfun;
}
Algorithm.prototype.getParams = function(){
    return this.param[1].split(",");
}
Algorithm.prototype.toString = function(){
    return this.func.toString();
}
Algorithm.prototype.decorated = function() {
    return this.addDebugging(this.func);
}
Algorithm.prototype.run = function() {
    var N = this.getParams().length;
    var c = "("+this.decorated()+")("+Algorithm.paramArg(N)+");";
    //preserve this for the eval inside var self
    var self = this;

    console.log(c);

    this.AlgorithmContext.cumulative_delay = 1000;

    return eval(c);
}
Algorithm.prototype.callback = function() {
    console.log("called");
}
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
