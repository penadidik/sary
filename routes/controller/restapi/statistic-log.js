var express = require('express');
var router = express.Router();
var xls = require('node-excel-export');
var dao = require(global.config.dir.dao + 'dao');
var dateFormat = require('dateformat');
var utils = require(global.config.dir.utils + 'reqUtils');
var pool = dao.getPool('csitso');
var async = require('async');
var logger = require(global.config.dir.utils + 'logger');
var request = require('request');

var DEFAULT_PAGE_SIZE = 800000;
var MAX_PAGE_SIZE = 1000000;

/**
 * log history
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/stat-log
 * @PARAM start_date, end_date, floor_no, room_id
 */
router.get('/stat-log', function (req, res, next) {
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
			async.apply(getStatLogs, connection, query, result_data)
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

/**
 * log all history
 *
 * @METHOD get
 * @URL /restapi/v1/tso/stat-all-log
 * @PARAM start_date, end_date
 */
router.get('/stat-all-log', function (req, res, next) {
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
			async.apply(getStatAllLogs, connection, query, result_data)
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

function getStatLogs(connection, query, result_data, callback) {
    var sql = " select round(avg(temp),1) temp, updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";

    var where_condition = [];
    var params = [];
    var startDate = "";
    var endDate = "";

    if (query.room_id != "null") {
        params.push(query.room_id);
        where_condition.push(" b.room_id = ? and b.floor_no = ? ");
    }else{
        where_condition.push(" b.floor_no = ? ");
    }

    where_condition.push(" hour(updated_date) BETWEEN '8' AND '18' ");
    params.push(query.floor_no);

    var groupParam = query.interval;
    var groups = ""
    if (groupParam == "yearly") {//between year
        where_condition.push(" date_format(updated_date, '%Y') BETWEEN ? AND ? ");
        startDate = dateFormat(query.start_date, "yyyy");
        endDate = dateFormat(query.end_date, "yyyy");
        params.push(startDate);
        params.push(endDate);
        sql = " select round(avg(temp),1) temp, date_format(updated_date, '%Y') updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date) ";
    } else if (groupParam == "monthly") {//between month
        where_condition.push(" date_format(updated_date, '%Y-%m') BETWEEN ? AND ? ");
        startDate = dateFormat(query.start_date, "yyyy-mm");
        endDate = dateFormat(query.end_date, "yyyy-mm");
        params.push(startDate);
        params.push(endDate);
        sql = " select round(avg(temp),1) temp, concat(FROM_DAYS(TO_DAYS(updated_date) - MOD(TO_DAYS(updated_date) -2, 7)), ' - ', FROM_DAYS(TO_DAYS(updated_date) - MOD(TO_DAYS(updated_date) -2, 7)) + INTERVAL 6 DAY) updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), week(updated_date) ";
    } else if (groupParam == "weekly") {//just one month
        where_condition.push(" date_format(updated_date, '%Y-%m') = ? ");
        startDate = dateFormat(query.start_date, "yyyy-mm");
        params.push(startDate);
        sql = " select round(avg(temp),1) temp, concat(FROM_DAYS(TO_DAYS(updated_date) - MOD(TO_DAYS(updated_date) -2, 7)), ' - ', FROM_DAYS(TO_DAYS(updated_date) - MOD(TO_DAYS(updated_date) -2, 7)) + INTERVAL 6 DAY) updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), week(updated_date) ";
    } else if (groupParam == "daily") {//just one month
        /*where_condition = [];
        params = [];
        sql = setDaily(query.start_date, query.room_id, query.floor_no);*/
        where_condition.push(" date_format(updated_date, '%Y-%m') = ? ");
        startDate = dateFormat(query.start_date, "yyyy-mm");
        params.push(startDate);
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), day(updated_date) ";
    } else if (groupParam == "hourly") {//just one date
        where_condition = [];
        params = [];
        sql = setHourly(query.start_date, query.room_id, query.floor_no);
    } else if (groupParam == "5 minutes") {//just one date
        startDate = dateFormat(query.start_date, "yyyy-mm-dd");
        params.push(startDate);
        where_condition.push(" date_format(updated_date, '%Y-%m-%d') = ? ");
        sql = " select round(temp,1) temp, updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";
    }

    if (where_condition.length > 0) {
        sql += ' WHERE ' + where_condition.join(' AND ');
    }

    sql += groups;

    console.log("sql ->"+sql+" | with params ->"+params);
    connection.query(sql, params, function (err, rows, fields) {
        if (err) {
            logger.error('==>> ERROR: %j', err);
            callback(err);
            return;
        }

        rows.forEach(function (element) {
            try {
                element.message = JSON.parse(element.message);
            } catch (exception) {
                logger.error(exception);
            }
            if (groupParam != "weekly" && groupParam != "monthly") {
                element.updated_date = dateFormat(element.updated_date, "yyyy-mm-dd h:MM TT");
            }
        }, this);

        //console.log(rows);
        result_data.items = rows;
        callback();
    });
}

function getStatAllLogs(connection, query, result_data, callback) {
    var sql = " select round(avg(temp),1) temp, updated_date, a.sensor_serial_no, room_name, floor_no from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no ";

    var where_condition = [];
    var params = [];

    where_condition.push(" hour(updated_date) BETWEEN '8' AND '18' ");

    var startDate = dateFormat(query.start_date, "yyyy-mm-dd");
    var nowDate = dateFormat(new Date(), "yyyy-mm-dd");

    var groups = "";
    if (startDate == nowDate) {
        where_condition.push(" date_format(updated_date, '%Y-%m-%d') = ? ");
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), day(updated_date), hour(updated_date) ";
    } else {
        startDate = dateFormat(query.start_date, "yyyy-mm");
        where_condition.push(" date_format(updated_date, '%Y-%m') = ? ");
        groups = " group by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), day(updated_date) ";
    }

    params.push(startDate);

    if (where_condition.length > 0) {
        sql += ' WHERE ' + where_condition.join(' AND ');
    }

    sql += groups;
    sql += ' ORDER BY floor_no, updated_date, room_name ';

    console.log("sql ->"+sql+" | with params ->"+params);
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
            if (startDate == nowDate) {
                element.updated_date = dateFormat(element.updated_date, "yyyy-mm-dd h:MM TT");
            } else {
                element.updated_date = dateFormat(element.updated_date, "yyyy-mm-dd");
            }
        }, this);

        result_data.items = rows;
        callback();
    });
}

function setDaily(month, roomId, floorNo) {
    var mnth = dateFormat(month, "yyyy-mm");
    var startQuery = " select * from(";
    var contentQuery = "";
    for (var i = 1; i < 32; i++) {
        if (i < 10) {
            contentQuery += varDaily(mnth + "-0" + i, roomId, floorNo) + " UNION ALL ";
        } else {
            contentQuery += varDaily(mnth + "-" + i, roomId, floorNo) + " UNION ALL ";
        }
    }
    contentQuery = contentQuery.substring(0, contentQuery.length - 11)
    return startQuery + contentQuery + ") as sary";
}

function setHourly(month, roomId, floorNo) {
    var mnth = dateFormat(month, "yyyy-mm-dd");
    return varDaily(mnth, roomId, floorNo);
}

function varDaily(mnth, roomId, floorNo) {
    var rooms = "";
    if (roomId != 'null') {
        rooms = " b.room_id = '" + roomId + "' and ";
    }

    return " (" +
        " select round(AVG(temp), 1) temp, updated_date, a.sensor_serial_no, room_name, floor_no " +
        " from statistic_log a inner join metadata b on b.sensor_serial_no = a.sensor_serial_no  WHERE " + rooms + " b.floor_no = '" + floorNo + "' " +
        " AND  hour(updated_date) BETWEEN '8' AND '18' AND date_format(updated_date, '%Y-%m-%d') = '" + mnth + "'" +
        " GROUP by a.sensor_serial_no, room_name, floor_no, year(updated_date), month(updated_date), day(updated_date), hour(updated_date)" +
        " ) ";
}

router.get('/export-excel', function(req, res, next){
    var paths = req.url;
    paths = paths.substring(paths.indexOf("?"), paths.length);
    var url = "http://"+config.host.url+"/restapi/v1/tso/stat-log"+paths;

    var dataArr= [];
    var handlerFn = function (err2, res2, body) {
        var jsonArr = JSON.parse(body)["data"]["items"];
        for(var i = 0; i < jsonArr.length; i++) {
            dataArr.push(jsonArr[i]);
        }

        const styles = {
          headerDark: {
            fill: {
              fgColor: {
                rgb: 'FF000000'
              }
            },
            font: {
              color: {
                rgb: 'FFFFFFFF'
              },
              sz: 14,
              bold: true,
            }
          },
          cellPink: {
            fill: {
              fgColor: {
                rgb: 'FFFFCCFF'
              }
            }
          },
          cellGreen: {
            fill: {
              fgColor: {
                rgb: 'FF00FF00'
              }
            }
          }
        };

        const specification = {
          floor_no: { // <- the key should match the actual data key
            displayName: 'Floor', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 50 // <- width in pixels
          },
          room_name: { // <- the key should match the actual data key
            displayName: 'Zone', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 100 // <- width in pixels
          },
          updated_date: { // <- the key should match the actual data key
            displayName: 'Date', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 130 // <- width in pixels
          },
          sensor_serial_no: {
            displayName: 'Serial No',
            headerStyle: styles.headerDark,
            width: 120
          },
          temp: {
            displayName: 'Temp. (℃)',
            headerStyle: styles.headerDark,
            width: 100
          }
        }

        const report = xls.buildExport(
          [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            {
             /* name: 'Report', // <- Specify sheet name (optional)
              heading: heading, // <- Raw heading array (optional)
              merges: merges, // <- Merge cell ranges*/
              specification: specification, // <- Report specification
              data: dataArr // <-- Report data
            }
          ]
        );

        res.attachment('report.xlsx');
        res.send(report);

    };

    request(url, {}, handlerFn);
});

router.get('/export-excel-all', function(req, res, next){
    var paths = req.url;
    paths = paths.substring(paths.indexOf("?"), paths.length);
    var url = "http://"+config.host.url+"/restapi/v1/tso/stat-all-log"+paths;

    var dataArr= [];
    var handlerFn = function (err2, res2, body) {
        var jsonArr = JSON.parse(body)["data"]["items"];
        for(var i = 0; i < jsonArr.length; i++) {
            dataArr.push(jsonArr[i]);
        }

        const styles = {
          headerDark: {
            fill: {
              fgColor: {
                rgb: 'FF000000'
              }
            },
            font: {
              color: {
                rgb: 'FFFFFFFF'
              },
              sz: 14,
              bold: true,
            }
          },
          cellPink: {
            fill: {
              fgColor: {
                rgb: 'FFFFCCFF'
              }
            }
          },
          cellGreen: {
            fill: {
              fgColor: {
                rgb: 'FF00FF00'
              }
            }
          }
        };

        const specification = {
          floor_no: { // <- the key should match the actual data key
            displayName: 'Floor', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 50 // <- width in pixels
          },
          room_name: { // <- the key should match the actual data key
            displayName: 'Zone', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 100 // <- width in pixels
          },
          updated_date: { // <- the key should match the actual data key
            displayName: 'Date', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            width: 130 // <- width in pixels
          },
          sensor_serial_no: {
            displayName: 'Serial No',
            headerStyle: styles.headerDark,
            width: 120
          },
          temp: {
            displayName: 'Temp. (℃)',
            headerStyle: styles.headerDark,
            width: 100
          }
        }

        const report = xls.buildExport(
          [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            {
             /* name: 'Report', // <- Specify sheet name (optional)
              heading: heading, // <- Raw heading array (optional)
              merges: merges, // <- Merge cell ranges*/
              specification: specification, // <- Report specification
              data: dataArr // <-- Report data
            }
          ]
        );

        res.attachment('report.xlsx');
        res.send(report);
    };

    request(url, {}, handlerFn);
});

module.exports = router;