/** Dashboard Js */
var dashboard = {
    message: false,
    form: false,
    table: null,
    refresh_interval: 30,
    url: {
        api: '/restapi/v1/tso/rooms?merge=true',
    },
    //이벤트를 바인딩한다.
    doInit: function () {
        var p = this;
        this.table = $('#room_status_table').DataTable({
            searching: false,
            info: false,
            ordering: false,
            ajax: {
                url: p.url.api,
                dataSrc: 'data'
            },
            columnDefs: [{
                targets: 0,
                className: 'dt-body-center',
            }, {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
            }],
            "aaSorting": [],
            columns: [{
                    data: 'floor_no',
                    render: function (data, type, row, meta) {
                        return data + 'F';
                    },
                },
                {
                    data: 'room_name'
                },
                {
                    render: function (data, type, row, meta) {
                        return data || '-';
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        return data || '-';
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        return data || '-';
                    }
                },
                {
                    render: function (data, type, row, meta) {
                        return data || '-';
                    }
                }
            ],
            paging: false,
            rowsGroup: [0],
            initComplete: function (settings, json) {
                json.data.forEach(function (e, i) {
                    dashboard.loadSensingData(e.room_id, i);
                });

                dashboard.table.on('click', 'tr td:first-child, tr td:nth-child(2)', function () {
                    var data = dashboard.table.row($(this).parents('tr')).data();
                    window.open('/data/floor-image/' + data.floor_no + '.pdf', "FloorPlan", 'top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
                });

                $('#room_status_table tbody')
                    .on('mouseover', 'td', function () {
                        var colIdx = dashboard.table.cell(this).index().column;
                        var rowIdx = dashboard.table.cell(this).index().row;
                        if (colIdx < 2) {
                            $(dashboard.table.cells().nodes()).removeClass('highlight');
                            $(dashboard.table.cell({
                                row: rowIdx,
                                column: colIdx
                            }).nodes()).addClass('highlight');
                        }
                        if (colIdx == 1) {
                            for (var i = rowIdx; i > -1; i--) {
                                if ($(dashboard.table.cell({
                                        row: i,
                                        column: 0
                                    }).nodes()).attr('rowspan')) {
                                    $(dashboard.table.cell({
                                        row: i,
                                        column: 0
                                    }).nodes()).addClass('highlight');
                                    break;
                                };
                            }
                        }
                    })
                    .on('mouseleave', function () {
                        $(dashboard.table.cells().nodes()).removeClass('highlight');
                    });
            }

        });
    },
    loadSensingData: function (roomid, row) {
        //if (row > 3) return;
        var data;
        $.ajax({
            url: '/restapi/v1/tso/rooms/' + roomid + "/sensing-data",
            dataType: 'json',
            type: 'GET',
            success: function (result) {
                if (result.code != 200) {
                    dashboard.table.cell({
                        row: row,
                        column: 2
                    }).data('-');
                    dashboard.table.cell({
                        row: row,
                        column: 3
                    }).data('-');
                    dashboard.table.cell({
                        row: row,
                        column: 4
                    }).data('-');
                    dashboard.table.cell({
                        row: row,
                        column: 5
                    }).data('-').draw();
                } else {
                    data = result.data;
                    $.each(data, function (i, e) {
                        if (jutils.empty(e)) {
                            e = 0;
                        }
                    });
                    dashboard.table.cell({
                        row: row,
                        column: 2
                    }).data('<span class="temp">' + data.temp + '</span>');
                    dashboard.table.cell({
                        row: row,
                        column: 3
                    }).data('<span class="rh">' + data.rh + '</span>');

                    var co2_msg = data.co2_state_msg.toLowerCase();
                    var pm25_msg = data.pm25_state_msg.toLowerCase();
                    var co2_html = '';
                    var pm25_html = '';
switch (co2_msg) {
                        case "moderate":
                            co2_html = '<i class="fa fa-square" aria-hidden="true" title="Moderate" style="color:#e9a91e"></i>';
                            break;
                        case "unhealthy":
                            co2_html = '<i class="fa fa-square" aria-hidden="true" title="Unhealthy" style="color:#e91e24"></i>';
                            break;
                        default:
                            co2_html = '<i class="fa fa-square" aria-hidden="true" title="Good" style="color:#1ee96f"></i>';
                            break;
                    }

                    switch (pm25_msg) {
                        case "moderate":
                            pm25_html = '<i class="fa fa-square" aria-hidden="true" title="Moderate" style="color:#e9a91e"></i>';
                            break;
                        case "unhealthy":
                            pm25_html = '<i class="fa fa-square" aria-hidden="true" title="Unhealthy" style="color:#e91e24"></i>';
                            break;
                        default:
                            pm25_html = '<i class="fa fa-square" aria-hidden="true" title="Good" style="color:#1ee96f"></i>';
                            break;
                    }

                    dashboard.table.cell({
                        row: row,
                        column: 4
                    }).data(co2_html + ' ' + '<span class="co2">' + data.co2 + '</span>');
                    dashboard.table.cell({
                        row: row,
                        column: 5
                    }).data(pm25_html + ' ' + '<span class="pm25">' + data.pm25 + '</span>').draw();
                }
                setTimeout(function () {
                    dashboard.loadSensingData(roomid, row);
                }, dashboard.refresh_interval * 1000);
            },
            error: function (e) {
                //console.log(e);
            }
        });
    }
};


$(function () {
    dashboard.doInit();
});
