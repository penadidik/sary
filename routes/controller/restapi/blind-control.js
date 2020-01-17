var express = require('express');
var router = express.Router();

var async = require('async');
var auth = require(global.config.dir.services + 'auth');
var dao = require(global.config.dir.dao + 'dao');
var utils = require(global.config.dir.utils + 'reqUtils');
var pool = dao.getPool('csitso');
var request = require('request');

var logger = require(global.config.dir.utils + 'logger');

/**
 * adjust blind
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/rooms/:room_id/control-blind
 * @PARAM 
 */

router.post('/rooms/:room_id/control-blind', function (req, res, next) {
	var param = {
		user_id: req.headers.user_id,
		room_id: req.params.room_id,
		message: req.body.data,
		controlled_time: new Date()
	};
	if (req.headers.user_id != 'admin' && !req.headers.mapped_room_id.includes(req.params.room_id)) {
		res.json({
			code: 400,
			error: 'Not the Admin user of this room.'
		});
		return;
	}

	if (!param.message) {
		res.json({
			code: 403,
			error: 'Bad request. Invalid message has been sent.'
		});
		return;
	}
	async.waterfall([
		async.apply(sendMessagetoGateway, param),
			async.apply(insertControlLog, param)
	], function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			res.json({
				code: 500,
				error: err
			});
		} else {
			res.json({
				code: 200
			});
		}
	});
});

/*
	게이트웨이에 제어 명령 보내기
*/
function sendMessagetoGateway(param, callback) {
	var room_info = global.metadata.room_map.get(param.room_id);
	var gateway_ip = room_info.gateway_static_ip;
	var completed_requests = 0;
	var error = [];
	var handlerFn = function (index, device_id) {
		return function (err, res, body) {
			if (err) {
				console.log(err);
				error.push({
					message: err,
					device_id: device_id
				});
			} else {
				if (body.startsWith('ERROR')) {
					console.log(index);
					error.push({
						message: body,
						device_id: device_id
					});
				}
			}
			completed_requests++;
			if (completed_requests == param.message.length) {
				callback(error.length > 0 ? error : null);
			}
		};
	};

	var getControllerId = function (ch_no) {
		for (var index in room_info.blind_info) {
			if (room_info.blind_info[index].ch_no == ch_no) {
				return room_info.blind_info[index].blind_controller_id;
			}
		}
		return 0;
	};

	for (var index in param.message) {
		var device_id = getControllerId(param.message[index].ch_no);
		var action = utils.capitalizeFirstLetter(param.message[index].direction);
		var api_tmp = [
			'http://',
			gateway_ip,
			'/port_3480/data_request?id=lu_action&action=',
			action,
			'&serviceId=urn:upnp-org:serviceId:WindowCovering1&DeviceNum=',
			device_id
		];
		var api_url = api_tmp.join('');
		console.log(api_url);
		request(api_url, {
			json: true,
			timeout: 3000
		}, (handlerFn)(index, device_id));
	}
}

/*
	제어 로그 저장
*/
function insertControlLog(param, callback) {
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			callback();
		}

		param.message = JSON.stringify(param.message);
		var sql = 'INSERT INTO control_log SET ? ';
		connection.query(sql, [param], function (err) {
			connection.release();
			if (err) {
				logger.error('==>> ERROR: %j', err);
			}
			callback();
		});
	});
}

module.exports = router;