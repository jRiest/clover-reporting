define(function(require) {

  var BaseDataView = require('app/ui/BaseDataView'),
      $ = require('$'),
      remove = require('mout/array/remove'),
      debounce = require('mout/function/debounce'),
      d3 = require('d3'),
      nv = require('nv');

  require('rdust!templates/revenue_by_customer');

  /**
   * Super class for all chart views
   * @class app.ui.charts.BaseChartView
   * @extends app.ui.BaseDataView
   */
  var BaseChartView = BaseDataView.extend(function BaseChartView() {
    BaseDataView.apply(this, arguments);

    this.chart = this.createChart();
    this.mapEvent({
      model: {
        'change.loading': _onChangeLoading.bind(this)
      }
    });
    $(window).on('resize.baseChart'+this.id, debounce(function() {
      this.updateChart();
    }.bind(this), 50));
  }, {
    template: 'templates/revenue_by_customer',
    className: 'revenue_by_customer',
    createChart: function() {},
    updateChart: function() {},
    getData: function() {},
    onDataChange: function() {
      this.updateChart();
    },
    onRenderSuccess: function() {
      BaseDataView.prototype.onRenderSuccess.apply(this, arguments);
      nv.addGraph(function() {
        if (this.model) {
          this.updateChart();
        }
        return this.chart;
      }.bind(this));
    },
    dispose: function() {
      $(window).off('resize.baseChart'+this.id);
      remove(nv.graphs, this.chart);
      return BaseDataView.prototype.dispose.apply(this, arguments);
    }
  });

  function _onChangeLoading(e) {
    var loading = e.value,
        spinners,
        nestedSpinners;
    if (!loading) {
      this.el.find('.loading').each(function() {
        d3.select(this).classed('loading', false);
      });
      spinners = this.el.find('.loading-spinner');
      nestedSpinners = this.el.find('[data-view-id] .loading-spinner');
      spinners.not(nestedSpinners).remove();
    }
  }

  return BaseChartView;

});