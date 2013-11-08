define(function(require) {
  var BaseMetricsModel = require('app/models/metrics/BaseMetricsModel'),
      revenueForLineItem = require('app/workers/source/revenueForLineItem'),
      sumLineItems = require('app/data/operations/sumLineItems');

  var ProductDetailMetricsModel = BaseMetricsModel.extend(function ProductDetailMetricsModel() {
    BaseMetricsModel.apply(this, arguments);
    // this.addMetric()
    this.addDataOperation(_dataOperation);
  });

  function _dataOperation(handle) {
    var id = this.get('id');
    sumLineItems(handle)
      .process(function(counts) {
        var result = [],
            max = 0,
            total = 0;
        for (var id in counts) {
          result.push({
            id: id,
            name: counts[id].name,
            total: counts[id].total
          });
          total += counts[id].total;
          max = Math.max(max, counts[id].total);
        }
        result.forEach(function(item) {
          item.percentOfTotal = item.total / total;
          item.percentOfMax = item.total / max;
        });
        return result;
      })
      .filter(function(item, id) {
        return item.id === id;
      }, id)
      .process(function(arr) {
        return arr[0];
      });
  }

  // Metrics
  function _otherDataOperation(handle) {
    var id = this.get('id');
    handle
      .map(function(order) {
        var result = {
          modified: order.modified,
          items: {}
        };
        (order.lineItems || []).forEach(function(lineItem) {
          var item = lineItem.item,
              itemObj;
          if (item && item.id && item.name) {
            itemObj = result.items[item.id];
            if (!result[item.id]) {
              itemObj = result.items[item.id] = {
                name: item.name,
                qty: 0,
                total: 0
              };
            }
            itemObj.total += revenueForLineItem(lineItem);
            itemObj.qty += lineItem.qty;
          }
        });
        return result;
      })
      // [
      //   {
      //     modified: 1234,
      //     items: {
      //       xxx: {
      //         name: 'abc',
      //         qty: 123,
      //         total: 123
      //       },
      //       yyy: {
      //         name: 'xyz',
      //         qty: 123,
      //         total: 123
      //       }
      //     }
      //   },
      //   ...
      // ]
      .reduce(function(result, current) {
        result.first = Math.min(result.first, current.modified);
        result.last = Math.max(result.last, current.modified);
        for (var id in current.items) {
          if (!result.items[id]) {
            result.items[id] = current.items[id];
          } else {
            result.items[id].total += current.items[id].total;
            result.items[id].qty += current.items[id].qty;
          }
          result.max = Math.max(result.max, result.items[id].total);
          result.total += current.items[id].qty;
        }
        return result;
      }, {
        first: Number.MAX_VALUE,
        last: Number.MIN_VALUE,
        max: 0,
        total: 0,
        items: {}
      })
      // {
      //   first: 1234,
      //   last: 5678,
      //   total: 1234,
      //   max: 1234,
      //   items: {
      //     xxx: {
      //       name: 'abc',
      //       total: 1234,
      //       qty: 1234
      //     },
      //     yyy: {
      //       name: 'xyz',
      //       total: 1234,
      //       qty: 1234
      //     }
      //   }
      // }
      .process(function(totals) {
        var items = [];
        for (var id in totals.items) {
          totals.items[id].id = id;
          items.push(totals.items[id]);
        }
        items.sort(function(a, b) {
          return b.total - a.total;
        });
        totals.items = items;
        totals.time = totals.last - totals.first;
        delete totals.first;
        delete totals.last;
        return totals;
      });
      // {
      //   time: 4444,
      //   total: 1234,
      //   max: 1234,
      //   items: [
      //     {
      //       id: 'xxx',
      //       name: 'abc',
      //       total: 1234,
      //       qty: 1234
      //     },
      //     {
      //       id: 'yyy',
      //       name: 'xyz',
      //       total: 1234,
      //       qty: 1234
      //     }
      //   ]
      // }
  }

  return ProductDetailMetricsModel;
});