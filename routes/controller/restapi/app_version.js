var express = require('express');
var router = express.Router();

var async = require('async');
var dao = require(global.config.dir.dao + 'dao');
var dateFormat = require('dateformat');
var dateTime = require('node-datetime');
var pool = dao.getPool();
var request = require('request');
var utils = require(global.config.dir.utils + 'reqUtils');
var logger = require(global.config.dir.utils + 'logger');


/*******************************************************************************
 * Pagination
 ******************************************************************************/
var DEFAULT_PAGE_SIZE = 100;
var MAX_PAGE_SIZE = 500;

var app_version_sql = {
    select_all: 'SELECT * FROM app_version ORDER BY registered_time desc',
    select_latest_one: `
        SELECT 
            os_type, 
            version,
            link,
            registered_time
        FROM 
            app_version 
        WHERE os_type = ?
        ORDER BY registered_time desc
        LIMIT 1`,
    insert_one: 'INSERT INTO app_version SET ? \n',
}


/************************************************************************* START
 * APIs
 ******************************************************************************/

/** C
 * insert App Version
 * 
 * @METHOD POST
 * @URL /restapi/v2/app-version
 */
router.post('/app-version', function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                code: 500,
                error: err
            });
            return;
        }
        async.waterfall([
            async.apply(insertAppVersion, connection, req.body),
        ], function (err) {
            connection.release();

            if (err) {
                console.error('==>> ERROR', err);
                res.json({
                    code: 500,
                    error: err
                });
                return;
            } else {
                res.json({
                    code: 200,
                    data: 'success'
                });
            }
        });
    });
});

/** C
 * insert App Version
 * 
 * @METHOD POST
 * @URL /restapi/v1/app-version
 */
router.get('/app-version', function (req, res, next) {
    var appVersions = {
        items: []
    }
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                code: 500,
                error: err
            });
            return;
        }
        async.waterfall([
            async.apply(selectAppVersions, connection, appVersions),
        ], function (err) {
            connection.release();

            if (err) {
                console.error('==>> ERROR', err);
                res.json({
                    code: 500,
                    error: err
                });
                return;
            } else {
                res.json({
                    code: 200,
                    data: appVersions
                });
            }
        });
    });
});

/** R
 * GET latest-app_version
 * 
 * @METHOD GET
 * @URL /restapi/v1/app-version/latest-app-version
 */
router.get('/app-version/latest-app-version', function (req, res, next) {
    var query = utils.getRequestQuery(req);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({
                code: 500,
                error: err
            });
            return;
        }
        async.waterfall([
            async.apply(getLatestAppVersionByType, connection, query.os_type),
        ], function (result) {
            connection.release();
            res.json({
                code: 200,
                data: result ? result : null
            });
        });
    });
    return;
});

/************************************************************************* START
 * Functions
 ******************************************************************************/

function insertAppVersion(connection, newData, callback) {
    var sql = app_version_sql.insert_one;

    var appVersion = newData;
    appVersion.registered_time = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    connection.query(sql, appVersion, function (err) {
        if (err) {
            console.error('==>> ERROR', err);
            callback(err);
            return;
        }
        callback();
    });
}

function selectAppVersions(connection, appVersions, callback) {
    var sql = app_version_sql.select_all;    
    connection.query(sql, function (err, rows) {
        if (err) {
            console.error('==>> ERROR', err);
            callback(err);
            return;
        }
        appVersions.items = rows;
        callback();
    });
}


function getLatestAppVersionByType(connection, os_type, callback) {
    var sql = app_version_sql.select_latest_one;

    connection.query(sql, [
        os_type
    ], function (err, rows, fields) {
        if (err) {
            console.error('==>> ERROR', err);
            callback(err);
            return;
        }
        rows[0].registered_time = dateFormat(rows[0].registered_time, "yyyy-mm-dd HH:MM:ss");
        callback(rows[0]);
    });
}

module.exports = router;