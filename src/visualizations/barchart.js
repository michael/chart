// -------------------------------------------
// supports
// -------------------------------------------
// 1 quantitative measure
// -------------------------------------------
// measure#1: quantitative

var Barchart = function (chart) {
  var that = this;
  this.chart = chart;
};

// register on the chart object
Chart.visualizations.barchart = {
  className: 'Barchart',
  create: function (chart) {
    return new Barchart(chart);
  }
};

Barchart.prototype = {
  render: function () {
    
    var w = this.chart.plotWidth(),         
        h = this.chart.plotHeight(),    
        yProp = this.chart.collection.get("properties", this.chart.measures[0].property),
        that = this,
        data = this.chart.collection.list("items").nodes,
        yMin = yProp.aggregate(Aggregators.MIN),
        yMax = yProp.aggregate(Aggregators.MAX),
        y = pv.Scale.linear(yMin, yMax).nice().range(0, w),
        vis;
    
    
    vis = new pv.Panel()
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(this.chart.margin.bottom)
      .width(4000)
      .height(h)
      .canvas('chart');
      
    // yAxis
    vis.add(pv.Rule)
        .data(y.ticks())
        .strokeStyle("#eee")
        .lineWidth(1)
        .bottom(function (d) {
          return parseInt(y(d), 10) + 0.5;
        })
      .anchor("left").add(pv.Label)
        .font('12px Century Gothic');
    
    vis.add(pv.Panel)
        .data(data)
        .left(function () {
          return this.index * 15; 
        })
      .add(pv.Panel) // group bar and label for redraw
        .def("active", false)
      .add(pv.Bar)
        .bottom(0)
        .width(10)
        .height(function (d) {
          return y(d.value(yProp.key()));
        })
        .fillStyle(function () {
          return this.parent.active() ? "orange" : "steelblue";
        }) 
        .event("mouseover", function () {
          return this.parent.active(true);
        })
        .event("mouseout", function () {
          return this.parent.active(false); 
        })
      .anchor("top").add(pv.Label)
        .bottom(20)
        .text(function (d) {
          return that.chart.identify(d);
        })
        .font('12px Century Gothic')
        .visible(function () {
          return this.parent.active();
        });
    vis.render();
  }
};

