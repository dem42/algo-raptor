/////////////////////////////////////////////////////////////////
// Algorithm class ///
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
var ALGORITHM_MODULE = (function(ALGORITHM_MODULE, $, d3) {

    // alias our algorithm module
    var _my = ALGORITHM_MODULE;
    if (_my == undefined) {
	throw "Algorithm module is not defined!";
    }

    console.debug("executing definitions of algo.js")

    function Algorithm(func, callbacks, codeContainerId, algorithmContext, resetControlsFunction)
    {
	this.codeContainerId = codeContainerId;
	this.func = func;
	this.param = func.toString().match(/\(([^\(\)]*)\)/);
	this.callbacks = callbacks;
	this.var_map = {};
	this.varname_map = {};
	this.funcName = func.toString().match(/function\s*(.*?)\s*\(/)[1];
	this.animation_queue = [];
	// used by the runStack command to kick off the animation in continuous mode
	this.runningInContMode = false;
	// used by the runStack command to kick off the animation in step mode
	this.runningInStepMode = false;
	this.runningCodeStack = [];
	this.functionStack = [];
	this.return_rows = {};
	this.resetControls = resetControlsFunction;

	var tokens = func.toString().split("\n");
	var LN = tokens.length;
	this.lastRowNum = LN;
	var result = undefined;
	var args = this.param[1].split(",");
	for (var i=0;i < args.length; i++) {
	    this.varname_map[$.trim(args[i])] = {"row_num": 0, "idx": i};
	}

	var var_pat = /\s*var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/;
	var ret_pat = /^return\s*;|^return\s+.*|.*\s+return\s*;|.*\s+return\s+.*/;
	var _found_vars = args.length;
	for (var i=0; i < LN; i++) {
	    // direct eval uses the global context so the variable names are in global
	    var trimmed = $.trim(tokens[i]);
	    var strm = trimmed.substring(0,2);
	    if (strm == "//" || strm == "/*") {
		continue;
	    }
	    var result = trimmed.match(var_pat);
	    if (result != null) {
		args += "," + result[1];
		this.var_map[_found_vars] = {"row_num" : i, "name" : result[1]};
		this.varname_map[result[1]] = {"row_num" : i, "idx" : _found_vars};
		_found_vars++;
	    }
	    this.return_rows[i] = ret_pat.test(tokens[i]) || i == LN-1;
	}
	this.found_vars = args;
	/*
	 * Algorithm context which stores functions and variables accessible from inside the callbacks. 
	 */
	this.AlgorithmContext = algorithmContext;

	function getRowToHighlightSelector(rowNumber, codeContainerId) {
	    return "." + codeContainerId + " div:last-of-type li:nth-child(" + (rowNumber + 1) +")";
	}

	this.highlightRow = function highlightRow(codeContainerId, rowNumber, startDelay, durationOfHighlight) {
	    var rowToHighlightSelector = getRowToHighlightSelector(rowNumber, codeContainerId);
	    setTimeout(function() {
		$(rowToHighlightSelector).toggleClass("highlighted-row");
	    }, startDelay);
	    if (durationOfHighlight != undefined) {
		setTimeout(function() {
		    $(rowToHighlightSelector).toggleClass("highlighted-row");
		}, startDelay + durationOfHighlight);
	    }
	    return startDelay + durationOfHighlight;
	};

	this.removeAllRowHighlighting = function(codeContainerId) {
	    d3.selectAll("." + codeContainerId + " .highlighted-row").classed("highlighted-row", false);
	};

	/*** we need a pre-row and a post-row because some rows like for loop and ifs may not get to the end 
             of the row if the condition fails but we would still like to see them executed **/
	this.preRowExecute = function(row_num, var_array0) {
	    var var_array = _my.AlgorithmUtils.clone(var_array0);
	    var selfie = this;
	    this.animation_queue.push(new AnimationFrame("pre", row_num, this.return_rows, this.codeContainerId, function() {
		var animation_duration;
		if (row_num in selfie.callbacks && selfie.callbacks[row_num].pre !== undefined)
		{
		    var callback_obj = selfie.callbacks[row_num].pre;
		    var fun_param = callback_obj.toString().match(/\(([^\(\)]*)\)/);
		    var param_vals = [];
		    fun_param[1].split(",").forEach(function(p) {
			var trimmed = $.trim(p);
			if (trimmed == "") {
			    return;
			}
			if (selfie.varname_map[$.trim(p)].idx == undefined) {
			    console.error("Your callback is looking for a variable named", p, "which isn't defined in the function", selfie.funcName);
			}
	    		param_vals.push(var_array[selfie.varname_map[$.trim(p)].idx]);
		    });
		    animation_duration = callback_obj.apply(selfie.callbacks, param_vals);
		}
		else
		{
		    animation_duration = selfie.AlgorithmContext.default_animation_duration;
		}
		return animation_duration;
	    }));
	};

	/**** post row does the printing debug info inside the algorithm and  keeping track of variable values **/
	this.postRowExecute = function(row_num, var_array0) {
	    
	    var var_array = _my.AlgorithmUtils.clone(var_array0);
	    var selfie = this;
	    this.animation_queue.push(new AnimationFrame("post", row_num, this.return_rows, this.codeContainerId, function() {
		var animation_duration;
		var callback_obj = (row_num in selfie.callbacks) ? selfie.callbacks[row_num] : undefined;
		if (typeof callback_obj === "object") {
		    callback_obj = ("post" in callback_obj) ? callback_obj.post : undefined;
		}
		if (callback_obj !== undefined)
		{
		    var fun_param = callback_obj.toString().match(/\(([^\(\)]*)\)/);
		    var param_vals = [];
		    fun_param[1].split(",").forEach(function(p) {
			var trimmed = $.trim(p);
			if (trimmed == "") {
			    return;
			}
			if (selfie.varname_map[$.trim(p)].idx == undefined) {
			    console.error("Your callback is looking for a variable named", p, "which isn't defined in the function", selfie.funcName);
			}
	    		param_vals.push(var_array[selfie.varname_map[$.trim(p)].idx]);
		    });
		    animation_duration = callback_obj.apply(selfie.callbacks, param_vals);
		}
		else
		{
		    animation_duration = selfie.AlgorithmContext.default_animation_duration;
		}

		if (animation_duration == undefined) {
		    animation_duration = selfie.AlgorithmContext.default_animation_duration;
		}

		var_array.forEach(function(var_elem, idx) {
		    if (selfie.var_map[idx] == undefined) {
			return;
		    }
		    var rowToHighlightSelector = getRowToHighlightSelector(selfie.var_map[idx].row_num, codeContainerId);
		    /*** add or remove dynamic debugging info **/
		    if (var_elem == undefined) {
			setTimeout(function() {
			    var comment_span = d3.select(rowToHighlightSelector).select("code").select("span.com");
			    if (comment_span.empty()) {
				comment_span.remove();
			    }
			}, animation_duration);
		    }
		    else {
			setTimeout(function() {
			    var code = d3.select(rowToHighlightSelector).select("code");
			    var comment_span = code.select("span.com");
			    if (comment_span.empty()) {
				code.append("span").attr("class", "com dynamic");
			    }
			    code.select("span.com").text("  //" + selfie.var_map[idx].name + " = " + Algorithm.getTextForPrinting(var_elem));
			}, animation_duration);
		    }
		});
		return animation_duration;
	    }));
	};

	// variables that are used in callbacks must be set here
	this.callbacks["AlgorithmContext"] = this.AlgorithmContext;
	this.callbacks["var_map"] = this.var_map;
	this.codeContainerId = codeContainerId;
    }
    /* statics */
    Algorithm.getTextForPrinting = function(object) {
	/** testing strict equality of type to numeric and rounding to see if it is a double**/
	if (typeof object === "number" && Math.round(object) != object) {
	    return Math.round10(object, -4);
	}
	return object;
    }

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
	    // preExecute is for rows like if or while conditions that get evaluated to false
	    if (i > 0 && $.trim(tokens[i]) != "" && $.trim(tokens[i]).indexOf("{") != 0 && $.trim(tokens[i]).indexOf("else") != 0) {
		nfun += "self.preRowExecute(" + i + ", [" + this.found_vars + "]);";
	    }

   	    nfun += tokens[i];
	    if (i < tokens.length-1 && ($.trim(tokens[i+1]).indexOf("{") != 0) && ($.trim(tokens[i+1]).indexOf("else") != 0)) { 
		// add the handle row function to every row except for the first and last
		// this function will deal with row highlighting and var printing
		nfun += "self.postRowExecute(" + i + ", [" + this.found_vars + "]);";

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
    Algorithm.prototype.getDecorated = function() {
	return this.addDebugging(this.func);
    }

    Algorithm.prototype.getAnimationQueue = function() {
	return this.animation_queue;
    }

    /**
     * Start algorithm animation
     */
    Algorithm.prototype.startAnimation = function() {
	this.runningInContMode = false;
	this.runningCodeStack = [];
	this.functionStack = [];
	this.animation_queue = []; // reset the animation queue
	var result = this.run.apply(this, arguments);
	return result;
    }

    /** 
     * Execute the function with using animating the algorithm
     *
     * IF YOU WANT TO RUN WITH A SHARED ANIMATION QUEUE USE runWithSharedAnimationQueue TO WRAP THE INNER ALGO INSTEAD OF THIS
     */
    Algorithm.prototype.run = function() {
	var N = this.getParams().length;
	var c = "("+this.getDecorated()+")("+Algorithm.paramArg(N)+");";
	//preserve this for the eval inside var self
	var self = this;
	//console.log(c);
	return eval(c);
    }

    // a visualization is always limited to just one animation queue
    // this will be the animation queue of the function that you started with startAnimation
    // if you have multiple functions and want to visualize the calling of these other functions you 
    // can use the runWithSharedAnimationQueue function to attach them
    //
    // IF YOU DONT WANT TO RUN WITH A SHARED ANIMATION QUEUE USE run TO WRAP THE INNER ALGO INSTEAD OF THIS
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
	this.runningInContMode = true;
	this.__executeNextRow();
    }

    Algorithm.prototype.executeNextRowInStepMode = function() {
	if (this.animation_queue.length > 0) {
	    var rownum = this.animation_queue[0].rowNumber;
	    var codeId = this.animation_queue[0].codeContainerId;

	    var lastFunc = this.runningCodeStack.pop();
	    this.removeAllRowHighlighting(lastFunc);
	    this.highlightRow(codeId, rownum, 0, undefined);
	    this.runningInStepMode = true;
	    this.__executeNextRow(rownum);
	}
    }

    Algorithm.prototype.isRunning = function() {
	return this.animation_queue.length > 0;
    }

    /*** __executeNextRow is shared by both step by step and continuous execution and does all the animation frame queueing
         and recursion frame shennanigans */
    Algorithm.prototype.__executeNextRow = function(prevRowNum) {
	
	if (this.animation_queue.length > 0) {
	    var rownum = this.animation_queue[0].rowNumber;
	    var codeId = this.animation_queue[0].codeContainerId;

	    if (!this.runningInContMode && rownum != prevRowNum) {
		return;
	    }

	    var preanimation_extra_time = 0;
	    if (rownum == 0) {
		if (existsOnTheStack(codeId, this.functionStack)) {
		    preanimation_extra_time += _my.AlgorithmUtils.visualizeNewStackFrame(codeId);
		}
		this.functionStack.push(codeId);
	    }
	    var doFrameRemoval = this.animation_queue[0].isReturnRow();

	    var this_obj = this;
	    var animationFunction = this.animation_queue[0].animationFunction;
	    setTimeout(function() {
		if (this_obj.runningInContMode && rownum != prevRowNum) {
		    var lastFunc = this_obj.runningCodeStack.pop();
		    this_obj.removeAllRowHighlighting(lastFunc);
		    this_obj.highlightRow(codeId, rownum, 0, undefined);
		}

		this_obj.runningCodeStack.push(codeId);
		this_obj.animation_queue.shift();

		var animation_duration = animationFunction.call(this_obj);
		
		setTimeout(function() {
		    if (doFrameRemoval) {
			// a function has returned so we need to handle that
			if(isRecursionFrame(codeId, this_obj.functionStack)) {
			    var removal_duration = _my.AlgorithmUtils.popStackFrame(codeId);
			    setTimeout(function() {
				this_obj.__executeNextRow(rownum);
			    }, removal_duration);
			}
			else {
			    _my.AlgorithmUtils.clearComments(codeId);
			    this_obj.__executeNextRow(rownum);
			}
			this_obj.functionStack.pop();
		    }
		    else {
			this_obj.__executeNextRow(rownum);
		    }
		}, animation_duration);
	    }, preanimation_extra_time);
	}
	else {
	    var lastFunc = this.runningCodeStack.pop();
	    this.removeAllRowHighlighting(lastFunc);
	    if(this.resetControls != undefined) {
		this.resetControls(this.codeContainerId);
	    }
	    this.runningInContMode = false;
	    this.runningInStepMode = false;
	}
	
	function existsOnTheStack(codeId, stack) {
	    var N = stack.length;
	    for (var i=0;i<N;i++) {
		if (stack[i] == codeId) return true;
	    }
	    return false;
	}

	function isRecursionFrame(codeId, stack) {
	    var N = stack.length;
	    var cnt = 0;
	    for (var i=0;i<N;i++) {
		if (stack[i] == codeId) {
		    cnt++;
		}
	    }
	    return cnt > 1;
	}
    }

    function AnimationFrame(type, rowNumber, returnRows, codeContainerId, animationFunction) {
	this.type = type;
	this.rowNumber = rowNumber;
	this.animationFunction = animationFunction;
	this.codeContainerId = codeContainerId;
	this.returnRows = returnRows
    }
    AnimationFrame.prototype.isReturnRow = function() {
	return this.returnRows[this.rowNumber];
    }
    
    _my.Algorithm = Algorithm;
    return _my;
})(ALGORITHM_MODULE, $, d3);
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////
