define(function(require) {
  var Collection = require('lavaca/mvc/Collection'),
      OrdersService = require('app/data/OrdersService'),
      timeRangeModel = require('app/models/TimeRangeModel');

  var RecentOrdersCollection = Collection.extend(function RecentOrdersCollection() {
    Collection.apply(this, arguments);
    _fetch.call(this);
    this.set('loading', true);
    this.apply({
      totalRevenue: _totalRevenue,
      revenuePerEmployee: _revenuePerEmployee,
      revenuePerCustomer: _revenuePerCustomer
    });

    this._externalBoundHandler = _fetch.bind(this);
    timeRangeModel.on('rangeUpdate', this._externalBoundHandler);
  }, {
    dispose: function() {
      timeRangeModel.off('rangeUpdate', this._externalBoundHandler);
      return Collection.prototype.dispose.apply(this, arguments);
    }
  });

  // Private functions
  function _fetch() {
    var startTime = timeRangeModel.get('startTime'),
        endTime = timeRangeModel.get('endTime');

    clearTimeout(this._fetchTimeout);
    if (this._lastFetch) {
      this._lastFetch.reject('abort');
    }

    this.set('startTime', startTime);
    this.set('endTime', endTime);
    this._lastFetch = OrdersService.getOrdersForDateRange(startTime, endTime)
      .then(function(data, hash) {
        if (data && data.orders) {
          if (!this._lastHash || this._lastHash !== hash) {
            this.clearModels();
            this.add(data.orders);
            this._lastHash = hash;
          }
        }
        this.set('error', false);
      }.bind(this), function(error) {
        if (error !== 'abort') {
          this.set('error', true);
        }
      }.bind(this))
      .always(function() {
        this.set('loading', false);
        this._fetchTimeout = setTimeout(_fetch.bind(this), 5000);
      }.bind(this));
  }

  // Computed Properties
  function _totalRevenue() {
    var total = 0;
    this.each(function(index, order) {
      total += order.get('total');
    });
    return total;
  }
  function _revenuePerEmployee() {
    var employees = [],
        totalRevenue = 0;
    this.each(function(index, order) {
      var employeeName = order.get('employeeName');
      if (employeeName && employees.indexOf(employeeName) === -1) {
        employees.push(employeeName);
      }
      totalRevenue += order.get('total');
    });

    // Dividing by zero is bad, mmmkay?
    if (employees.length) {
      return totalRevenue / employees.length;
    }
    return null;
  }
  function _revenuePerCustomer() {
    var customers = [],
        customerCount = 0,
        totalRevenue = 0;
    this.each(function(index, order) {
      var customer = order.get('customer');
      if (customer && customers.indexOf(customer.id) === -1) {
        customers.push(customer.id);
        customerCount++;
      } else if (!customer) {
        customerCount++;
      }
      totalRevenue += order.get('total');
    });

    // Dividing by zero is bad, mmmkay?
    if (customerCount) {
      return totalRevenue / customerCount;
    }
    return null;
  }

  return new RecentOrdersCollection();
});