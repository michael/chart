// -------------------------------------------
// supports
// -------------------------------------------
// 2..3 measures
// -------------------------------------------
// measure#1: quantitative
// measure#2: quantitative
// measure#3: quantitative | ordinal (in future)

// 3 quantitative measures (3rd dimensions is encoded as dot size)

// register

Chart.visualizations['scatterplot'] = {
  className: 'Scatterplot',
  create: function(chart) {
    return new Scatterplot(chart);
  }
};

var Scatterplot = function(chart) {
  var that = this;
  this.chart = chart;
};

Scatterplot.prototype.render = function() {
  
  var w = this.chart.plotWidth()-15,
      h = this.chart.plotHeight()-5,
      that = this;
  
  var xAxis = this.chart.measures[0];
  var yAxis = this.chart.measures[1];
  
  if (!xAxis || !yAxis || xAxis.property.type() != "number" || yAxis.property.type() != "number")
    return

  
  var data = this.chart.collectionView.list("items").nodes,
      x = pv.Scale.linear(xAxis.min(), xAxis.max()).range(0, w),
      y = pv.Scale.linear(yAxis.min(), yAxis.max()).range(0, h),
      c = pv.Scale.linear(4, 40).range("#1f77b4", "#ff7f0e");
  
  var vis = new pv.Panel()
      .width(w)
      .height(h)
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(this.chart.margin.bottom)
      .canvas('chart');
  
  // xAxis
  vis.add(pv.Rule)
      .data(x.ticks())
      .strokeStyle("#eee")
      .left(function(d) { return parseInt(x(d))+0.5})
    .anchor("bottom").add(pv.Label)
      .font('12px Century Gothic');
  
  // yAxis
  vis.add(pv.Rule)
      .data(y.ticks())
      .strokeStyle("#eee")
      .lineWidth(1)
      .bottom(function(d) { return parseInt(y(d))+0.5})
    .anchor("left").add(pv.Label)
      .font('12px Century Gothic');
  
  // dots
  vis.add(pv.Panel)
    .data(data)
    .add(pv.Panel) // group dot and label for redraw
      .def("active", false)
    .add(pv.Dot)
      //.shape('square')
      .left(function(d) { return x(d.value(xAxis.key())); })
      .bottom(function(d) { return y(d.value(yAxis.key())); })
      .fillStyle(function() { return this.parent.active() ? "rgba(30, 120, 180, .9)" : "rgba(30, 120, 180, 0.4)"; })
          .event("mouseover", function() { return this.parent.active(true); })
          .event("mouseout", function() { return this.parent.active(false); })
    .anchor("right").add(pv.Label)
      .text(function(d) { return that.chart.identify(d); })
      .strokeStyle("green")
      .visible(function() { return this.parent.active(); });
  vis.render();
};

