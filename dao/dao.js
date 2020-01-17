var mysql = require('mysql');
var sqlResource = require(global.config.dir.dao + 'sql');

var csitsoPool = mysql.createPool({
	connectionLimit: global.config.db.connection.limit,
	host: global.config.db.csitso.host,
	user: global.config.db.csitso.user,
	password: global.config.db.csitso.password,
	database: global.config.db.csitso.database,
	debug: false,
	waitForConnections: false
});

exports.getPool = function (poolName) {
	switch (poolName) {
		case 'csitso':
			return csitsoPool;
		default:
			return csitsoPool;
	}
};

exports.format = function (sql, inserts) {
	return mysql.format(sql, inserts);
}

exports.getSql = function (id) {
	var sql = eval('sqlResource.mysql.' + id);
	return sql;
}