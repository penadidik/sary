var async = require('async');
var fs = require('fs');
var Puid = require('puid');
var puid = new Puid(true);
var dateFormat = require('dateformat');
var util = require('util');
var https = require('https');

/*******************************************************************************
 * Pagination
 ******************************************************************************/
exports.pagination = function (PAGE_ITEM_SIZE, PAGE_WINDOW_SIZE, total, page_no) {
	var startMod = page_no % PAGE_WINDOW_SIZE;
	var start = page_no - startMod;

	var maxMod = total % PAGE_ITEM_SIZE;
	var max = (total - maxMod) / PAGE_ITEM_SIZE;

	if (maxMod > 0)
		max++;

	var endMod = start + PAGE_WINDOW_SIZE;
	var end = Math.min(endMod, max);

	var pages = {
		start: start,
		end: end,
		max: max,
		pageItemSize: PAGE_ITEM_SIZE,
		pageWindowSize: PAGE_WINDOW_SIZE,
		total: total,
		items: [],
	}
	for (var i = start; i < end; i++) {
		pages.items.push(i);
	}

	return pages;
};

exports.getPaginationWithoutWindowSize = function (page_no, page_size, total, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE) {
	if (!page_no || page_no < 1) {
		page_no = 1;
	}

	if (page_size) {
		if (page_size > MAX_PAGE_SIZE) {
			page_size = MAX_PAGE_SIZE;
		}
	} else {
		page_size = DEFAULT_PAGE_SIZE;
	}

	return {
		total: total,
		page_no: page_no,
		page_size: page_size
	};
}

exports.getRequestQuery = function (req, res) {
	var query = req.query;

	if (Object.keys(req.body).length > 0) {
		for (var key in req.body) {
			query[key] = req.body[key];
		}
	}

	if (Object.keys(req.params).length > 0) {
		for (var key in req.params) {
			query[key] = req.params[key];
		}
	}

	if (!query.language)
		query.language = 'en';

	// TODO : If add to language in japan or espanol, remove this conditions
	if (query.language == 'ja' || query.language == 'es')
		query.language = 'en';

	if (!query.page_no)
		query.page_no = 0;
	else
		query.page_no = parseInt(query.page_no);

	if (!query.page_size)
		query.page_size = 0;
	else
		query.page_size = parseInt(query.page_size);

	if (config.debug)
		console.log('==>> STEP 0 ----', query);

	return query;
};

exports.tagParser = function (descriptions) {
	var tagArray = new Array();

	if (!util.isNullOrUndefined(descriptions)) {
		var orgStrArray = descriptions.replace(/\n/gim, ' ');
		orgStrArray = orgStrArray.split(" ");

		for (var i in orgStrArray) {
			if (orgStrArray[i].indexOf('#') === 0)
				tagArray.push(orgStrArray[i].substring(1));
		}
	}

	return tagArray;
};

exports.stringToArray = function (str) {
	var array = new Array();
	var dummy = str.split(",");

	for (var i in dummy) {
		array.push(dummy[i].trim());
	}

	return array;
};

exports.generateId = function () {
	return puid.generate();
};

exports.currentTime = function () {
	var now = new Date();
	var jsonDate = now.toJSON();
	return new Date(jsonDate);
};

exports.getTimedFolderPath = function (prefix) {
	var now = new Date();

	if (prefix)
		return prefix + '/' + dateFormat(now, 'yyyy/mm/dd/hh/MM');
	else
		return dateFormat(now, 'yyyy/mm/dd/hh/MM');
};

exports.deleteDummyContentFile = function (path) {
	fs.unlink(path, function (err) {
		if (err) {
			console.error('==>> ERROR', err);
			return;
		}
	});
};

exports.getImageRate = function (item) {
	var widthDiv = item.width / 920;

	if (widthDiv < 0)
		item.rate = (920 / item.width).toFixed(2);

	if (widthDiv > 0)
		item.rate = (item.width / 920).toFixed(2);
};

exports.hideText = function (text, len) {
	if (!len)
		len = 2;

	var result = '';
	for (var i = 0; i < len; i++) {
		result += '*';
	}

	return result + text.substring(len, text.length);
};

exports.compareDayOfWeek = function (str) {
	var current = new Date().getDay();
	var result = str.substring(current, current + 1);
	return result === '1';
};

exports.isEmpty = function (val) {
	return typeof val == 'string' && !val.trim() || typeof val === 'undefined' || val === null || val === 'undefined';
};

exports.isValidDate = function (val) {
	var regEx = /^\d{4}-\d{2}-\d{2}$/;
	return val.match(regEx) != null;
};

exports.nvlNumber = function (val) {
	if (val == null ||
		val == undefined ||
		val == '' ||
		val == 'undefined') {
		return 0;
	}
	return val;
};

exports.formatDate = function (val) {
	if (!val)
		return '';
	if (val.length != 8)
		return val;

	return val.substring(0, 4) + '-' + val.substring(4, 6) + '-' + val.substring(6, 8) + " 00:00:00";
};

exports.convertToJSON = function (input) {
	try {
		return JSON.parse(input);
	} catch (error) {
		return input;
	}
};

exports.getFileType = function (file) {
	return "." + file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2);
};

exports.setStartTime = function (time) {
	time = time + " 00:00:00";
	return time;
}

exports.setEndTime = function (time) {
	time = time + " 23:59:59";
	return time;
};

exports.capitalizeFirstLetter = function (string) {
	return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
};

exports.hashFn = function (s) {
  /* Simple hash function. */
  var a = 1,
    c = 0,
    h, o;
  if (s) {
    a = 0;
    for (h = s.length - 1; h >= 0; h--) {
      o = s.charCodeAt(h);
      a = (a << 6 & 268435455) + o + (o << 14);
      c = a & 266338304;
      a = c !== 0 ? a ^ c >> 21 : a;
    }
  }
  return String(a);
};