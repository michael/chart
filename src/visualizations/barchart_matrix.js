// -------------------------------------------
// supports
// -------------------------------------------
// 1 quantitative measure (scoped within a subcollection)
// -------------------------------------------
// measure#1: 

var minnesota;

var BarchartMatrix = function (chart) {
  var that = this;
  this.chart = chart;
};

// register on the chart object
Chart.visualizations.barchart_matrix = {
  className: 'BarchartMatrix',
  create: function (chart) {
    return new BarchartMatrix(chart);
  }
};

BarchartMatrix.prototype = {
  render: function () {
    console.log("trying to render...");
    
    if (!this.chart.measures[0]) return;
    var w = 200,
        h = 30,
        numberFormat = pv.Format.number(),
        dateFormat = pv.Format.date("%B %Y"),
        property = this.chart.measures[0].property,
        nested_property = this.chart.measures[0].properties[1];
    
    // make sure if the specified properties are valid
    if (!this.chart.collection.get('properties', property)) return;
    
    /* Color by maximum number of people employed in that job. */
    var c = pv.Scale.log(minnesota, function(d) { return pv.max(d.values) })
        .range("#ccc", "#1f77b4");
    var chart = document.getElementById('chart');
    
    // prepare the data
    var data = [];
    
    var items = this.chart.collection.list('items');
    // sort by name
    items.sort(function(item1, item2) {
      var value1 = item1.value('source'),
          value2 = item2.value('source');
      return value1 === value2 ? 0 : (value1 < value2 ? -1 : 1);
    });
    
    items.each(function(index, item) {
      var sub_items = item.node(property).list('items');

      var values = [];
      var value_names = [];
      var correct_matches = [];
      var correct_matches_count = 0;
      sub_items.each(function(index, i) {
        values.push(i.value(nested_property));
        value_names.push(i.identify());

        var correct = item.value('checker') === i.value('checker');
        if (correct) correct_matches_count++;
        correct_matches.push(correct);
      });
      
      var accuracy = correct_matches_count / values.length;
      data.push({name: item.identify(), values: values, value_names: value_names, correct_matches: correct_matches, accuracy: accuracy});
    });
    
    var items = this.chart.collection.get('items');
    /* Tile the visualization for each job. */
    var vis = new pv.Panel()
        .data(data)
        .width(w)
        // .fillStyle('red')
        .height(h + 10)
        .top(6)
        .left(6)
        .right(6)
        .bottom(6)
        .canvas(function() { return chart.appendChild(document.createElement("span")); })
    
    /* A panel instance to store scales (x, y) and the mouseover index (i). */
    var panel = vis.add(pv.Panel)
        .def("i", -1)
        .def("x", function(d) { return pv.Scale.linear(d.values, pv.index).range(0, w); })
        .def("y", function(d) { return pv.Scale.linear(0, pv.max(d.values)).range(0, h); })
        .bottom(10)
        .events("all")
        .event("mousemove", pv.Behavior.point(Infinity).collapse("y"));
  
    // closure for the correct_matches
    var cached_data;
    
    /* The area. */
    panel.add(pv.Bar)
        .data(function(d) { cached_data = d; return d.values; })
        .fillStyle(function(d, p) { return cached_data.correct_matches[this.index] ? "#3c99b7" : "#90250c"; })
        .left(function() { return parseInt(panel.x()(this.index)); })
        .width(8)
        .height(function(d) { return panel.y()(d); })
        .bottom(0)
        .event("point", function() { return panel.i(this.index) })
        .event("unpoint", function() { return panel.i(-1) });
    
    /* The x-axis. */
    panel.add(pv.Rule)
        .bottom(0);
    
    /* The mouseover dot. */
    panel.add(pv.Dot)
        .visible(function() { return panel.i() >= 0; })
        .left(function() { return panel.x()(panel.i()); })
        .bottom(function(d) { return panel.y()(d.values[panel.i()]); })
        .fillStyle("#ff7f0e")
        .strokeStyle(null)
        .size(10);
    
    /* The label: either the job name, or the month and value. */
    panel.add(pv.Label)
        .bottom(-1)
        .textBaseline("top")
        .left(function() { return panel.i() < 0 ? 0 : null })
        .right(function() { return panel.i() < 0 ? null : 0 })
        .textAlign(function() { return panel.i() < 0 ? "left" : "right"; })
        .textStyle(function() { return panel.i() < 0 ? "#999" : "#000"; })
        .text(function(d) { return panel.i() < 0 ? ""
            : d.value_names[panel.i()] + ": "+ d.values[panel.i()]; });

    panel.add(pv.Label)
      .bottom(-1)
      .textBaseline("top")
      // .left(function() { return panel.i() < 0 ? 0 : null })
      // .right(function() { return panel.i() < 0 ? null : 0 })
      .textStyle(function() { return panel.i() < 0 ? "#999" : "#000"; })
      .textAlign('left')
      .text(function(d) { return d.name+" ("+d.accuracy+")"; });
    

    vis.render();
    console.log("rendered");
  }
};