var fs = require('fs');

var config = {};

config.debug = false;

config.running_mode = 'normal';

// handypiadb
config.db = {
  connection: {
    limit: 50
  },
  csitso: {
    host: '127.0.0.1',
    database: 'csitsodb',
    user: 'root',
    password: ''
  }
};

config.spdyOptions = {
  key: fs.readFileSync(__dirname + '/../config/local_key.pem'),
  cert: fs.readFileSync(__dirname + '/../config/local_cert.pem'),
  spdy: {
    protocols: ['h2', 'spdy/3.1'],
    plain: false,
    ssl: true,
    'x-forwarded-for': true,
    connection: {
      windowSize: 1024 * 1024,
      autoSpdy31: false
    }
  }
};

// HANDYPIA oneM2M
config.handypia = {
  // baseurl: 'http://127.0.0.1:8081/~/csitso-in/base',
  baseurl : 'http://10.47.183.6:8081/~/csitso-in/base',
  origin: 'csitso-in'
};

config.batch = {
  location: 'Asia/Jakarta'
};

module.exports = config;