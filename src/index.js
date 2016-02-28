var isNull = require("is_null"),
    isUndefined = require("is_undefined"),
    isArrayLike = require("is_array_like"),
    isNumber = require("is_number"),
    Iterator = require("iterator"),
    fastBindThis = require("fast_bind_this"),
    fastSlice = require("fast_slice"),
    defineProperty = require("define_property"),
    freeze = require("freeze"),
    isEqual = require("is_equal");


var INTERNAL_CREATE = {},

    ITERATOR_SYMBOL = typeof(Symbol) === "function" ? Symbol.iterator : false,
    IS_LIST = "__ImmutableList__",

    EMPTY_LIST = freeze(new List(INTERNAL_CREATE)),

    IteratorValue = Iterator.Value,

    ListPrototype = List.prototype;


module.exports = List;


function List(value) {
    if (!(this instanceof List)) {
        throw new Error("List() must be called with new");
    }

    this.__size = 0;
    this.__root = null;
    this.__tail = null;

    if (value !== INTERNAL_CREATE) {
        return List_createList(this, value, arguments);
    } else {
        return this;
    }
}

List.EMPTY = EMPTY_LIST;

function List_createList(_this, value, values) {
    var length = values.length;

    if (length > 1) {
        return List_fromArray(_this, values);
    } else if (length === 1) {
        if (isList(value)) {
            return value;
        } else if (isArrayLike(value)) {
            return List_fromArray(_this, value.toArray ? value.toArray() : value);
        } else {
            _this.__root = _this.__tail = new Node(value, null);
            _this.__size = 1;
            return freeze(_this);
        }
    } else {
        return EMPTY_LIST;
    }
}

function List_fromArray(_this, array) {
    var length = array.length,
        i = length - 1,
        tail = new Node(array[i], null),
        root = tail;

    while (i--) {
        root = new Node(array[i], root);
    }

    _this.__size = length;
    _this.__root = root;
    _this.__tail = tail;

    return freeze(_this);
}

List.fromArray = function(array) {
    if (array.length > 0) {
        return List_fromArray(new List(INTERNAL_CREATE), array);
    } else {
        return EMPTY_LIST;
    }
};

List.of = function() {
    return List_createList(new List(INTERNAL_CREATE), arguments[0], arguments);
};

function isList(value) {
    return value && value[IS_LIST] === true;
}

List.isList = isList;

defineProperty(ListPrototype, IS_LIST, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: true
});

ListPrototype.size = function() {
    return this.__size;
};

if (defineProperty.hasGettersSetters) {
    defineProperty(ListPrototype, "length", {
        get: ListPrototype.size
    });
}

ListPrototype.count = ListPrototype.size;

ListPrototype.isEmpty = function() {
    return this.__size === 0;
};

function List_get(_this, index) {
    if (index === 0) {
        return _this.__root;
    } else if (index === _this.__size - 1) {
        return _this.__tail;
    } else {
        return findNode(_this.__root, index);
    }
}

ListPrototype.get = function(index, notSetValue) {
    if (!isNumber(index) || index < 0 || index >= this.__size) {
        return notSetValue;
    } else {
        return List_get(this, index).value;
    }
};

ListPrototype.nth = ListPrototype.get;

ListPrototype.first = function(notSetValue) {
    var node = this.__root;

    if (isNull(node)) {
        return notSetValue;
    } else {
        return node.value;
    }
};

ListPrototype.last = function(notSetValue) {
    var node = this.__tail;

    if (isNull(node)) {
        return notSetValue;
    } else {
        return node.value;
    }
};

ListPrototype.indexOf = function(value) {
    var node = this.__root,
        i = 0;

    while (!isNull(node)) {
        if (isEqual(node.value, value)) {
            return i;
        }
        node = node.next;
        i += 1;
    }

    return -1;
};

function copyFromTo(from, to, newNode) {
    if (from !== to) {
        return new Node(from.value, copyFromTo(from.next, to, newNode));
    } else {
        return newNode;
    }
}

function List_set(_this, node, index, value) {
    var list = new List(INTERNAL_CREATE),
        newNode = new Node(value, node.next),
        root = copyFromTo(_this.__root, node, newNode),
        tail = isNull(node.next) ? newNode : _this.__tail;

    list.__size = _this.__size;
    list.__root = root;
    list.__tail = tail;

    return freeze(list);
}

ListPrototype.set = function(index, value) {
    var node;

    if (index < 0 || index >= this.__size) {
        throw new Error("List set(index, value) index out of bounds");
    } else {
        node = List_get(this, index);

        if (isEqual(node.value, value)) {
            return this;
        } else {
            return List_set(this, node, index, value);
        }
    }
};

function findParent(parent, node) {
    var next = parent.next;

    if (next !== node) {
        return findParent(next, node);
    } else {
        return parent;
    }
}

function insertCreateNodes(values, index, length, root) {
    var i = index - 1,
        il = length - 1;

    while (i++ < il) {
        root = new Node(values[i], root);
    }

    return root;
}

function List_insert(_this, node, index, values) {
    var list = new List(INTERNAL_CREATE),

        oldRoot = _this.__root,
        parent = oldRoot !== node ? findParent(oldRoot, node) : null,

        length = values.length,

        tail = new Node(values[length - 1], node),
        first = insertCreateNodes(values, 0, length - 1, tail),

        root = isNull(parent) ? first : copyFromTo(oldRoot, node, first);

    list.__size = _this.__size + length;
    list.__root = root;
    list.__tail = tail;

    return freeze(list);
}

ListPrototype.insert = function(index) {
    if (index < 0 || index >= this.__size) {
        throw new Error("List insert(index, value) index out of bounds");
    } else {
        return List_insert(this, List_get(this, index), index, fastSlice(arguments, 1));
    }
};

function findNext(node, count) {

    while (count-- && !isNull(node)) {
        node = node.next;
    }

    return node;
}

function List_remove(_this, node, count) {
    var list = new List(INTERNAL_CREATE),
        next = findNext(node, count),
        root = copyFromTo(_this.__root, node, next),
        tail = isNull(next) ? _this.__tail : next;

    list.__size = _this.__size - count;
    list.__root = root;
    list.__tail = tail;

    return freeze(list);
}

ListPrototype.remove = function(index, count) {
    var size = this.__size,
        node;

    count = count || 1;

    if (index < 0 || index >= size) {
        throw new Error("List remove(index[, count=1]) index out of bounds");
    } else if (count > 0) {
        node = List_get(this, index);

        if (node === this.__root && count === size) {
            return EMPTY_LIST;
        } else {
            return List_remove(this, node, count);
        }
    } else {
        return this;
    }
};

function List_conj(_this, values) {
    var list = new List(INTERNAL_CREATE),
        root = _this.__root,
        tail = _this.__tail,
        size = _this.__size,
        length = values.length,
        il = length - 1,
        i = 0;

    if (isNull(tail)) {
        root = tail = new Node(values[i], null);
    } else {
        i = -1;
    }

    while (i++ < il) {
        root = new Node(values[i], root);
    }

    list.__size = length + size;
    list.__root = root;
    list.__tail = tail;

    return freeze(list);
}

ListPrototype.unshiftArray = function(array) {
    if (array.length !== 0) {
        return List_conj(this, array);
    } else {
        return this;
    }
};

ListPrototype.conj = function() {
    return this.unshiftArray(arguments);
};

ListPrototype.unshift = ListPrototype.conj;

function List_pop(_this) {
    var list = new List(INTERNAL_CREATE),
        root = _this.__root,
        tail = _this.__tail,
        newRoot = new Node(root.value, null),
        newTail = newRoot;

    while (true) {
        root = root.next;

        if (isNull(root) || root === tail) {
            break;
        } else {
            newTail = newTail.next = new Node(root.value, null);
        }
    }

    list.__size = _this.__size - 1;
    list.__root = newRoot;
    list.__tail = newTail;

    return freeze(list);
}

ListPrototype.pop = function() {
    var size = this.__size;

    if (size === 0) {
        return this;
    } else if (size === 1) {
        return EMPTY_LIST;
    } else {
        return List_pop(this);
    }
};

function List_shift(_this) {
    var list = new List(INTERNAL_CREATE);

    list.__size = _this.__size - 1;
    list.__root = _this.__root.next;
    list.__tail = _this.__tail;

    return freeze(list);
}

ListPrototype.shift = function() {
    var size = this.__size;

    if (size === 0) {
        return this;
    } else if (size === 1) {
        return EMPTY_LIST;
    } else {
        return List_shift(this);
    }
};

ListPrototype.rest = ListPrototype.shift;

function pushCreateNodes(values, length, root) {
    var i = length;

    while (i--) {
        root = new Node(values[i], root);
    }

    return root;
}

function copyNodes(node, last) {
    if (isNull(node)) {
        return last;
    } else {
        return new Node(node.value, copyNodes(node.next, last));
    }
}

function List_push(_this, values, length) {
    var list = new List(INTERNAL_CREATE),

        oldRoot = _this.__root,

        tail = new Node(values[length - 1], null),
        first = length !== 1 ? pushCreateNodes(values, length - 1, tail) : tail,

        root = isNull(oldRoot) ? first : copyNodes(oldRoot, first);

    list.__size = _this.__size + length;
    list.__root = root;
    list.__tail = tail;

    return freeze(list);
}

ListPrototype.pushArray = function(array) {
    var length = array.length;

    if (length !== 0) {
        return List_push(this, array, length);
    } else {
        return this;
    }
};

ListPrototype.push = function() {
    return this.pushArray(arguments);
};

function List_concat(a, b) {
    var asize = a.__size,
        bsize = b.__size,
        root, tail, list;

    if (asize === 0) {
        return b;
    } else if (bsize === 0) {
        return a;
    } else {
        root = copyNodes(a.__root, b.__root);
        tail = b.__tail;

        list = new List(INTERNAL_CREATE);
        list.__size = asize + bsize;
        list.__root = root;
        list.__tail = tail;

        return freeze(list);
    }
}

ListPrototype.concatArray = function(array) {
    var length = array.length,
        i, il, list;

    if (length !== 0) {
        i = -1;
        il = length - 1;
        list = this;

        while (i++ < il) {
            list = List_concat(list, array[i]);
        }

        return list;
    } else {
        return this;
    }
};

ListPrototype.concat = function() {
    return this.concatArray(arguments);
};

function List_iterator(_this) {
    var node = _this.__root;

    return new Iterator(function next() {
        var value;

        if (isNull(node)) {
            return Iterator.createDone();
        } else {
            value = node.value;
            node = node.next;

            return new IteratorValue(value, false);
        }
    });
}

function List_iteratorReverse(_this) {
    var root = _this.__root,
        node = _this.__tail;

    return new Iterator(function next() {
        var value;

        if (isNull(node)) {
            return Iterator.createDone();
        } else {
            value = node.value;
            node = root !== node ? findParent(root, node) : null;

            return new IteratorValue(value, false);
        }
    });
}

ListPrototype.iterator = function(reverse) {
    if (reverse !== true) {
        return List_iterator(this);
    } else {
        return List_iteratorReverse(this);
    }
};

if (ITERATOR_SYMBOL) {
    ListPrototype[ITERATOR_SYMBOL] = ListPrototype.iterator;
}

function List_every(_this, it, callback) {
    var next = it.next(),
        index = 0;

    while (next.done === false) {
        if (!callback(next.value, index, _this)) {
            return false;
        }
        next = it.next();
        index += 1;
    }

    return true;
}

ListPrototype.every = function(callback, thisArg) {
    return List_every(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

function List_filter(_this, it, callback) {
    var results = [],
        next = it.next(),
        index = 0,
        j = 0,
        value;

    while (next.done === false) {
        value = next.value;

        if (callback(value, index, _this)) {
            results[j++] = value;
        }

        next = it.next();
        index += 1;
    }

    return List.of(results);
}

ListPrototype.filter = function(callback, thisArg) {
    return List_filter(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

function List_forEach(_this, it, callback) {
    var next = it.next(),
        index = 0;

    while (next.done === false) {
        if (callback(next.value, index, _this) === false) {
            break;
        }
        next = it.next();
        index += 1;
    }

    return _this;
}

ListPrototype.forEach = function(callback, thisArg) {
    return List_forEach(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

ListPrototype.each = ListPrototype.forEach;

function List_forEachRight(_this, it, callback) {
    var next = it.next(),
        index = _this.__size;

    while (next.done === false) {
        index -= 1;
        if (callback(next.value, index, _this) === false) {
            break;
        }
        next = it.next();
    }

    return _this;
}

ListPrototype.forEachRight = function(callback, thisArg) {
    return List_forEachRight(this, List_iteratorReverse(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

ListPrototype.eachRight = ListPrototype.forEachRight;

function List_map(_this, it, callback) {
    var next = it.next(),
        results = new Array(_this.__size),
        index = 0;

    while (next.done === false) {
        results[index] = callback(next.value, index, _this);
        next = it.next();
        index += 1;
    }

    return List.of(results);
}

ListPrototype.map = function(callback, thisArg) {
    return List_map(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

function List_reduce(_this, it, callback, initialValue) {
    var next = it.next(),
        value = initialValue,
        index = 0;

    if (isUndefined(value)) {
        value = next.value;
        next = it.next();
        index = 1;
    }

    while (next.done === false) {
        value = callback(value, next.value, index, _this);
        next = it.next();
        index += 1;
    }

    return value;
}

ListPrototype.reduce = function(callback, initialValue, thisArg) {
    return List_reduce(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 4), initialValue);
};

function List_reduceRight(_this, it, callback, initialValue) {
    var next = it.next(),
        value = initialValue,
        index = _this.__size;

    if (isUndefined(value)) {
        value = next.value;
        next = it.next();
        index -= 1;
    }

    while (next.done === false) {
        index -= 1;
        value = callback(value, next.value, index, _this);
        next = it.next();
    }

    return value;
}

ListPrototype.reduceRight = function(callback, initialValue, thisArg) {
    return List_reduceRight(this, List_iteratorReverse(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 4), initialValue);
};

function List_some(_this, it, callback) {
    var next = it.next(),
        index = 0;

    while (next.done === false) {
        if (callback(next.value, index, _this)) {
            return true;
        }
        next = it.next();
        index += 1;
    }

    return false;
}

ListPrototype.some = function(callback, thisArg) {
    return List_some(this, List_iterator(this), isUndefined(thisArg) ? callback : fastBindThis(callback, thisArg, 3));
};

ListPrototype.toArray = function() {
    var array = new Array(this.__size),
        node = this.__root,
        i = 0;

    while (!isNull(node)) {
        array[i++] = node.value;
        node = node.next;
    }

    return array;
};

ListPrototype.join = function(separator) {
    var result = "",
        node = this.__root,
        value;

    separator = separator || " ";

    while (!isNull(node)) {
        value = node.value;
        node = node.next;

        if (isNull(node)) {
            result += value;
            break;
        } else {
            result += value + separator;
        }
    }

    return result;
};

ListPrototype.toString = function() {
    return "(" + this.join() + ")";
};

ListPrototype.inspect = ListPrototype.toString;

List.equal = function(a, b) {
    if (a === b) {
        return true;
    } else if (!a || !b || a.__size !== b.__size) {
        return false;
    } else {
        a = a.__root;
        b = b.__root;

        while (!(isNull(a) || isNull(b))) {
            if (isEqual(a.value, b.value)) {
                a = a.next;
                b = b.next;
            } else {
                return false;
            }
        }

        return true;
    }
};

ListPrototype.equals = function(b) {
    return List.equal(this, b);
};

function Node(value, next) {
    this.value = value;
    this.next = next;
}

function findNode(root, index) {
    var i = 0,
        node = root;

    while (i++ !== index) {
        node = node.next;
    }

    return node;
}
