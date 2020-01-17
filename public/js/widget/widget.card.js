(function ($) {

    $.fn.appCardWidget = function (args) {

        var options = $.extend(true, {

            url: '',
            title: '',
            id: false,
            count: 0,
            initial: false,
            initialData: false,
            params: {},
            obj: {},
            emptyText: '',
            mode: 'dashboard'

        }, args);

        //현재객체
        var thisWgt = this;
        var thisElm = $(this);
        var thisMode = thisElm.data("mode");

        if (thisMode)
            options.mode = thisMode;


        this.appendBlindBox = function (blind_box_div, arr, cnt) {
            var img = '';

            $.each(arr, function (k, e) {
                if (e.blind_cnt > 8) {
                    img += '<img class="" src="/images/blind/sm_btn_blind_8.png" id="' + e.ch_no + '" value="' + e.blind_cnt + '" alt="blind" style="cursor:pointer;"/>';
                } else {
                    img += '<img class="" src="/images/blind/sm_btn_blind_' + e.blind_cnt + '.png"  id="' + e.ch_no + '"  value="' + e.blind_cnt + '" alt="blind" style="cursor:pointer;"/>';
                }
            });

            var div = $('<div style="padding:0 0 0 1em;"></div>');

            $(div).append(img);
            $(blind_box_div).append(div);

            thisElm.append(blind_box_div);
        }

        this.setSensingValue = function (env_col, updateUiFn) {
            var id = options.id;
            var data;

            $.ajax({
                url: options.url + id + "/sensing-data",
                dataType: 'json',
                type: 'GET',
                success: function (result) {
console.log(result)
                    if (result.code != 200){
                        options.params.curr_temp = 25;
                        env_col.find('.temperature').text('N/A');
                        env_col.find('.humidity').text('N/A');
                        env_col.find('.co2').text('N/A');
                        env_col.find('.pm25').text('N/A');
                    }else{
                        data = result.data;
                        $.each(data, function (i, e) {
                            if (jutils.empty(e)) {
                                e = 0;
                            }
                        });
                        options.params.curr_temp = data.temp;
                        env_col.find('.temperature').text(data.temp);
                        env_col.find('.humidity').text(data.rh);
                        env_col.find('.co2').text(data.co2);
                        env_col.find('.pm25').text(data.pm25);

                        var co2_msg = data.co2_state_msg.toLowerCase();
                        var pm25_msg = data.pm25_state_msg.toLowerCase();

                        switch (co2_msg) {
                            case "moderate":
                                env_col.find('.co2').parent().find('.moderate').show();
                                break;
                            case "unhealty":
                                env_col.find('.co2').parent().find('.unhealty').show();
                                break;
                            default:
                                env_col.find('.co2').parent().find('.good').show();
                                break;
                        }

                        switch (pm25_msg) {
                            case "moderate":
                                env_col.find('.pm25').parent().find('.moderate').show();
                                break;
                            case "unhealty":
                                env_col.find('.pm25').parent().find('.unhealty').show();
                                break;
                            default:
                                env_col.find('.pm25').parent().find('.good').show();
                                break;
                        }
                    }
                    updateUiFn(env_col);
                },
                error: function (e) {
                    //console.log(e);
                }
            });
        };


        this.setLightValue = function (btn_col) {
            var id = options.id;
            var lamp_mode;

            $.ajax({
                url: options.url + id + "/lamp-status",
                dataType: 'json',
                type: 'GET',
                async: false,
                success: function (result) {

                    if (!result)
                        return;

                    lamp_mode = result.data.lamp_mode;
                },
                error: function (e) {
                    //console.log(e);
                }
            });

            // console.log(id, lamp_mode);
            options.obj.light_status = lamp_mode;

            switch (lamp_mode.toLowerCase()) {
                case 'on':
                    $(btn_col).find('.light').removeClass('light-off').removeClass('light-presentation').addClass('light-on');
                    break;
                case 'presentation':
                    $(btn_col).find('.light').removeClass('light-on').removeClass('light-off').addClass('light-presentation');
                    break;
                default:
                    $(btn_col).find('.light').removeClass('light-on').removeClass('light-presentation').addClass('light-off');
                    break;
            }

            return btn_col;
        }

        this.getTargetTemperature = function () {
            var id = options.id;
            var target_temperature;

            $.ajax({
                url: options.url + id + "/temperature-status",
                dataType: 'json',
                type: 'GET',
                async: false,
                success: function (result) {

                    if (!result)
                        return;

                    target_temperature = result.data.target_temperature;
                },
                error: function (e) {
                    //console.log(e);
                }
            });

            return target_temperature;
        }

        this.createRow = function () {
            var full = $('<div class="card-box-media mb-3"></div>');

            if (options.mode == 'dashboard') {
                var card = $('<div class="card text-white bg-dark o-hidden h-100"></div>');
                var card_box = $('<div class="box box-info"></div>');

                var content = $('<div class="content"></div>');

                var env_title = $('<div class="box-title"></div>');
                var row = $('<div class="row"></div>');
                var env_col = $('<div class="box-col"></div>');
                var btn_col = $('<div class="box-col"></div>');

                var env_div = '<div class="env-div">'
                    + '<div class="env-cel">'
                    + '<img src="../images/common/sm_icon_tem.png"/>'
                    + '<p class="env-txt temperature"></p>'
                    + '</div>'
                    + '<div class="env-cel">'
                    + '<img src="../images/common/sm_icon_hum.png"/>'
                    + '<p class="env-txt humidity"></p>'
                    + '</div>'
                    + '</div>'
                    + '<div class="env-div">'
                    + '<div class="env-cel">'
                    + '<div class="environment-status good" style="display:none;"><img src="/images/common/cs_icon_good.png"/> Good </div>'
                    + '<div class="environment-status unhealty" style="display:none;"><img src="/images/common/cs_icon_unhealthy.png"/> Unhealty</div>'
                    + '<div class="environment-status moderate" style="display:none;"><img src="/images/common/cs_icon_moderate.png"/> Moderate </div>'
                    + '<img src="../images/common/sm_icon_co2.png"/>'
                    + '<p class="env-txt co2"></p>'
                    + '</div>'
                    + '<div class="env-cel">'
                    + '<div class="environment-status good" style="display:none;"><img src="/images/common/cs_icon_good.png"/> Good </div>'
                    + '<div class="environment-status unhealty" style="display:none;"><img src="/images/common/cs_icon_unhealthy.png"/> Unhealty</div>'
                    + '<div class="environment-status moderate" style="display:none;"><img src="/images/common/cs_icon_moderate.png"/> Moderate </div>'
                    + '<img src="../images/common/sm_icon_o2.png"/>'
                    + '<p class="env-txt pm25"></p>'
                    + '</div>'
                    + '</div>';



                var btn_div = '<div class="env-btn light" data-toggle="modal"  data-target="#modal" id="light-btn-' + options.id + '"></div>'
                    + '<div class="env-btn temperature" data-toggle="modal"  data-target="#modal"></div>';

                if (options.params.blind_info && options.params.blind_info.length > 0) {
                    btn_div += '<div class="env-btn blind" data-toggle="modal"  data-target="#modal"></div>'
                } else {
                    btn_div += '<div class="env-btn blind-none"></div>';
                }

                env_col.append(env_div);
                btn_col.append(btn_div);

                //dashboard value 지정
                var updateUiFn = function(envcol){
                    btn_col = thisWgt.setLightValue(btn_col);

                    row.append(env_col);
                    row.append(btn_col);

                    var title = '<p></p><h3 class="box-title">' + options.title + '</h3><p></p> ';
                    env_title.append(title);

                    content.append(env_title);

                    content.append(row);
                    card_box.append(content);

                    card.append(card_box);
                    full.append(card);

                    thisElm.append(full);

                    var ctrlBlindFn = function () {
                        dashboard.setBlindInfo(options.title, options.id, options.params.blind_info);
                    }

                    var ctrlTempFn = function () {
                        // var current_temp = parseInt(options.params.curr_temp);
                        //var current_temp = options.obj.target_temperature;
                        var target_temp = thisWgt.getTargetTemperature();
                        dashboard.getTemperatureValue(options.title, options.id, target_temp);
                    }
                    var ctrlLightFn = function () {
                        dashboard.getLightValue(options.title, options.id, this.id, options.obj.light_status);
                    }

                    btn_col.find('.blind').click(ctrlBlindFn);
                    btn_col.find('.temperature').click(ctrlTempFn);
                    btn_col.find('.light').click(ctrlLightFn);
                };
                
                thisWgt.setSensingValue(env_col, updateUiFn);

            }

            if (options.mode.toLowerCase() == "blind") {
                var newArr = [];
                var blind_box_div;


                var newArr = [];
                var blind_box_div;
                if (options.count > 0) {
                    newArr = options.params.blind_info.division(5);

                    for (var i = 0; i <= options.params.count; i++) {
                        blind_box_div = $('<div id="blind_div_' + i + '" value="' + i + '" style="text-align:center"></div>');
                        thisWgt.appendBlindBox(blind_box_div, newArr[i], options.params.count);
                    }

                } else {
                    newArr = options.params.blind_info;

                    blind_box_div = $('<div id="blind_div" style="text-align:center"></div>');
                    thisWgt.appendBlindBox(blind_box_div, newArr, options.params.count);

                }

            }

        };

        this.create = function () {
            var title = options.title;
            var id = options.id;

            thisWgt.createRow();
        }

        this.create();

        return this;
    };

}(jQuery));