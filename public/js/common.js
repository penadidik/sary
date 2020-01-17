var Controller = {
  form: false,
  url: {
    dashboard: jprops.page.dashboard,
    statistichistory: jprops.page.statistichistory,
    statistichistoryfloor: jprops.page.statistichistoryfloor,
    statistichistoryall: jprops.page.statistichistoryall,
    management: jprops.page.management,
    configuration: jprops.page.configuration,
    controlhistory: jprops.page.controlhistory,
    administrator: jprops.page.administrator,
    roomcontrol: jprops.page.roomcontrol,
    floor: '/restapi/v1/tso/floors',
    room: '/restapi/v1/tso/rooms',
    login: jprops.page.login
  },
  params: {
    cookie_time: '',
  },
  init: function () {

    var url = $(location).attr("href");
    var curl = jcommon.getURLIndex(url);

    var p = this;

    p.createNavigation();

    p.createTopTitile(curl);

    p.createFloorList();

    var date = new Date();
    var minutes = 5;
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    p.params.cookie_time = date;

    $('#logout-btn').bind("click", p.doLogout);
  },
  createNavigation: function () {
    var navigation = $("#exampleAccordion");

    if (navigation.length <= 0) {
      return false;
    }

    var li = navigation.find("li");

    $.each(li, function () {
      var div = $(this).find("div");
      var key = div.attr("name");
      div.css('cursor', 'pointer');

      switch (key) {
        case "management":
          div.attr("value", Controller.url.management);
          break;
        case "statistichistory":
          div.attr("value", Controller.url.statistichistory);
          break;
        case "statistichistoryfloor":
          div.attr("value", Controller.url.statistichistoryfloor);
          break;
        case "statistichistoryall":
          div.attr("value", Controller.url.statistichistoryall);
          break;
        case "configuration":
          div.attr("value", Controller.url.configuration);
          break;
        case "controlhistory":
          div.attr("value", Controller.url.controlhistory);
          break;
        case "administrator":
          div.attr("value", Controller.url.administrator);
          break;
        case "roomcontrol":
          div.attr("value", Controller.url.roomcontrol);
          break;
        default:
          div.attr("value", Controller.url.dashboard);
          break;
      }
    });


    $('div.nav-link').on("click touchend", function () {
      localStorage.removeItem('management_floor');
      jcommon.go($(this).attr('value'));
    });

  },
  createTopTitile: function (url) {

    if (url == "dashboard") {
      $('#top-title-main').remove();
    } else {
      $('#top-title-main a').text("Main");
    }

    $('#top-title-sub').text(jutils.initCap(url));
    $('#top-title-h1').text(jutils.initCap(url));
  },
  createFloorList: function () {
    var p = this;
    var floor = $('.floor-list');

    if (floor.length <= 0) {
      return false;
    }

    var successFn = function (floorList) {
      var floorUl = $(".floor-list");
      //Set Floor List 
      $.each(floorList, function (i, e) {
        floorUl.append('<li class="txt"><a href="javascript:;" class="floor" value="' + e + '">' + jcommon.setFloor(e) + '</a></li> ');
      });

      if ($('#dashboard-floor-toggle').length > 0) {
        dashboard.doSelectFloor();
      }

      if ($('#management-floor-toggle').length > 0) {
        management.doSelectFloor();
      }


      $('.floor').on("click", function () {
        //Get Room List
        var floor = $(this).attr("value");

        //li selected  
        $('.floor-toggle p').text($(this).text());
        $('.room-toggle p').text('Room selection');

        switch ($(this).parents('ul').attr('id')) {
          case 'controlhistory-floor-list':
            controlhistory.doSelectFloor();
            p.createRoomList(floor);
            break;
          case 'management-floor-list':
            management.doReload($(this).attr("value"));
            break;
          case 'statistichistory-floor-list':
            $('.room-toggle p').text('Zone selection');
            statistichistory.doSelectFloor();
            p.createRoomList(floor);
            break;
          default:
            p.createRoomList(floor);
            break;
        }

      });
    }
    //Get Floor List 
    $.ajax({
      url: Controller.url.floor,
      type: 'GET',
      error: function (xhr, status, error) {
        console.log(error);
      },
      success: function (result) {
        var code = result.code;
        if (code == 200) {
          var floorList = result.data;
          successFn(floorList);
        } else if (code != 403 && code != 401) {
          console.log("floor list error");
        }
      }
    });
  },
  createRoomList: function (floor) {

    var successFn = function (roomList) {
      var room = $('.room-list');

      if ($('#dashboard-form').length > 0) {
        dashboard.getRoomDetail(roomList);
        return false;
      } else if ($('#management-form').length > 0) {
        return false;
      }

      if (room.length <= 0) {
        return false;
      }

      var roomNm = [];
      var roomUl = $(".room-list");

      roomUl.empty();
      $.each(roomList, function (i, e) {
        roomUl.append('<li class="txt"><a href="javascript:;" class="room" value="' + e.room_id + '" id="' + i + '" >' + e.room_name + '</a></li> ');
      });

      $('.room').on("click", function () {
        $('.room-toggle p').text($(this).text());

        switch ($(this).parents('ul').attr('id')) {
          case 'controlhistory-room-list':
                controlhistory.doSelectRoom(roomList[$(this).attr('id')]);
                break;
          case 'statistichistory-room-list':
                statistichistory.doSelectRoom(roomList[$(this).attr('id')]);
                break;
          default:
                break;
        }
      });
    };

    //Get Room List 
    $.ajax({
      url: Controller.url.room + "?floor_no=" + floor,
      type: 'GET',
      error: function (xhr, status, error) {
        console.log(error);
      },
      success: function (result) {
        var code = result.code;

        if (code == 200) {
          var rommList = result.data.rooms;
          successFn(rommList);
        } else if (code != 403 && code != 401) {
          console.log("room list error");
          jmessager.show({
            title: jprops.title.error,
            msg: jprops.contents.error + result.error.code
          });
        }
      }
    });
  },
  hashFn: function (s) {
    /* Simple hash function. */
    var a = 1,
      c = 0,
      h, o;
    if (s) {
      a = 0;
      for (h = s.length - 1; h >= 0; h--) {
        o = s.charCodeAt(h);
        a = (a << 6 & 268435455) + o + (o << 14);
        c = a & 266338304;
        a = c !== 0 ? a ^ c >> 21 : a;
      }
    }
    return String(a);
  },
  doInitModal: function () {
    // $('.modal-body').empty();

    $('#modal-title').text('');

    $('#modal-form').empty();

    $('#modal-btn').empty();
    $('#modal-btn').append('<button class="btn btn-secondary point-cursor" id="modal-cancle-btn" type="button" data-dismiss="modal">Cancel</button>');
  },
  doInitModalCtrl: function () {
    $('#modal').find('.modal-lg').removeClass('modal-lg');
    $('#modal-title').text('');

    $('.modal-body').empty();
    $('.modal-footer').empty();
  },
  doLogout: function () {
    localStorage.removeItem('management_floor');
    document.cookie = 'Authorization=; path=/';
    jcommon.go(Controller.url.login);
  }
}

$(function () {

  //초기화
  Controller.init();

});