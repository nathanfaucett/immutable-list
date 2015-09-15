var isNull = require("is_null"),
    isUndefined = require("is_undefined"),
    isArrayLike = require("is_array_like"),
    fastBindThis = require("fast_bind_this"),
    fastSlice = require("fast_slice"),
    isEqual = require("is_equal");


var INTERNAL_CREATE = {},
    ListPrototype = List.prototype,
    ITERATOR_SYMBOL = typeof(Symbol) === "function" ? Symbol.iterator : false,
    emptyList = new List(INTERNAL_CREATE);


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

function List_createList(_this, value, values) {
    var length = values.length;

    if (length > 1) {
        return List_fromJS(_this, values);
    } else if (length === 1) {
        if (isArrayLike(value)) {
            return List_fromJS(_this, value.toArray ? value.toArray() : value);
        } else {
            _this.__root = _this.__tail = new Node(value, null);
            _this.__size = 1;
            return _this;
        }
    } else {
        return emptyList;
    }
}

function List_fromJS(_this, values) {
    var length = values.length,
        i = length - 1,
        tail = new Node(values[i], null),
        root = tail;

    while (i--) {
        root = new Node(values[i], root);
    }

    _this.__size = length;
    _this.__root = root;
    _this.__tail = tail;

    return _this;
}

List.of = function(value) {
    if (arguments.length > 0) {
        return List_createList(new List(INTERNAL_CREATE), value, arguments);
    } else {
        return emptyList;
    }
};

List.isList = function(value) {
    return value && value.__List__ === true;
};

ListPrototype.__List__ = true;

ListPrototype.size = function() {
    return this.__size;
};

if (Object.defineProperty) {
    Object.defineProperty(ListPrototype, "length", {
        get: ListPrototype.size
    });
}

ListPrototype.count = ListPrototype.size;

function List_get(_this, index) {
    if (index === 0) {
        return _this.__root;
    } else if (index === _this.__size - 1) {
        return _this.__tail;
    } else {
        return findNode(_this.__root, index);
    }
}

ListPrototype.get = function(index) {
    if (index < 0 || index >= this.__size) {
        return undefined;
    } else {
        return List_get(this, index).value;
    }
};

ListPrototype.nth = ListPrototype.get;

ListPrototype.first = function() {
    var node = this.__root;

    if (isNull(node)) {
        return undefined;
    } else {
        return node.value;
    }
};

ListPrototype.last = function() {
    var node = this.__tail;

    if (isNull(node)) {
        return undefined;
    } else {
        return node.value;
    }
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

    return list;
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

    return list;
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

    return list;
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
            return emptyList;
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
        i;

    if (isNull(tail)) {
        i = 0;
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

    return list;
}

ListPrototype.conj = function() {
    if (arguments.length !== 0) {
        return List_conj(this, arguments);
    } else {
        return this;
    }
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

    return list;
}

ListPrototype.pop = function() {
    var size = this.__size;

    if (size === 0) {
        return this;
    } else if (size === 1) {
        return emptyList;
    } else {
        return List_pop(this);
    }
};

function List_shift(_this) {
    var list = new List(INTERNAL_CREATE);

    list.__size = _this.__size - 1;
    list.__root = _this.__root.next;
    list.__tail = _this.__tail;

    return list;
}

ListPrototype.shift = function() {
    var size = this.__size;

    if (size === 0) {
        return this;
    } else if (size === 1) {
        return emptyList;
    } else {
        return List_shift(this);
    }
};

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

function List_push(_this, args, length) {
    var list = new List(INTERNAL_CREATE),

        oldRoot = _this.__root,

        tail = new Node(args[length - 1], null),
        first = length !== 1 ? pushCreateNodes(args, length - 1, tail) : tail,

        root = isNull(oldRoot) ? first : copyNodes(oldRoot, first);

    list.__size = _this.__size + length;
    list.__root = root;
    list.__tail = tail;

    return list;
}

ListPrototype.push = function() {
    var length = arguments.length;

    if (length !== 0) {
        return List_push(this, arguments, length);
    } else {
        return this;
    }
};

function ListIteratorValue(done, value) {
    this.done = done;
    this.value = value;
}

function ListIterator(next) {
    this.next = next;
}

function List_iterator(_this) {
    var node = _this.__root;

    return new ListIterator(function next() {
        var value;

        if (isNull(node)) {
            return new ListIteratorValue(true, undefined);
        } else {
            value = node.value;
            node = node.next;

            return new ListIteratorValue(false, value);
        }
    });
}

function List_iteratorReverse(_this) {
    var root = _this.__root,
        node = _this.__tail;

    return new ListIterator(function next() {
        var value;

        if (isNull(node)) {
            return new ListIteratorValue(true, undefined);
        } else {
            value = node.value;
            node = root !== node ? findParent(root, node) : null;

            return new ListIteratorValue(false, value);
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

ListPrototype.toString = function() {
    return "(" + this.toArray().join(" ") + ")";
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
