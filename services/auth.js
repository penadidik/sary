var logger = require(global.config.dir.utils + 'logger');

exports.requireAuthentication = function (req, res, next) {
	var access_info;
	if (global.config.running_mode == 'demo') {
		return next();
	} else if (req.method == 'GET') { // pass all GET requests.
		access_info = global.user_access_map.get(token);
		if (access_info) {
			access_info.last_access_time = new Date();
			global.user_access_map.set(token, access_info);
			req.headers.user_id = access_info.user_id;
		}
		return next();
	}

	var token = req.headers.authorization;
	if (!token) {
		token = getAuthorizationFromCookie(req);
	}
	if (!token) {
		res.json({
			code: 400,
			error: "'Authorization' header is required."
		});
	} else {
		access_info = global.user_access_map.get(token);
		if (access_info) {
			var passed_time = new Date() - access_info.last_access_time;
			if (passed_time > (5 * 60 * 1000)) { // over 5 min?
				global.user_access_map.delete(token);
				res.json({
					code: 403,
					error: "Session Expired."
				});
			} else {
				access_info.last_access_time = new Date();
				global.user_access_map.set(token, access_info);
				req.headers.user_id = access_info.user_id;
				req.headers.mapped_room_id = access_info.room_id;
				next();
			}
		} else {
			res.json({
				code: 401,
				error: "Unauthorized"
			});
		}
	}
};

exports.requireAdminAuthorization = function (req, res, next) {
	var token = getAuthorizationFromCookie(req);
	var access_info = global.user_access_map.get(token);
	if (global.config.running_mode == 'demo') {
		next();
	} else if (!access_info || (access_info && !access_info.is_admin)) {
		res.redirect('/tso-console');
	} else {
		next();
	}
};

exports.requireAuthLogin = function (req, res, next) {
	var token = getAuthorizationFromCookie(req);
	var access_info = global.user_access_map.get(token);
	if (global.config.running_mode == 'demo') {
		res.redirect('/tso-console/dashboard');
	} else if (!access_info || (access_info && !access_info.is_admin)) {
		res.render('login', {
          title: 'Smart Room System',
          csrfToken : req.csrfToken()
        });
	} else {
		res.redirect('/tso-console/dashboard');
	}
};

function getAuthorizationFromCookie(request) {
	var rc = request.headers.cookie;
	var authorization;
	if (rc) {
		rc.split(';').forEach(function (cookie) {
			var parts = cookie.split('=');
			if (parts.shift().trim() == 'Authorization')
				authorization = decodeURI(parts.join('='));
		});
	}

	return authorization;
}