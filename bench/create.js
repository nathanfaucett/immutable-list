var Benchmark = require("benchmark"),
    mori = require("mori"),
    List = require("..");


var suite = new Benchmark.Suite();


suite.add("immutable-list", function() {
    new List(0, 1, 2, 3);
});

suite.add("mori list", function() {
    mori.list(0, 1, 2, 3);
});

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
    console.log("==========================================\n");
});

console.log("\n= create =================================");
suite.run();
