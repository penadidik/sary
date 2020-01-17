var sql = {};

sql.mysql = {}

sql.mysql.sensor_log_last = 'SELECT Device_ID AS deviceId, Object_ID AS objectId, URI AS uri, Content AS content, Timestamp AS timestamp \n'
+ '  FROM sensing_data \n'
+ ' WHERE Device_ID = ? AND Object_ID = ? \n '
+ ' ORDER BY Timestamp DESC \n';

sql.mysql.devices_search = 'SELECT deviceid, coordinate, description, devicename, deviceowner, \n'
+ ' location, modelid, passcode, registereddate, serialno, status, tags, tenantid, updateddate \n'
+ ' FROM tbl_devices \n'
+ ' WHERE deviceowner = ? \n';

module.exports = sql;