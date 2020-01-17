var graphhistory = {
    message: false,
    form: false,
    table: null,
    refresh_interval: 7,
    path_received: null,
    url: {
        api: '/restapi/v1/tso/graph-log',
    },
    doInit: function (path) {
        graphhistory.path_received = path;
         $.ajax({
             url: graphhistory.url.api+path,
             data: {},
             error: function (xhr, status, error) {
                 console.log(error);
             },
             success: function (result) {
                 var code = result.code;
                 if (code == 200) {
                     var items = result.data.items;
                     var itemArr = [];

                     $.each(items, function (index, item) {
                        itemArr.push(item);
                     });

                     graphhistory.loadCharts(itemArr);
                 } else if (code != 403 && code != 401) {
                     console.log("error in getting graph history");
                     jmessager.show({
                         title: jprops.title.error,
                         msg: jprops.contents.error + result.error.code
                     });
                 }
             }
         });
    },
    loadCharts: function (items) {
        Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
        Chart.defaults.global.defaultFontColor = '#292b2c';

        var str = graphhistory.path_received;
        var pathCheck = str.substring(str.indexOf("room_id=") + 8, str.length);
        console.log(items);
        if (items.length > 0) {
            $("#graph_title").text(items[0]["floor_no"] + "F");
        }

        var dataFinals = [];
        var labels = [];
        var datasets = [];
        var dataTemp = [];
        var itemSerialNo = "";
        var labelMax = 0;

        if (pathCheck == "null" || pathCheck == null) {
            //group by sensor
            for (var i = 0; i < items.length; i++) {
                if (itemSerialNo == "") {//is first?
                    itemSerialNo = items[i]["sensor_serial_no"];
                    dataTemp.push(items[i]);//add sensor for first time
                } else {
                    if (itemSerialNo == items[i]["sensor_serial_no"]) {//same sensor
                        dataTemp.push(items[i]);
                    } else {
                        itemSerialNo = items[i]["sensor_serial_no"];
                        dataFinals.push(dataTemp);
                        dataTemp = [];//empty sensor
                        dataTemp.push(items[i]);//add new sensor
                    }
                }

                if (i == items.length - 1) {
                    dataFinals.push(dataTemp);
                }
            }
        } else {
            for (var i = 0; i < items.length; i++) {
                dataTemp.push(items[i]);
            }
            dataFinals.push(dataTemp);
        }

        //console.log(dataFinals);

        var colors = ["#9370DB", "#FF6347", "#87CEEB"]
        var maxTemp = 0;
        var minTemp = 0;
        var maxX = 0;

        for (var i = 0; i < dataFinals.length; i++) {
            var dataArr = [];
            var labelArr = [];
            var dateArr = [];

            if (maxX == 0) {
                maxX = dataFinals[i].length;
            } else {
                if (maxX < dataFinals[i].length) maxX = dataFinals[i].length;
            }

            for (var j = 0; j < dataFinals[i].length; j++) {
                dataArr.push(dataFinals[i][j]["temp"]);
                labelArr.push(dataFinals[i][j]["room_name"]);
                dateArr.push(dataFinals[i][j]["updated_date"]);

                if (maxTemp == 0) {
                    maxTemp = parseInt(dataFinals[i][j]["temp"]);
                } else {
                    if (maxTemp < parseInt(dataFinals[i][j]["temp"])) maxTemp = parseInt(dataFinals[i][j]["temp"]);
                }

                if (minTemp == 0) {
                    minTemp = parseInt(dataFinals[i][j]["temp"]);
                } else {
                    if (parseInt(dataFinals[i][j]["temp"]) < minTemp) minTemp = parseInt(dataFinals[i][j]["temp"]);
                }
            }

            if (labelMax == 0) {
                labelMax = dataFinals[i].length;
                labels = dateArr;
            } else {
                if (labelMax < dataFinals[i].length) {
                    labelMax = dataFinals[i].length;
                    labels = dateArr;
                }
            }

            var data = {
                fill: false,
                label: labelArr[0],
                lineTension: 0.3,
                backgroundColor: colors[i],
                borderColor: colors[i],
                pointRadius: 5,
                pointBackgroundColor: "#008080",
                pointBorderColor: "rgba(255,255,255,0.8)",
                pointHoverRadius: 9,
                pointHoverBackgroundColor: colors[i],
                pointHitRadius: 50,
                pointBorderWidth: 2,
                data: dataArr,
            }

            datasets.push(data);
        }

        var ctx = document.getElementById("chart");
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                scales: {
                    xAxes: [{
                        time: {
                            unit: 'date'
                        },
                        gridLines: {
                            display: true
                        },
                        ticks: {
                            maxTicksLimit: maxX
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: minTemp - 1,
                            max: maxTemp + 1,
                            maxTicksLimit: 5
                        },
                        gridLines: {
                            color: "rgba(0, 0, 0, .125)",
                        }
                    }],
                },
                legend: {
                    display: true
                }
            }
        });
    }
};

$(function () {
    graphhistory.doInit(window.location.search);
    setTimeout(function () {
          location.reload();
        }, 300 * 1000);
});
