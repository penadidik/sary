/** Management Js */
var management_detail = {
    message: false,
    form: false,
    params: {
        floor_no: '',
    },
    //url
    url: {
        api: '/restapi/v1/tso/rooms',
    },
    //이벤트를 바인딩한다.
    doInit: function () {
        var p = this;

        p.form = $('#management-detail-form');

        $('#managemnt-blind-add-btn').bind("click", p.doAddBlindChannels);

        $('#management-room-register').bind("click", p.doRegister);

        $('#management-room-cencel').bind("click", p.doCallback);

    },
    setRoomInfo: function (room_info) {

        if (!jutils.empty(room_info)) {
            room_info = eval("(" + room_info + ")");
            management_detail.setRoomDetail(room_info);
        }
        $('#management-detail').show();
    },
    setRoomDetail: function (roomInfo) {

        var v = this;
        var card = $('#management-card');

        var room_name = roomInfo.room_name;
        var room_id = roomInfo.room_id;
        var floor = roomInfo.floor_no;
        var description = roomInfo.description;
        var gateway_serial_no = roomInfo.gateway_serial_no;
        var gateway_static_ip = roomInfo.gateway_static_ip;
        var sensor_serial_no = roomInfo.sensor_serial_no;
        var sensor_static_ip = roomInfo.sensor_static_ip;
        // var gateway_mac_address = roomInfo.gateway_mac_address;
        var blindInfo = roomInfo.blind_info;

        management.params.floor_no = floor;

        $('#management-room-name').val(room_name);
        $('#management-room-identification').val(room_id);
        $('#management-room-identification').data('org_id', room_id);
        $('#management-room-floor').val(floor);
        $('#management-room-descriptions').val(description);
        $('#management-room-gateway-serial-no').val(gateway_serial_no);
        $('#management-room-gateway-static-ip').val(gateway_static_ip);
        $('#management-room-sensor-serial-no').val(sensor_serial_no);
        $('#management-room-sensor-static-ip').val(sensor_static_ip);
        //$('#management-room-gateway-mac-address').val(gateway_mac_address);

        //console.log(blindInfo);
        var html = '';
        $('#management-room-blind-info').empty();
        blindInfo = blindInfo || [];
        for (var i = 0; i < blindInfo.length; i++) {
            html += '<div class="pull-center btn btn-red2 mb10 mr5 management-blind-channel-deatil" data-toggle="modal" data-target="#modal" id="' + blindInfo[i].ch_no + '" value="' + blindInfo[i].blind_cnt + '" data-blind-controller-id="' + blindInfo[i].blind_controller_id + '">CH' + blindInfo[i].ch_no + ' (' + blindInfo[i].blind_cnt + ')</div>';
        }

        $('#management-room-blind-info').append(html);

        $('.management-blind-channel-deatil').on("click", function () {
            management_detail.getBlindChannels($(this).attr("id"), $(this).attr("value"), $(this).attr("data-blind-controller-id"));
        });

        $('#management-room-btn-area').empty();
        $('#management-room-btn-area').append('<button type="button" class="pull-right btn btn-red2 ml10 mb5 ml5" id="management-room-modify" value="U">Update</button> ');
        $('#management-room-btn-area').append('<button type="button" class="pull-right btn btn-gray ml10 mb5 ml5" id="management-room-delete" data-toggle="modal" data-target="#modal">Delete</button> ');
        $('#management-room-btn-area').append('<button type="button" class="pull-right btn btn-secondary mb5" id="management-room-cencel">Cancel</button>');

        $('#management-room-cencel').bind("click", management_detail.doCallback);
        $('#management-room-modify').bind("click", management_detail.doRegister);
        $('#management-room-delete').bind("click", management_detail.beforeDelete);

        var form = management_detail.form;
        var label = form.find('label');

        label.css('color', '#212529');

    },
    doCallback: function () {
        localStorage.setItem('management_floor', management.params.floor_no);
        jcommon.go(jprops.page.management);
    },
    doAddBlindChannels: function () {
        Controller.doInitModal();
        $('#modal-title').text('Blind Channels');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        var html = '';
        html += '<div class="form-group">';
        html += '<label for="Channel No">Channel No</label>';
        html += '<input class="form-control" id="management-room-blind-channel-no" placeholder="Channel No.">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="Blind count">Blind Count</label>';
        html += '<input class="form-control" id="management-room-blind-count" placeholder="Blind Count">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Blind Controller ID</label>';
        html += '<input class="form-control" id="management-room-blind-controller-id" placeholder="Blind Controller ID">';
        html += '</div>';

        $('#modal-form').append(html);
        $('#modal-btn').append('<button class="pull-right btn btn-red2 ml10" id="managemnt-blind-channels-add-btn" value="I">Add</button>');


        $('#managemnt-blind-channels-add-btn').bind("click", management_detail.setBlindChannels);
    },
    setBlindChannels: function () {
        if (this.id != 'managemnt-blind-channels-modify-btn' && this.id != 'managemnt-blind-channels-delete-btn' && this.id != 'managemnt-blind-channels-add-btn') {
            return false;
        }


        var ch_no = $("#management-room-blind-channel-no").val();
        var blind_cnt = $("#management-room-blind-count").val();
        var blind_controller_id = $("#management-room-blind-controller-id").val();

        if (!management_detail.doValidateBlindChannel(ch_no, blind_cnt)) {
            return false;
        }

        var ex_ch_no = $('.exist-management-room-blind-info').attr('id');
        var ex_blind_cnt = $('.exist-management-room-blind-info').attr('value');

        var html = '';
        var blindInfoArea = $('#management-room-blind-info').find('div');
        switch (this.value) {
            case "D":
                $.each(blindInfoArea, function (i, e) {
                    if ($(this).attr('id') == ex_ch_no && $(this).attr('value') == ex_blind_cnt) {
                        $(this).remove();
                    }
                });
                break;
            case "U":
                $.each(blindInfoArea, function (i, e) {
                    if ($(this).attr('id') == ex_ch_no && $(this).attr('value') == ex_blind_cnt) {
                        $(this).attr('id', ch_no);
                        $(this).attr('value', blind_cnt);
                        $(this).text("CH" + ch_no + " (" + blind_cnt + ")");
                        $(this).data('blind-controller-id', blind_controller_id);
                    }
                });
                break;
            default:
                html += '<div class="pull-center btn btn-red2 mb10 mr5 management-blind-channel-deatil" data-toggle="modal" data-target="#modal" id="' + ch_no + '" value="' + blind_cnt + '" data-blind-controller-id="' + blind_controller_id + '">CH' + ch_no + ' (' + blind_cnt + ')</div>';
                $('#management-room-blind-info').append(html);
                break;
        }

        $('.management-blind-channel-deatil').on("click", function () {
            management_detail.getBlindChannels($(this).attr("id"), $(this).attr("value"), $(this).data("blind-controller-id"));
        });

        // $('#modal').modal('toggle');
        $('.modal').click();
        $('.modal').click();
        return false;
    },
    getBlindChannels: function (ch_no, blind_cnt, blind_controller_id) {
        Controller.doInitModal();
        $('#modal-title').text('Blind Channels');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        var html = '';
        html += '<div class="form-group">';
        html += '<label for="Channel No">Channel No</label>';
        html += '<input class="form-control" id="management-room-blind-channel-no" placeholder="Channel No." value="' + ch_no + '">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label for="Blind count">Blind Count</label>';
        html += '<input class="form-control" id="management-room-blind-count" placeholder="Blind count" value="' + blind_cnt + '">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Blind Controller ID</label>';
        html += '<input class="form-control" id="management-room-blind-controller-id" placeholder="Blind Controller ID" value="' + blind_controller_id + '">';
        html += '</div>';

        html += '<input class="exist-management-room-blind-info" type="hidden" id="' + ch_no + '" value="' + blind_cnt + '" data-blind-controller-id="' + blind_controller_id + '"/>';


        $('#modal-form').append(html);

        $('#modal-btn').append('<button class="pull-right btn btn-red2 ml10" id="managemnt-blind-channels-modify-btn" value="U">Modify</button>');
        $('#modal-btn').append('<button class="pull-right btn btn-gray ml10" id="managemnt-blind-channels-delete-btn" value="D">Delete</button>');

        $('#managemnt-blind-channels-modify-btn').bind("click", management_detail.setBlindChannels);
        $('#managemnt-blind-channels-delete-btn').bind("click", management_detail.setBlindChannels);
    },
    doValidateBlindChannel: function (ch_no, blind_cnt) {
        if (jutils.empty(ch_no)) {
            $('#management-room-blind-channel-no').focus();
            return false;
        } else if (jutils.empty(blind_cnt)) {
            $('#management-room-blind-count').focus();
            return false;
        } else {
            return true;
        }
    },
    doRegister: function () {
        if (this.id != "management-room-register" && this.id != "management-room-modify") {
            return false;
        }

        var form = management_detail.form;
        var label = form.find('label');

        label.css('color', '#212529');

        if (!management_detail.doValidate())
            return false;

        var room_id = $('#management-room-identification').val();
        var blind_info = [];
        var blindInfoDiv = $('#management-room-blind-info').find('div');

        $.each(blindInfoDiv, function () {
            var blind_info_detail = {};
            blind_info_detail.ch_no = parseInt($(this).attr('id'));
            blind_info_detail.blind_cnt = parseInt($(this).attr('value'));
            blind_info_detail.blind_controller_id = $(this).data('blind-controller-id');

            blind_info.push(blind_info_detail);
        });

        var data = form.serializeObject();
        data.blind_info = blind_info;
        data.floor_no = data.floor_no.toLowerCase().replace('f', '');

        // $.cookie('management_floor',  data["floor_no"], { expires: Controller.params.cookie_time });
        localStorage.setItem('management_floor', data.floor_no);
        data = JSON.stringify(data);

        var url, type;

        if (this.value == "I") {
            url = management_detail.url.api;
            type = 'POST';
        } else if (this.value == "U") {
            room_id = $('#management-room-identification').data('org_id');
            url = management_detail.url.api + "/" + room_id;
            type = 'PUT';
        }

        $.ajax({
            type: type,
            url: url,
            data: data,
            contentType: 'application/json',
            success: function (xml) {
                var code = xml.code;

                if (code == 200) {
                    jmessager.show({
                        msg: jprops.success.roomUpdate,
                        fn: function () {
                            management_detail.doCallback();
                            return true;
                        }
                    });
                } else if (code != 403 && code != 401) {
                    console.log("management error");
                    jmessager.show({
                        title: jprops.title.error,
                        msg: jprops.contents.error + xml.error.code
                    });
                }

            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    },
    beforeDelete: function () {
        Controller.doInitModal();
        $('#modal-title').text('Delete Room');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        var html = '';
        html += '<div class="form-group">';
        html += '<div class="modal-body">Are you sure you want to delete?</div>';
        html += '</div>';
        $('#modal-form').append(html);
        var deleteBtn = $('<button class="pull-right btn btn-gray ml10" id="managemnt-delete-room-delete-btn">Delete</button>');
        //var cancelBtn = $('<button class="pull-right btn btn-red2 ml10" id="managemnt-delete-room-cancel-btn">Calcel</button>')
        $('#modal-btn').append(deleteBtn);
        //$('#modal-btn').append(cancelBtn);
        deleteBtn.bind("click", management_detail.doDelete);
        //cancelBtn.bind("click", management_detail.setBlindChannels);        
    },
    doDelete: function () {
        var room_id = $('#management-room-identification').val();
        var url = management_detail.url.api + '/' + room_id;
        $.ajax({
            type: 'DELETE',
            url: url,
            success: function (result) {
                $('.modal').click();
                var code = result.code;
                if (code == 200) {
                    jmessager.show({
                        msg: jprops.success.roomDelete,
                        fn: function () {
                            management.params.floor_no = '';
                            management_detail.doCallback();
                            return true;
                        }
                    });
                } else if (code != 403 && code != 401) {
                    console.log("management error");
                    jmessager.show({
                        title: jprops.title.error,
                        msg: jprops.contents.error + xml.error.code
                    });
                }

            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    },
    doValidate: function () {
        var form = management_detail.form;
        var input = form.find('input');
        var result = true;

        $.each(input, function () {
            if (jutils.empty(this.value) && ($(this).attr('name') == 'room_id' || $(this).attr('name') == 'room_name' || $(this).attr('name') == 'floor_no')) {
                $(this).parent('div').parent('div').find('label').css('color', 'red');
                $(this).focus();

                result = false;
                return false;
            }
        });

        return result;
    }
};


$(function () {
    management_detail.doInit();
});