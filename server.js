// boilerplate
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.urlencoded({
  extended: true
}));
// connecting to route.js
var routes = require('./api/routes/route');
routes(app);
app.listen(port, () => {
  console.log("Server started!");
});