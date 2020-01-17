var express = require('express');
var router = express.Router();

var async = require('async');
var auth = require(global.config.dir.services + 'auth');
var utils = require(global.config.dir.utils + 'reqUtils');

var dao = require(global.config.dir.dao + 'dao');
var pool = dao.getPool('csitso');
var request = require('request');
var csrf = require('csurf');
var csrfProtection = csrf({
  cookie: true
});
var logger = require(global.config.dir.utils + 'logger');

/**
 * login
 * 
 * @METHOD post
 * @URL /openapi/v1/tso/login
 * @PARAM 
 */
router.post('/login', function (req, res, next) {
  var query = utils.getRequestQuery(req);
  var user_id = query.user_id;
  var password = query.password;
  doLogin(user_id, password, query.is_web_login, function (result) {
    res.json(result);
  });
});

router.post('/login-web', csrfProtection, function (req, res, next) {
  var query = utils.getRequestQuery(req);
  var user_id = query.user_id;
  var password = query.password;
  doLogin(user_id, password, query.is_web_login, function (result) {
    res.json(result);
  });
});

function doLogin(user_id, password, is_web_login, callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      callback({
        code: 500,
        error: err
      });
      return;
    }
    var sql;
    var hashedPassword = '';
    if (password) {
      hashedPassword = utils.hashFn(password);
      sql = 'SELECT * FROM admin_list WHERE admin_id = ? AND (admin_password = ? OR admin_password = ?)  \n';
    } else if (is_web_login) {
      sql = 'SELECT * FROM admin_list WHERE admin_id = ? AND (admin_password is NULL OR admin_password = \'\') \n';
    } else {
      sql = 'SELECT * FROM admin_list WHERE admin_id = ? \n';
    }

    connection.query(sql, [user_id, password, hashedPassword], function (err, result) {
      connection.release();
      if (err) {
        callback({
          code: 500,
          error: err
        });
      } else {
        if (result.length == 0) {
          callback({
            code: 200,
            data: {
              is_admin: false
            }
          });
        } else {
          var access_key = makeid();
          global.user_access_map.set(access_key, {
            last_access_time: new Date(),
            user_id: user_id,
            is_admin: true,
            room_id: result[0].description ? result[0].description.split(',') : [] // 'description' is the room-id mapped to the user, only the mapped user can control the room.
          });
          callback({
            code: 200,
            data: {
              access_key: access_key,
              is_admin: true,
              admin_id: user_id
            }
          });
        }
      }
    });
  });

}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 30; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


/**
 * 
 * 연동  API
 * 
 * @METHOD get
 * @URL /openapi/v1/tso/sso
 * @PARAM 
 */
var crypto = require('crypto');

router.get('/sso', function (req, res, next) {
  try {
    var query = utils.getRequestQuery(req);
    var key = 'sop';
    key += query.tdate.substring(0, 13);
    var decrypt = crypto.createDecipheriv('aes-128-ecb', key, "");
    var user_id = decrypt.update(query.tid, 'base64', 'utf8');
    user_id += decrypt.final('utf8');
    doLogin(user_id, false, false, function (result) {
      if (result.code == 200 && result.data.is_admin) {
        res.cookie('Authorization', result.data.access_key);
        res.redirect('/tso-console/dashboard');
      } else {
        res.redirect('/tso-console');
      }
    });
  } catch (e) {
    res.redirect('/tso-console');
  }
});

module.exports = router;