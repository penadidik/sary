/** Management Js */
var management = {
    message: false,
    form: false,
    grid: false,
    params: {
        flag: 'insert',
    },
    //url
    url: {
        api: '/restapi/v1/tso/rooms',
        detail: jprops.page.managementDetail,
    },
    //이벤트를 바인딩한다.
    doInit: function () {
        var p = this;

        p.form = $('#management-form');

        $('#new-management-room').bind("click", p.onSelect);
        $('#management-detail').hide();
    },
    doInitGrid: function () {
        var p = this;
        var label = jprops.room;
        
        // 그리드 위젯 정의
        this.grid = $("#management-table").appTableWidget({
            url: this.url.api,
            title: '',
            selectRow: true,
            selectRowEvent: p.onSelect,
            columns: [
                { data: 'room_id', width: '20%', align: 'c', header: { title: label.roomId } },
                { data: 'room_name', width: '30%', align: 'c', header: { title: label.roomNm } },
                { data: 'blind_control', width: '15%', align: 'c', header: { title: label.blindControl } },
                { data: 'description', width: 'auto', align: 'c', header: { title: label.desc } },
            ]
        });
    },
    doReload: function (floor) {
        var data = {};
        data.floor = floor;
        data.flag = "management";


        // $.cookie('management_floor', floor, { expires: Controller.params.cookie_time });
        localStorage.setItem('management_floor', data.floor_no);
        this.grid.load(data);
        return false;
    },
    onSelect: function (json, rowidx) {

        var room_id = json.room_id;
        var data = '';

        if (!jutils.empty(room_id)) {
            data = JSON.stringify(json);
        }

        // $.post(management.url.detail, { data }).done(function (data) { $("body").html(data); });
        //$.post(management.url.detail, { data: data, }).done(function (data) { $("body").html(data); });
      
        $('#management-form').hide(); 
        management_detail.setRoomInfo(data);
       
    },
    doSelectFloor: function () {
        var p = this;

        if (p.form.attr('id') != 'management-form') {
            return false;
        }

        // var selectFloor = $.cookie('management_floor');
        var selectFloor = localStorage.getItem('management_floor');

        if (jutils.empty(selectFloor)) {
            var floor = $('.floor-list li').first();

            $('#management-floor-toggle p').text(floor.text());
            p.doReload(floor.find('a').attr('value'));

        } else {
            $('#management-floor-toggle p').text(selectFloor + "F");
            p.doReload(selectFloor);
        }

    }
}


$(function () {
    management.doInit();

    management.doInitGrid();
});
