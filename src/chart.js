// @depends collection/collection.js

/*jslint white: true, browser: true, rhino: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true, indent: 2 */
/*global Aggregators: true, alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
"use strict";


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
    
    that.chart.collection.items.each(function (i, item) {
      that.dataMin = Math.min(that.dataMin, item.attributes[that.property.key]);
      that.dataMax = Math.max(that.dataMax, item.attributes[that.property.key]);
    });
  },
  inspect: function () {
    return "Measure[property=" + this.property.key + " (" + this.property.name + ")]";
  }
};

//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function (element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collection;
  this.visualization = options.plotOptions.visualization;
  
  // TODO: use extracted groupKeys for identification if no identityKeys are provided
  this.identityKeys = options.plotOptions.identifyBy || [];
  this.groupKeys = options.plotOptions.groupBy || [];

  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;
  
  if (options.plotOptions.aggregated) {
    this.groupProperties = options.plotOptions.measures.map(function (k) {
      return { property: k, aggregator: Aggregators.SUM };
    });
    
    this.collection = this.collection.group({
      keys: this.groupKeys,
      properties: this.groupProperties
    });
  }
  
  // TODO: skip if there are no groupKeys provided
  this.groups = this.collection.getGroups(this.groupKeys);
  
  // init measures
  options.plotOptions.measures.each(function (i, propertyKey) {
    that.measures.push(new Measure(that, that.collection.properties[propertyKey], i));
  });
};

// The is where concrete visualizations have to register
Chart.visualizations = {};

Chart.prototype = {
  plotHeight: function () {
    return this.element.height() - (this.margin.top + this.margin.bottom);
  },
  plotWidth: function () {
    return this.element.width() - (this.margin.left + this.margin.right);
  },
  render: function () {
    var vis = Chart.visualizations[this.visualization].create(this);
    vis.render();
  },
  // returns an items identity as a string based on this.identityKeys
  identify: function (item) {
    var that = this;
    this.identityKeys.map(function (s) {
      return item.attributes[s];
    }).join(", ");
  }
};
