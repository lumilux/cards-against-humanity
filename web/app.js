
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , pubnub = require('pubnub')
  , mongoose = require('mongoose');

var config_file = require('yaml-config');
exports = module.exports = config = config_file.readConfig('config/config.yaml');

require('./db-connect.js');

// Configuration
var models_path = __dirname + '/models';
User = require(models_path+'/user.js');
//require(models_path+'/card.js');
require(models_path+'/room.js');

/*
var model_files = fs.readdirSync(models_path);
model_files.forEach(function(file) {
  if (file == 'user.js')
    User = require(models_path+'/'+file);
  else
    require(models_path+'/'+file);
});
*/

var app = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: 'layouts/default'});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var controllers_path = __dirname + '/controllers';
var controller_files = fs.readdirSync(controllers_path);
controller_files.forEach(function(file){
  require(controllers_path+'/'+file)(app);
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
