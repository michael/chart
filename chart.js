/***************************************************************/
/* Pull in tinylog (nasty Hack)                                 
/***************************************************************/

var tinylog = {}

$(function() {
  tinylog.log = Processing(document.getElementById('chart'), function(p) {}).println
});

/***************************************************************/
/* Utility functions                                                      
/***************************************************************/

Util = {
  extractExponent: function(x) {
    return parseInt(x.toExponential().split("e")[1]);
  },
  niceNum: function(x, round) {
    var exp, // exponent of x
        f, // fractional part of x
        nf; // nice, rounded fraction
    
    exp = Util.extractExponent(x); // instead of floor(log10(x)) which doesn't work properly in javascript
    f = x / Math.pow(10, exp); // between 1 and 10
    
    if (round) {
      if (f < 1.5) nf = 1;
      else if (f < 3) nf = 2;
      else if (f < 7) nf = 5;
      else nf = 10;
    } else {
      if (f <= 1) nf = 1;
      else if (f <= 2) nf = 2;
      else if (f <= 5) nf = 5;
      else nf = 10;
    }
    return nf*Math.pow(10, exp);
  }
}

/***************************************************************/
/* Chart                                                      
/***************************************************************/

Chart = function Chart(element) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.series = [];

  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
}


Chart.COLORS = [
  [177, 102, 73],
  [171, 199, 49],
  [128, 142, 137],
  [131, 127, 67],
  [171, 199, 49],
  [144, 150, 60],
  [134, 162, 169],
  [162, 195, 85],
  [154, 191, 123],
  [147, 186, 161],
  [141, 181, 200],
  [177, 102, 73],
  [122, 122, 104],
  [157, 175, 55]
];

Chart.prototype = {
  plotHeight: function() {
    return this.height-(this.margin.top+this.margin.bottom);
  },
  plotWidth: function() {
    return this.width-(this.margin.left+this.margin.right);
  },
  addSeries: function(series) {
    this.series.push(series);
  },
  setupAxes: function(options) {    
    this.xAxis = new Axis(this, this.plotWidth(), true, options.xAxis);
    this.yAxis = new Axis(this, this.plotHeight(), false, options.yAxis);
  },
  // called in chart obj context
  draw: function(p) {
    p.background(255);
    p.smooth();
    
    // center the plotarea
    p.translate(this.margin.left, this.margin.top);
    
    // color for the plot area
    p.fill(244);
    p.rect(0,0,this.plotWidth(), this.plotHeight());
    
    var font = p.loadFont("Century Gothic"); 
    p.textFont(font, 12); 
    
    // draw xAxis
    this.xAxis.draw(p);
    
    // draw yAxis
    this.yAxis.draw(p);
    
    // draw series
    $.each(this.series, function(i, series) {
      series.draw(p);
    });
    
    p.exit();
  },
  render: function() {
    var elem = this.element;
    var that = this;
    
    var pjs_code = function(p) {
  		p.setup = function() {
  			p.size(elem.width(), elem.height());
  			p.noStroke();
  			p.frameRate(60);
  		}
    
      p.draw = function() { that.draw(p) };
      p.init();
    };
    
    this.processingControl = Processing(this.element[0], pjs_code);
    
    // debug
    tinylog.log("xAxis: "+this.xAxis.inspect());
    tinylog.log("yAxis: "+this.yAxis.inspect());
  }
}


/***************************************************************/
/* Series                                                      
/***************************************************************/

var Series = function(chart, index, seriesOptions) {
  // constructing 
  this.chart = chart;
  
  this.index = index;
  this.points = [];
  this.name = seriesOptions.name;
  
  that = this;
  
  // initialize data points
  $.each(seriesOptions.data, function(idx, p) {
    that.points.push(new Point(that, p));
  });
};

Series.prototype = {
	destroy: function() {
	  // TODO: implement
	},
	draw: function(p) {
	  var that = this;
    p.fill(p.color.apply(p,Chart.COLORS[this.index]));
    
    // draw points whereby j is the category index
    $.each(this.points, function(j, point) {
      var yAxis = that.chart.yAxis, 
          xAxis = that.chart.xAxis,
          height = that.chart.height;

      var categoryDim = that.chart.plotWidth() / xAxis.categories.length;
      var categorySpacing = categoryDim*0.04;
      var pointSpacing = 5;
      var pointXDim = (categoryDim / that.chart.series.length)-pointSpacing-categorySpacing;
      
      var xOffset = Math.round(j*(categoryDim+categorySpacing) + that.index*(pointXDim+pointSpacing));
            
      p.rect(xOffset,that.chart.plotHeight()-yAxis.translate(point.y), pointXDim, yAxis.translate(point.y));
    });
	}
};


/***************************************************************/
/* Axis                                                      
/***************************************************************/


Axis = function(chart, length, isXAxis, options) {
	this.chart = chart;
	this.title = options.title;
	this.length = length; // the axis total length (in pixels)
	this.categories = options.categories;
	
	this.isXAxis = isXAxis;
	this.dataMin = Infinity;
	this.dataMax = -Infinity;
	
	// TODO: user set min/max

	// set min and max, tickInterval, scale etc.
	this.update();

} // end Axis

Axis.prototype = {
  /**
   * Get the minimum and maximum for the series of each axis 
   * a series can belong to an axis. in our case it's always the x-axis
   */
  update: function() {

    // calculate
    if (this.isXAxis) {
      this.computeCategoryTicks();
    } else {
      // find out min/max on data level
      this.computeDataExtremes();
      this.computeLooseTicks(this.dataMin, this.dataMax, 5);
    }
    
    this.setScale();
  },
  // translates the given data value to the corresponding pixel value
  translate: function(value) {
    // CAUTION: not sure if -this.graphMin should go here
    return Math.round((value-this.graphMin)*this.scale);
  },
  // consider all series and find the min/max values
  // TODO: consider moving this to Chart
  computeDataExtremes: function() {
    var that = this;
    $.each(that.chart.series, function(i, series) {
      that.dataMin = Math.min(that.dataMin, Math.min.apply(this, $.map(series.points, function(p) { return p.y; })));
      that.dataMax = Math.max(that.dataMax, Math.max.apply(this, $.map(series.points, function(p) { return p.y; })));
    });
  },
  computeCategoryTicks: function() {
    this.graphMin = 0;
    this.graphMax = this.categories.length-1;
    
    this.tickInterval = 1;
    this.nFract = 0;
    this.nTicks = this.categories.length;
  },
  computeLooseTicks: function(min, max, desiredNTicks) {
    var range;
        
    range = Util.niceNum(max-min, false);
    
    this.tickInterval = Util.niceNum(range / (desiredNTicks-1), true);
    this.graphMin = Math.floor(min / this.tickInterval)*this.tickInterval;
    this.graphMax = Math.ceil(max / this.tickInterval)*this.tickInterval;
    
    this.nFract = Math.max(-Util.extractExponent(this.tickInterval),0);
    
    this.nTicks = 0; // how many ticks do actually fit for the nice tickInterval
    for (var x = this.graphMin; x <= this.graphMax+0.5*this.tickInterval; x += this.tickInterval) {
      this.nTicks += 1;
    }
  },
  /**
   * Set the scale based on data min and max, user set min and max or options
   */
  setScale: function() {
    // is just a factor, each data value is multiplied with the scale value to fit on display
    this.scale = this.length / (this.graphMax-this.graphMin);
  },
  draw: function(p) {
    if (this.isXAxis) {
      
    } else {
      for(var i = 0; i<this.nTicks; i++) {
        p.fill(66);
        var y = this.chart.plotHeight()-this.translate(i*this.tickInterval+this.graphMin);
        y += 0.5; // needs to be shifted for some reason (probably caused by the PJS patch)

        // TODO: only show nFrac fractional digits
        p.text(this.graphMin+i*this.tickInterval, -40, y);
        
        p.stroke(180);
        p.strokeWeight(1);
        p.line(0, y, this.chart.plotWidth(), y);
        p.strokeWeight(0);
      }
    }
  },
  inspect: function() {
    return "Axis[title="+this.title+", categories="+this.categories+", tickInterval="+this.tickInterval+", nTicks="+this.nTicks+", graphMin="+this.graphMin+", graphMax="+this.graphMax+"]"
  }
}


/***************************************************************/
/* Point                                                      
/***************************************************************/


var Point = function(series, value) {
  this.x = null;
  this.series = series;
  this.y = value; // sufficient for bar charts
};

Point.prototype = {
	/**
	 * make human readable
	 */
	inspect: function() {
    return "Point[series="+this.series.name+", x="+this.x+", y=x="+this.y+"]"
	},
	
	/**
	 * Clear memory
	 */
	destroy: function() {
    // TODO: implement
	}
};


/***************************************************************/
/* The widget                                                      
/***************************************************************/

$.widget("ui.chart", {
  // default options
  options: {
    
  },
  _create: function() {
    // TODO: this should all go to to the Chart constructor
    
    // init chart object
    this.chart = new Chart(this.element, this.options);
    var that = this;

    // init series
    $.each(this.options.series || [], function(idx, seriesOptions) {
      that.chart.addSeries(new Series(that.chart, idx, seriesOptions));
    });
    
    // setup axis
    this.chart.setupAxes(this.options);
    
    // render the chart
    this.chart.render();
  },
  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});