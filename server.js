const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var routes = require('./api/routes/route');
routes(app);
app.listen(port, () => {
  console.log("Server started!");
});