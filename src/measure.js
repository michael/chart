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
  key: function () {
    return this.property.key();
  },
  min: function () {
    return this.dataMin;
  },
  max: function () {
    return this.dataMax;
  },
  collectionView: function() {
    return this.chart.collectionView;
  },
  // consider all items and find the min/max values
  computeDataExtremes: function () {
    var that = this;
    
    var items = that.collectionView().get("items");
    
    $.each(items, function(key, item) {      
      that.dataMin = Math.min(that.dataMin, item.value(that.property.key()));
      that.dataMax = Math.max(that.dataMax, item.value(that.property.key()));
    });
  },
  inspect: function () {
    return "Measure[property=" + this.property.key + " dataMin=" +this.dataMin+ ", dataMax=" + this.dataMax +"]";
  }
};