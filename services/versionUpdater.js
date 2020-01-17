var dao = require(global.config.dir.dao + 'dao');
var pool = dao.getPool('csitso');
var logger = require(global.config.dir.utils + 'logger');

exports.updateVersion = function (version_id) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return null;
        }
        var sql_version = 'update version set value=value+1 where id = ?';
        connection.query(sql_version, [version_id], function (err, result) {
            connection.release();
            if (err) {                
                logger.error('versionUpdater.updateVersion ==>> ERROR', err);
                callback(err);
                return;
            }
        });
    });
}