//-----------------------------------------------------------------------------
// Collection API
// Represents a collection of items
// Collections can be grouped and aggregated to generate diverse views
//-----------------------------------------------------------------------------


/*jslint white: true, browser: true, rhino: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true, indent: 2 */
"use strict";


//-----------------------------------------------------------------------------
// Aggregators
//-----------------------------------------------------------------------------

var Aggregators = {};

Aggregators.SUM = function (key, items) {
  var result = 0;
  items.each(function (i, item) {
    result += item.attributes[key];
  });
  return result;
};

Aggregators.MIN = function (key, items) {
  var result = Infinity;
  items.each(function (i, item) {
    if (item.attributes[key] < result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.MAX = function (key, items) {
  var result = -Infinity;
  items.each(function (i, item) {
    if (item.attributes[key] > result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.COUNT = function (key, items) {
  var result = 0;
  return items.length;
};


//-----------------------------------------------------------------------------
// Modifiers
//-----------------------------------------------------------------------------

var Modifiers = {};

// The default modifier simply does nothing
Modifiers.DEFAULT = function (attribute) {
  return attribute;
};

Modifiers.MONTH = function (attribute) {
  return attribute.getMonth();
};

Modifiers.QUARTER = function (attribute) {
  return Math.floor(attribute.getMonth() / 3) + 1;
};


//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

var Item = function (chart, attributes) {
  this.attributes = attributes;
};

Item.prototype = {
  groupMembership: function (groupKeys) {
    var membership = [],
        that = this;
        
    groupKeys.each(function (i, groupKey) {
      membership.push(groupKey.modifier(that.attributes[groupKey.property]));
    });
    return membership;
  }
};

//-----------------------------------------------------------------------------
// Property
//-----------------------------------------------------------------------------


var Property = function (chart, key, options) {
  // constructing 
  this.chart = chart;
  this.key = key;
  this.name = options.name;
  this.type = options.type;
};


//-----------------------------------------------------------------------------
// Collection
//-----------------------------------------------------------------------------

var Collection = function (options) {
  this.id = options.id;
  this.name = options.name;
  
  this.properties = {};
  this.items = [];
  var that = this;
  
  // init properties
  options.properties.each(function (key, options) {
    that.properties[key] = new Property(that, key, options);
  });
  
  options.items.each(function (i, item) {
    that.items.push(new Item(that, item.attributes));
  });
};

Collection.prototype = {
  // build groups based on groupKeys
  getGroups: function (groupKeys) {
    var that = this,
        groups = {},
        idx = 0; // the groupIndex
    
    this.items.each(function (i, item) {
      var membership = item.groupMembership(groupKeys);
      groups[membership] = groups[membership] || { items: [], index: idx += 1 };
      groups[membership].items.push(item);      
    });    
    return groups;
  },
  aggregate: function (items, properties, groupKeys) {
    var aggregatedItem = {},
        that = this;
    
    // include group key attributes
    groupKeys.each(function (i, gk) {
      aggregatedItem[gk.property] = items[0].attributes[gk.property];
    });
    
    properties.each(function (i, p) {
      aggregatedItem[p.property] = p.aggregator(p.property, items);
    });
    return aggregatedItem;
  },
  // @param groupKeys
  //      example [{property: '1', modifier: Modifiers.DEFAULT}]
  //      TODO: allow groupkeys to just be an array of property keys
  // 
  // @param properties [Optional]
  //      example [{property: '5', aggregator: Aggregators.SUM}]
  group: function (options) {
    var groups = this.getGroups(options.keys),
        that = this,
        newProps = {},
        newItems = [];

    // property projection
    options.keys.each(function (i, key) {
      newProps[key.property] = that.properties[key.property];
    });
    
    options.properties.each(function (i, key) {
      newProps[key.property] = that.properties[key.property];
    });
    
    groups.each(function (k, group) {
      newItems.push(that.aggregate(group.items, options.properties, options.keys));
    });

    return new Collection({properties: newProps, items: newItems});
  }
};

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

