define(function(require) {

  var BaseChartView = require('app/ui/charts/BaseChartView'),
      RevenueOverTimeView = require('app/ui/charts/chronological/RevenueOverTimeView'),
      timeRangeModel = require('app/models/global/TimeRangeModel'),
      bucketData = require('app/misc/bucket_data'),
      d3 = require('d3'),
      nv = require('nv');

  /**
   * Recent Orders View
   * @class app.ui.charts.chronological.FilteredRevenueOverTimeView
   * @extends app.ui.charts.BaseChartView
   */
  var FilteredRevenueOverTimeView = RevenueOverTimeView.extend(function FilteredRevenueOverTimeView() {
    RevenueOverTimeView.apply(this, arguments);
  }, {
    template: 'templates/revenue_over_time',
    className: 'small-revenue-over-time',
    minDataRange: 4,
    maxDataRange: 9,
    onRenderSuccess: function() {
      return BaseChartView.prototype.onRenderSuccess.apply(this, arguments);
    },
    updateChart: function() {
      var selected = d3.select(this.el[0]).select('svg'),
          rangeData = timeRangeModel.getRangeData(this.minDataRange, this.maxDataRange),
          values = [],
          max = 0,
          filter,
          bucketedValues,
          data;

      if (!this.model) {return;}

      // Filter and bucket values
      if (this.parentView && this.parentView.model.filterCollectionItem) {
        filter = this.parentView.model.filterCollectionItem.bind(this.parentView.model);
      }
      bucketedValues = bucketData(this.model, rangeData.start, rangeData.end, rangeData.ticks, 'modified', 'total', filter),
      bucketedValues.forEach(function(bucketedVal, index) {
        values.push({
          label: bucketedVal[0], // Will be hidden, must be unique
          value: bucketedVal[1]
        });
      });
      data = [
        {
          key: 'Revenue',
          values: values
        }
      ];

      if (!data[0].values.length) {
        selected.text(null);
        this.el.addClass('empty');
      } else {
        this.el.removeClass('empty');
      }

      // Find max and set y-scale
      this.model.each(function(index, model) {
        max = Math.max(model.get('total'), max);
      });
      this.chart.forceY([0, max]);

      selected
          .datum(data)
          .call(this.chart);
    },
    createChart: function() {
      var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label; })
                    .y(function(d) { return d.value; })
                    .tooltips(false)
                    .showValues(false)
                    .showXAxis(false)
                    .margin({top: 23, left: 20, right: 20, bottom: 5})
                    .showYAxis(false)
                    .color(function() {
                      return '#1ae08e';
                    })
                    .width(133)
                    .height(77);
      return chart;
    }
  });

  return FilteredRevenueOverTimeView;

});