var tape = require("tape"),
    List = require("..");


tape("List() should create new list from passed arguments", function(assert) {
    assert.deepEqual(new List(0, 1, 2).toArray(), [0, 1, 2]);
    assert.deepEqual(new List([0, 1, 2]).toArray(), [0, 1, 2]);
    assert.deepEqual(new List([0, 1, 2], 1, 2).toArray(), [
        [0, 1, 2], 1, 2
    ]);

    assert.end();
});

tape("List size() should return size of the List", function(assert) {
    assert.equal(new List().size(), 0);
    assert.equal(new List([1, 2]).size(), 2);
    assert.equal(new List([1, 2], 3).size(), 2);
    assert.equal(new List(1).size(), 1);
    assert.end();
});

tape("List conj(...values) should add values to front of list", function(assert) {
    var a = new List(1, 2),
        b = a.conj(0),
        c = a.conj(0, 1, 2);

    assert.deepEqual(b.toArray(), [0, 1, 2]);
    assert.deepEqual(c.toArray(), [2, 1, 0, 1, 2]);

    assert.end();
});

tape("List push(...values) should push values to end of list", function(assert) {
    var a = new List(1, 2),
        b = a.push(0),
        c = a.push(0, 1, 2);

    assert.deepEqual(b.toArray(), [1, 2, 0]);
    assert.deepEqual(c.toArray(), [1, 2, 0, 1, 2]);

    assert.end();
});

tape("List pop() should return list without last element of list", function(assert) {
    var a = new List(1, 2, 3),
        b = a.pop(),
        c = b.pop(),
        d = c.pop(),
        e = d.pop();

    assert.deepEqual(b.toArray(), [1, 2]);
    assert.deepEqual(c.toArray(), [1]);
    assert.equal(b.size(), 2);
    assert.equal(c.size(), 1);
    assert.equal(d.size(), 0);
    assert.equal(d, e);

    assert.end();
});

tape("List shift() should return list without first element of list", function(assert) {
    var a = new List(1, 2, 3),
        b = a.shift(),
        c = b.shift(),
        d = c.shift(),
        e = d.shift();

    assert.deepEqual(b.toArray(), [2, 3]);
    assert.deepEqual(c.toArray(), [3]);
    assert.equal(b.size(), 2);
    assert.equal(c.size(), 1);
    assert.equal(d.size(), 0);
    assert.equal(d, e);

    assert.end();
});

tape("List get(index : Int) should return nth element in list undefined if out of bounds", function(assert) {
    var list = new List(1, 2, 3);

    assert.equal(list.get(0), 1);
    assert.equal(list.get(1), 2);
    assert.equal(list.get(2), 3);
    assert.equal(list.get(3), undefined);

    assert.end();
});

tape("List first() should return first element from list", function(assert) {
    var a = new List(1, 2, 3);
    assert.equal(a.first(), 1);
    assert.end();
});

tape("List last() should return last element from list", function(assert) {
    var a = new List(1, 2, 3);
    assert.equal(a.last(), 3);
    assert.end();
});

tape("List set(index : Int, value : Any) should return a new list with the updated element at index if value is not the same", function(assert) {
    var a = new List(0, 1, 2),
        b = a.set(0, 2),
        c = a.set(2, 0);

    assert.notEqual(b.__root, a.__root);
    assert.equal(b.__root.next, a.__root.next);
    assert.equal(b.__tail, a.__tail);

    assert.notEqual(c.__root, a.__root);
    assert.notEqual(c.__tail, a.__tail);

    assert.deepEqual(b.toArray(), [2, 1, 2]);

    assert.end();
});

tape("List insert(index : Int, ...values : Any) should return new List with inserted values at index", function(assert) {
    var a = new List(0, 1, 2),
        b = a.insert(0, 1),
        c = a.insert(2, 3),
        d = a.insert(1, 1, 2);

    assert.equal(b.__root.next, a.__root);
    assert.equal(c.__root.next.next.next, a.__tail);
    assert.equal(d.__root.next.next.next, a.__root.next);

    assert.deepEqual(b.toArray(), [1, 0, 1, 2]);
    assert.deepEqual(c.toArray(), [0, 1, 3, 2]);
    assert.deepEqual(d.toArray(), [0, 1, 2, 1, 2]);

    assert.end();
});

tape("List remove(index : Int[, count = 1 : int]) should return new List with the removed count from index", function(assert) {
    var a = new List(0, 1, 2),
        b = a.remove(0),
        c = a.remove(1),
        d = a.remove(2),
        e = a.remove(0, 2),
        f = e.remove(0);

    assert.equal(b.__root, a.__root.next);
    assert.equal(c.__root.next, a.__root.next.next);
    assert.equal(e.__root, a.__root.next.next);

    assert.deepEqual(b.toArray(), [1, 2]);
    assert.deepEqual(c.toArray(), [0, 2]);
    assert.deepEqual(d.toArray(), [0, 1]);
    assert.deepEqual(e.toArray(), [2]);
    assert.deepEqual(f.toArray(), []);

    assert.end();
});

tape("List static equal(a : List, b : List) should return a deep equals of list a and b", function(assert) {
    assert.equal(List.equal(new List(0, 1, 2), new List(0, 1, 2)), true);
    assert.equal(List.equal(new List(0, 1, 2), new List(1, 2, 3)), false);
    assert.equal(List.equal(new List(0, 1, 2), new List(1, 2)), false);
    assert.equal(List.equal(new List(0, 1, 2), new List()), false);
    assert.equal(List.equal(new List(0, 1, 2), new List(0, 1, 3)), false);
    assert.equal(List.equal(new List(0, 1, 2), new List(0, 1, 2, 3)), false);

    assert.end();
});

tape("List iterator([reverse = false : Boolean]) (reverse = false) should return Iterator starting from the beginning", function(assert) {
    var a = new List(0, 1, 2),
        it = a.iterator();

    assert.equal(it.next().value, 0);
    assert.equal(it.next().value, 1);
    assert.equal(it.next().value, 2);
    assert.equal(it.next().done, true);

    assert.end();
});

tape("List iterator([reverse = false : Boolean]) (reverse = true) should return Iterator starting from the end", function(assert) {
    var a = new List(0, 1, 2),
        it = a.iterator(true);

    assert.equal(it.next().value, 2);
    assert.equal(it.next().value, 1);
    assert.equal(it.next().value, 0);
    assert.equal(it.next().done, true);

    assert.end();
});

tape("List every(callback[, thisArg])", function(assert) {
    assert.equals(
        List.of([0, 1, 2, 3, 4, 5]).every(function(value, index) {
            return value === index;
        }),
        true
    );
    assert.equals(
        List.of([0, 1, 2, 3, 4, 5]).every(function(value) {
            return value === 1;
        }),
        false
    );
    assert.end();
});

tape("List filter(callback[, thisArg])", function(assert) {
    assert.deepEquals(
        List.of([0, 0, 2, 2, 4, 4]).filter(function(value, index) {
            return value === index;
        }).toArray(), [0, 2, 4]
    );
    assert.end();
});

tape("List forEach(callback[, thisArg])", function(assert) {
    var count = 0;

    List.of([0, 1, 2, 3, 4]).forEach(function() {
        count += 1;
    });
    assert.equals(count, 5);

    count = 0;
    List.of([0, 1, 2, 3, 4]).forEach(function(value) {
        count += 1;
        if (value === 2) {
            return false;
        }
    });
    assert.equals(count, 3);

    assert.end();
});

tape("List map(callback[, thisArg])", function(assert) {
    assert.deepEquals(
        List.of([0, 1, 2, 3, 4]).map(function(value, index) {
            return value + index;
        }).toArray(), [0, 2, 4, 6, 8]
    );
    assert.end();
});

tape("List reduce(callback[, thisArg])", function(assert) {
    assert.deepEquals(
        List.of([0, 1, 2, 3, 4]).reduce(function(currentValue, value) {
            return currentValue + value;
        }),
        10
    );
    assert.end();
});

tape("List reduceRight(callback[, thisArg])", function(assert) {
    assert.deepEquals(
        List.of([0, 1, 2, 3, 4]).reduceRight(function(currentValue, value) {
            return currentValue + value;
        }),
        10
    );
    assert.end();
});

tape("List some(callback[, thisArg])", function(assert) {
    assert.equals(
        List.of([0, 1, 2, 3, 4, 5]).some(function(value) {
            return value === 3;
        }),
        true
    );
    assert.equals(
        List.of([0, 1, 2, 3, 4, 5]).some(function(value) {
            return value === 6;
        }),
        false
    );
    assert.end();
});

tape("List toString() should return toString representation of List", function(assert) {
    assert.equal((new List(0, 1, 2)).toString(), "(0 1 2)");
    assert.end();
});
