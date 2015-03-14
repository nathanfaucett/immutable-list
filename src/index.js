var create = require("create"),
    isArrayLike = require("is_array_like"),
    fastSlice = require("fast_slice"),
    isEqual = require("is_equal");


var ListPrototype = List.prototype,
    ITERATOR_SYMBOL = typeof(Symbol) === "function" ? Symbol.iterator : false;


module.exports = List;


function List(value) {
    var length = arguments.length;

    if (isArrayLike(value) && length === 1) {
        fromJS(this, value);
    } else if (length > 1) {
        fromJS(this, arguments);
    } else if (length === 1) {
        this.__root = this.__tail = new Node(value, null);
        this.__size = 1;
    }
}

ListPrototype.__size = 0;
ListPrototype.__root = null;
ListPrototype.__tail = null;

ListPrototype.count = function() {
    return this.__size;
};

ListPrototype.nth = function(index) {
    var node = nth(this, index);

    if (node !== undefined) {
        return node.value;
    } else {
        return undefined;
    }
};

ListPrototype.set = function(index, value) {
    var node = nth(this, index);

    if (node !== undefined) {
        if (isEqual(node.value, value)) {
            return this;
        } else {
            return set(this, node, index, value);
        }
    } else {
        throw new Error("List set(index, value) index out of bounds");
    }
};

ListPrototype.insert = function(index) {
    var node = nth(this, index);

    if (node !== undefined) {
        return insert(this, node, index, fastSlice(arguments, 1));
    } else {
        throw new Error("List insert(index, value) index out of bounds");
    }
};

ListPrototype.remove = function(index, count) {
    var node;

    count = count || 1;

    if (count > 0) {
        node = nth(this, index);

        if (node !== undefined) {
            return remove(this, node, count);
        } else {
            throw new Error("List remove(index[, count=1]) index out of bounds");
        }
    } else {
        return this;
    }
};

ListPrototype.conj = function() {
    var length = arguments.length;

    if (length !== 0) {
        return conj(this, arguments, length);
    } else {
        return this;
    }
};

ListPrototype.iterator = function(reverse) {
    var root, node;

    if (reverse === true) {
        root = this.__root;
        node = this.__tail;
    } else {
        node = this.__root;
    }

    return {
        next: function next() {
            var value;

            if (node === null) {
                return {
                    done: true,
                    value: undefined
                };
            } else {
                value = node.value;
                node = reverse === true ? (root !== node ? findParent(root, node) : root) : node.next;

                return {
                    done: false,
                    value: value
                };
            }
        }
    };
};

if (ITERATOR_SYMBOL) {
    ListPrototype[ITERATOR_SYMBOL] = ListPrototype.iterator;
}

ListPrototype.toArray = function() {
    var array = [],
        node = this.__root;

    while (node !== null) {
        array[array.length] = node.value;
        node = node.next;
    }

    return array;
};

ListPrototype.toString = function() {
    return "(" + this.toArray().join(" ") + ")";
};

ListPrototype.inspect = function() {
    return this.toString();
};

List.equal = function(a, b) {
    if (!a || !b || a.__size !== b.__size) {
        return false;
    } else {
        a = a.__root;
        b = b.__root;

        while (a !== null && b !== null) {
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

function conj(list, args, length) {
    var newList = create(ListPrototype),

        root = list.__root,
        tail = list.__tail,
        size = list.__size,
        il = length - 1,
        i;

    if (tail !== null) {
        i = -1;
    } else {
        i = 0;
        root = tail = new Node(args[i], null);
    }

    while (i++ < il) {
        root = new Node(args[i], root);
    }

    newList.__size = length + size;
    newList.__root = root;
    newList.__tail = tail;

    return newList;
}

function findNext(node, count) {
    while (count-- && node !== null) {
        node = node.next;
    }

    return node;
}

function remove(list, node, count) {
    var newList = create(ListPrototype),
        next = findNext(node, count),
        root = copyFromTo(list.__root, node, next),
        tail = next !== null ? next : list.__tail;

    newList.__size = list.__size;
    newList.__root = root;
    newList.__tail = tail;

    return newList;
}

function findParent(parent, node) {
    var next = parent.next;

    if (next !== node) {
        return findParent(next, node);
    } else {
        return parent;
    }
}

function createNodes(values, index, length, root) {
    var i = index - 1,
        il = length - 2;

    while (i++ < il) {
        root = new Node(values[i], root);
    }

    return root;
}

function insert(list, node, index, values) {
    var newList = create(ListPrototype),

        oldRoot = list.__root,
        parent = oldRoot !== node ? findParent(oldRoot, node) : null,

        length = values.length,

        last = new Node(values[length - 1], node),
        first = createNodes(values, 0, length, last),

        root = parent !== null ? copyFromTo(oldRoot, node, first) : first;

    newList.__size = list.__size + length;
    newList.__root = root;
    newList.__tail = last;

    return newList;
}

function copyFromTo(from, to, newNode) {
    if (from !== to) {
        return new Node(from.value, copyFromTo(from.next, to, newNode));
    } else {
        return newNode;
    }
}

function set(list, node, index, value) {
    var newList = create(ListPrototype),
        newNode = new Node(value, node.next),
        root = copyFromTo(list.__root, node, newNode),
        tail = node.next === null ? newNode : list.__tail;

    newList.__size = list.__size;
    newList.__root = root;
    newList.__tail = tail;

    return newList;
}

function nth(list, index) {
    var size = list.__size;

    if (index < 0 || index >= size) {
        return undefined;
    } else if (index === 0) {
        return list.__root;
    } else if (index === size - 1) {
        return list.__tail;
    } else {
        return findNode(list.__root, index);
    }
}

function fromJS(list, array) {
    var length = array.length,
        i = length - 1,
        tail = new Node(array[i], null),
        root = tail;

    while (i--) {
        root = new Node(array[i], root);
    }

    list.__size = length;
    list.__root = root;
    list.__tail = tail;
}

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
