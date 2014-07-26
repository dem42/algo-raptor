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

    /*
     * Algorithm context which stores functions and variables accessible from inside the callbacks. 
     */
    this.AlgorithmContext = {
	// animation duration for row highlights
	default_animation_duration : 100,
	// callback html code row highlighting function
	highlightRow : function(rowNumber, startDelay, durationOfHighlight) {
	    var rowToHighlightSelector = "#" + codeContainerId + " li:nth-child(" + rowNumber +")";
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
	cumulative_delay : 0,
    };

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
	if (i in this.callbacks)
	{
	    var fun_param = this.callbacks[i].toString().match(/\(([^\(\)]*)\)/);
	    nfun += "self.callbacks["+i+"]("+fun_param[1].split(",")+");\n";
	}
   	nfun += tokens[i]+"\n";
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
    var args = Algorithm.paramArg(N);
    var c = "("+this.decorated()+")("+args+");";
    //preserve this for the eval inside var self
    var self = this;
    return eval(c);
}
Algorithm.prototype.callback = function() {
    console.log("called");
}
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
