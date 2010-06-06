//-----------------------------------------------------------------------------
// Measure
//-----------------------------------------------------------------------------

// a measure is one dimension of the data item to be plotted.
var Measure = function (chart, options) {  
  // properties that are nested within a sub collection are separated with ::
  this.properties = options.property_key.split("::");
  
  // just for convenience since most measure can be described with just one
  // property key
  this.property = this.properties[0]; 
  
  this.chart = chart;
  this.index = options.index;
};

Measure.prototype = {
  inspect: function () {
    return "Measure[ property=" + this.property.key + "]";
  }
};


