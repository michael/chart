//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function (element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collectionView;
  this.visualization = options.plotOptions.visualization;
  this.identityKeys = options.plotOptions.identifyBy;
  
  this.groupKeys = options.plotOptions.groupBy;
  
  this.measures = [];
  this.margin = {top: 10, right: 0, bottom: 15, left: 80};
  var that = this;
  
  // use first property key as default identity
  if (this.identityKeys.length === 0) {
    this.identityKeys.push('name');
  }
  
  // init measures
  options.plotOptions.measures.eachItem(function (propertyKey, i) {
    that.measures.push(new Measure(that, {property_key: propertyKey, index:i}));
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
    
    return $.map(identityKeys, function (k) {
      return item.value(k);
    }).join(", ");
  }
};