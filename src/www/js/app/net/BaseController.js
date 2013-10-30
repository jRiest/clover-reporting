define(function(require) {

  var Controller = require('lavaca/mvc/Controller'),
      merge = require('mout/object/merge'),
      stateModel = require('app/models/StateModel');

  /**
   * Base controller
   * @class app.net.BaseController
   * @extends Lavaca.mvc.Controller
   */
  var BaseController = Controller.extend(function(){
      Controller.apply(this, arguments);
    }, {
    exec: function(action, params) {
      if (!_isAuthorized() && !params.bypassAuth) {
        return this.redirect('/login');
      }
      return Controller.prototype.exec.apply(this, arguments);
    },
    updateState: function(historyState, title, url, stateProps){
      var defaultStateProps = {pageTitle: title};
      this.history(historyState, title, url)();

      stateModel.set('hideHeader', !!(stateProps && stateProps.hideHeader));

      stateProps = merge(stateProps || {}, defaultStateProps);
      stateModel.apply(stateProps, true);
      stateModel.trigger('change');
    }
  });

  function _isAuthorized() {
    return stateModel.get('loggedIn');
  }

  return BaseController;

});