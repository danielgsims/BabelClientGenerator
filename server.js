var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config');
var express = require('express');
var app = express();
module.exports = app;

function main() {
  var http = require('http');

  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.set('view options', { layout: false }); 
  app.use(express.static(path.join(__dirname, 'public')));  

  var server = http.createServer(app);
  require('./routes')(app, __dirname);
  server.listen(process.env.PORT);
}

main();
