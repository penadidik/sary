var dao = require(global.config.dir.dao + 'dao');
var pool = dao.getPool('csitso');
var groupBy = require('group-by');
var async = require('async');
var dateFormat = require('dateformat');
var logger = require(global.config.dir.utils + 'logger');

exports.loadMetadata = function () {
    pool.getConnection(function (err, connection) {
        if (err) {
            return null;
        }
        var last_version = {};
        async.waterfall([
            async.apply(getLastVersion, connection, last_version),
            async.apply(loadMetadataFromDB, connection, last_version)
        ], function (err) {
            connection.release();
            if (err) {
                logger.error('==>> ERROR: %j', err);
            }
        });
    });
};

function loadMetadataFromDB(connection, last_version, callback) {
    var sql_metadata = `
        select 
            room_id, 
            room_name, 
            floor_no, 
            blind_info, 
            gateway_static_ip, 
            gateway_serial_no, 
            gateway_id, 
            sensor_static_ip, 
            sensor_serial_no, 
            sensor_id, 
            description,
            updated_time,
            additional_info
        from 
            metadata
        order by floor_no, room_id`;
    connection.query(sql_metadata, [], function (err, result) {
        if (err) {            
            logger.error('metadataLoader.loadMetadata ==>> ERROR', err);
        }
        var floor_index = [];
        var floors = [];
        var floor_map = new Map();
        var room_map = new Map();

        for (var i in result) {
            result[i].blind_info = JSON.parse(result[i].blind_info);
            result[i].additional_info = JSON.parse(result[i].additional_info);
            result[i].updated_time = dateFormat(result[i].updated_time, "yyyy-mm-dd HH:MM:ss");			
            room_map.set(result[i].room_id, result[i]);
        }

        result = groupBy(result, 'floor_no');
        for (var key in result) {
            var tempFloor = {
                floor_no: key,
                rooms: result[key]
            };
            floor_index.push(key);
            floor_map.set(key, tempFloor);

            // tempFloor.rooms.filter(function (elm) {
            //     delete elm.floor_no;
            //     delete elm.static_ip;
            //     delete elm.mac_address;
            //     delete elm.controller_id;
            // });

            floors.push(tempFloor);
        }
        global.metadata = {
            last_version: last_version.value,
            floor_index: floor_index,
            floors: floors,
            floor_map: floor_map,
            room_map: room_map
        }       
    });
}

function getLastVersion(connection, last_version, callback) {
    var sql_version = `select value as version from version where id='metadata_version'`;
    connection.query(sql_version, [], function (err, result) {
        if (err) {            
            logger.error('metadataLoader.loadMetadata ==>> ERROR: %j', err);
            callback(err);
            return;
        }
        last_version.value = result[0];
        callback();
    });
}