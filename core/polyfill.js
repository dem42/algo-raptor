/*** we want some functionality only available in ecma6 .. polyfill it **/
(function(Math) {
        /**
     * Decimal adjustment of a number.
     *
     * @param	{String}	type	The type of adjustment.
     * @param	{Number}	value	The number.
     * @param	{Integer}	exp		The exponent (the 10 logarithm of the adjustment base).
     * @returns	{Number}			The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
	// If the exp is undefined or zero...
	if (typeof exp === 'undefined' || +exp === 0) {
	    return Math[type](value);
	}
	value = +value;
	exp = +exp;
	// If the value is not a number or the exp is not an integer...
	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
	    return NaN;
	}
	// Shift
	value = value.toString().split('e');
	value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
	// Shift back
	value = value.toString().split('e');
	return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
	Math.round10 = function(value, exp) {
	    return decimalAdjust('round', value, exp);
	};
    }
    // Decimal floor
    if (!Math.floor10) {
	Math.floor10 = function(value, exp) {
	    return decimalAdjust('floor', value, exp);
	};
    }
    // Decimal ceil
    if (!Math.ceil10) {
	Math.ceil10 = function(value, exp) {
	    return decimalAdjust('ceil', value, exp);
	};
    }

    // fill is ecma6
    if (!Array.prototype.fill) {
	Array.prototype.fill = function(value) {
	    if (this == null) {
		throw new TypeError('this is null or not defined');
	    }
	    var O = Object(this);
	    var len = O.length >>> 0;
	    var k = 0;
	    while (k < len) {
		O[k] = value;
		k++;
	    }
	    return O;
	};
    }

    Math.log2 = Math.log2 || function(x) {
	return Math.log(x) / Math.LN2;
    };
}(Math));
