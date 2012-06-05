# Interlude ![travis build status](https://secure.travis-ci.org/clux/interlude.png)
Interlude is ES5 JavaScript with Haskell inspired enhancements.
It's aims to simplify and abstract common patterns by joining
common higher order functions with the ES5 arsenal to allow a
more declarative style with negligible efficiency changes.

It does not simply alias ES5 methods, and it does not touch prototypes.
*It curries*.

## Usage
Attach it to the short variable of choice:

````javascript
var $ = require('interlude');
````

Then spice up your JavaScript with Functional Programming;

```javascript
[1,3,2,6,5,4].filter($.gt(4));
// [ 6, 5 ]

$.range(5).map($.pow(2));
// [ 1, 4, 9, 16, 25 ]

var nested = [[1, 3, 2], [2], [1, 4, 2, 3]];
$.collect('length', nested);
// [ 3, 1, 4 ]

nested.filter($.all($.eq(2)));
// [ [2] ]

nested.sort($.comparing('length'));
// [ [ 2 ], [ 1, 3, 2 ], [ 1, 4, 2, 3 ] ]

$.zipWith($.add, [1, 1, 1, 1, 1], $.range(5), [1, 0, 0]);
// [ 3, 3, 4 ]

var f = g = h = $.noop;
$.compose(f, g, h);
// [Function] :: args -> f(g(h(args)))

// Powers of two
$.iterate(8, $.times(2))(2);
// [ 2, 4, 8, 16, 32, 64, 128, 256 ]


// Pascal's Triangle
var pascalNext = function (row) {
  return $.zipWith($.add2, row.concat(0), [0].concat(row));
}
$.iterate(5, pascalNext)([1]);
// [ [ 1 ]
//   [ 1, 1 ],
//   [ 1, 2, 1 ],
//   [ 1, 3, 3, 1 ],
//   [ 1, 4, 6, 4, 1 ] ]


// Fibonacci numbers
var fibPairs = $.iterate(8, function (x) {
  return [x[1], x[0] + x[1]];
})([0,1]);
$.collect(0, fibPairs);
// [ 0, 1, 1, 2, 3, 5, 8, 13 ]


// Prime numbers
var notCoprime = $.compose($.gt(1), $.gcd);
$.nubBy(notCoprime, $.range(2, 20));
// [ 2, 3, 5, 7, 11, 13, 17, 19 ]
````

Read the [API](interlude/api.md)

## Installation

````bash
$ npm install interlude
````

## Running tests
Install development dependencies

````bash
$ npm install
````

Run the tests

````bash
$ npm test
````

## License
MIT-Licensed. See LICENSE file for details.
