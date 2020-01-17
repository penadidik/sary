var express = require('express');
var router = express.Router();
var dao = require(global.config.dir.dao + 'dao');
var utils = require(global.config.dir.utils + 'reqUtils');
var pool = dao.getPool('csitso');
var multer = require('multer');
var memorystorage = multer.memoryStorage();
var upload = multer({
	storage: memorystorage
});
var xlsx = require('node-xlsx').default;
var async = require('async');
var metadataLoader = require(global.config.dir.services + 'metadataLoader');
var versionUpdater = require(global.config.dir.services + 'versionUpdater');
var logger = require(global.config.dir.utils + 'logger');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

/**
 * import configuration excel file
 * 
 * @METHOD post
 * @URL /restapi/v1/tso/import-configuration-file
 * @PARAM file
 */
router.post('/import-configuration-file', csrfProtection, upload.single('file'), function (req, res, next) {
	var query = utils.getRequestQuery(req);

	if (!req.file) {
		res.json({
			code: 400,
			message: "file not sent"
		});
		return;
	}
	// Parse a buffer
	try {
		var configurationSheet = xlsx.parse(req.file.buffer)[0].data;
		var room_array = [];
		var floor_index = 1,
			room_name_index = floor_index + 1,
			room_id_index = floor_index + 2,
			gateway_static_ip_index = floor_index + 3,
			gateway_serial_no_index = floor_index + 4,
			sensor_static_ip_index = floor_index + 5,
			sensor_serial_no_index = floor_index + 6,
			room_description_index = floor_index + 7,
			ch_cnt_index = floor_index + 8;
			additional_info_idx = floor_index + 21;

		for (var i = 2; i < configurationSheet.length; i++) {
			var room_info = configurationSheet[i];

			if (!room_info[floor_index] || !room_info[floor_index + 1]) {
				continue;
			}

			var blind_info = [];
			for (var j = 0; j < room_info[ch_cnt_index]; j++) {
				var ch_info = {
					"ch_no": room_info[ch_cnt_index + 1 + (j * 3)], // ch_no
					"blind_cnt": room_info[ch_cnt_index + 2 + (j * 3)], // blind_cnt
					"blind_controller_id": room_info[ch_cnt_index + 3 + (j * 3)] // blind_controller_id					
				};
				blind_info.push(ch_info);
			}

			var room = [
				room_info[room_id_index], // + '-' + (room_info[floor_index + 1]).replace(/ /g, '-'), //room_id
				room_info[room_name_index], //room_name
				room_info[floor_index], //floor_no
				JSON.stringify(blind_info), //blind_info				
				room_info[gateway_static_ip_index], //gateway_static_ip
				room_info[gateway_serial_no_index], //gateway_serial_no
				'S' + room_info[gateway_serial_no_index], //gateway_id
				room_info[sensor_static_ip_index], //sensor_static_ip
				room_info[sensor_serial_no_index], //sensor_serial_no
				'S' + room_info[sensor_serial_no_index], //sensor_id
				room_info[room_description_index], //room description
				new Date(),
				room_info[additional_info_idx] // additional info...
			];
			room_array.push(room);
		}

		pool.getConnection(function (err, connection) {
			if (err) {
				connection.release();
				res.json({
					code: 500,
					error: err
				});
				return;
			}

			async.waterfall([
				async.apply(deleteAllRooms, connection),
				async.apply(insertNewRooms, connection, room_array)
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
				metadataLoader.loadMetadata();
				versionUpdater.updateVersion('metadata_version');
				res.json({
					code: 200
				});
			});
		});

	} catch (exception) {
		res.json({
			code: 400,
			message: 'Sheet format is invalid. '
		});
	}
});

function deleteAllRooms(connection, callback) {
	var sql = 'DELETE FROM metadata\n';
	connection.query(sql, [], function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}

function insertNewRooms(connection, new_rooms, callback) {
	var sql = 'INSERT INTO metadata VALUES ?\n';
	connection.query(sql, [new_rooms], function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}

module.exports = router;