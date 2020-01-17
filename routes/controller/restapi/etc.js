var express = require('express');
var router = express.Router();
var async = require('async');

/**
 * get the last version of the metadata
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/rooms/metadata-version
 * @PARAM 
 */
router.get('/metadata-version', function (req, res, next) {	
	res.json({
		code: 200,
		data: global.metadata.last_version
	});
});


/**
 * get the floor list
 * 
 * @METHOD get
 * @URL /restapi/v1/tso/floors
 * @PARAM 
 */

router.get('/floors', function (req, res, next) {	
	res.json({
		code: 200,
		data: global.metadata.floor_index
	});
});

module.exports = router;