module.exports = function(app) {
  var control = require('../controllers/controller');

  app.route('/auth')
    .get(control.auth);
  app.route('/redirect')
    .get(control.redirect);

};