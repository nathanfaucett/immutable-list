var Benchmark = require("benchmark"),
    mori = require("mori"),
    List = require("..");


var suite = new Benchmark.Suite();


suite.add("immutable-list", function() {
    var a = new List();
    a.conj(0, 1, 2);
});

suite.add("mori vector", function() {
    var a = mori.list();
    mori.conj(a, 0, 1, 2);
});

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
});

suite.run();
