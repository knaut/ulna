(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Ulna = {};

if (typeof window === 'undefined') {
	Ulna.env = 'node'
} else {
	Ulna.env = 'browser'
}

Ulna.extend = require('./src/extend.js');
Ulna.Dispatcher = require('./src/Dispatcher.js');
Ulna.Component = require('./src/Component.js');

module.exports = Ulna;
},{"./src/Component.js":8,"./src/Dispatcher.js":9,"./src/extend.js":11}],2:[function(require,module,exports){
nerve = {};
nerve.type = 'nerve';

nerve.parse = {};
nerve.parse.css = require('./modules/parse/css.js');

nerve.toType = require('./modules/toType.js')
nerve.normalize = require('./modules/normalize.js');
nerve.stringify = require('./modules/stringify.js');

module.exports = nerve;
},{"./modules/normalize.js":3,"./modules/parse/css.js":4,"./modules/stringify.js":5,"./modules/toType.js":6}],3:[function(require,module,exports){
module.exports = function(struct) {
	var normalized = [];

	switch (this.toType(struct)) {
		case 'string':
			return struct;
			break;
		case 'array':

			// for component based library (Ulna), check if we're mixed into the component
			// prototype, and depend on its api
			if (this.type === 'component') {
				// this is uninintuitive but works because of recursion
				// when we loop, we push to the normalized struct (component's) children	
				for (var x = 0; struct.length > x; x++) {
					normalized.push = this.normalize(struct[x]);
				}

				// by setting normalized to the struct, we return the array for normalized templates
				normalized = struct;
			} else {
				// code where we assume every array holds another nerve template object
				// still want to test
				for (var i = 0; struct.length > i; i++) {

					var obj = struct[i];

					for (var key in obj) {
						var parsed = this.parse.css.selector(key);
						parsed.inner = this.normalize(obj[key]);
					}

					normalized.push(parsed)
				}
			}

			break;
		case 'object':
			var keys = Object.keys(struct);

			for (var k = 0; keys.length > k; k++) {
				var obj = {};
				var key = keys[k];
				var val = struct[key];

				obj[key] = val;

				for (var keyS in obj) {
					var parsed = this.parse.css.selector(keyS);
					parsed.inner = this.normalize(struct[keyS]);
				}

				normalized.push(parsed);
			}
			break;
		case 'function':
			// console.log('found a function', struct);

			// here we set the returned object as the result of whatever the function ran,
			// resulting in a structure that should also be normalized

			// we call this as the current context, assuming that this is a component
			normalized = this.normalize(struct.call(this));

			break;
		case 'component':
			// console.log('found a component');

			// for components we push a parent reference
			struct['parent'] = this;

			// nested components on first load won't be normalized
			// if (!struct.normalized) {
			// 	struct.normalized = this.normalize( struct.templates );
			// }

			// assuming refactored Ulna api
			// we push to a children array for convenient references
			this.children.push(struct);

			// we push to the normalized template
			// or, we could just set the normalized array as the next component structure
			// depends if we want the component's api in normalized object
			normalized = struct.normalized;
			// normalized.push( struct );

			break;
	}

	return normalized;
}
},{}],4:[function(require,module,exports){
module.exports = {
	selector: function(string) {
		// parse a CSS selector and normalize it as a a JS object
		/* 
		example:
			{
				type: 'dom',
				attrs: [ { 
					attrKey: 'data-val'
					attrVal: 'value' } ],
				classes: [ 'className' ],
				id: 'string',
				tagName: 'string'
			}
		*/

		var parsed = {
			type: 'html',
			tagName: 'div', // default element
			attrs: [],
			classes: [],
			id: ''
		};

		// check for attributes
		if (string.indexOf('[') > -1) {
			parsed.attrs = this.attrs(string);
		}

		// check for classes
		if (string.indexOf('.') > -1) {
			parsed.classes = this.classes(string);
		}

		// check for id
		if (string.indexOf('#') > -1) {
			parsed.id = this.id(string);
		}

		// check for tag name
		if (this.tagName(string)) {
			parsed.tagName = this.tagName(string);
		}

		return parsed;
	},

	tagName: function(string) {
		// parse a selector with an element name
		var reg = /^\w*/;

		var tag = string.match(reg)[0];

		if (!tag) {
			return false;
		} else {
			// list of supported dom tags
			var dom = [
				'div',
				'a',
				'p',
				'span',
				'ul',
				'li',
				'header',
				'article',
				'section',
				'nav',
				'footer',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'pre',
				'em'
			];

			for (var d = 0; dom.length > d; d++) {
				if (dom[d] === tag) {
					return tag;
				}
			}
		}
	},

	id: function(string) {
		// parse a selector with an id
		// and extract the id
		var reg = /#[\w|-]*/;

		var id = string.match(reg)[0].substring(1);

		return id;
	},

	classes: function(string) {
		// parse a selector with at least one class
		var reg = /\.[\w|-]*/g;

		var classes = string.match(reg);

		var parsed = [];
		for (var c = 0; classes.length > c; c++) {
			// chop off the .
			var classString = classes[c].substring(1);
			parsed.push(classString)
		}

		return parsed;
	},

	attrs: function(string) {
		var reg = /\[.+\]/g;

		// we will only accept attributes grouped together in the selector
		var attrs = string.match(reg);

		// treat the attrs as an array, even if there's only one
		if (attrs[0].indexOf('][') > -1) {
			attrs = attrs[0].split('][');
		}

		// push the parsed pairs to an array for later
		var parsed = [];

		for (var i = 0; attrs.length > i; i++) {

			// clean up everything
			var attr = attrs[i].replace(/'|"|\[|\]/g, '');

			// only assume the attr has a key
			var pair = {};
			if (attr.indexOf('=') > -1) {
				var split = attr.split('=');
				pair = {
					attrKey: split[0],
					attrVal: split[1]
				};
				parsed.push(pair);
			} else {
				pair = {
					attrKey: attr,
					attrVal: null
				}
				parsed.push(pair);
			}
		}

		return parsed;
	}
}
},{}],5:[function(require,module,exports){
module.exports = {
	normalized: function(normalized) {
		// let one do function do one thing:
		// take a normalized structure and recursively stringify it

		var string = '';
		for (var n = 0; normalized.length > n; n++) {
			var normalizedType = nerve.toType(normalized[n]);

			switch (normalizedType) {
				case 'object':
					string += this.object(normalized[n]);
					break;
				case 'string':
					console.log('let me know', normalized);
					break;
				case 'component':
				
					// seriously
					string += this.normalized( normalized[n].normalized );

					break;
				case 'array':
					console.log('array', normalized)
					break;
			}
		}
		return string;
	},

	object: function(obj) {
		// helps split up the control logic
		// we can stringify based on the type of object we normalized
		// or easily add more type cases in the future
		var string = '';
		switch (obj.type) {
			case 'html':
				string = this.html(obj);
				break;
			case 'function':
				string = this.func(obj);
				break;
		}
		return string;
	},

	// deprecating
	// func: function(obj) {
	// 	// can be moved to a global config later
	// 	var delimiters = {
	// 		evaluate: ['<<', '>>'],
	// 		interpolate: ['~~', '~~'],
	// 		escape: ['--', '--'],
	// 		srcBreak: '%break%'
	// 	}

	// 	var splitSrc = obj.src.split(delimiters.srcBreak);

	// 	var string = '';

	// 	// we loop based on the number of returned inner blocks
	// 	for (var s = 0; obj.inner.length > s; s++) {
	// 		// enclose the split src strings in evaluation brackets
	// 		string += delimiters.evaluate[0] + splitSrc[s] + delimiters.evaluate[1];

	// 		// we don't use stringify() here because that will cause unnecessary nested loops
	// 		// we also know its type, so we can stringify it directly
	// 		string += this.html(obj.inner[s]);
	// 	}
	// 	// we can assume there will be an ending bracket in most control structures
	// 	string += delimiters.evaluate[0] + splitSrc[s] + delimiters.evaluate[1];

	// 	return string;
	// },

	html: function(obj) {
		var string = '<' + obj.tagName;

		// id
		if (obj.id) {
			string += ' id="' + obj.id + '"';
		}

		// classes
		if (obj.hasOwnProperty('classes') && obj.classes.length) {
			string += ' class="' + obj.classes.join(' ') + '"';
		}

		// custom attrs
		if (obj.hasOwnProperty('attrs') && obj.attrs.length) {

			// loop through array of key/vals
			for (var a = 0; obj.attrs.length > a; a++) {
				var attr = obj.attrs[a];

				// for each pair, concatenate them as a single string
				var pair = []

				for (var key in attr) {
					pair.push(attr[key])
				}

				pair[1] = '"' + pair[1] + '"';
				pair = pair.join('=');

				// we add to the string each time in the loop, accounting for each attr in the array
				string += ' ' + pair;
			}
		}

		// end the opening tag
		string += '>';

		if (obj.hasOwnProperty('inner') && obj.inner.length && nerve.toType(obj.inner) !== 'string') {
			string += this.normalized(obj.inner);
		} else if (nerve.toType(obj.inner) === 'string') {
			string += obj.inner;
		}

		string += '</' + obj.tagName + '>';

		return string;
	}
}
},{}],6:[function(require,module,exports){
module.exports = function(obj) {
	// better type checking
	// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	if (obj.hasOwnProperty('type') && obj.type === 'component') {
		return 'component';
	} else {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	}
}
},{}],7:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],8:[function(require,module,exports){
var _ = require('underscore');
var nerve = require('nerve-templates');
var extend = require('./extend.js');

Component = function(obj) {
	this.type = 'component';
	this.eventsBound = false;
	this.children = [];
	this.normalized = null;
	this.$root = [];

	for (var prop in obj) {
		this[prop] = obj[prop];
	}
	
	this.initialize.call(this)

	// we bind dispatcher listeners on construction.
	// we use initialize/deinitialize for dom-related setup and teardown
	if (this.listen) {
		this.bindListen();	
	}
}

methods = {
	initialize: function() {
		// fires on construction
		this.normalized = this.normalize( this.template );	
		this.stringified = this.stringify.normalized( this.normalized );
	},

	// DOM
	bindToDOM: function() {
		this.bindRoot();
		this.bindEvents();

		return this.eventsBound;
	},

	unbindFromDOM: function() {
		this.unbindEvents();
		this.unbindRoot();

		return this.eventsBound;
	},

	bindRoot: function() {
		this.$root = $(this.root);
		
		return this.$root;
	},

	unbindRoot: function() {
		this.$root = [];
		
		return this.$root;
	},

	bindEvents: function() {
		// backbone-style hash pairs for easy event config
		this.eventsBound = true;

		for (var key in this.events) {
			var culledKey = this.cullEventKey(key);

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.on(culledKey[0], this.events[key].bind(this));
			} else {
				this.$root.find(culledKey[1]).on(culledKey[0], this.events[key].bind(this));
			}
		}

		return this.eventsBound;
	},

	unbindEvents: function() {
		this.eventsBound = false;

		for (var key in this.events) {
			var culledKey = this.cullEventKey(key);

			// shortcut to just binding the root
			if (culledKey[1] === 'root') {
				// bind the root event based on the event type and the handler we supplied
				this.$root.off(culledKey[0]);
			} else {
				this.$root.find(culledKey[1]).off(culledKey[0]);
			}
		}

		return this.eventsBound;
	},

	cullEventKey: function(key) {
		var reg = /[a-z|A-Z]*/;
		var eventString = key.match(reg)[0];
		var selector = key.replace(eventString + ' ', '');

		return [eventString, selector];
	},

	render: function() {
		return this.stringify.normalized( this.normalized );
	},

	renderToDOM: function() {
		this.$root.html( this.render() );

		return this.$root;
	},

	unrenderFromDOM: function() {
		this.$root.empty();

		return this.$root;
	},

	// FLUX
	bindListen: function() {
		// backbone-style hashes for flux-style action configuration
		for (var action in this.listen) {
			this.dispatcher.register(action, this, this.listen[action].bind(this));
		}
	},

	// CHILDREN
	bindChildren: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].bindToDOM();
		}

		return this.children;
	},

	unbindChildren: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].unbindFromDOM();
		}

		return this.children;
	},

	renderChildrenToDOM: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].bindRoot();
			this.children[c].renderToDOM();
			this.children[c].bindEvents();
		}		
	},

	unrenderChildrenFromDOM: function() {
		if (!this.children.length) return false;

		for (var c = 0; this.children.length > c; c++) {
			this.children[c].unbindEvents();
			this.children[c].unrenderFromDOM();
			this.children[c].unbindRoot();
		}		
	}
}

// we need to use the nerve object like a mixin
// every component should have access to its library

for (var prop in nerve) {
	Component.prototype[prop] = nerve[prop];
}

_.extend(Component.prototype, methods);

Component.extend = extend;

module.exports = Component;
},{"./extend.js":11,"nerve-templates":2,"underscore":7}],9:[function(require,module,exports){
var underscore = require('underscore');
var Events = require('./events.js');

var Dispatcher = function(options) {
	if (options && options.actions) {
		if (typeof options.actions === 'string') {
			this.createAction(options.actions);
		} else {
			this.createActions(options.actions);
		}
	}

	Object.defineProperty(this, '_actions', {
		enumerable: false,
		value: {}
	});

	underscore.extend(this._actions, Events);

	this.initialize.apply(this, arguments);
}

Dispatcher.prototype = {
	initialize: function() {},

	_prepareAction: function(name, callbacks) {
		var action = {};
		if (underscore.isString(name)) {
			action.name = name;
			if (callbacks) {
				if (underscore.isFunction(callbacks)) {
					action.beforeEmit = callbacks;
				} else {
					for (var c in callbacks) {
						if (callbacks.hasOwnProperty(c)) {
							action[c] = callbacks[c];
						}
					}
				}
			}
		} else {
			action = name;
		}
		return action;
	},

	createAction: function(name, callbacks) {
		var action = this._prepareAction(name, callbacks);
		var dispatch;
		var emit = function(payload) {
			this._triggerAction(action.name, payload);
		}.bind(this);
		var beforeEmit = function(payload) {
			action.beforeEmit(payload, function(newPayload) {
				emit(newPayload);
			});
		};
		var shouldEmit = function(fn) {
			return function(payload) {
				if (action.shouldEmit(payload)) {
					fn(payload);
				}
			};
		};
		if (action.shouldEmit) {
			if (action.beforeEmit) {
				dispatch = shouldEmit(beforeEmit);
			} else {
				dispatch = shouldEmit(emit);
			}
		} else if (action.beforeEmit) {
			dispatch = beforeEmit;
		} else {
			dispatch = emit;
		}
		Object.defineProperty(this, action.name, {
			enumerable: false,
			value: dispatch
		});
	},

	createActions: function(actions) {
		var action;
		for (action in actions) {
			if (actions.hasOwnProperty(action)) {
				this.createAction(actions[action]);
			}
		}
	},

	register: function(action, listener, method) {
		if (!listener) {
			throw new Error('The listener is undefined!');
		}
		method = (typeof(method) === 'function') ? method : listener[method || action];
		if (typeof(method) !== 'function') {
			throw new Error('Cannot register callback `' + method +
				'` for the action `' + action +
				'`: the method is undefined on the provided listener object!');
		}
		this._actions.on(action, method.bind(listener));
	},

	registerStore: function(actions, listener, methods) {
		var isUniqueCallback = (typeof methods) === 'string' || (typeof methods) === 'function';
		var actionsNames;
		if (underscore.isArray(actions)) {
			methods = methods || actions;
			if (!isUniqueCallback && actions.length !== methods.length) {
				throw new RangeError('The # of callbacks differs from the # of action names!');
			}
		} else if (underscore.isObject(actions)) {
			actionsNames = Object.keys(actions);
			methods = actionsNames.map(function(actionName) {
				return actions[actionName];
			});
			actions = actionsNames;
		}
		for (var i = 0, action;
			(action = actions[i]); i++) {
			this.register(action, listener, isUniqueCallback ? methods : methods[i]);
		}
	},

	dispatch: function(actionName, payload) {
		if (this.hasOwnProperty(actionName)) {
			return this[actionName](payload);
		}
		throw new Error('There is not an action called `' + actionName + '`');
	},

	_triggerAction: function(actionName, payload) {
		this._actions.trigger(actionName, payload);
	}
};

module.exports = Dispatcher;
},{"./events.js":10,"underscore":7}],10:[function(require,module,exports){
var Events = (function() {
	// Events, stolen from Backbone
	// only needed for Dispatcher at this point

	// Events
	// ---------------
	// A module that can be mixed in to *any object* in order to provide it with
	// custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = {};
	//     _.extend(object, Events);
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//

	var Events = {};
	// Regular expression used to split event strings.
	var eventSplitter = /\s+/;

	// Iterates over the standard `event, callback` (as well as the fancy multiple
	// space-separated events `"change blur", callback` and jQuery-style event
	// maps `{event: callback}`), reducing them by manipulating `memo`.
	// Passes a normalized single event name and callback, as well as any
	// optional `opts`.
	var eventsApi = function(iteratee, memo, name, callback, opts) {
		var i = 0,
			names;
		if (name && typeof name === 'object') {
			// Handle event maps.
			if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
			for (names = _.keys(name); i < names.length; i++) {
				memo = iteratee(memo, names[i], name[names[i]], opts);
			}
		} else if (name && eventSplitter.test(name)) {
			// Handle space separated event names.
			for (names = name.split(eventSplitter); i < names.length; i++) {
				memo = iteratee(memo, names[i], callback, opts);
			}
		} else {
			memo = iteratee(memo, name, callback, opts);
		}
		return memo;
	};

	// Bind an event to a `callback` function. Passing `"all"` will bind
	// the callback to all events fired.
	Events.on = function(name, callback, context) {
		return internalOn(this, name, callback, context);
	};

	// An internal use `on` function, used to guard the `listening` argument from
	// the public API.
	var internalOn = function(obj, name, callback, context, listening) {
		obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
			context: context,
			ctx: obj,
			listening: listening
		});

		if (listening) {
			var listeners = obj._listeners || (obj._listeners = {});
			listeners[listening.id] = listening;
		}

		return obj;
	};

	// Inversion-of-control versions of `on`. Tell *this* object to listen to
	// an event in another object... keeping track of what it's listening to.
	Events.listenTo = function(obj, name, callback) {
		if (!obj) return this;
		var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
		var listeningTo = this._listeningTo || (this._listeningTo = {});
		var listening = listeningTo[id];

		// This object is not listening to any other events on `obj` yet.
		// Setup the necessary references to track the listening callbacks.
		if (!listening) {
			var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
			listening = listeningTo[id] = {
				obj: obj,
				objId: id,
				id: thisId,
				listeningTo: listeningTo,
				count: 0
			};
		}

		// Bind callbacks on obj, and keep track of them on listening.
		internalOn(obj, name, callback, this, listening);
		return this;
	};

	// The reducing API that adds a callback to the `events` object.
	var onApi = function(events, name, callback, options) {
		if (callback) {
			var handlers = events[name] || (events[name] = []);
			var context = options.context,
				ctx = options.ctx,
				listening = options.listening;
			if (listening) listening.count++;

			handlers.push({
				callback: callback,
				context: context,
				ctx: context || ctx,
				listening: listening
			});
		}
		return events;
	};

	// Remove one or many callbacks. If `context` is null, removes all
	// callbacks with that function. If `callback` is null, removes all
	// callbacks for the event. If `name` is null, removes all bound
	// callbacks for all events.
	Events.off = function(name, callback, context) {
		if (!this._events) return this;
		this._events = eventsApi(offApi, this._events, name, callback, {
			context: context,
			listeners: this._listeners
		});
		return this;
	};

	// Tell this object to stop listening to either specific events ... or
	// to every object it's currently listening to.
	Events.stopListening = function(obj, name, callback) {
		var listeningTo = this._listeningTo;
		if (!listeningTo) return this;

		var ids = obj ? [obj._listenId] : _.keys(listeningTo);

		for (var i = 0; i < ids.length; i++) {
			var listening = listeningTo[ids[i]];

			// If listening doesn't exist, this object is not currently
			// listening to obj. Break out early.
			if (!listening) break;

			listening.obj.off(name, callback, this);
		}
		if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

		return this;
	};

	// The reducing API that removes a callback from the `events` object.
	var offApi = function(events, name, callback, options) {
		// No events to consider.
		if (!events) return;

		var i = 0,
			listening;
		var context = options.context,
			listeners = options.listeners;

		// Delete all events listeners and "drop" events.
		if (!name && !callback && !context) {
			var ids = _.keys(listeners);
			for (; i < ids.length; i++) {
				listening = listeners[ids[i]];
				delete listeners[listening.id];
				delete listening.listeningTo[listening.objId];
			}
			return;
		}

		var names = name ? [name] : _.keys(events);
		for (; i < names.length; i++) {
			name = names[i];
			var handlers = events[name];

			// Bail out if there are no events stored.
			if (!handlers) break;

			// Replace events if there are any remaining.  Otherwise, clean up.
			var remaining = [];
			for (var j = 0; j < handlers.length; j++) {
				var handler = handlers[j];
				if (
					callback && callback !== handler.callback &&
					callback !== handler.callback._callback ||
					context && context !== handler.context
				) {
					remaining.push(handler);
				} else {
					listening = handler.listening;
					if (listening && --listening.count === 0) {
						delete listeners[listening.id];
						delete listening.listeningTo[listening.objId];
					}
				}
			}

			// Update tail event if the list has any events.  Otherwise, clean up.
			if (remaining.length) {
				events[name] = remaining;
			} else {
				delete events[name];
			}
		}
		if (_.size(events)) return events;
	};

	// Bind an event to only be triggered a single time. After the first time
	// the callback is invoked, it will be removed. When multiple events are
	// passed in using the space-separated syntax, the event will fire once for every
	// event you passed in, not once for a combination of all events
	Events.once = function(name, callback, context) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
		return this.on(events, void 0, context);
	};

	// Inversion-of-control versions of `once`.
	Events.listenToOnce = function(obj, name, callback) {
		// Map the event into a `{event: once}` object.
		var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
		return this.listenTo(obj, events);
	};

	// Reduces the event callbacks into a map of `{event: onceWrapper}`.
	// `offer` unbinds the `onceWrapper` after it has been called.
	var onceMap = function(map, name, callback, offer) {
		if (callback) {
			var once = map[name] = _.once(function() {
				offer(name, once);
				callback.apply(this, arguments);
			});
			once._callback = callback;
		}
		return map;
	};

	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.trigger = function(name) {
		if (!this._events) return this;

		var length = Math.max(0, arguments.length - 1);
		var args = Array(length);
		for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

		eventsApi(triggerApi, this._events, name, void 0, args);
		return this;
	};

	// Handles triggering the appropriate event callbacks.
	var triggerApi = function(objEvents, name, cb, args) {
		if (objEvents) {
			var events = objEvents[name];
			var allEvents = objEvents.all;
			if (events && allEvents) allEvents = allEvents.slice();
			if (events) triggerEvents(events, args);
			if (allEvents) triggerEvents(allEvents, [name].concat(args));
		}
		return objEvents;
	};

	// A difficult-to-believe, but optimized internal dispatch function for
	// triggering events. Tries to keep the usual cases speedy (most internal
	// Backbone events have 3 arguments).
	var triggerEvents = function(events, args) {
		var ev, i = -1,
			l = events.length,
			a1 = args[0],
			a2 = args[1],
			a3 = args[2];
		switch (args.length) {
			case 0:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx);
				return;
			case 1:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
				return;
			case 2:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
				return;
			case 3:
				while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
				return;
			default:
				while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
				return;
		}
	};

	// Aliases for backwards compatibility.
	Events.bind = Events.on;
	Events.unbind = Events.off;

	module.exports = Events;

})();
},{}],11:[function(require,module,exports){
var _ = require('underscore');

module.exports = function(protoProps, staticProps) {
	var parent = this;
	var child;

	if (protoProps && _.has(protoProps, 'constructor')) {
		child = protoProps.constructor;
	} else {
		child = function() {
			return parent.apply(this, arguments);
		};
	}

	_.extend(child, parent, staticProps);

	var Surrogate = function() {
		this.constructor = child;
	};

	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate();

	if (protoProps) {
		_.extend(child.prototype, protoProps);
	}

	child.__super__ = parent.prototype;

	return child;
};
},{"underscore":7}]},{},[1]);
