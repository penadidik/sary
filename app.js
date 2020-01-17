var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var fs = require('fs');
var request = require('request');
var app = express();
var CronJob = require('cron').CronJob;
var req = require("request-promise");
var minimist = require('minimist');

/*******************************************************************************
 * global configuration
 ******************************************************************************/

var config = null;

var args = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version'
  },
  default: {
    env: 'dev',
    mode: 'demo',
    ssl: false
  }
});

console.log("args:[env]", args.env);
console.log("args:[mode]", args.mode);
console.log("args:[ssl]", args.ssl);

if (args.env == 'prod') {
  config = require('./config/config.prod');
} else if (args.env == 'local') {
  config = require('./config/config.local');
} else {
  config = require('./config/config');
}

config.ssl_supported = args.ssl;
config.running_mode = args.mode;

global.config = config;
//global.config.db.csitso = JSON.parse(Buffer.from(global.config.db.csitso, "base64").toString('ascii').replace(/'/gi, '\\\"'));
if (args.dbuser) {
  global.config.db.csitso.user = args.dbuser;
}
if (args.dbpwd) {
  global.config.db.csitso.password = args.dbpwd;
}

config.host.url = args.url

global.config.dir = {
  base: __dirname,
  dao: __dirname + '/dao/',
  logs: __dirname + '/logs/',
  services: __dirname + '/services/',
  jwt_cert_key: __dirname + '/config/jwt_public.key',
  utils: __dirname + '/utils/'
};

if (!fs.existsSync(global.config.dir.logs)) {
  fs.mkdirSync(global.config.dir.logs);
}
/** *************************************************************************** */

/*******************************************************************************
 * access loggin
 ******************************************************************************/
app.use(logger(':date :method :url :status :response-time ms - :res[content-length]'));
/** *************************************************************************** */

/*******************************************************************************
 * Cross domain setup
 ******************************************************************************/
//var CORS = require('cors')();
//app.use(CORS);
/** *************************************************************************** */

/*******************************************************************************
 * view engine setup
 ******************************************************************************/
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({
  limit: '4mb'
}));
app.use(bodyParser.text({
  limit: '4mb'
}));
app.use(bodyParser.raw({
  limit: '4mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/** *************************************************************************** */

/**
 * For Authentication
 */
global.user_access_map = new Map();
var authService = require(global.config.dir.services + 'auth');
app.all('/restapi/*', authService.requireAuthentication);
app.all('/tso-console/*', authService.requireAdminAuthorization);


/*******************************************************************************
 * router
 ******************************************************************************/
//var index = require('./routes/index');
var view = require('./routes/view');
var tsoEtcApis = require('./routes/controller/restapi/etc');
var tsoImportConfigApis = require('./routes/controller/restapi/import-config');
var tsoControlLogApis = require('./routes/controller/restapi/control-log');
var tsoStatLogApis = require('./routes/controller/restapi/statistic-log');
var tsoGraphLogApis = require('./routes/controller/restapi/graph-log');
var tsoRoomsApis = require('./routes/controller/restapi/rooms');
var tsoBlindControlApis = require('./routes/controller/restapi/blind-control');
var tsoTempControlApis = require('./routes/controller/restapi/temp-control');
var tsoLampControlApis = require('./routes/controller/restapi/lamp-control');
var tsoSensingDataApis = require('./routes/controller/restapi/sensing-data');
var metadataLoader = require(global.config.dir.services + 'metadataLoader');
var loginApi = require('./routes/controller/openapi/authenticate');
var tsoAdminApis = require('./routes/controller/restapi/admins');
var tsoAppVersionApis = require('./routes/controller/restapi/app_version');
/** *************************************************************************** */

/*******************************************************************************
 * endPoint
 ******************************************************************************/
app.use('/tso-console', view);
app.use('/openapi/v1/tso', loginApi);
app.use('/restapi/v1/tso', [
  tsoEtcApis,
  tsoImportConfigApis,
  tsoControlLogApis,
  tsoStatLogApis,
  tsoGraphLogApis,
  tsoRoomsApis,
  tsoBlindControlApis,
  tsoTempControlApis,
  tsoLampControlApis,
  tsoSensingDataApis,
  tsoAdminApis,
  tsoAppVersionApis
]);

app.use(new RegExp('/'), function (req, res) {
  res.redirect('/tso-console')
});
/** *************************************************************************** */

metadataLoader.loadMetadata();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: "Error Page",
    url: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Per 1 hour. Delete user access_info that over 10 min.
new CronJob('0 0 * * * *', function () {
  global.user_access_map.forEach(function (value, key, map) {
    var passed_time = new Date() - value.last_access_time;
    if (passed_time > (10 * 60 * 1000)) { // over 10 min?
      map.delete(key);
    }
  });
}, null, true, config.batch.location);

var handlerRoom = function (err, response, body) {
    var json = JSON.parse(body)["data"];
    for(var i = 0; i < json.length; i++) {
        //var sensor_static_ip = json["sensor_static_ip"]; //for telkomsel
        var sensor_static_ip = "192.168.1.66"; //for local csi
        req("http://"+config.host.url+"/restapi/v1/tso/rooms/sensing-data/"+sensor_static_ip)
            .then(function (htmlString) {
                //console.log(htmlString);
            })
            .catch(function (err) {
                //console.log(err);
            });
    }
}

// Collect data from iAeris every 30 minutes in weekdays from 8 am - 5 pm
new CronJob('*/5 9-17 * * 1-5', function () {
   var times = new Date();
   console.log(">>>>>>> Starting Collect data from iAeris every 30 minutes in weekdays from 8 am - 5 pm @ "+times.toUTCString());
   request("http://"+config.host.url+"/restapi/v1/tso/rooms?merge=true", {}, handlerRoom);
}, null, true, config.batch.location);

// Collect data from iAeris every 30 minutes in weekdays from 5 pm - 7 am
new CronJob('*/30 17-23,1-8 * * *', function () {
   var times = new Date();
   console.log(">>>>>>> Starting Collect data from iAeris every 30 minutes in weekdays from 5 pm - 7 am @ "+times.toUTCString());
   request("http://"+config.host.url+"/restapi/v1/tso/rooms?merge=true", {}, handlerRoom);
}, null, true, config.batch.location);

// Collect data from iAeris every 30 minutes in weekend
new CronJob('*/30 * * * 6,0', function () {
   var times = new Date();
   console.log(">>>>>>> Starting Collect data from iAeris every 30 minutes in weekend @ "+times.toUTCString());
   request("http://"+config.host.url+"/restapi/v1/tso/rooms?merge=true", {}, handlerRoom);
}, null, true, config.batch.location);

module.exports = app;