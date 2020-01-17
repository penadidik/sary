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
var admin_sql = {
	select_all: 'SELECT * FROM admin_list \n',
	delete_one: 'DELETE FROM admin_list WHERE admin_id = ? \n',
	update_one: 'UPDATE admin_list SET ? WHERE admin_id = ? \n',
	insert_one: 'INSERT INTO admin_list SET ? \n'
};

/**
 * get admin list
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/admins
 * @PARAM 
 */

router.get('/admins', csrfProtection, function (req, res, next) {
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		var sql = admin_sql.select_all;
		connection.query(sql, [], function (err, result) {
			connection.release();
			if (err) {
				res.json({
					code: 500,
					error: err
				});
			} else {
				res.json({
					code: 200,
					data: result
				});
			}
		});
	});
});

/**
 * create a new admin
 * 
 * @METHOD post
 * @URL /restapi/v1/tso/admins
 * @PARAM 
 */

router.post('/admins', csrfProtection, function (req, res, next) {
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
		
		var sql = admin_sql.insert_one;
		connection.query(sql, [new_data], function (err) {
			connection.release();
			if (err) {
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
});

/**
 * update a admin
 * 
 * @METHOD put
 * @URL /restapi/v1/tso/admins/:admin_id
 * @PARAM 
 */

router.put('/admins/:admin_id', csrfProtection, function (req, res, next) {
	var new_data = req.body;
  delete new_data._csrf;

  var admin_id = req.params.admin_id;
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		var sql = admin_sql.update_one;
		connection.query(sql, [new_data, admin_id], function (err) {
			connection.release();
			if (err) {
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
});

/**
 * delete a admin
 * 
 * @METHOD delete
 * @URL /restapi/v1/tso/admins/:admin_id
 * @PARAM 
 */

router.delete('/admins/:admin_id', function (req, res, next) {
	var new_data = req.body;
	var admin_id = req.params.admin_id;
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release();
			res.json({
				code: 500,
				error: err
			});
			return;
		}
		var sql = admin_sql.delete_one;
		connection.query(sql, [admin_id], function (err) {
			connection.release();
			if (err) {
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
});

module.exports = router;