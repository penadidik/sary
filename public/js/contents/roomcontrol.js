/** Dashboard Js */
var dashboard = {
    message: false,
    form: false,
    params: {
        div_cnt: 0,
        index: 0,
        key: '',
    },
    //url
    url: {
        api: '/restapi/v1/tso/rooms/',
    },
    //이벤트를 바인딩한다.
    doInit: function () {
        var p = this;

        p.form = $('#dashboard-form');
    },
    doSelectFloor: function () {
        var p = this;

        if (p.form.attr('id') != 'dashboard-form') {
            return false;
        }

        var floor = $('.floor-list li').first();

        $('#dashboard-floor-toggle p').text(floor.text());
        Controller.createRoomList(floor.find('a').attr('value'));
    },
    getRoomDetail: function (room) {

        var cardArea = $('#dashboard-card-area');

        cardArea.html('');

        cardArea.html('');
        $.each(room, function (i, e) {

            cardArea.appCardWidget({
                title: e.room_name.replace(' ', ''),
                id: e.room_id,
                url: dashboard.url.api,
                params: {
                    blind_info: e.blind_info
                }
            });

        });
    },
    setBlindInfo: function (key, id, params) {
        Controller.doInitModalCtrl();
        dashboard.setBlindCtrl(id);

        dashboard.params.index = 0;
        dashboard.params.key = key;

        $('#modal .modal-dialog').addClass('modal-lg');
        $('#modal-title').text('Blind Channels');

        $('#modal .modal-body').css('padding', '0');

        var box = $('<div class="bs_box"></div>');
        var box_title = '<div class="box-title2"><div class="btn_area borb2"><div class="fl_l txt1">' + key + '</div>' +
            '       <div class="fl_r">' +
            '            <input type="checkbox" id="all-blind-check" value="" class="mr-1 mt-3">' +
            '            <span  class="txt2 mt32">Select All</span>' +
            '        </div>' +
            '    </div>' +
            '</div>';

        var blind_box = $('<div class="blind_box"></div>');
        var div_cnt = 0;
        dashboard.params.div_cnt = 0;

        if (params.length > 5) {
            div_cnt = Math.floor(params.length / 5);
            dashboard.params.div_cnt = div_cnt;
        }

        blind_box.appCardWidget({
            id: id,
            params: {
                blind_info: params,
                count: div_cnt,
            },
            mode: 'blind'
        });

        var blind_box_btn = '<div class="blind_btn_div">' +
            '   <button class="btn btn-dark show-blind point-cursor" type="button" value="prev" id="show-blind-prev"><i class="fa fa-arrow-left"></i> </button>' +
            '   <button class="btn btn-dark pull-right show-blind point-cursor" type="button" value="next" id="show-blind-next"><i class="fa fa-arrow-right"></i></button>' +
            '</div><div style="clear: both;"></div>';
        $(blind_box).append(blind_box_btn);

        $(box).append(box_title);
        $('#modal .modal-body').append(box);
        $('#modal .modal-body').append(blind_box);

        if (div_cnt > 0) {
            for (var k = 0; k <= div_cnt; k++) {
                if (k > 0) {
                    var id = '#blind_div_' + k;
                    $(id).hide();
                }
            }

            $('#show-blind-prev').hide();
        } else {
            $('.blind_btn_div').hide();
        }

        $('.show-blind').on("click", function () {
            var flag = this.value;
            var index = dashboard.params.index;
            dashboard.showBlind(index, flag);
        });

        $('.blind_box img').click(dashboard.clickBlind);

        $('#all-blind-check').on('change', function () {
            dashboard.clickBlindAll(this.checked);
        });

    },
    showBlind: function (index, flag) {
        var div_cnt = dashboard.params.div_cnt;

        if (flag == "next") {
            var nextIndex = index + 1;

            if (nextIndex < div_cnt) {
                dashboard.params.index++;
            }

            var id = '#blind_div_' + index;
            var nextId = '#blind_div_' + nextIndex;

            if (nextIndex < div_cnt) {
                $(id).hide();
                $(nextId).show();

                $('#show-blind-prev').show();
            } else if (nextIndex == div_cnt) {
                $(id).hide();
                $(nextId).show();

                $('#show-blind-next').hide();
                $('#show-blind-prev').show();
            }

        } else if (flag == "prev") {
            var prevIndex = index - 1;
            var nextIndex = index + 1;

            var id = '#blind_div_' + index;
            var prevId = '#blind_div_' + prevIndex;
            var nextId = '#blind_div_' + nextIndex;

            $(id).show();
            $(prevId).hide();
            $(nextId).hide();

            if (prevIndex < 0) {
                $('#show-blind-prev').hide();
                $('#show-blind-next').show();
            } else {
                $('#show-blind-prev').show();
                $('#show-blind-next').show();
            }

            dashboard.params.index--;

        }

        if (dashboard.params.index < 0) {
            dashboard.params.index = 0;
        }
    },
    clickBlind: function () {
        if ($(this).attr('class') == 'check_blind') {
            dashboard.unCheckBlind(this);
            dashboard.checkBlindAll();
        } else {
            dashboard.checkBlind(this);
            dashboard.checkBlindAll();
        }
    },
    clickBlindAll: function (checked) {
        var img = $('.blind_box img');
        if (checked) {
            $.each(img, function () {
                dashboard.checkBlind(this);
            });
        } else {
            $.each(img, function () {
                dashboard.unCheckBlind(this);
            });
        }
    },
    checkBlind: function (p) {
        $(p).attr('src', '/images/blind/sm_btn_blind_selec_on.png');
        $(p).addClass('check_blind');
    },
    unCheckBlind: function (p) {
        var blind_cnt = $(p).attr('value');

        if (blind_cnt > 8) {
            blind_cnt = 8;
        }

        $(p).removeClass('check_blind');
        $(p).attr('src', '/images/blind/sm_btn_blind_' + blind_cnt + '.png');
    },
    checkBlindAll: function () {
        var img = $('.blind_box img');
        var all = true;

        $.each(img, function () {
            if ($(this).attr('class') != "check_blind") {
                all = false;
            }
        });

        // console.log(all);

        if (!all) {
            $("#all-blind-check").prop("checked", false);
        } else {
            $("#all-blind-check").prop("checked", true);
        }
    },
    setBlindCtrl: function (id) {
        $('#modal .modal-footer').empty();
        $('#modal .modal-footer').css({
            'padding': '20px',
            'background-color': ' #383838',
            'text-align': 'center'
        });

        var div = $('<div class="blind-ctrl-btn"></div>');
        var btn = '<button class="pull-center btn btn-outline-white btn-lg mr-2 mt-1 mb-1 blind-ctrl point-cursor" value="up" type="button"><img src="/images/common/sm_icon_up.png" alt="pause"></button>' +
            '<button class="pull-center btn btn-outline-white btn-lg mr-2 mt-1 mb-1 blind-ctrl point-cursor" value="stop"type="button"><img src="/images/common/sm_icon_pause.png" alt="pause"></button>' +
            '<button class="pull-center btn btn-outline-white btn-lg mr-2 mt-1 mb-1 blind-ctrl point-cursor" value="down" type="button"><img src="/images/common/sm_icon_down.png" alt="pause"></button>';

        $(div).append(btn);
        $('#modal .modal-footer').append(div);

        $('.blind-ctrl').on("click", function () {
            var key = dashboard.params.key;
            var action = this.value;
            dashboard.doControlBlind(id, action);
        });
    },
    doControlBlind: function (id, action) {
        var url = dashboard.url.api + id + "/control-blind";
        var data = [];

        // var obj = [];
        // console.log(url);
        var check_blind = $('.blind_box img.check_blind');

        if (check_blind.length < 1) {
            return false;
        }


        $.each(check_blind, function () {

            var arr = {};
            arr.ch_no = parseInt(this.id);
            arr.direction = action;

            data.push(arr);
        });

        // console.log(data);

        data = JSON.stringify({
            data: data
        });

        // console.log(data);
        // console.log(url);
        $.toast({
            text: 'Send blind control message.',
            showHideTransition: 'slide',
            loader: false,
            position: 'bottom-right',
            //hideAfter: 2000,
            icon: 'info'
        });
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            contentType: 'application/json',
            success: function (xml) {
                var code = xml.code;
                if (code == 200) {
                    $.toast({
                        heading: action.toUpperCase(),
                        text: 'All blinds have worked successfully.',
                        showHideTransition: 'slide',
                        position: 'bottom-right',
                        loader: false,
                        icon: 'success'
                    });
                } else if (code == 400) {
                    $.toast({
                        heading: 'Warning',
                        text: xml.error,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'warning'
                    });
                } else if (code != 403 && code != 401) {
                    $.toast({
                        heading: 'Bind control failed',
                        text: 'Error Code: ' + code,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'error'
                    });
                } else {
                    $('.modal').click();
                }
            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    },
    getTemperatureValue: function (title, id, curr) {
        Controller.doInitModalCtrl();
        $('#modal-title').text('Temperature Setting');

        $('#modal .modal-body').css('padding', '0');

        var box = $('<div class="bs_box"></div>');
        var box_title = '<div class="box-title2"><div class="btn_area borb2"><div class="fl_l txt1">' + title + '</div></div>';
        var temperature_box = $('<div class="temperature_box"></div>');

        dashboard.setCtrlOk();
        $(box).append(box_title);

        var temperature_btn = '<div class="up-temp-div">' +
            '<button class="btn btn-dark up-temp point-cursor" type="button" value="up" id="up-temp-btn"><i class="fa fa-sort-up"></i> </button>' +
            '</div>' +
            '<div class="temp-text"><p class="temp-value" id="temp-value">' + curr + '</p><p>℃</p><input type="hidden" name="target_temperature" value="' + curr + '"/></div>' +
            '<div class="down-temp-div">' +
            '<button class="btn btn-dark down-temp point-cursor" type="button" value="down" id="down-temp-btn"><i class="fa fa-sort-down"></i> </button>' +
            '</div>';

        temperature_box.append(temperature_btn);
        $('#modal .modal-body').append(box);
        $('#modal .modal-body').append(temperature_box);

        var footer_btn = '<div style="float:right;padding-top:5px;">' +
            '<button class="btn btn-secondary point-cursor" data-dismiss="modal" aria-label="Close">Cancle</button>' +
            '<button class="pull-right btn btn-red ml10" id="update-temp-value" data-dismiss="modal" aria-label="Close" >Update</button>' +
            '</div>';

        $('#modal .modal-footer').append(footer_btn);

        $('.up-temp').bind('click', dashboard.ctrlTempValue);
        $('.down-temp').bind('click', dashboard.ctrlTempValue);

        $('#update-temp-value').on("click", function () {
            var value = $('input[name$="target_temperature"]').val();
            var action = $(this).val();

            dashboard.setTemperatureValue(id, value);
        });

    },
    ctrlTempValue: function () {
        if (this.id != 'up-temp-btn' && this.id != 'down-temp-btn')
            return false;

        var curr_temp = $('input[name$="target_temperature"]').val();
        var action = this.value;

        if (action == "up") {
            var new_temp = parseInt(curr_temp) + 1;
            $('input[name$="target_temperature"]').val(new_temp);
            $('p.temp-value').text($('input[name$="target_temperature"]').val());
        } else {
            var new_temp = parseInt(curr_temp) - 1;
            $('input[name$="target_temperature"]').val(new_temp);
            $('p.temp-value').text($('input[name$="target_temperature"]').val());
        }
    },
    setTemperatureValue: function (id, value) {
        if (jutils.empty(value))
            return false;

        var url = dashboard.url.api + id + "/control-temperature";

        var data = {
            "target_temperature": value
        };

        data = JSON.stringify({
            data: data
        });

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            contentType: 'application/json',
            success: function (xml) {
                var code = xml.code;

                if (code == 200) {
                    $.toast({
                        text: 'Temperature control was successfully completed.',
                        showHideTransition: 'slide',
                        position: 'bottom-right',
                        loader: false,
                        icon: 'success'
                    });

                } else if (code == 400) {
                    $.toast({
                        heading: 'Warning',
                        text: xml.error,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'warning'
                    });
                } else if (code != 403 && code != 401) {
                    $.toast({
                        heading: 'Temperature control failed',
                        text: 'Error Code: ' + code,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'error'
                    });
                } else {
                    $('.modal').click();
                }
            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    },
    getLightValue: function (title, id, btn, light_status) {
        Controller.doInitModalCtrl();
        $('#modal-title').text('Light Setting');

        $('#modal .modal-body').css('padding', '0');

        var box = $('<div class="bs_box"></div>');
        var box_title = '<div class="box-title2"><div class="btn_area borb2"><div class="fl_l txt1">' + title + '</div></div>';
        var light_box = $('<div class="light_box"></div>');

        dashboard.setCtrlOk();

        var light_btn = '<button class="light-on" value="on"></button>' +
            '<button class="light-off" value="off"></button>' +
            '<button class="light-presentation" value="presentation"></button>';

        light_box.append(light_btn);

        box.append(box_title);
        $('#modal .modal-body').append(box);
        $('#modal .modal-body').append(light_box);

        switch (light_status) {
            case 'on':
                $('.light_box').find('button.light-on').addClass('active');
                break;
            case 'presentation':
                $('.light_box').find('button.light-presentation').addClass('active');
                break;
            default:
                $('.light_box').find('button.light-off').addClass('active');
                break;
        }

        $('.light-on').on("click", function () {
            var value = $(this).val();
            $('.light_box').find('button.active').removeClass('active');
            dashboard.setLightValue(id, value, btn);
        });
        $('.light-off').on("click", function () {
            var value = $(this).val();
            $('.light_box').find('button.active').removeClass('active');
            dashboard.setLightValue(id, value, btn);
        });
        $('.light-presentation').on("click", function () {
            var value = $(this).val();
            $('.light_box').find('button.active').removeClass('active');
            dashboard.setLightValue(id, value, btn);
        });
    },
    setLightValue: function (id, value, btn) {
        if (jutils.empty(value))
            return false;

        var url = dashboard.url.api + id + "/control-lamp";
        var data = {
            "lamp_mode": value
        };

        data = JSON.stringify({
            data: data
        });

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            contentType: 'application/json',
            success: function (xml) {
                var code = xml.code;

                if (code == 200) {
                    $.toast({
                        text: 'Light control was successfully completed.                         ',
                        showHideTransition: 'slide',
                        position: 'bottom-right',
                        loader: false,
                        icon: 'success'
                    });

                    var btn_id = '#' + btn;
                    switch (value.toLowerCase()) {
                        case 'on':
                            $(btn_id).css('background', 'url(../images/common/sm_btn_light_on.png)');
                            break;
                        case 'presentation':
                            $(btn_id).css('background', 'url(../images/common/sm_btn_pre_on.png)');
                            break;
                        default:
                            $(btn_id).css('background', 'url(../images/common/sm_btn_light_off.png)');
                            break;
                    }
                } else if (code == 400) {
                    $.toast({
                        heading: 'Warning',
                        text: xml.error,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'warning'
                    });
                } else if (code != 403 && code != 401) {
                    $.toast({
                        heading: 'Light control failed',
                        text: 'Error Code: ' + code,
                        showHideTransition: 'slide',
                        hideAfter: 10 * 1000,
                        position: 'bottom-right',
                        loader: false,
                        icon: 'error'
                    });
                } else {
                    $('.modal').click();
                }
            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    },
    setCtrlOk: function () {
        $('#modal .modal-footer').empty();

        $('#modal .modal-footer').css({
            'background-color': ' #383838',
            'text-align': 'center',
            'display': 'block',
            'border-top': 'none',
            'padding': '5px',
            'min-height': '50px'
        });

        // var btn = '<button class="pull-center btn btn-outline-white btn-lg mr-2 mt-1 mb-1 ctrl-btn point-cursor" type="button" data-dismiss="modal" aria-label="Close">OK</button>';

        // $('#modal .modal-footer').append(btn);

        // $('.ctrl-btn').on("click", function () {
        //     var key = dashboard.params.key;
        //     var action = this.value;
        //     dashboard.doControlBlind(key, action);
        // });
    }
}


$(function () {
    dashboard.doInit();
});