function TextTypingPlugin(typing_delay_millis) {
    this.typing_delay_millis = typing_delay_millis != undefined ? typing_delay_millis : 250;
}

TextTypingPlugin.prototype.animateText = function(text, container) {
    if (typeof container.text != "function") {
	console.error("The container must contain a text function. The passed argument does not :", container);
    }
    
    this.__loop(container, text, 0);
    return (text.length - 1) * this.typing_delay_millis;
}


TextTypingPlugin.prototype.__loop = function(container, text, pos) {

    console.log("calling", pos, this.typing_delay_millis);
    
    if (pos == text.length) {
	return;
    }
    
    var old_text = container.text();
    container.text(old_text + "" + text[pos]);

    var self = this;
    setTimeout(function() {
	self.__loop(container, text, pos + 1);
    }, this.typing_delay_millis);
}
