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
    var w = 200,
        h = 30,
        numberFormat = pv.Format.number(),
        dateFormat = pv.Format.date("%B %Y");

    /* Color by maximum number of people employed in that job. */
    var c = pv.Scale.log(minnesota, function(d) { return pv.max(d.values) })
        .range("#ccc", "#1f77b4");

    var chart = document.getElementById('chart');
    
    // prepare the data
    var data = [];
    
    this.chart.collection.list('items').each(function(index, item) {
      // console.log(item.value('name'));
      var values = item.node('similar_artists').get('properties', 'score').values('values');
      var sub_items = item.node('similar_artists').list('items');
      
      var values = [];
      var value_names = [];
      sub_items.each(function(index, item) {
        // values.push({name: item.identify(), value: item.value('score')});
        values.push(item.value('score'));
        value_names.push(item.identify());
      });
      
      data.push({name: item.value('name'), values: values, value_names: value_names});
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
    
    /* The area. */
    panel.add(pv.Area)
        .data(function(d) { return d.values; })
        .fillStyle(function(d, p) { return panel.i() < 0 ? c(pv.max(p.values)) : "#2ca02c"; })
        .left(function() { return panel.x()(this.index); })
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
        .text(function(d) { return panel.i() < 0 ? d.name 
            : d.value_names[panel.i()] + ": "+ d.values[panel.i()]; });
            
    vis.render();
  }
};