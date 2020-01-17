var express = require('express');
var router = express.Router();

var async = require('async');
var auth = require(global.config.dir.services + 'auth');
var dao = require(global.config.dir.dao + 'dao');
var dateFormat = require('dateformat');
var utils = require(global.config.dir.utils + 'reqUtils');

var pool = dao.getPool('csitso');
var groupBy = require('group-by');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var metadataLoader = require(global.config.dir.services + 'metadataLoader');
var versionUpdater = require(global.config.dir.services + 'versionUpdater');
var logger = require(global.config.dir.utils + 'logger');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var room_sql = {
	delete_one: 'DELETE FROM metadata WHERE room_id = ? \n',
	update_one: 'UPDATE metadata SET ? WHERE room_id = ? \n',
	insert_one: 'INSERT INTO metadata SET ? \n'
};

/**
 * get room list
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/rooms
 * @PARAM 
 */

router.get('/rooms', function (req, res, next) {
	var query = utils.getRequestQuery(req);
	var result = [];
	if(query.merge){
		result = Array.from(global.metadata.room_map.values());

	} else if (query.floor_no) {
		result = global.metadata.floor_map.get(query.floor_no);
	} else {
		result = global.metadata.floors;
	}
	// result.filter(function (elm, index) {

	// })
	res.json({
		code: 200,
		data: result
	});
});

/**
 * get a room info
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/rooms/:room_id
 * @PARAM 
 */

router.get('/rooms/:room_id', function (req, res, next) {
	var query = utils.getRequestQuery(req);
	res.json({
		code: 200,
		data: global.metadata.room_map.get(query.room_id)
	});
});

/**
 * create a new room
 * 
 * @METHOD post
 * @URL /restapi/v1/tso/rooms
 * @PARAM 
 */

router.post('/rooms', csrfProtection, function (req, res, next) {
	var new_data = req.body;
  delete new_data._csrf;
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		insertRoom(connection, new_data, function (err) {
			connection.release();
			if (err) {
				logger.error('ERROR in insertRoom: %j', err);
				res.json({
					code: 500,
					error: err
				});
			} else {
				metadataLoader.loadMetadata();
				versionUpdater.updateVersion('metadata_version');
				res.json({
					code: 200
				});
			}
		})
	});
});

/**
 * update a room info
 * 
 * @METHOD put
 * @URL /restapi/v1/tso/rooms/:room_id
 * @PARAM 
 */

router.put('/rooms/:room_id', csrfProtection, function (req, res, next) {
	var new_data = req.body;
  delete new_data._csrf;
	var room_id = req.params.room_id;
	// if (new_data.room_id && new_data.room_id != room_id) {
	// 	res.json({
	// 		code: 400,
	// 		message: "room_id in the params is not matched with room_id in the body"
	// 	});
	// 	return;
	// }
	//new_data.room_id = room_id;
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		updateRoom(connection, room_id, new_data, function (err) {
			connection.release();
			if (err) {
				logger.error('ERROR in updateRoom: %j', err);
				res.json({
					code: 500,
					error: err
				});
			} else {
				metadataLoader.loadMetadata();
				versionUpdater.updateVersion('metadata_version');
				res.json({
					code: 200
				});
			}
		})
	});
});

/**
 * delete a room
 * 
 * @METHOD delete
 * @URL /restapi/v1/tso/rooms/:room_id
 * @PARAM 
 */

router.delete('/rooms/:room_id', function (req, res, next) {
	var room_id = req.params.room_id;
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		deleteRoom(connection, room_id, function (err) {
			connection.release();
			if (err) {
				logger.error('ERROR in deleteRoom: %j', err);
				res.json({
					code: 500,
					error: err
				});
			} else {
				metadataLoader.loadMetadata();
				versionUpdater.updateVersion('metadata_version');
				res.json({
					code: 200
				});
			}
		});
	});
});

function insertRoom(connection, new_data, callback) {
	var sql = room_sql.insert_one;
	if (new_data.blind_info) {
		new_data.blind_info = JSON.stringify(new_data.blind_info);
	}
	if (new_data.gateway_serial_no) {
		new_data.gateway_id = 'S' + new_data.gateway_serial_no;
	}
	if (new_data.sensor_serial_no) {
		new_data.sensor_id = 'S' + new_data.sensor_serial_no;
	}
	new_data.updated_time = new Date();
	connection.query(sql, new_data, function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}

function updateRoom(connection, room_id, new_data, callback) {
	var sql = room_sql.update_one;
	if (new_data.blind_info) {
		new_data.blind_info = JSON.stringify(new_data.blind_info);
	}
	if (new_data.gateway_serial_no) {
		new_data.gateway_id = 'S' + new_data.gateway_serial_no;
	}
	if (new_data.sensor_serial_no) {
		new_data.sensor_id = 'S' + new_data.sensor_serial_no;
	}
	new_data.updated_time = new Date();
	connection.query(sql, [new_data, room_id], function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}

function deleteRoom(connection, room_id, callback) {
	var sql = room_sql.delete_one;
	connection.query(sql, room_id, function (err) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}
		callback();
	});
}


module.exports = router;