var Benchmark = require("benchmark"),
    mori = require("mori"),
    List = require("..");


var suite = new Benchmark.Suite();


suite.add("immutable-list", function() {
    var a = new List(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    return function() {
        a.set(0, 1);
        a.set(5, 1);
        a.set(9, 1);
    };
}());

suite.add("mori list", function() {
    var a = mori.list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    return function() {
        mori.set(a, 0, 1);
        mori.set(a, 5, 1);
        mori.set(a, 9, 1);
    };
}());

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
    console.log("=========================================\n");
});

console.log("\n= set ===================================");
suite.run();
