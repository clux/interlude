var slice = Array.prototype.slice
  , hasOwnProp = Object.prototype.hasOwnProperty
  , $ = {};

// ---------------------------------------------
// common
// ---------------------------------------------
$.id = function (x) {
  return x;
};

$.noop = function () {
};

$.constant = function (val) {
  return function () {
    return val;
  };
};

// if using object as a hash, use this for security
// but preferably set hash = Object.create(null)
// and simply test for !!hash[key]
$.has = function (obj, key) {
  return hasOwnProp.call(obj, key);
};

// can sometimes be useful to compose with
$.not = function (x) {
  return !x;
};

// ---------------------------------------------
// Math
// ---------------------------------------------

// lifted versions of the first two exist
// but they're hard to name sensibly different, and too peripheral
// lcm = $.lift($.lcm, 1);
// gcd = $.lift($.gcd, Infinity);

$.gcd = function (a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    var temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

$.lcm = function (a, b) {
  return (!a || !b) ? 0 : Math.abs((Math.floor(a / $.gcd(a, b)) * b));
};

$.pow = function (exponent) {
  return function (x) {
    return Math.pow(x, exponent);
  };
};

// ultimately just as accurate as the internal Math.log approximation
$.logBase = function (base) {
  return function (x) {
    return Math.log(x) / Math.log(base);
  };
};

// ---------------------------------------------
// curried binary operations
// ---------------------------------------------

$.plus = function (x) {
  return function (y) {
    return y + x;
  };
};

$.subtract = function (x) {
  return function (y) {
    return y - x;
  };
};

$.times = function (x) {
  return function (y) {
    return y * x;
  };
};

$.divide = function (x) {
  return function (y){
    return y / x;
  };
};

$.append = function (xs) {
  return function (ys) {
    return ys.concat(xs);
  };
};

$.prepend = function (xs) {
  return function (ys) {
    return xs.concat(ys);
  };
};

// ---------------------------------------------
// uncurried binary operators
// ---------------------------------------------

$.add2 = function (x, y) {
  return x + y;
};

$.subtract2 = function (x, y) {
  return x - y;
};

$.multiply2 = function (x, y) {
  return x * y;
};

$.concat2 = function (xs, ys) {
  return xs.concat(ys);
};

$.and2 = function (x, y) {
  return x && y;
};

$.or2 = function (x, y) {
  return x || y;
};

$.eq2 = function (x, y) {
  return x === y;
};

$.weq2 = function (x, y) {
  return x == y;
};

$.gt2 = function (x, y) {
  return x > y;
};

$.lt2 = function (x, y) {
  return x < y;
};

$.gte2 = function (x, y) {
  return x >= y;
};

$.lte2 = function (x, y) {
  return x <= y;
};

// ---------------------------------------------
// Higher order looping
// ---------------------------------------------

$.iterate = function (times, fn) {
  return function (x) {
    var result = [x];
    for (var i = 1; i < times; i += 1) {
      result.push(fn(result[i - 1]));
    }
    return result;
  };
};

// DO NOT FOLD WITH VARIADIC FUNCTIONS!
// Instead use binary uncurried operators (also more efficient)
// fold - Array::reduce with array curried
$.fold = function (fn, initial) {
  return function (xs) {
    return xs.reduce(fn, initial);
  };
};

// like fold, but keeps intermediary steps
// scan(fn, z)([x1, x2, ...]) == [z, f(z, x1), f(f(z, x1), x2), ...]
$.scan = function (fn, initial) {
  return function (xs) {
    var result = [initial];
    for (var i = 0; i < xs.length; i += 1) {
      result.push(fn(result[i], xs[i]));
    }
    return result;
  };
};

// enumerate the first n positive integers
// like _.range or python's range, but 1-indexed inclusive
$.range = function (start, stop, step) {
  if (arguments.length <= 1) {
    stop = start || 1;
    start = 1;
  }
  step = arguments[2] || 1;

  var len = Math.max(Math.ceil((stop - start + 1) / step), 0)
    , idx = 0
    , range = new Array(len);

  while (idx < len) {
    range[idx++] = start;
    start += step;
  }
  return range;
};

// any/all are more useful for reverse currying every/some than unlifting and/or
$.all = function (fn) {
  return function (xs) {
    return xs.every(fn);
  };
};

$.any = function (fn) {
  return function (xs) {
    return xs.some(fn);
  };
};

$.none = function (fn) {
  return function (xs) {
    return !xs.some(fn);
  };
};


// ---------------------------------------------
// binary operators folded over lists
// ---------------------------------------------

// using fold with binary operators to give lifted functions
// any of these (i.e. they act on a list) can be remembered by "take the " fnName
// wheras the variadic counterpart has the name of the associative operator
$.sum = $.fold($.add2, 0);
$.product = $.fold($.multiply2, 1);
$.concatenation = $.fold($.concat2, []);
$.and = $.fold($.and2, true);
$.or = $.fold($.or2, false);

// ---------------------------------------------
// lifts and unlifts
// ---------------------------------------------

// multi param function f -> single array fn
// this is the inverse of unlift
$.lift = function (fn, context) {
  return function (xs) {
    return fn.apply(context, xs);
  };
};

// examples
// follows the "take the" fnName of list semantic
// max/min already have unlifted variadic counterparts so they can simply be lifted
// rather than folding over a two parameter arg
$.maximum = $.lift(Math.max, Math);
$.minimum = $.lift(Math.min, Math);

// generalized versions:
$.maximumBy = function (fn, xs) {
  return $.maximum(xs.map(fn));
};

$.minimumBy = function (fn, xs) {
  return $.minimum(xs.map(fn));
};


// (new ClassInst) can't be lifted - has to be one manually
// maybe not want to put this in here, after all Object.create exists
// and classes are a different thing for people to disagree over
$.construct = function (Ctor, args) {
  var F = function () {
    Ctor.apply(this, args);
  };
  F.prototype = Ctor.prototype;
  return new F();
};

// take a function operating on an array and turn it into a multi-parameter function, inverse of lift
// because argument based functions are semantic tand is most sensible with zipWith
$.unlift = function (fn, context) {
  return function () {
    var args = slice.call(arguments, 0);
    return fn.apply(context, [args]);
  };
};

// variadic version of the lifted functions
// named after the operation, i.e. "we " fnName (together) "arg1, arg2, ..."
// variadic => can be used with zipWith for any number of lists
$.add = $.unlift($.sum);
$.multiply = $.unlift($.product);
$.concat = $.unlift($.concatenation);

// ---------------------------------------------
// compositions and sequencing
// ---------------------------------------------

// manually lift/unlift "compose" for efficiency rather than fold/unlift over chain
// we maintain the lifted/unlifted name semantics of "take the" x || we x
$.compose = function (/*fns...*/) {
  var fns = arguments;
  return function () {
    var args = arguments;
    for (var i = fns.length - 1; i >= 0; i -= 1) {
      args = [fns[i].apply(this, args)];
    }
    return args[0];
  };
};

// same as compose, but applies functions in arguments list order
// sequence(f1, f2, f3..., fn)(args...) == fn(...(f3(f2(f1(args...)))))
// $.sequence($.plus(2), $.plus(3), $.times(2))(2) -> 14
$.sequence = function (/*fns...*/) {
  var fns = arguments
    , numFns = fns.length;
  return function () {
    var args = arguments;
    for (var i = 0; i < numFns; i += 1) {
      args = [fns[i].apply(this, args)];
    }
    return args[0];
  };
};

// and their list equivalents:
$.composition = $.lift($.compose);
$.pipeline = $.lift($.sequence);

// ---------------------------------------------
// Getters/setters
// ---------------------------------------------

// simple proprety accessor
// can also be used for array number accessor
$.get = function (prop) {
  return function (el) {
    return el[prop];
  };
};

// property get map -- equivalent to _.pluck or xs.map($.get('prop'))
// works with both xs curried or included
// $.collect('length', [ [1,3,2],  [2], [1,2] ]) -> [3,1,2]
$.collect = function (propName, xs) {
  var fn = function (ys) {
    var result = [];
    for (var i = 0; i < ys.length; i += 1) {
      result[i] = ys[i][propName];
    }
    return result;
  };
  return (xs == null) ? fn : fn(xs);
};

// curried this way so it can be zipped with, i.e.:
// $.zipWith($.set('prop'), elList, valList);
// if you wanted to do all three arguments in one, you'd just do a normal assign
$.set = function (propName) {
  return function (el, value) {
    el[propName] = value;
    return el;
  };
};

// property set map -- equivalent to xs.map($.set('prop'))
// modify a list of objects by setting propName on all objects to valFn(currObj)
// can use $.inject('prop1', $.constant(5))([{}, {a:2}]) -> [{prop1:5}, {a:2, prop1: 5}]|
$.inject = function (propName, valFn) {
  return function (xs) {
    for (var i = 0; i < xs.length; i += 1) {
      xs[i][propName] = valFn(xs[i]);
    }
    return xs;
  };
};

// ---------------------------------------------
// zipWith / zip
// ---------------------------------------------

// can act as zipWith, zipWith3, zipWith4...
// zipper function must have the same number of arguments as there are lists
// but beyond that, it's very dynamic
// zipWith(function(x,y,z){return x+y+z;}, [1,3,2], [21,1], [2,3]) -> [24,7]
$.zipWith = function () {
  var fn = arguments[0]
    , args = slice.call(arguments, 1)
    , numLists = args.length
    , results = []
    , len = $.minimumBy($.get('length'), args);

  for (var i = 0; i < len; i += 1) {
    var els = [];
    for (var j = 0; j < numLists; j += 1) {
      els.push(args[j][i]);
    }
    results.push(fn.apply(null, els));
  }
  return results;
};

// zip, zip3, zip4.. all in one!
// inlining faster: http://jsperf.com/inlinezip3
$.zip = function () {
  var args = slice.call(arguments, 0)
    , numLists = args.length
    , results = []
    , len = $.minimumBy($.get('length'), args);

  for (var i = 0; i < len; i += 1) {
    var els = [];
    for (var j = 0; j < numLists; j += 1) {
      els.push(args[j][i]);
    }
    results.push(els);
  }
  return results;
};

// ---------------------------------------------
// ordering
// ---------------------------------------------

// sort helper
// put in property names (in order), you want to order by
// then pass the resulting function to xs.sort()
$.comparing = function () {
  var pargs = slice.call(arguments, 0);
  return function (x, y) {
    for (var i = 0; i < pargs.length; i += 1) {
      if (x[pargs[i]] !== y[pargs[i]]) {
        return x[pargs[i]] - y[pargs[i]];
      }
      return 0;
    }
  };
};

// functional comparison helpers curried to one level
$.gt = function (a) {
  return function (b) {
    return b > a;
  };
};

$.lt = function (a) {
  return function (b) {
    return b < a;
  };
};

$.eq = function (a) {
  return function (b) {
    return b === a;
  };
};

// weak eq
$.weq = function (a) {
  return function (b) {
    return b == a;
  };
};

$.gte = function (a) {
  return function (b) {
    return b >= a;
  };
};

$.lte = function (a) {
  return function (b) {
    return b <= a;
  };
};

// can do stuff like
// [1,4,2,5,2,3].filter(gt(3)); -> [4,5]
// [[1,3,5], [2,3,1]].filter(any(gte(5))) -> [ [ 1, 3, 5 ] ]

// ---------------------------------------------
// Membership
// ---------------------------------------------

$.elem = function (xs) {
  return function (x) {
    return xs.indexOf(x) >= 0;
  };
};

$.notElem = function (xs) {
  return function (x) {
    return xs.indexOf(x) < 0;
  };
};

// allows stuff like
// [1,2,3,4,3].filter(elem([1,3]))  -> [1,3,3]
// [1,2,3,4,3].filter(notElem[1,3]) -> [2,4]

// ---------------------------------------------
// List operations
// ---------------------------------------------

// assumes xs sorted, insert x at next step
// equivalent to $.insertBy($.subtract2, ..)
$.insert = function (xs, x) {
  for (var i = xs.length - 1; i >= 0; i -= 1) {
    if (x >= xs[i]) { // gte(0) . subtract2(x, xs[i])
      xs.splice(i+1, 0, x);
      return xs;
    }
  }
  xs.unshift(x);
  return xs;
};

// $.insertBy($.comparing(prop)) is good
$.insertBy = function (cmp, xs, x) {
  for (var i = xs.length - 1; i >= 0; i -= 1) {
    if (cmp(x, xs[i]) >= 0) {
      xs.splice(i+1, 0, x);
      return xs;
    }
  }
  xs.unshift(x);
  return xs;
};

// $.partition($.equality(0)([2]), [[1], [2], [3], [2]])
$.partition = function (fn, xs) {
  return [xs.filter(fn), xs.filter($.compose($.not, fn))];
};

// what equality means for generalized functions can be created with $.equality
// takes what to count as equality first, then x, then y
// partition takes it curried to up to y, intersect partitioned up to x and y
$.equality = function () {
  var pargs = slice.call(arguments, 0);
  return function (x) {
    return function (y) {
      for (var i = 0; i < pargs.length; i += 1) {
        if (x[pargs[i]] !== y[pargs[i]]) {
          return false;
        }
        return true;
      }
    };
  };
};

$.intersect = function (xs, ys) {
  return $.intersectBy($.eq, xs, ys);
};

$.intersectBy = function (eq, xs, ys) {
  var result = [];
  if (xs.length && ys.length) {
    for (var i = 0; i < xs.length; i += 1) {
      var x = xs[i];
      if (ys.filter(eq(x)).length > 0) {
        result.push(x);
      }
    }
  }
  return result;
};

$.group = function (xs) {

};

$.groupBy = function (fn, xs) {

};

$.delete = function (xs) {

};


$.deleteBy = function (fn, xs) {

};


// nub, build up a list of unique (w.r.t. equality)
// elements by checking if current is not 'equal' to anything in the buildup
// nubBy curried with function (x, y) { return x == y; } as the equality function is
// equivalent to nub
$.nub = function (xs) {
  var result = [];
  for (var i = 0; i < xs.length; i += 1) {
    if (result.indexOf(xs[i]) < 0) {
      result.push(xs[i]);
    }
  }
  return result;
};

// nubBy builds up a list of unique (w.r.t. provided equality function) similarly to nub
$.nubBy = function (fn, xs) {
  var result = []
    , resLen = 0
    , len = xs.length;

  for (var i = 0; i < len; i += 1) {
    var keep = true;

    for (var j = 0; j < resLen; j += 1) {
      if (fn(xs[j], xs[i])) {
        keep = false;
        break;
      }
    }

    if (keep) {
      result.push(xs[i]);
      resLen += 1;
    }
  }
  return result;
};


// ---------------------------------------------
// Function Wrappers
// ---------------------------------------------

//TODO: throttle, debounce, once
//TODO: clone, extend

// Memoize an expensive function by storing its results in a proper hash.
$.memoize = function (fn, hasher) {
  var memo = Object.create(null);
  hasher || (hasher = $.id);
  return function () {
    var key = hasher.apply(this, arguments);
    memo[key] || (memo[key] = fn.apply(this.arguments));
    return memo[key];
  };
};

$.curry = function (fn) {
  var curried = slice.call(arguments, 1);
  return function () {
    var args = curried.concat(slice.call(arguments, 0));
    return fn.apply(this, args);
  };
};

// like curry, but curries the last arguments, and creates a function expecting the first
$.rcurry = function (fn) {
  var curried = slice.call(arguments, 1);
  return function () {
    var args = slice.call(arguments, 0).concat(curried);
    return fn.apply(this, args);
  };
};


// guard a function by a condition function
// returns a function that will only apply f(x) if cond(x) is true
$.guard = function (fn, cond) {
  return function (x) {
    return (cond(x)) ? fn(x) : null;
  };
};

// var guardedFibonacci = $.guard(fibonacci, lt(100));

// $.either null guard a function, else return errorFn result
// if errorFn is a logger, then curry it with the required message
$.either = function (guardedFn, errorFn) {
  return function (x) {
    var result = guardedFn(x);
    return (result === null) ? errorFn() : result;
  };
};

// var errorMsg;
// var cpuSafeFibonacci = $.either(guardedFibonacci, $.constant(errorMsg));
// or
// var cpuSafeFibonaci = $.either(guardedFibonacci, $.curry(console.log, errorMsg))


// debug function, wrap it in a function reporting its scope and arguments
// particularly useful when combined with $.iterate
$.trace = function (fn, fnName) {
  var log = (console) ? console.log : $.noop
    , global = (function () { return this; }())
    , name = fn.name || fnName || "fn";

  return function () {
    var result = fn.apply(this, arguments);
    var scope = (this === global) ? "global" : this;
    log('[', name + '.apply(', scope, ',', slice.call(arguments, 0), ') -> ', result, ']');
    return result;
  };
};


// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = $;
