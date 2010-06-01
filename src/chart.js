//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function (element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collectionView = options.collectionView;
  this.visualization = options.plotOptions.visualization;
  this.identityKeys = options.plotOptions.identifyBy;
  this.groupKeys = options.plotOptions.groupBy;
  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;

  // use first property key as default identity
  if (this.identityKeys.length === 0) {
    this.identityKeys.push('name');
  }
  
  // init measures
  options.plotOptions.measures.eachItem(function (propertyKey, index) {
    that.measures.push(new Measure(that, that.collectionView.get("properties", propertyKey), index));
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
  },
  getFirstPropertyKey: function () {
    var keys = [];
    $.each(this.collectionView.properties, function (key, val) {
      keys.push(key);
    });
    return keys[0];
  }
};