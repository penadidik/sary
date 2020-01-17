var express = require('express');
var router = express.Router();

var async = require('async');
var auth = require(global.config.dir.services + 'auth');
var dao = require(global.config.dir.dao + 'dao');
var utils = require(global.config.dir.utils + 'reqUtils');

var pool = dao.getPool('csitso');
var request = require('request');

var metadataLoader = require(global.config.dir.services + 'metadataLoader');
var logger = require(global.config.dir.utils + 'logger');

/**
 * get sensing-data of a room
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/rooms/:room_id/sensing-data
 * @PARAM 
 */

router.get('/rooms/:room_id/sensing-data', function (req, res, next) {
	var query = utils.getRequestQuery(req);
	if (!global.metadata.room_map.get(query.room_id)) {
		res.json({
			code: 500,
			error: 'The room does not exist.'
		});
		return;
	}
	// var handlerFn = function (err, response, body) {
	// 	if (err && !global.config.running_mode == 'demo') {
	// 		console.log(err);
	// 		res.json({
	// 			code: 500,
	// 			error: err
	// 		});
	// 	} else {
	// 		try {
	// 			var data = JSON.parse(Buffer.from(JSON.parse(body)['m2m:cin'].con, 'base64'));
	// 			var co2 = data.value.CO2;
	// 			var pm25 = data.value.PM2_5;
	// 			var co2_state_msg, pm25_state_msg;
	// 			if (co2 < 701) {
	// 				co2_state_msg = 'Good';
	// 			} else if (co2 > 700 && co2 < 2001) {
	// 				co2_state_msg = 'Moderate';
	// 			} else {
	// 				co2_state_msg = 'Unhealthy';
	// 			}
	//
	// 			if (pm25 < 16) {
	// 				pm25_state_msg = 'Good';
	// 			} else if (pm25 > 15 && pm25 < 51) {
	// 				pm25_state_msg = 'Moderate';
	// 			} else {
	// 				pm25_state_msg = 'Unhealthy';
	// 			}
	// 			res.json({
	// 				code: 200,
	// 				data: {
	// 					//onem2m_original_response: data,
	// 					co2: co2,
	// 					pm25: pm25,
	// 					rh: data.value.RH,
	// 					temp: data.value.Temperature,
	// 					co2_state_msg: co2_state_msg,
	// 					pm25_state_msg: pm25_state_msg
	// 				}
	// 			});
	// 		} catch (e) {
	// 			if (global.config.running_mode == 'demo' && Math.random() > 0.2) {
	// 				var co2 = parseFloat((Math.random() * 2200).toFixed(1));
	// 				var pm25 = parseFloat((Math.random() * 60).toFixed(1));
	// 				var co2_state_msg, pm25_state_msg;
	// 				if (co2 < 701) {
	// 					co2_state_msg = 'Good';
	// 				} else if (co2 > 700 && co2 < 2001) {
	// 					co2_state_msg = 'Moderate';
	// 				} else {
	// 					co2_state_msg = 'Unhealthy';
	// 				}
	//
	// 				if (pm25 < 16) {
	// 					pm25_state_msg = 'Good';
	// 				} else if (pm25 > 15 && pm25 < 51) {
	// 					pm25_state_msg = 'Moderate';
	// 				} else {
	// 					pm25_state_msg = 'Unhealthy';
	// 				}
	// 				res.json({
	// 					code: 200,
	// 					data: {
	// 						co2: co2,
	// 						pm25: pm25,
	// 						rh: 30 + parseFloat((Math.random() * 10).toFixed(1)),
	// 						temp: 20 + parseFloat((Math.random() * 10).toFixed(1)),
	// 						co2_state_msg: co2_state_msg,
	// 						pm25_state_msg: pm25_state_msg
	// 					}
	// 				});
	// 			} else {
	// 				res.json({
	// 					code: 500,
	// 					error: 'Seneor not response.'
	// 				});
	// 			}
	// 		}
	// 	}
	// };

	var handlerFn = function (err, response, body) {
		if (err && !global.config.running_mode == 'demo') {
			console.log(err);
			res.json({
				code: 500,
				error: err
			});
		} else {
			try {
				var data = JSON.parse(body.substring(2, body.length - 2));
				var co2 = data.CO2;
				var pm25 = data.PM2_5;
				var co2_state_msg, pm25_state_msg;
				if (co2 < 701) {
					co2_state_msg = 'Good';
				} else if (co2 > 700 && co2 < 2001) {
					co2_state_msg = 'Moderate';
				} else {
					co2_state_msg = 'Unhealthy';
				}

				if (pm25 < 16) {
					pm25_state_msg = 'Good';
				} else if (pm25 > 15 && pm25 < 51) {
					pm25_state_msg = 'Moderate';
				} else {
					pm25_state_msg = 'Unhealthy';
				}
				res.json({
					code: 200,
					data: {
						//onem2m_original_response: data,
						co2: co2,
						pm25: pm25,
						rh: data.RH,
						temp: data.Temperature,
						co2_state_msg: co2_state_msg,
						pm25_state_msg: pm25_state_msg
					}
				});
			} catch (e) {
				if (global.config.running_mode == 'demo' && Math.random() > 0.2) {
					var co2 = parseFloat((Math.random() * 2200).toFixed(1));
					var pm25 = parseFloat((Math.random() * 60).toFixed(1));
					var co2_state_msg, pm25_state_msg;
					if (co2 < 701) {
						co2_state_msg = 'Good';
					} else if (co2 > 700 && co2 < 2001) {
						co2_state_msg = 'Moderate';
					} else {
						co2_state_msg = 'Unhealthy';
					}

					if (pm25 < 16) {
						pm25_state_msg = 'Good';
					} else if (pm25 > 15 && pm25 < 51) {
						pm25_state_msg = 'Moderate';
					} else {
						pm25_state_msg = 'Unhealthy';
					}
					res.json({
						code: 200,
						data: {
							co2: co2,
							pm25: pm25,
							rh: 30 + parseFloat((Math.random() * 10).toFixed(1)),
							temp: 20 + parseFloat((Math.random() * 10).toFixed(1)),
							co2_state_msg: co2_state_msg,
							pm25_state_msg: pm25_state_msg
						}
					});
				} else {
					res.json({
						code: 500,
						error: 'Seneor not response.'
					});
				}
			}
		}
	};

	if (global.config.running_mode == 'demo') {
		handlerFn(1, 0, 0);
		return;
	}

	// var api_tmp = [
	// 	global.config.handypia.baseurl,
	// 	'/',
	// 	(global.metadata.room_map.get(query.room_id)).sensor_id,
	// 	'/',
	// 	(global.metadata.room_map.get(query.room_id)).sensor_serial_no,
	// 	'/la'
	// ];
	// var api_url = api_tmp.join('');
	// console.log(api_url);
	// request(api_url, {
	// 	headers: {
	// 		'content-type': 'application/json',
	// 		'X-M2M-Origin': global.config.handypia.origin,
	// 		'X-M2M-RI': 'rid-1'
	// 	}
	// }, handlerFn);

	var api_url = 'http://' + global.metadata.room_map.get(query.room_id).sensor_static_ip + '/read';
	//console.log(api_url);
	request(api_url, {}, handlerFn);
});

router.get('/rooms/sensing-data/:ip', function (req, res, next) {
    var query = utils.getRequestQuery(req);
	var handlerFn = function (err, response, body) {
		if (err && !global.config.running_mode == 'demo') {
			console.log(err);
			res.json({
				code: 500,
				error: err
			});
		} else {
			try {
				var data = JSON.parse(body.substring(2, body.length - 2));
				var co2 = data.CO2;
				var pm25 = data.PM2_5;
				var co2_state_msg, pm25_state_msg;
				if (co2 < 701) {
					co2_state_msg = 'Good';
				} else if (co2 > 700 && co2 < 2001) {
					co2_state_msg = 'Moderate';
				} else {
					co2_state_msg = 'Unhealthy';
				}

				if (pm25 < 16) {
					pm25_state_msg = 'Good';
				} else if (pm25 > 15 && pm25 < 51) {
					pm25_state_msg = 'Moderate';
				} else {
					pm25_state_msg = 'Unhealthy';
				}
				res.json({
					code: 200,
					data: {
						//onem2m_original_response: data,
						co2: co2,
						pm25: pm25,
						rh: data.RH,
						temp: data.Temperature,
						co2_state_msg: co2_state_msg,
						pm25_state_msg: pm25_state_msg
					}
				});

				pool.getConnection(function (err, connection) {
                    if (err) {
                        connection.release();
                        res.json({
                            code: 500,
                            error: err
                        });
                        return;
                    }

                    var datas = [];
                    var history = [
                        data.Temperature,
                        data.SNO,
                        data.HCHO,
                        data.CO2,
                        data.CO,
                        data.RH,
                        data.PM10,
                        data.PM2_5,
                        data.EPAPM10,
                        data.EPAPM2_5,
                        data.PID,
                        data.BLESNO,
                        data.date,
                        data.TVOC,
                        new Date(),
                    ];
                    datas.push(history);

                    async.waterfall([
                        async.apply(insertHistoryStats, connection, datas)
                    ], function (err) {
                        connection.release();
                        if (err) {
                            logger.error('==>> ERROR: %j', err);
                            res.json({
                                code: 500,
                                error: err
                            });
                            return;
                        }
                    });
                });
			} catch (e) {
				if (global.config.running_mode == 'demo' && Math.random() > 0.2) {
					var co2 = parseFloat((Math.random() * 2200).toFixed(1));
					var pm25 = parseFloat((Math.random() * 60).toFixed(1));
					var co2_state_msg, pm25_state_msg;
					if (co2 < 701) {
						co2_state_msg = 'Good';
					} else if (co2 > 700 && co2 < 2001) {
						co2_state_msg = 'Moderate';
					} else {
						co2_state_msg = 'Unhealthy';
					}

					if (pm25 < 16) {
						pm25_state_msg = 'Good';
					} else if (pm25 > 15 && pm25 < 51) {
						pm25_state_msg = 'Moderate';
					} else {
						pm25_state_msg = 'Unhealthy';
					}
					res.json({
						code: 200,
						data: {
							co2: co2,
							pm25: pm25,
							rh: 30 + parseFloat((Math.random() * 10).toFixed(1)),
							temp: 20 + parseFloat((Math.random() * 10).toFixed(1)),
							co2_state_msg: co2_state_msg,
							pm25_state_msg: pm25_state_msg
						}
					});
				} else {
					res.json({
						code: 500,
						error: 'Sensor not response.'
					});
				}
			}
		}
	};

	if (global.config.running_mode == 'demo') {
		handlerFn(1, 0, 0);
		return;
	}

	var api_url = "http://"+query.ip+"/read";
	request(api_url, {}, handlerFn);
});

function insertHistoryStats(connection, new_data, callback) {
	var sql = 'INSERT INTO statistic_log (temp, sensor_serial_no, hcho, co2, co, rh, pm10, pm2_5, epapm10, epapm2_5, pid, blesno, date, tvoc, updated_date) VALUES ?\n';
	connection.query(sql, [new_data], function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}

module.exports = router;