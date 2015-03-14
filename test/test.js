var assert = require("assert"),
    List = require("../src/index");


describe("List", function() {
    describe("#constructor", function() {
        it("should create new list from passed arguments", function() {
            assert.deepEqual(new List(0, 1, 2).toArray(), [0, 1, 2]);
            assert.deepEqual(new List([0, 1, 2]).toArray(), [0, 1, 2]);
            assert.deepEqual(new List([0, 1, 2], 1, 2).toArray(), [
                [0, 1, 2], 1, 2
            ]);
        });
    });

    describe("#count()", function() {
        it("should return size of the List", function() {
            assert.equal(new List().count(), 0);
            assert.equal(new List([1, 2]).count(), 2);
            assert.equal(new List([1, 2], 3).count(), 2);
            assert.equal(new List(1).count(), 1);
        });
    });

    describe("#nth(index : Int)", function() {
        it("should return nth element in list undefined if out of bounds", function() {
            var list = new List(1, 2, 3);

            assert.equal(list.nth(0), 1);
            assert.equal(list.nth(1), 2);
            assert.equal(list.nth(2), 3);
            assert.equal(list.nth(3), undefined);
        });
    });

    describe("#set(index : Int, value : Any)", function() {
        it("should return a new list with the updated element at index if value is not the same", function() {
            var a = new List(0, 1, 2),
                b = a.set(0, 2),
                c = a.set(2, 0);

            assert.notEqual(b.__root, a.__root);
            assert.equal(b.__root.next, a.__root.next);
            assert.equal(b.__tail, a.__tail);

            assert.notEqual(c.__root, a.__root);
            assert.notEqual(c.__tail, a.__tail);

            assert.deepEqual(b.toArray(), [2, 1, 2]);
        });
    });

    describe("#insert(index : Int, ...values : Any)", function() {
        it("should return new List with inserted values at index", function() {
            var a = new List(0, 1, 2),
                b = a.insert(0, 1),
                c = a.insert(2, 3),
                d = a.insert(1, 1, 2);

            assert.equal(b.__root.next, a.__root);
            assert.equal(c.__root.next.next.next, a.__tail);
            assert.equal(d.__root.next.next.next.next, a.__tail);

            assert.deepEqual(b.toArray(), [1, 0, 1, 2]);
            assert.deepEqual(c.toArray(), [0, 1, 3, 2]);
            assert.deepEqual(d.toArray(), [0, 1, 2, 1, 2]);
        });
    });

    describe("#remove(index : Int[, count = 1 : int])", function() {
        it("should return new List with the removed count from index", function() {
            var a = new List(0, 1, 2),
                b = a.remove(0),
                c = a.remove(1),
                d = a.remove(2),
                e = a.remove(0, 2);

            assert.equal(b.__root, a.__root.next);
            assert.equal(c.__root.next, a.__root.next.next);
            assert.equal(e.__root, a.__root.next.next);

            assert.deepEqual(b.toArray(), [1, 2]);
            assert.deepEqual(c.toArray(), [0, 2]);
            assert.deepEqual(d.toArray(), [0, 1]);
            assert.deepEqual(e.toArray(), [2]);
        });
    });

    describe("#static equal(a : List, b : List)", function() {
        it("should return a deep equals of list a and b", function() {
            assert.equal(List.equal(new List(0, 1, 2), new List(0, 1, 2)), true);
            assert.equal(List.equal(new List(0, 1, 2), new List(1, 2, 3)), false);
            assert.equal(List.equal(new List(0, 1, 2), new List(0, 1, 3)), false);
        });
    });
});
