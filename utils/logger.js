var dateFormat = require('dateformat');
var winston = require('winston');
require('winston-daily-rotate-file');

var consoleTransport = new (winston.transports.Console)({
	colorize: true,
	level: 'debug',
	json:false,
	timestamp: function(){
		return dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss');
	},
	formatter: function(options) {
		return options.timestamp() + ' - ' + options.level.toUpperCase() + ' : ' + (options.message ? options.message : '') +
		(options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
	}
});

var debugTransport = new winston.transports.DailyRotateFile({
	filename: global.config.dir.logs + '/log',
	datePattern: 'yyyy-MM-dd.',
	prepend: true,
	level: 'debug',
	json:false,
	timestamp: function(){
		return dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss');
	},
	formatter: function(options) {
		return options.timestamp() + ' - ' + options.level.toUpperCase() + ' : ' + (options.message ? options.message : '') +
		(options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
	}
});

var logger = new (winston.Logger)({
	transports: [
		consoleTransport,
		debugTransport
	]
});

module.exports = logger;