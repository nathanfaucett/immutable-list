Immutable List
=======

Immutable persistent linked list for the browser and node.js, ImmutableList can not be changed once created. Persistent data presents a mutative API which does not update the data in-place, but instead always yields new updated data.

This implementation is based on clojure's List.


# Install using npm
```bash
$ npm install @nathanfaucett/immutable-list --save
```
# Install using yarn
```bash
$ yarn add @nathanfaucett/immutable-list --save
```

# Example Usage
```javascript
var ImmutableList = require("@nathanfaucett/immutable-list");


var a = new ImmutableList([0, 1, 2]),
    b = new ImmutableList(0, 1, 2),
    c = ImmutableList.of([0, 1, 2]),
    d = ImmutableList.of(0, 1, 2);

var a0 = a.push(3), // returns a new list with 3 at the end of the list
    a1 = a.unshift(-1); // returns a new list with -1 at the start of the list
```

# Docs

## Members

#### length -> Number
    returns size of List, only available if Object.defineProperty is supported


## Static Functions

#### List.isList(value: Any) -> Boolean
    returns true if value is a list else false

#### List.of(...values: Array<Any>) -> List
    creates List from passed values same as new List(...values: Array<Any>)

#### List.equal(a: List, b: List) -> Boolean
    compares lists by values


## Functions

#### size() -> Number
    returns size of List

#### get(index: UnsignedNumber) -> Any
    returns value at index

#### nth(index: UnsignedNumber) -> Any
    alias to get

#### first() -> Any
    returns first element

#### last() -> Any
    returns last element

#### indexOf(value: Any) -> Number
    returns index of value, -1 if not found

#### set(index: UnsignedNumber, value: Any) -> List
    returns new List if value at index is different

#### insert(index: UnsignedNumber, ...values: Array<Any>) -> List
    returns new List with inserted values at index

#### remove(index: UnsignedNumber[, count = 1: UnsignedNumber]) -> List
    returns new List without the values from index to index + count

#### conj(...values: Array<Any>) -> List
    returns new List with values pushed to front of the List

#### unshift(...values: Array<Any>) -> List
    alias to conj

#### pop() -> List
    returns new List without last element

#### shift() -> List
    returns new List without first element

#### push(...values: Array<Any>) -> List
    returns new List with values pushed to end of the List

#### concat(...lists: Array<List>) -> List
    returns new List with values from lists pushed to end of the List

#### iterator([reverse = false: Boolean]) -> Iterator
    returns Iterator

#### toArray() -> Array<Any>
    returns List elements in an Array

#### join([separator = " "]) -> String
    join all elements of an List into a String

#### toString() -> String
    String representation of List

#### equals(other: List) -> Boolean
    compares this list to other list by values

#### every, filter, forEach, forEachRight, map, reduce, reduceRight, some
    common Array methods
