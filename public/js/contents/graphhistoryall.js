var graphhistory = {
    message: false,
    form: false,
    table: null,
    refresh_interval: 7,
    url: {
        api: '/restapi/v1/tso/graph-all-log',
    },
    doInit: function (path) {
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
    loadCharts : function(items){
            Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
            Chart.defaults.global.defaultFontColor = '#292b2c';

            //console.log(items);

            var dataFinals = [];
            var labels = [];
            var datasets = [];
            var dataTemp = [];
            var itemSerialNo = "";
        var itemSerialNoArr = [];
            var labelMax = 0;

        //collect sensor
            for(var i=0; i<items.length; i++){
                if(itemSerialNo == ""){//is first?
                    itemSerialNo = items[i]["sensor_serial_no"];
                    itemSerialNoArr.push({'key': items[i]["sensor_serial_no"], 'content': []});
                }else{
                    if (!findSensor(itemSerialNoArr, items[i]["sensor_serial_no"])) {//same sensor
                        itemSerialNoArr.push({'key': items[i]["sensor_serial_no"], 'content': []});
                    }
                }
            }

        //group by sensor
        for (var i = 0; i < items.length; i++) {
            pushSensor(itemSerialNoArr, items[i]["sensor_serial_no"], items[i]);
        }

        //console.log(dataFinals);
        //console.log(itemSerialNoArr);

            var colors = ["#9370DB","#FF6347","#87CEEB"]
            var maxTemp = 0;
            var minTemp = 0;
        var maxX = 0;

        for (var i = 0; i < itemSerialNoArr.length; i++) {
                var dataArr = [];
                var labelArr = [];
                var dateArr = [];

            if (maxX == 0) {
                maxX = itemSerialNoArr[i].content.length;
            } else {
                if (maxX < itemSerialNoArr[i].content.length) maxX = itemSerialNoArr[i].content.length;
            }

            for (var j = 0; j < itemSerialNoArr[i].content.length; j++) {
                dataArr.push(itemSerialNoArr[i].content[j]["temp"]);
                labelArr.push(itemSerialNoArr[i].content[j]["room_name"]);
                dateArr.push(itemSerialNoArr[i].content[j]["updated_date"]);

                    if(maxTemp == 0){
                        maxTemp = parseInt(itemSerialNoArr[i].content[j]["temp"]);
                    }else{
                        if (maxTemp < parseInt(itemSerialNoArr[i].content[j]["temp"])) maxTemp = parseInt(itemSerialNoArr[i].content[j]["temp"]);
                    }

                    if(minTemp == 0){
                        minTemp = parseInt(itemSerialNoArr[i].content[j]["temp"]);
                    }else{
                        if (parseInt(itemSerialNoArr[i].content[j]["temp"]) < minTemp) minTemp = parseInt(itemSerialNoArr[i].content[j]["temp"]);
                    }
                }

                if(labelMax == 0) {
                    labelMax = itemSerialNoArr[i].content.length;
                    labels = dateArr;
                }else{
                    if (labelMax < itemSerialNoArr[i].content.length) {
                        labelMax = itemSerialNoArr[i].content.length;
                        labels = dateArr;
                    }
                }

                var data = {
                      fill : false,
                      label: labelArr[0],
                      lineTension: 0.3,
                      backgroundColor: colors[i],
                      borderColor: colors[i],
                      pointRadius: 5,
                      pointBackgroundColor: "#008080",
                      pointBorderColor: "rgba(255,255,255,0.8)",
                      pointHoverRadius: 7,
                      pointHoverBackgroundColor: "#00FF7F",
                      pointHitRadius: 50,
                      pointBorderWidth: 2,
                      data: dataArr,
                 }

                 datasets.push(data);
            }

            var ctx = document.getElementById("chart");
            var myLineChart = new Chart(ctx, {
              type: 'bar',
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
                      min: minTemp-1,
                      max: maxTemp+1,
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

function findSensor(arrData, sensor) {
    var isFound = false;
    for (var i = 0; i < arrData.length; i++) {
        if (arrData[i].key == sensor) {
            isFound = true;
            break;
        }
    }
    return isFound;
}

function pushSensor(arrData, sensor, items) {
    for (var i = 0; i < arrData.length; i++) {
        if (arrData[i].key == sensor) {
            arrData[i].content.push(items);
            break;
        }
    }
}

$(function () {
    graphhistory.doInit(window.location.search);
    setTimeout(function () {
          location.reload();
        }, 300 * 1000);
});
