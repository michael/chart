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
    
    str = '<table><thead><tr>';
    
    $.each(this.chart.collection.properties, function(key, p) {
      str += '<th>'+p.name+'</th>';
    });
    
    str += '</tr></thead><tbody>';
    
    $.each(this.chart.collection.items, function(i, item) {
      str += '<tr>';
      
      $.each(item.attributes, function(key, a) {
        str += '<td>'+a+'</td>';
      });
      
      str += '</tr>';
    });
    
    str += '</tbody></table>';
    
    $('#chart').html(str);
  }
};