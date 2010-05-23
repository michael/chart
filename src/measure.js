//-----------------------------------------------------------------------------
// Measure
//-----------------------------------------------------------------------------

// a measure is one dimension of the data item to be plotted.
var Measure = function (chart, property, index) {
  this.property = property;
  this.chart = chart;
  this.index = index;
  this.dataMin = Infinity;
  this.dataMax = -Infinity;
  
  // compute dataMin and dataMax
  this.computeDataExtremes();
};

Measure.prototype = {
  values: function () {
    var that = this;
    return that.chart.collection.items.map(function (i) {
      return i.attributes[that.property.key];
    });
  },
  key: function () {
    return this.property.key;
  },
  min: function () {
    return this.dataMin;
  },
  max: function () {
    return this.dataMax;
  },
  // consider all items and find the min/max values
  computeDataExtremes: function () {
    var that = this;
    
    that.chart.collection.items.eachItem(function (item) {
      that.dataMin = Math.min(that.dataMin, item.attributes[that.property.key]);
      that.dataMax = Math.max(that.dataMax, item.attributes[that.property.key]);
    });
  },
  inspect: function () {
    return "Measure[property=" + this.property.key + " (" + this.property.name + ")]";
  }
};