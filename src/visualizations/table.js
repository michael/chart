// register
Chart.visualizations['table'] = {
  className: 'Table',
  create: function(chart) {
    return new Table(chart);
  }
};

var Table = function(chart) {
  var that = this;
  this.chart = chart;
};

Table.prototype = {
  render: function() {
    $('#chart').html(this.renderCollection(this.chart.collectionView));
  },
  renderItem: function(i) {
    var that = this;
    str = '<tr>';
    $.each(i.get("attributes"), function(key, attr) {
      if (i.type(key) === 'collection') {
        str += '<td>'+that.renderCollection(i.node(key))+'</td>';
      } else {
        str += '<td>'+i.value(key)+'</td>';
      }
    });
    str += '</tr>';
    return str;
  },
  renderCollection: function(c) {
    var that = this;
    
    str = '<table><thead><tr>';
    c.list("properties").each(function(index, p) {
      str += '<th>'+p.name()+'</th>';
    });
    
    str += '</tr></thead><tbody>';
    
    c.list("items").each(function(index, item) {
      str += that.renderItem(item);
    });
    
    str += '</tbody></table>';
    return str;
  }
};

