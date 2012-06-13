var slice = Array.prototype.slice
  , hasOwnProp = Object.prototype.hasOwnProperty
  , $ = require('operators');

// ---------------------------------------------
// Functional Helpers
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
$.not = function (fn) {
  return function (x) {
    return !fn(x);
  };
};

// any/all/none are more useful as fn currying for every/some than unlifting and/or
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

// ---------------------------------------------
// Math
// ---------------------------------------------

// can easily $.lift gcd/lcm
// but they're hard to name sensibly different, and too peripheral for this library

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
  return (!a || !b) ? 0 : Math.abs((a * b) / $.gcd(a, b));
};

$.pow = function (exponent) {
  return function (x) {
    return Math.pow(x, exponent);
  };
};

// ultimately only as accurate as the internal Math.log approximation
$.logBase = function (base) {
  return function (x) {
    return Math.log(x) / Math.log(base);
  };
};

$.even = function (n) {
  return n % 2 === 0;
};

$.odd = function (n) {
  return n % 2 === 1;
};

// ---------------------------------------------
// Higher order looping
// ---------------------------------------------

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

$.replicate = function (num, el) {
  var result = [];
  for (var i = 0; i < num; i += 1) {
    result.push(el);
  }
  return result;
};

// this arguably needs a curried version, waiting for initial
$.iterate = function (times, init, fn) {
  var result = [init];
  for (var i = 1; i < times; i += 1) {
    result.push(fn(result[i - 1]));
  }
  return result;
};

$.find = function (xs, fn) {
  for (var i = 0; i < xs.length; i += 1) {
    if (fn(xs[i])) {
      return xs[i];
    }
  }
  return -1;
};


// scan(fn, z)([x1, x2, ...]) == [z, f(z, x1), f(f(z, x1), x2), ...]
$.scan = function (xs, fn, initial) {
  var result = [initial];
  for (var i = 0, len = xs.length ; i < len; i += 1) {
    result.push(fn(result[i], xs[i]));
  }
  return result;
};

// these need only curried versions, as immediate use could simply access prototype on xs
$.reduce = function (fn, initial) {
  return function (xs) {
    return xs.reduce(fn, initial);
  };
};

$.map = function (fn) {
  return function (xs) {
    return xs.map(fn);
  };
};

$.filter = function (fn) {
  return function (xs) {
    return xs.filter(fn);
  };
};

// general accessor for anything else
// more cumbersome but can do most things well
$.invoke = function (method) {
  var args = slice.call(arguments, 1);
  return function (xs) {
    var fn = xs[method];
    return fn.apply(xs, args);
  };
};

// ---------------------------------------------
// Comparison
// ---------------------------------------------

$.equality = function () {
  var pargs = arguments;
  return function (x, y) {
    for (var i = 0, len = pargs.length; i < len; i += 1) {
      if (x[pargs[i]] !== y[pargs[i]]) {
        return false;
      }
    }
    return true;
  };
};

$.compare = function (dir) {
  var factor = parseInt((dir || '+') + 1); // => 1 by default
  return function (x, y) {
    return factor * (x - y);
  };
};

// result of this can be passed directly to Array::sort
$.comparing = function () {
  var args = slice.call(arguments, 0);
  return function (x, y) {
    for (var i = 0, len = args.length; i < len; i += 2) {
      var factor = parseInt((args[i + 1] || '+') + 1); // => 1 by default
      if (x[args[i]] !== y[args[i]]) {
        return factor * (x[args[i]] - y[args[i]]);
      }
    }
    return 0;
  };
};

// ---------------------------------------------
// Functional Sequencing (Composition)
// ---------------------------------------------

// $.seq(f1, f2, f3..., fn)(args...) == fn(...(f3(f2(f1(args...)))))
// performance: http://jsperf.com/seqperformance
$.seq = function () {
  var fns = arguments;
  return function () {
    // only need to apply the first with initial args
    var res = fns[0].apply(this, arguments);
    for (var i = 1, len = fns.length; i < len; i += 1) {
      res = fns[i](res); // rest chain in result from previous
    }
    return res;
  };
};

// more efficient functional sequencers
$.seq2 = function (f, g) {
  return function (x, y, z, w) {
    return g(f(x, y, z, w));
  };
};

$.seq3 = function (f, g, h) {
  return function (x, y, z, w) {
    return h(g(f(x, y, z, w)));
  };
};

$.seq4 = function (f, g, h, k) {
  return function (x, y, z, w) {
    return k(h(g(f(x, y, z, w))));
  };
};

// ---------------------------------------------
// Property accessors
// ---------------------------------------------

$.get = function (prop) {
  return function (el) {
    return el[prop];
  };
};

$.getDeep = function (str) {
  var props = str.split('.')
    , len = props.length;
  return function (el) {
    var pos = el;
    for (var i = 0; i < len; i += 1) {
      pos = pos[props[i]];
      if (pos === undefined) {
        return;
      }
    }
    return pos;
  };
};

// property accessor map -- equivalent to _.pluck or xs.map($.get('prop'))
$.pluck = function (prop, xs) {
  var result = [];
  for (var i = 0, len = xs.length; i < len; i += 1) {
    result[i] = xs[i][prop];
  }
  return result;
};

// ---------------------------------------------
// Function Wrappers
// ---------------------------------------------

//TODO: throttle, debounce, once
//TODO: clone, extend

/*
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
    , name = fn.name || fnName || "fn";

  return function () {
    var result = fn.apply(this, arguments);
    log('[', name + '(', slice.call(arguments, 0).join(', '), ') -> ', result, ']');
    return result;
  };
};
*/

// ---------------------------------------------
// max/min
// ---------------------------------------------

$.maximum = function (xs) {
  return Math.max.apply(Math, xs);
};

$.minimum = function (xs) {
  return Math.min.apply(Math, xs);
};

// What to use:?
// metric/getter faster for single property case
// but comparison function easier to generalize
// no curtom metric writing functions necessary!

// using compare functions:
// empty array => return undefined
$.maximumBy = function (cmp, xs) {
  for (var i = 1, max = xs[0], len = xs.length; i < len; i += 1) {
    if (cmp(xs[i], max) > 0) {
      max = xs[i];
    }
  }
  return max;
};

$.minimumBy = function (cmp, xs) {
  for (var i = 1, min = xs[0], len = xs.length; i < len; i += 1) {
    if (cmp(xs[i], min) < 0) {
      min = xs[i];
    }
  }
  return min;
};


// ---------------------------------------------
// List operations
// ---------------------------------------------
// the following functions are basically dependency free
// apart from $.eq2, but really needs $.equality for efficient testing of both

// can act as zipWith, zipWith3, zipWith4...
// zipper function must have the same number of arguments as there are lists
// but beyond that, it's very dynamic
$.zipWith = function () {
  var fn = arguments[0]
    , args = slice.call(arguments, 1)
    , numLists = args.length
    , results = []
    , len = $.minimum($.pluck('length', args));

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
// inlining quite a bit faster: http://jsperf.com/inlinezip3
// then not slicing helps too: http://jsperf.com/tosliceornottoslice5
$.zip = function () {
  var numLists = arguments.length
    , results = []
    , len = $.minimum($.pluck('length', arguments));

  for (var i = 0; i < len; i += 1) {
    var els = [];
    for (var j = 0; j < numLists; j += 1) {
      els.push(arguments[j][i]);
    }
    results.push(els);
  }
  return results;
};

// $.partition($.equality(0)([2]), [[1], [2], [3], [2]])
$.partition = function (fn, xs) {
  return [xs.filter(fn), xs.filter($.not(fn))];
};

// Ordered Array operations

$.insertBy = function (cmp, xs, x) {
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (cmp(xs[i], x) >= 0) {
      xs.splice(i, 0, x);
      return xs;
    }
  }
  xs.push(x);
  return xs;
};

$.insert = function (xs, x) {
  return $.insertBy($.compare(), xs, x);
};

$.deleteBy = function (eq, xs, x) {
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (eq(xs[i], x)) {
      xs.splice(i, 1);
      return xs;
    }
  }
  return xs;
};

// behaviourally equivalent to $.deleteBy($.eq2, xs, x)
$.delete = function (xs, x) {
  var idx = xs.indexOf(x);
  if (idx >= 0) {
    xs.splice(idx, 1);
  }
  return xs;
};

// "Set" operations

$.intersectBy = function (eq, xs, ys) {
  var result = [];
  if (xs.length && ys.length) {
    for (var i = 0, iLen = xs.length; i < iLen; i += 1) {
      var x = xs[i];
      for (var j = 0, jLen = ys.length; j < jLen; j += 1) {
        if (eq(x, ys[j])) {
          result.push(x);
          break;
        }
      }
    }
  }
  return result;
};

$.intersect = function (xs, ys) {
  return $.intersectBy($.eq2, xs, ys);
};

// nub, build up a list of unique (w.r.t. equality)
// elements by checking if current is not 'equal' to anything in the buildup
// $.curry($.nubBy, $.eq) === $.nub
// http://jsperf.com/nubnubbytest1 => indexOf clearly beats calling $.nubBy($.eq2)
$.nub = function (xs) {
  var result = [];
  for (var i = 0, len = xs.length; i < len; i += 1) {
    if (result.indexOf(xs[i]) < 0) {
      result.push(xs[i]);
    }
  }
  return result;
};

// nubBy builds up a list of unique (w.r.t. provided equality function) similarly to nub
// this can also take the curried $.equality now because of it's looseness
$.nubBy = function (eq, xs) {
  var result = []
    , resLen = 0
    , len = xs.length;
  for (var i = 0; i < len; i += 1) {
    var keep = true;
    for (var j = 0; j < resLen; j += 1) {
      if (eq(xs[j], xs[i])) {
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

$.group = function (xs) {
  return $.groupBy($.eq2, xs);
};

$.groupBy = function (eq, xs) {
  var result = []
    , j, sub;
  for (var i = 0, len = xs.length; i < len; i = j) {
    sub = [xs[i]];
    for (j = i + 1; j < len && eq(xs[i], xs[j]); j += 1) {
      sub.push(xs[j]);
    }
    result.push(sub);
  }
  return result;
};

$.unionBy = function (eq, xs, ys) {
  var delBy = function (ys, y) {
    return $.deleteBy(eq, ys, y);
  };
  return xs.concat(xs.reduce(delBy, $.nubBy(eq, ys)));
};

$.union = function (xs, ys) {
  return xs.concat(xs.reduce($.delete, $.nub(ys)));
};

$.differenceBy = function (eq, xs, ys) {
  var delBy = function (ys, y) {
    return $.deleteBy(eq, ys, y);
  };
  return ys.reduce(delBy, xs.slice()); // reduce a copy
};

$.difference = function (xs, ys) {
  return ys.reduce($.delete, xs.slice());
};

// ---------------------------------------------
// maybe do some string things
// ---------------------------------------------

/*
// mostly useful for taking bits out of a string in an unconventional way
// maybe not so useful..
$.matches = function (regx) {
  return function (str) {
    return (str.match(regx) || []).join('');
  };
};

// ["kYoto", "wOo", "wUt", "SUCK it!"].map($.capitals).join(''); // 'YOUSUCK'
$.capitals = $.matches(/[A-Z]/g);
*/

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = $;
