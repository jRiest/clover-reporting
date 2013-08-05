define(function(require) {
  var dust = require('dust'),
      moment = require('moment');

  dust.filters.commas = function(value) {
    return _addCommas(value, 0);
  };

  dust.filters.cashMoney = function(value) {
    // value is in cents
    return '$' + _addCommas(value/100, 2);
  };

  dust.filters.dateTime = function(value) {
    if (!moment.isMoment(value)) {
      value = moment(value);
    }
    return value.format('hh:mm A dddd, MMMM DD YYYY');
  };

  dust.filters.timestamp = function(value) {
    if (!moment.isMoment(value)) {
      value = moment(value);
    }
    return value.toISOString();
  };

  // Private functions
  function _addCommas(value, decimalDigits) {
    var output = '',
        decimal = '';
    value = parseFloat(value); // make sure its a number
    if (decimalDigits) {
      decimal = '' + value.toFixed(decimalDigits);
      decimal = decimal.substring(decimal.indexOf('.'));
      output = '' + Math.floor(value);
    } else {
      output = '' + Math.round(value);
    }
    while (/(\d)(?=(\d\d\d)+(?!\d))/g.test(output)) {
      output = output.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
    return output + decimal;
  }
});