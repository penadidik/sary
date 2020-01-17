var statistichistory = {
    dataStat: null,
    interval: null,
    message: false,
    form: false,
    table: null,
    refresh_interval: 7,
    url: {
        api: '/restapi/v1/tso/stat-log',
    },
    selected_room_id: false,
    doInit: function () {
        var p = this;
        p.form = $('#search-form');
        $('.dropdown').each(function (key, dropdown) {
            var $dropdown = $(dropdown);
            $dropdown.find('.dropdown-menu a').on('click', function () {
                statistichistory.interval = $(this).text().toLowerCase();
                var statIntvl = statistichistory.interval;
                if (statIntvl == "5 minutes" || statIntvl == "hourly" || statIntvl == "daily" || statIntvl == "weekly") {
                    $("#until").hide();
                    $("#end-date-input").hide();
                    $("#end-date-btn").hide();
                } else {
                    $("#until").show();
                    $("#end-date-input").show();
                    $("#end-date-btn").show();
                }

                if (statIntvl == "monthly" || statIntvl == "yearly") {
                    setDatePickerOnlyMonthYear();
                } else {
                    setDatePickerAll();
                }

                $dropdown.find('button').text($(this).text()).append(' <span class="caret"></span>');
            });
        });

        //default
        $('#export-btn').hide();
        $("#until").hide();
        $("#end-date-input").hide();
        $("#end-date-btn").hide();

        $('#search-btn').bind("click", function () {
            if (statistichistory.selected_room_id == null) {
                alert("Please Select The Zone");
            }else{
                if (statistichistory.interval == null) {
                    statistichistory.interval = "5 minutes";
                }

                $('#export-btn').show();
                p.doSearch(1);
            }
        });
        $('#export-btn').bind("click", function(){
            p.doExportExcel();
        });
        $('#graph-btn').bind("click", function(){
             if(statistichistory.selected_room_id == null){
                 alert("Please Select The Zone");
             }else{
                 if (statistichistory.interval == null) {
                     statistichistory.interval = "5 minutes";
                 }
                 var form = statistichistory.form;
                 var data = form.serializeObject();
                 data.start_date += ' 00:00:00';
                 data.end_date += ' 23:59:59';
                 window.open("/tso-console/graphhistory?interval="+statistichistory.interval+"&start_date="+data.start_date+"&end_date="+data.end_date
                       +"&floor_no="+statistichistory.selected_floor_no+"&room_id="+statistichistory.selected_room_id,'window','toolbar=no, menubar=no, resizable=yes');
             }
        });

        var allLi = $('<li class="txt"><a href="javascript:;">ALL</a></li>')
        allLi.bind('click', function () {
            $('.floor-toggle p').text('ALL');
            $('.room-toggle p').text('ALL');
            $('#room-id-input').val('All rooms');
            $('#room-select-btn').prop('disabled', true);
            $('#statistichistory-room-list-stat').empty();
            p.selected_room_id = false;
        });
        $('#statistichistory-floor-list-stat').prepend(allLi);

        setDatePickerAll();

        $('#start-date-btn').bind('click', function () {
            $('#start-date-input').datepicker('show');
        });
        $('#end-date-btn').bind('click', function () {
            $('#end-date-input').datepicker('show');
        });
    },
    doSelectRoom: function (roomInfo) {
         statistichistory.selected_room_id = roomInfo.room_id;
         $('#room-id-input').val(roomInfo.room_id);
    },
    doSelectFloor: function () {
         $('#room-id-input').val(null);
         $('#room-select-btn').prop('disabled', false);
         $('#export-btn').hide();
         $("#list-table-body").empty();

         statistichistory.selected_room_id = null;
         var parent_floor = document.getElementById("floor-select-btn").firstChild;
         var floor =  parent_floor.childNodes[0].nodeValue;
         statistichistory.selected_floor_no = floor.substring(0, floor.length-1);
    },
    doSearch: function (pageNo) {
         var p = this;
         var form = statistichistory.form;
         var data = form.serializeObject();

         if(statistichistory.selected_floor_no != null){
             data.floor_no = statistichistory.selected_floor_no;
         }
         if (statistichistory.selected_room_id) {
             data.room_id = statistichistory.selected_room_id;
         }
         if (pageNo) {
             data.page_no = pageNo;
         }

         data.start_date += ' 00:00:00';
         data.end_date += ' 23:59:59';

         data.interval = statistichistory.interval;
         statistichistory.dataStat = data;

         var labelArr = [];
         var dataArr = [];
         var successFn = function (pagination, items) {
             $('#updated-time-span').text(jutils.formatDateTime(new Date()));
             $('#list-table-body').empty();

             var count = 0;
             $.each(items, function (index, item) {
                 labelArr.push(item.updated_date);
                 dataArr.push(item.temp);

                 var itemTr = $('<tr></tr>')
                     .append('<td class="text-center">' + item.updated_date + '</td>')
                     .append('<td class="text-center">' + item.sensor_serial_no + '</td>')
                     .append('<td class="text-center">' + item.temp + '</td>')
                 $('#list-table-body').append(itemTr);
                 count++;
             });

             $('#total-span').text(count);
         };

         $.ajax({
             url: statistichistory.url.api,
             data: data,
             error: function (xhr, status, error) {
                 console.log(error);
             },
             success: function (result) {
                 var code = result.code;
                 if (code == 200) {
                     var pagination = result.data.pagination;
                     var items = result.data.items;
                     successFn(pagination, items);
                 } else if (code != 403 && code != 401) {
                     console.log("error in getting statistic history");
                     jmessager.show({
                         title: jprops.title.error,
                         msg: jprops.contents.error + result.error.code
                     });
                 }
             }
         });
    },
    doExportExcel : function(){
        window.open("/restapi/v1/tso/export-excel?interval="+statistichistory.interval+"&start_date="+statistichistory.dataStat.start_date
                +"&end_date="+statistichistory.dataStat.end_date
                +"&floor_no="+statistichistory.dataStat.floor_no+"&room_id="+statistichistory.dataStat.room_id, "_blank");
    }
};

function setDatePickerOnlyMonthYear() {
    $('#start-date-input').datepicker('destroy');
    $('#end-date-input').datepicker('destroy');

    $("#start-date-input").datepicker({
        dateFormat: 'MM yy',
        showButtonPanel: true,
        showMonthAfterYear: true,
        defaultDate: new Date(),
        maxDate: new Date(),
        onSelect: function (dateStr) {
            $("#end-date-input").datepicker("option", {minDate: new Date(dateStr)});
        }
    }).datepicker('setDate', new Date());

    $("#end-date-input").datepicker({
        dateFormat: 'MM yy',
        showButtonPanel: true,
        showMonthAfterYear: true,
        defaultDate: new Date(),
        maxDate: new Date(),
        minDate: new Date()
    }).datepicker('setDate', new Date());
}

function setDatePickerAll() {
    $('#start-date-input').datepicker('destroy');
    $('#end-date-input').datepicker('destroy');

    $("#start-date-input").datepicker({
        dateFormat: 'dd-mm-yy',
        showButtonPanel: true,
        showMonthAfterYear: true,
        defaultDate: new Date(),
        maxDate: new Date(),
        onSelect: function (dateStr) {
            $("#end-date-input").datepicker("option", {minDate: new Date(dateStr)});
        }
    }).datepicker('setDate', new Date());

    $("#end-date-input").datepicker({
        dateFormat: 'dd-mm-yy',
        showButtonPanel: true,
        showMonthAfterYear: true,
        defaultDate: new Date(),
        maxDate: new Date(),
        minDate: new Date()
    }).datepicker('setDate', new Date());
}

$(function () {
    statistichistory.doInit();
});
