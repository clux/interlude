# Functional JavaScript Programming
The aim of this module (unlike many similar helper libraries) is not: to replace/alias ES5 methods,
stuff Array.prototype full of helper methods, or try to avoid using JS semantics for another language's.
Instead, it exports simple higher order additions to go with the ES5 methods to improve the readibility
and semantics of common boilerplate code, while maintaining efficiency.

Currently, only a preview version is available on npm, but docs, tests, and additions are coming.

## Usage
Attach it to your generic free short variable:

````javascript
var $ = require('interlude');
````

Then add some Functional Programming, JavaScript style;

```javascript
[1,3,2,6,5,4].filter($.gt(4));
// [6,5]

$.zipWith($.add, [1,1,1,1,1], $.range(1,5), [1,0,0]);
// [3,3,4]

[[1,3,2],[2],[1,4,2,3]].map($.get('length'));
// [3,1,4]

$.compose(f, g, h);
// (x) -> f(g(h(x)));

$.iterate($.times(2), 8) (2)
// [2,4,8,16,32,64,128,256]

var pascalNext = function (row) {
  return $.zipWith($.add, $.concat(row, [0]), $.concat([0], row));
}
$.iterate(pascalNext, 5)([1]);
// [
//      [ 1 ],
//     [ 1, 1 ],
//    [ 1, 2, 1 ],
//   [ 1, 3, 3, 1 ],
//  [ 1, 4, 6, 4, 1 ]
// ]

````

Read the API (TODO)

## Installation

````bash
$ npm install interlude
````

## License
MIT-Licensed. See LICENSE file for details.
