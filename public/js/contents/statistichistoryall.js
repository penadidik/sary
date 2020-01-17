var statistichistory = {
    dataStat: null,
    interval: null,
    message: false,
    form: false,
    table: null,
    refresh_interval: 7,
    url: {
        api: '/restapi/v1/tso/stat-all-log',
    },
    selected_room_id: false,
    doInit: function () {
        var p = this;
        p.form = $('#search-form');
        $('.dropdown').each(function (key, dropdown) {
            var $dropdown = $(dropdown);
            $dropdown.find('.dropdown-menu a').on('click', function () {
                statistichistory.interval = $(this).text().toLowerCase();
                $dropdown.find('button').text($(this).text()).append(' <span class="caret"></span>');
            });
        });

        $('#export-btn').hide();
        $('#search-btn').bind("click", function () {
            $('#export-btn').show();
            p.doSearch(1);
        });
        $('#export-btn').bind("click", function(){
            p.doExportExcel();
        });
        $('#graph-btn').bind("click", function(){
            var form = statistichistory.form;
            var data = form.serializeObject();
            data.start_date += ' 00:00:00';
            data.end_date += ' 23:59:59';
            window.open("/tso-console/graphhistoryall?interval=" + statistichistory.interval + "&start_date=" + data.start_date + "&end_date=" + data.end_date,
                'window', 'toolbar=no, menubar=no, resizable=yes');
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

        $.datepicker.setDefaults({
            dateFormat: 'yy-mm-dd',
            showButtonPanel: true,
            showMonthAfterYear: true
        });

        $("#start-date-input").datepicker({
              defaultDate: new Date(),
              maxDate: new Date(),
              onSelect: function(dateStr){
                  $("#end-date-input").datepicker("option",{ minDate: new Date(dateStr)})
              }
        }).datepicker('setDate', new Date());

        $("#end-date-input").datepicker({
              defaultDate: new Date(),
              maxDate: new Date(),
              minDate: new Date()
        }).datepicker('setDate', new Date());

        $('#start-date-btn').bind('click', function () {
            $('#start-date-input').datepicker('show');
        });
        $('#end-date-btn').bind('click', function () {
            $('#end-date-input').datepicker('show');
        });
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

         data.start_date += ' 00:00:00';
         data.end_date += ' 23:59:59';

         data.floor_no = 'null'
         data.room_id = 'null';

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
                     .append('<td class="text-center">' + item.floor_no + '</td>')
                     .append('<td class="text-center">' + item.room_name + '</td>')
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
        window.open("/restapi/v1/tso/export-excel-all?interval="+statistichistory.interval+"&start_date="+statistichistory.dataStat.start_date
            +"&end_date="+statistichistory.dataStat.end_date
            +"&floor_no="+statistichistory.dataStat.floor_no+"&room_id="+statistichistory.dataStat.room_id, "_blank");
    }
};

$(function () {
    statistichistory.doInit();
});
