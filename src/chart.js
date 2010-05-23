//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function (element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collection;
  this.visualization = options.plotOptions.visualization;
  
  this.identityKeys = options.plotOptions.identifyBy;
  this.groupKeys = options.plotOptions.groupBy;
  
  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;
  
  if (options.plotOptions.aggregated && this.groupKeys.length > 0) {
    this.groupProperties = options.plotOptions.measures.map(function (k) {
      return { property: k, aggregator: Aggregators.SUM };
    });
    
    this.collection = this.collection.group({
      keys: this.groupKeys,
      properties: this.groupProperties
    });
    
    // set identityKeys to groupKey unless set
    if (this.identityKeys.length === 0) {
      this.identityKeys = $.map(this.groupKeys, function (ik) {
        return ik.property;
      });      
    }
  }
  
  // use first property key as default identity
  if (this.identityKeys.length === 0) {
    this.identityKeys.push(this.getFirstPropertyKey());
  }
  
  // TODO: skip if there are no groupKeys provided
  this.groups = this.collection.getGroups(this.groupKeys);
  
  // init measures
  options.plotOptions.measures.eachItem(function (propertyKey, index) {
    that.measures.push(new Measure(that, that.collection.properties[propertyKey], index));
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
    var that = this,
        identityKeys = this.identityKeys;

    return $.map(identityKeys, function (s) {
      return item.attributes[s];
    }).join(", ");
  },
  getFirstPropertyKey: function () {
    var keys = [];
    $.each(this.collection.properties, function (key, val) {
      keys.push(key);
    });
    return keys[0];
  }
};