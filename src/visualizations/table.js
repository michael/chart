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
    $('#chart').html(this.renderCollection(this.chart.collection));
  },
  renderItem: function(c, i) {
    var that = this;
    str = '<tr>';
    
    c.all("properties").eachKey(function(key, attr) {
      if (i.type(key) === 'collection') {
        // str += '<td>'+that.renderCollection(i.value(key))+'</td>';
      } else {
        str += '<td>'        
        i.values(key).each(function(index, v) {
          str += v+'<br/>';
        });
        str += '</td>'
      }
    });
    
    str += '</tr>';
    return str;
  },
  renderCollection: function(c) {
    var that = this;
    
    str = '<h1>'+c.all('items').length+' items</h1><table><thead><tr>';
    c.all("properties").each(function(index, p) {
      str += '<th>'+p.name+'</th>';
    });
    
    str += '</tr></thead><tbody>';
    c.all("items").each(function(index, item) {
      str += that.renderItem(c, item);
    });
    
    str += '</tbody></table>';
    return str;
  }
};

