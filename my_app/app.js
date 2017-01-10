
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var http = require('http');
var bodyParser = require('body-parser');

//var app = module.exports = express.createServer();
var app = express();
// Configuration

//app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended : true}));
  //app.use(express.methodOverride());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//});

//app.configure('development', function(){
 // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//});

//app.configure('production', function(){
 // app.use(express.errorHandler());
//});

// Routes

app.get('/', routes.index);
app.post('/addUser', routes.addUser);
app.post('/login', routes.login);
app.get('/get_token',routes.getAccessToken);
app.post('/notice_push', routes.noticeSend);
app.post('/batch_send', routes.batchSend);
app.post('/single_send', routes.singleSend);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode");
});
