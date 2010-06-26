// -------------------------------------------
// supports
// -------------------------------------------
// 2 quantitative measure
// -------------------------------------------
// measure#1: quantitative
// allow multi-series (grouped barchart)

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
    
    var width = this.chart.plotWidth()-50,         
        height = this.chart.plotHeight()-110,    
        yProp = this.chart.collection.get("properties", this.chart.measures[0].property),
        that = this,
        items = this.chart.collection.all("items").values(),
        yMin = yProp.aggregate(Aggregators.MIN),
        yMax = yProp.aggregate(Aggregators.MAX),
        y = pv.Scale.linear(yMin, yMax).nice().range(0, height-20),
        x = pv.Scale.linear(0, items.length).range(10, width),
        formatter = pv.Format.number(),
        vis;
        
    vis = new pv.Panel()
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(100)
      .width(4000)
      .height(height)
      .canvas('chart');
      
    // yAxis ticks
    vis.add(pv.Rule)
        .data(y.ticks())
        .strokeStyle("#eee")
        .lineWidth(1)
        .bottom(function (d) {
          return parseInt(y(d), 10) + 0.5;
        })
      .anchor("left").add(pv.Label)
        .text(y.tickFormat)
        .font('11px Helvetica')
        .textStyle('#777');
  
    // yAxis Name
    vis.add(pv.Label)
      .text(yProp.name)
      .left(-85)
      .top(height/2)
      .textAngle(-Math.PI / 2)
      .textStyle('#555')
      .font('bold 14px Helvetica');
        
    // actual data
    vis.add(pv.Panel)
        .data(items)
        .left(function () {
          return this.index * 15; 
        })
      .add(pv.Panel) // group bar and label for redraw
        .def("active", false)
      .add(pv.Bar)
        .bottom(0)
        .width(10)
        .height(function (d) {
          return y(d.value(yProp.key));
        })
        .fillStyle(function () {
          return this.parent.active() ? "#C9EF5E" : "#99B24F";
        }) 
        .event("mouseover", function () {
          return this.parent.active(true);
        })
        .event("mouseout", function () {
          return this.parent.active(false); 
        })
      .anchor("top").add(pv.Label)
        .bottom(-10)
        .left(0)
        .textAlign("right")
        .textAngle(-Math.PI / 2)
        .text(function (d) {
          return d.identify();
        })
        .textStyle(function(d) {
          return this.parent.active() ? '#000' : '#777'
        })
        .font('11px Helvetica')
      .anchor("top")
        .add(pv.Label)
          .text(function (d) {
            return formatter.format(d.value(yProp.key));
          })
          .bottom(function (d) { return y(d.value(yProp.key))+20; })
          .font('bold 11px Helvetica')
          .visible(function () { return this.parent.active(); });
    vis.render();
  }
};

