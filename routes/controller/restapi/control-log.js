var express = require('express');
var router = express.Router();
var dao = require(global.config.dir.dao + 'dao');
var dateFormat = require('dateformat');
var utils = require(global.config.dir.utils + 'reqUtils');
var pool = dao.getPool('csitso');
var async = require('async');
var logger = require(global.config.dir.utils + 'logger');

var DEFAULT_PAGE_SIZE = 50;
var MAX_PAGE_SIZE = 500;

/**
 * log history
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/control-log
 * @PARAM user_id, room_id
 */
router.get('/control-log', function (req, res, next) {
	var query = utils.getRequestQuery(req);
	var new_data = req.body;
	var result_data = {};
	pool.getConnection(function (err, connection) {
		if (err) {
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		async.waterfall([
			async.apply(getControlLogsCount, connection, query, result_data),
			async.apply(getControlLogs, connection, query, result_data)
		], function (err) {
			connection.release();

			if (err) {
				logger.error('==>> ERROR: %j', err);
				res.json({
					code: 500,
					error: err
				});
				return;
			} else {
				res.json({
					code: 200,
					data: result_data
				});
			}
		});
	});
});

function getControlLogsCount(connection, query, result_data, callback) {
	var sql = 'SELECT COUNT(1) as count FROM control_log';
	var where_condition = [];
	var params = [];
	if (query.user_id) {
		where_condition.push(' user_id = ? ');
		params.push(query.user_id);
	}
	if (query.room_id) {
		where_condition.push(' room_id = ? ');
		params.push(query.room_id);
	}
	if (query.start_date && query.end_date) {
		where_condition.push(' controlled_time BETWEEN ? AND ? ');
		params.push(query.start_date);
		params.push(query.end_date);
	}
	if (where_condition.length > 0) {
		sql += ' WHERE ' + where_condition.join(' and ');
	}

	connection.query(sql, params, function (err, rows, fields) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}

		var total = rows[0].count;
		result_data.pagination = utils.getPaginationWithoutWindowSize(
			query.page_no,
			query.page_size,
			total,
			DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
		callback();
	});
}

function getControlLogs(connection, query, result_data, callback) {	
	var sql = 'SELECT * FROM control_log ';
	var where_condition = [];
	var params = [];
	if (query.user_id) {
		where_condition.push(' user_id = ? ');
		params.push(query.user_id);
	}
	if (query.room_id) {
		where_condition.push(' room_id = ? ');
		params.push(query.room_id);
	}
	if (query.start_date && query.end_date) {
		where_condition.push(' controlled_time BETWEEN ? AND ? ');
		params.push(query.start_date);
		params.push(query.end_date);
	}
	if (where_condition.length > 0) {
		sql += ' WHERE ' + where_condition.join(' AND ');
	}
	sql += ' ORDER BY `index` DESC LIMIT ?, ?';
	
	var startIndex = (result_data.pagination.page_no - 1) * result_data.pagination.page_size;

	params.push(startIndex);
	params.push(result_data.pagination.page_size);

	connection.query(sql, params, function (err, rows, fields) {
		if (err) {
			logger.error('==>> ERROR: %j', err);
			callback(err);
			return;
		}

		rows.forEach(function (element) {
			try{
				element.message = JSON.parse(element.message);
			}catch(exception){
				logger.error(exception);
			}
			element.controlled_time = dateFormat(element.controlled_time, "yyyy-mm-dd HH:MM:ss");			
		}, this);

		result_data.items = rows;
		callback();
	});
}
module.exports = router;