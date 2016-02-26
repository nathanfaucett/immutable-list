var Benchmark = require("benchmark"),
    mori = require("mori"),
    List = require("..");


var suite = new Benchmark.Suite();


suite.add("immutable-list", function() {
    var a = new List(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    return function() {
        a.conj(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    };
}());

suite.add("mori list", function() {
    var a = mori.list(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

    return function() {
        mori.conj(a, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    };
}());

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
    console.log("==========================================\n");
});

console.log("\n= conj ===================================");
suite.run();
