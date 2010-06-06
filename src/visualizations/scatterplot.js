// -------------------------------------------
// supports
// 2..3 measures
// -------------------------------------------
// measure#1: quantitative
// measure#2: quantitative
// measure#3: quantitative | ordinal (not yet implemented)
// 3 quantitative measures (3rd dimensions will be encoded with dot size)

// register at the chart object
Chart.visualizations['scatterplot'] = {
  className: 'Scatterplot',
  create: function(chart) {
    return new Scatterplot(chart);
  }
};

var Scatterplot = function (chart) {
  this.chart = chart;
};

Scatterplot.prototype.render = function() {
  var w = this.chart.plotWidth()-15,
      h = this.chart.plotHeight()-5,
      that = this,
      xProp = this.chart.collection.get("properties", this.chart.measures[0].property),
      yProp = this.chart.collection.get("properties", this.chart.measures[1].property),
      xMin = xProp.aggregate(Aggregators.MIN),
      xMax = xProp.aggregate(Aggregators.MAX),
      yMin = yProp.aggregate(Aggregators.MIN),
      yMax = yProp.aggregate(Aggregators.MAX),
      x, y, data;
      
  /* Sizing parameters and scales. */
  x = pv.Scale.linear(xMin, xMax).range(0, w);
  y = pv.Scale.linear(yMin, yMax).range(0, h);
  
  data = this.chart.collection.list("items").nodes;

  /* The root panel. */
  var vis = new pv.Panel()
      .width(w)
      .height(h)
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(this.chart.margin.bottom)
      .strokeStyle("#aaa")
      .canvas('chart');

  /* X-axis and ticks. */
  vis.add(pv.Rule)
      .data(function() { return x.ticks(); })
      .strokeStyle(function(d) {return d ? "#ccc" : "#999"; })
      .left(function(d) { return parseInt(x(d), 10)+0.5; })
    .anchor("bottom").add(pv.Label)
      .text(x.tickFormat)
      .font('12px Century Gothic');
  
  /* Y-axis and ticks. */
  vis.add(pv.Rule)
      .data(function() { return y.ticks(); })
      .strokeStyle(function(d) { return d ? "#ccc" : "#999"; })
      .bottom(function(d) { return parseInt(y(d), 10)+0.5; })
    .anchor("left").add(pv.Label)
      .text(y.tickFormat)
      .font('12px Century Gothic');
  
  /* The dot plot. */
  vis.add(pv.Panel)
      .overflow("hidden")
      .data(data)
      .add(pv.Panel) // group dot and label for redraw
        .def('active', false)
      // .events("all") // - eats all the events that should reach dots.
      .event("mousedown", pv.Behavior.pan())
      .event("mousewheel", pv.Behavior.zoom())
      .event("pan", transform)
      .event("zoom", transform)
  
      .add(pv.Dot)
        .left(function(d) { return x(d.value(xProp.key())); })
        .bottom(function(d) { return y(d.value(yProp.key())); })
        .radius(function() { return 5 / this.scale; })
        .fillStyle(function() { return this.parent.active() ? "rgba(30, 120, 180, .9)" : "rgba(30, 120, 180, 0.4)"; })
          .event("mouseover", function() { return this.parent.active(true); })
          .event("mouseout", function() { return this.parent.active(false); })
      .anchor("right").add(pv.Label)
        .text(function(d) { return that.chart.identify(d); })
        .strokeStyle("green")
        .font('12px Century Gothic')
        .visible(function() { return this.parent.active(); });
    
  /** Update the x- and y-scale domains per the new transform. */
  function transform() {
    var t = this.transform().invert(),
        t2 = t.translate(0,0), // a copy of the transform object
        tMin, 
        tMax;
    
    t2.y = -t2.y; // invert the y-offset, because center is on left bottom edge
    tMin = t2.translate(x(xMin), y(yMin));
    tMax = t2.translate(x(xMax), y(yMax));
    x.domain(x.invert(tMin.x), x.invert(tMax.x));
    y.domain(y.invert(tMin.y), y.invert(tMax.y));
    vis.render();
  }
  
  vis.render();
};
