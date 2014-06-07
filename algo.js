/////////////////////////////////////////////////////////////////
// Algorithm class begin ///
/////////////////////////////////////////////////////////////////
/**
 * This class represents source code which has been decorated
 * with user defined callbacks on arbitrary, user-defined code lines
 * This decorated source code can then be executed using Algorithm#run
 * @author mpapanek
 */
 function Algorithm(func, callbacks)
{
	this.func = func;
	this.param = func.toString().match(/\(([^\(\)]*)\)/);
	this.callbacks = callbacks;
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
}

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
			nfun += "self.callbacks["+i+"]("+this.getParams()+");\n";
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
	console.log(args);
	//preserve this for the eval inside var self
	var self = this;
	eval(c);
}
Algorithm.prototype.callback = function() {
	console.log("called");
}
/////////////////////////////////////////////////////////////////
// Algorithm class end ///
/////////////////////////////////////////////////////////////////