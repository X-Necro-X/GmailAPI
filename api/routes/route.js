module.exports = function (app) {
  // connecting to controller.js
  var control = require('../controllers/controller');
  // route for oauth
  app.route('/auth')
    .get(control.auth);
  // route for redirect uri after oauth authentication
  app.route('/redirect')
    .get(control.redirect);
  // route for sending email
  app.route('/send')
    .post(control.send);
};