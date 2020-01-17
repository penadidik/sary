/*
 * @(#)business.js 1.0 2017/12/26
 * 
 * COPYRIGHT (C) 2017 HANDYSOFT, INC.
 * ALL RIGHTS RESERVED.
 */

/**
 * 공통 컨트롤을 처리하는 스크립트.
 * 
 * message.js (jprops) 필수로딩
 * 
 * 
 * jcommon
 * jutils
 * jlogic
 * jmessager
 *  
 *
 * @author 박소현
 * @version 1.0 2017/12/26
 */

var jcommon = {};
var jutils = {};

//for debugging
jcommon.printobject = function (obj) {
	alert(jcommon.toString(obj));
};

//페이지 이동
jcommon.go = function (url, target) {

	if (target) {
		window.open(url, target);
		return;
	}
	$(location).attr('href', url);
};

jcommon.toString = function (obj) {
	var arr = [];
	if ($.isArray(obj)) {
		$.each(obj, function (key, val) {
			arr.push($.isPlainObject(val) ? jcommon.toString(val) : val);
		});
		return "[" + arr.join(",") + "]";
	} else {
		$.each(obj, function (key, val) {
			var next = key + ": ";
			next += $.isPlainObject(val) ? jcommon.toString(val) : val;
			arr.push(next);
		});
		return "{" + arr.join(",") + "}";
	}
};

jcommon.toHtml = function (data, idPrefix) {

	idPrefix = idPrefix || '';

	for (var p in data) {
		var obj = $('#' + idPrefix + p);

		if (!obj)
			continue;

		obj.html(data[p]);
	}
};

jcommon.toForm = function (data, prefix) {

	for (var p in data) {

		var key = (prefix ? prefix : '') + p;
		var val = data[p];

		var obj = $('#' + key);

		if (!obj || !obj.length)
			continue;

		if (obj.is("span") || obj.is("div")) {
			obj.html(val);
		}
		else if (obj.is("input:checkbox") || obj.is("input:radio")) {
			if (obj.val() == val)
				obj.prop("checked", true);
		}
		else {
			obj.val(val);
		}
	}
};

jcommon.clear = function (idPrefix) {

	if (jutils.empty(idPrefix))
		return;

	$('span[id^=' + idPrefix + ']').each(function () {
		$(this).html("");
	});
};

jcommon.setText = function (arr, data) {

	$.each(arr, function (i, a) {
		var obj = $('#' + a);

		if (!obj ||
			obj.length == 0)
			return;

		if (data) {
			if (data[a] && data[a].length > 0)
				obj.html(data[a]);
		}
		else {
			obj.html("");
		}
	});
};

jcommon.setFloor = function (floor) {
	if (floor == 'null' || jutils.empty(floor)) {
		return false;
	}

	floor = parseInt(floor);
	var txtFloor;

	if (floor > 0) {
		txtFloor = floor + "F";
	} else {
		txtFloor = "B" + floor.replace("-", "");
	}

	return txtFloor;
}
//달력설정
jcommon.calendar = function () {
	var label = jprops.calendar;
	var calText = {
		dayNames: [] //'일','월','화','수','목','금','토'
		, dayNamesShort: [] //'일','월','화','수','목','금','토'
		, dayNamesMin: [] //'일','월','화','수','목','금','토'
		, monthNames: [] //'1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'
		, monthNamesShort: [] //'1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'
		, prevText: label.prev   // '이전 달'
		, nextText: label.next   // '다음 달'
		, yearSuffix: label.year   // '년'
		, timeText: label.time   // '시간'
		, hourText: label.hour   // '시'
		, minuteText: label.minute // '분'
		, secondText: label.second // '초'
		, currentText: label.today // '오늘'
		, closeText: label.close // '완료'
	};

	for (var i = 0; i <= 6; i++) {
		var text = label['week' + i];
		//calText.dayNames.push(text);
		//calText.dayNamesMin.push(text);
		calText.dayNamesShort.push(text);
	}
	for (var i = 1; i <= 12; i++) {
		var text = i + label.month;
		calText.monthNames.push(text);
		calText.monthNamesShort.push(text);
	}


	$.datepicker.setDefaults({
		dayNamesShort: calText.dayNamesShort,   //['일','월','화','수','목','금','토']
		monthNames: calText.monthNames,      //[['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		monthNamesShort: calText.monthNamesShort, //[['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		prevText: calText.prevText,        //['이전 달',
		nextText: calText.nextText,        //['다음 달',
		yearSuffix: calText.yearSuffix,      //['년',
		currentText: calText.currentText,
		closeText: calText.closeText,
		dateFormat: 'yy-mm-dd',
		maxDate: 0,
		buttonImage: './resources/img/common/calendar-btn.png',
		buttonImageOnly: true,
		showOn: 'both',
		showButtonPanel: true,
		showMonthAfterYear: true
	});


};

//입력 공통 MASK 설정
jcommon.inputMask = function () {

	// meiomask
	$('.app_number').setMask({ mask: "999999999999" });
	$('.app_date').setMask({ mask: "9999-19-39" });
	$('.app_time').setMask({ mask: "29:69:69" });

	$('.app_userid').mask('ZZZZZZZZZZZZZZZZZZZZZZ', {
		translation: {
			'Z': {
				pattern: /[A-Za-z0-9--_.@]/, reverse: true
			}
		}
	});

	$('.app_datetime').mask('00/00/0000 00:00:00');
	$('.app_cep').mask('00000-000');
	$('.app_phone').mask('0000-0000');
	$('.app_phone_with_ddd').mask('(00) 0000-0000');
	$('.app_phone_us').mask('(000) 000-0000');
	$('.app_mixed').mask('AAA 000-S0S');
	$('.app_cpf').mask('000.000.000-00', { reverse: true });
	$('.app_money').mask('000.000.000.000.000,00', { reverse: true });
	$('.app_money2').mask("#.##0,00", { reverse: true });
	$('.app_ip_address').mask('0ZZ.0ZZ.0ZZ.0ZZ', {
		translation: {
			'Z': {
				pattern: /[0-9]/, optional: true
			}
		}
	});
	$('.app_ip_address').mask('099.099.099.099');
	$('.app_percent').mask('##0,00%', { reverse: true });
	$('.app_clear-if-not-match').mask("00/00/0000", { clearIfNotMatch: true });
	$('.app_placeholder').mask("00/00/0000", { placeholder: "__/__/____" });
	$('.app_fallback').mask("00r00r0000", {
		translation: {
			'r': {
				pattern: /[\/]/,
				fallback: '/'
			},
			placeholder: "__/__/____"
		}
	});
}

//현재 URL의 경로정보를 반환한다.
jcommon.getURLPath = function (url) {

	if (url.indexOf("/") < 0)
		return "";

	return url.substring(0, url.lastIndexOf("/"));
};

//현재 URL의 상위경로정보를 반환한다.
jcommon.getURLParentPath = function (url) {
	var path = jcommon.getURLPath(url);
	return jcommon.getURLPath(path);
};

jcommon.getURLIndex = function (url) {
	if (url.indexOf("/") < 0)
		return "";

	var curl = url.substring(url.lastIndexOf("/"));

	if (curl.indexOf("?") > 0) {
		curl = curl.substring(0, curl.lastIndexOf("?"));
	}

	return curl.replace("/", "");
};



jcommon.getURLParams = function (name) {
	var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);

	if (!jutils.empty(results))
		return results[1] || 0;
	else
		return null;
}


//undefined 공백처리
jutils.nvl = function (val, def) {
	if (val == null ||
		val == undefined ||
		val == 'undefined' ||
		val == '' ||
		val == ' ') {
		if (def)
			return def;
		return '';
	}
	return val;
};
jutils.nvlObject = function (data) {
	for (var p in data) {
		data[p] = jutils.nvl(data[p]);
	}
	return data;
};
jutils.nvlNumber = function (val) {
	if (val == null ||
		val == undefined ||
		val == '' ||
		val == 'undefined') {
		return 0;
	}
	return parseInt(val);
};

//빈값체크
jutils.empty = function (val) {
	if (typeof val == "array") {
		if (val.length > 0)
			return false;
		return true;
	}
	if (!val)
		return true;
	if (val == null)
		return true;
	if (val == 'undefined')
		return true;
	if (val == '')
		return true;

	return false;
};

jutils.escapeJson = function (val) {
	val = JSON.stringify(val);
	val = val.replace(/\\r\\n/g, "");
	val = val.replace(/\\n/g, "");
	val = val.replace(/"{/, "{");
	val = val.replace(/}"/, "}");
	val = val.replace(/\\"/g, "\"");

	var obj = $.parseJSON(val);

	//jcommon.printobject(obj);

	return obj;
};

jutils.formatFileSize = function (bytes) {
	if (typeof bytes !== 'number') {
		return '';
	}
	if (bytes >= 1000000000) {
		return (bytes / 1000000000).toFixed(2) + ' GB';
	}
	if (bytes >= 1000000) {
		return (bytes / 1000000).toFixed(2) + ' MB';
	}
	return (bytes / 1000).toFixed(2) + ' KB';
};

jutils.byteString = function (str) {
	var len = 0;
	if (!str || !str.length)
		return 0;

	for (var i = 0; i < str.length; i++) {
		var c = escape(str.charAt(i));
		if (c.length == 1) len++;
		else if (c.indexOf("%u") != -1) len += 2;
		else if (c.indexOf("%") != -1) len += c.length / 3;
	}
	return len;
};

//객체를 값이 있는 항목의 querystring 문자열로 변환한다.
jutils.toQueryString = function (obj) {

	//escape(encodeURIComponent(s))

	if (!obj ||
		typeof obj != "object")
		return "";

	var s = "";
	for (var p in obj) {
		if (!isEmpty(obj[p])) {
			s += (s.length == 0 ? "?" : "&");
			s += p + "=" + obj[p];
		}
	}
	return s;
};


//내용의 바이트 체크
jutils.checkMaxBytes = function (s, maxkb) {
	var l = s.bytes();
	var m = maxkb * 1024;

	if (l > m) {
		// show error message
		jmessager.show({
			title: 'Error',
			msg: 'The content size (' + l + ' byte) exceeds the maximum size (' + m + ' byte).'
		});
		return false;
	}
	return true;
};
//숫자 3자리수마다 , 를 입력한다.
jutils.formatMoney = function (val) {
	var minus = false;

	if (val != 0 && !val) {
		return '';
	}

	if (typeof val == 'number')
		val = val + "";

	if (val.indexOf("-") != -1)
		minus = true;

	var sMoney = val.replace(/(,|-)/g, "");
	var tMoney = "";

	if (isNaN(sMoney)) {
		return "0";
	}

	var rMoney = "";
	var rCheck = false;
	if (sMoney.indexOf(".") != -1) {
		rMoney = sMoney.substring(sMoney.indexOf("."));
		sMoney = sMoney.substring(0, sMoney.indexOf("."));
		rCheck = true;
	}

	var len = sMoney.length;

	if (sMoney.length <= 3) return sMoney;

	for (var i = 0; i < len; i++) {
		if (i != 0 && (i % 3 == len % 3)) tMoney += ",";
		if (i < len) tMoney += sMoney.charAt(i);
	}
	if (minus) tMoney = "-" + tMoney;
	if (rCheck) tMoney = tMoney + rMoney;

	return tMoney;
};

jutils.formatNumber = function (val) {
	return jutils.formatMoney(val);
};

jutils.limitTxt = function (val) {
	var num = '17';

	if (val.length > num) {
		val = val.substr(0, num) + '...';

		return val;
	} else {
		return val;
	}

}

jutils.formatDate = function (val) {
	if (!val)
		return '';

	var date = [
		val.getFullYear(),
		('0' + (val.getMonth() + 1)).slice(-2),
		('0' + val.getDate()).slice(-2)
	].join('-');

	return date;
}

jutils.formatDateTime = function (val) {
	if (!val)
		return '';

	var date = [
		val.getFullYear(),
		('0' + (val.getMonth() + 1)).slice(-2),
		('0' + val.getDate()).slice(-2)
	].join('-');

	var time = [
		('0' + val.getHours()).slice(-2),
		('0' + val.getMinutes()).slice(-2),
		('0' + val.getSeconds()).slice(-2)
	].join(':');

	return date + ' ' + time;
}

// yyyy-MM 을 yyyy년mm월로 변경
jutils.formatMonth = function (val) {

	if (!val)
		return '';
	if (val.length != 7)
		return val;
	if (val.indexOf("-") != 4)
		return val;

	return val.substring(0, val.indexOf("-"))
		+ jprops.text.year
		+ val.substring(val.indexOf("-") + 1)
		+ jprops.text.month;
};

// 일 표시
jutils.formatDay = function (val) {

	if (!val)
		return '0' + jprops.text.day;
	if (val.length == 0)
		return '0' + jprops.text.day;

	return val + jprops.text.day;
};

// 소수점숫자(0.15)를 백분율(15%)로 표시
jutils.formatRate = function (val) {

	if (jutils.empty(val))
		return '0%';

	var v = parseFloat(val);
	v = v * 100;

	return v.toFixed(0) + '%';
};

//객체 배열의 중복여부를 체크한다.
jutils.duplicateObject = function (rows, field) {

	var arr = $.extend(true, [], rows);
	arr.sort(function (a, b) {
		var v1 = a[field];
		var v2 = b[field];
		return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
	});

	var dup = [];

	$.each(arr, function (i, r) {
		if (i == (arr.length - 1))
			return;
		if (r[field] == "")
			return;
		if (arr[i + 1][field] == r[field])
			dup.push(r[field]);
	});
	return (dup.length == 0 ? false : dup);
};


//모든 데이터를 문자열로 변환한다.
jutils.toStringObject = function (data) {
	$.each(data, function (key, value) {
		if (value)
			data[key] = value.toString();
	});
};

//특정EL로 이동처리
jutils.movePos = function (el) {
	$('html,body').animate({ scrollTop: $(el).offset().top }, 200);
};

// CamelCase 확인
jutils.isCamelCase = function (s) {

	for (var i = 0; i < s.length; i++) {
		var c = s.charAt(i);
		if (c == '_')
			return false;
		else if (c === c.toLowerCase())
			return true;
	}
	return false;
};
jutils.toCamelCase = function (str) {
	return str.replace(/\W+(.)/g, function (match, chr) {
		return chr.toUpperCase();
	});
};
jutils.deCamelCase = function (str) {
	return str.replace(/[A-Z]/g, function (chr) {
		return '_' + chr.toLowerCase();
	});
};

jutils.initCap = function (str) {
	var str = str.substring(0, 1).toUpperCase() + str.substring(1, str.length).toLowerCase();

	str = str.replace(/\_/g, ' ');

	return str;
};

jutils.formatEmail = function (email) {
	var exptext = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;

	return exptext.test(email);
};

//===========================================================================//
//메세지 ALERT, CONFIRM 처리
//===========================================================================//
var jmessager = {
	show: function (args) {

		var cfg = {
			modal: true,
			title: jprops.title.message,
			width: "auto",
			height: "auto",
			minHeight: "auto"
		};

		var msg = args;
		var fn = false;

		if ($.type(args) === 'object') {
			msg = args.msg;
			if (args.title)
				cfg.title = args.title;

			if (args.fn) {
				fn = args.fn;
			}

			if (args.appendTo) {
				cfg.appendTo = args.appendTo;
			}
		}

		cfg.buttons = {};
		cfg.buttons[jprops.btn.confirm] = {
			text: jprops.btn.confirm,
			class: 'pull-right btn btn-red2 ml10',
			click: function () {
				$(this).dialog("close");
				if (fn)
					fn();
			}
		};

		cfg.open = function () {
			$(this).closest(".ui-dialog")
				.find(".ui-dialog-titlebar")
				.find("button")
				.remove();

			$(this).closest(".ui-dialog")
				.find(".ui-dialog-titlebar")
				.append('<button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span> </button>');

			$(this).closest(".ui-dialog")
				.find(".ui-dialog-titlebar")
				.find("button")
				.click(function () {
					$('#app_message').dialog("close");
				});

			$(this).closest(".ui-dialog")
				.find(".ui-dialog-buttonset")
				.find("button")
				.removeClass("ui-button ui-corner-all ui-widget");
		}

		$("#app_message").html('<div class="app_text">' + msg + '</div>');
		$("#app_message").trigger("create");

		$("#app_message").dialog(cfg).show();

	},
	confirm: function (args, fn) {

		var cfg = {
			resizable: false,
			modal: true,
			title: jprops.title.confirm,
			width: "auto",
			height: "auto",
			minHeight: "auto"
		};

		var msg = args;
		var callback = fn;

		if ($.type(args) === 'object') {
			msg = args.msg;
			if (args.title)
				cfg.title = args.title;

			if (args.fn) {
				callback = args.fn;
			}
			if (args.appendTo) {
				cfg.appendTo = args.appendTo;
			}
		}

		cfg.buttons = {};
		cfg.buttons[jprops.btn.confirm] = function () {
			if (callback)
				callback(this);
			$(this).dialog("close");
		};
		cfg.buttons[jprops.btn.cancel] = function () {
			$(this).dialog("close");
		};

		$("#app_message").html('<div class="app_text">' + msg + '</div>');
		$("#app_message").trigger("create");
		$("#app_message").dialog(cfg).show();
	}
};


//===========================================================================//
//등록,수정,삭제 상태값
//===========================================================================//
var jstatus = {
	INSERT: 'I',    //등록 상태값
	UPDATE: 'U',    //수정 상태값
	DELETE: 'D',    //삭제 상태값
	SELECT: 'S',    //조회 상태값
	VIEW: 'V',    //상세조회 상태값
	REPLY: 'R',    //답변 상태값
	DONE: 'X',    //비활성 상태값
	FINISH: 'F',    //종료 상태값
	STATUS: 'oper', //상태 필드명
	//-----------------------------------------//
	//폼객체에 상태값 바인딩
	setForm: function (form, status) {

		var oper = form.find('[name="' + this.STATUS + '"]');

		if (jutils.empty(oper))
			return;

		if (jutils.empty(status)) {
			oper.val(this.INSERT);
			return;
		}
		oper.val(status);
	},
	//-----------------------------------------//
	//일반객체에 상태값 바인딩
	setObject: function (data, status) {
		if (jutils.empty(data))
			return;

		if (jutils.empty(status)) {
			data[this.STATUS] = this.INSERT;
			return;
		}
		data[this.STATUS] = status;
	},
	//-----------------------------------------//
	//입력받은 상태값 바인딩
	set: function (data, status) {
		if (data instanceof jQuery)
			this.setForm(data, status);
		else
			this.setObject(data, status);
	},
	//-----------------------------------------//
	//등록상태값 바인딩
	insert: function (data) {
		if (data instanceof jQuery)
			this.setForm(data);
		else
			this.setObject(data);
	},
	//-----------------------------------------//
	//수정상태값 바인딩
	update: function (data) {
		if (data instanceof jQuery)
			this.setForm(data, this.UPDATE);
		else
			this.setObject(data, this.UPDATE);
	},
	//-----------------------------------------//
	//삭제상태값 바인딩
	remove: function (data) {
		if (data instanceof jQuery)
			this.setForm(data, this.DELETE);
		else
			this.setObject(data, this.DELETE);
	},
	//-----------------------------------------//
	//조회상태값 바인딩
	read: function (data) {
		if (data instanceof jQuery)
			this.setForm(data, this.READ);
		else
			this.setObject(data, this.READ);
	},
	//-----------------------------------------//
	//비활성상태값 바인딩
	done: function (data) {
		if (data instanceof jQuery)
			this.setForm(data, this.DONE);
		else
			this.setObject(data, this.DONE);
	},
	//-----------------------------------------//
	//상태 확인
	equals: function (data, status) {
		var s = '';

		if (data instanceof jQuery)
			s = data.find('[name="' + this.STATUS + '"]').val();
		else
			s = data[this.STATUS];

		return (s == status);
	},
	//-----------------------------------------//
	//등록상태인지 확인
	isInsert: function (data) {
		return this.equals(data, this.INSERT);
	},
	//-----------------------------------------//
	//수정상태인지 확인
	isUpdate: function (data) {
		return this.equals(data, this.UPDATE);
	},
	//-----------------------------------------//
	//삭제상태인지 확인
	isRemove: function (data) {
		return this.equals(data, this.DELETE);
	}
};


//===========================================================================//
//공통 로직함수
//===========================================================================//

//배열 이동
Array.prototype.move = function (index, offset) {

	var newIndex = index + offset;

	if (newIndex > -1 && newIndex < this.length) {
		// Remove the element from the array
		var removedElement = this.splice(index, 1)[0];
		// At "newIndex", remove 0 elements, insert the removed element
		this.splice(newIndex, 0, removedElement);
	}

};

Array.prototype.division = function (n) {
	var arr = this;
	var len = arr.length;
	var cnt = Math.floor(len / n);
	var tmp = [];

	for (var i = 0; i <= cnt; i++) {
		tmp.push(arr.splice(0, n));
	}
	return tmp;
}

$.fn.serializeObject = function () {

	var o = {};
	var a = this.serializeArray();

	$.each(a, function () {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});

	return o;
};

$.fn.toForm = function (data) {
	var f = $(this);

	for (var p in data) {
		var obj = f.find('[name="' + p + '"]');

		if (!obj)
			continue;

		obj.each(function (i) {
			if (this.type == 'checkbox' ||
				this.type == 'radio') {
				if (this.value == data[p])
					this.checked = true;
			}
			else {
				$(this).val(data[p]);
				if (this.type == 'select-one') {
					var index = $(this).find('option').index($(this).find('option:selected'));
					$(this).prop('selectedIndex', index).selectric('refresh');
				}
				//var events = $._data(this, "events");
				//if (events != null) {
				//	alert($(this).attr('id')+"="+events);
				//	jcommon.printobject(events);
				//}
			}
		});
	}
};

$.fn.getFormValue = function (name, idx) {

	var f = $(this);
	var o = f.find('[name="' + name + '"]');

	if (o.length > 1 && (idx || idx == 0)) {
		o = o.eq(idx);
	}
	if (o)
		return o.val();
	return null;
};

$.fn.setFormValue = function (name, value) {
	var f = $(this);
	var o = f.find('[name="' + name + '"]');
	if (o)
		o.val(value);
};

$.fn.validateMobile = function () {

	var v = $(this).val();
	if (v == "")
		return false;

	if (v.length <= 9)
		return false;

	if (v.match(/^0(1[017689]{1})\-[0-9]{3,4}\-[0-9]{4}$/))
		return true;

	return false;
};

$.fn.getFormYN = function (name) {

	var f = $(this);
	var o = f.find('input[name="' + name + '"]:checked');

	if (!o)
		return 'N';

	if (o.val() == 'Y')
		return 'Y';

	return 'N';
};

$.fn.getRadioValue = function (name) {

	var f = $(this);
	var o = f.find('[name="' + name + '"]:checked');

	if (o)
		return o.val();
	return null;
};

$.fn.getCheckValue = function (name) {

	var f = $(this);
	var o = f.find('[name="' + name + '"]:checked');

	if (!o || o.length == 0)
		return null;

	if (o.length == 1)
		return o.val();

	var a = [];
	o.each(function (i) {
		a.push($(this).val());
	});
	return a.join(",");
};

$.fn.setFindValue = function (id, data) {
	$(this).find('.' + id).each(function () {
		var name = $(this).prop('name');
		$(this).val(data[name]);
	});
};

$.fn.toFormObject = function () {

	var data = {};

	$(this).each(function (i) {
		var name = $(this).prop('name');
		var type = $(this).prop('type');
		var field = $(this).data('field');

		if (!jutils.empty(field))
			name = field;

		if (type == 'checkbox' ||
			type == 'radio') {

			if (!(name in data))
				data[name] = '';

			if ($(this).is(":checked")) {
				var val = $(this).val().toString();
				if (data[name] != '')
					data[name] += "," + val;
				else
					data[name] = val;
			}
			return true;
		}
		data[name] = $(this).val().toString();
	});
	//데이터를 모두 문자형으로 변환한다.
	jutils.toStringObject(data);

	return data;
};




// dialog 제목에 HTML 로 표시하기
$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
	_title: function (title) {
		if (!this.options.title) {
			title.html("&#160;");
		} else {
			title.html(this.options.title);
		}
	}
}));
