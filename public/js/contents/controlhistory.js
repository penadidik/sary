/** ControlHistory Js */
var controlhistory = {
    message: false,
    form: false,
    params: {},
    //url
    url: {
        api: '/restapi/v1/tso/control-log',
    },
    selected_room_id: false,
    doInit: function () {
        var p = this;
        p.form = $('#search-form');
        $('#search-btn').bind("click", function () {
            p.doSearch(1);
        });

        var allLi = $('<li class="txt"><a href="javascript:;">ALL</a></li>')
        allLi.bind('click', function () {
            $('.floor-toggle p').text('ALL');
            $('.room-toggle p').text('ALL');
            $('#room-id-input').val('All rooms');
            $('#room-select-btn').prop('disabled', true);
            $('#controlhistory-room-list').empty();
            p.selected_room_id = false;
        });
        $('#controlhistory-floor-list').prepend(allLi);

        $.datepicker.setDefaults({
            dateFormat: 'yy-mm-dd',
            maxDate: 0,
            showButtonPanel: true,
            showMonthAfterYear: true
        });

        var startDatePicker = $('#start-date-input').datepicker().datepicker('setDate', 'today');
        var endDatePicker = $('#end-date-input').datepicker().datepicker('setDate', 'today');
        $('#start-date-btn').bind('click', function () {
            startDatePicker.datepicker('show');
        });
        $('#end-date-btn').bind('click', function () {
            endDatePicker.datepicker('show');
        });

        this.doSearch(1);
    },
    doSelectRoom: function (roomInfo) {
        controlhistory.selected_room_id = roomInfo.room_id;
        $('#room-id-input').val(roomInfo.room_id);
    },
    doSelectFloor: function () {
        $('#room-id-input').val(null);
        $('#room-select-btn').prop('disabled', false);
        controlhistory.selected_room_id = false;
    },
    doSearch: function (pageNo) {
        var p = this;
        var form = controlhistory.form;
        var data = form.serializeObject();
        if (data.user_id_check != "on") {
            delete data.user_id;
        }
        delete data.user_id_check;
        if (controlhistory.selected_room_id) {
            data.room_id = controlhistory.selected_room_id;
        }
        if (pageNo) {
            data.page_no = pageNo;
        }

        data.start_date += ' 00:00:00';
        data.end_date += ' 23:59:59';

        var successFn = function (pagination, items) {
            $('#total-span').text(pagination.total);
            $('#updated-time-span').text(jutils.formatDateTime(new Date()));
            $('#list-table-body').empty();
            $.each(items, function (index, item) {
                $.each(item.message, function (idx, itm) {
                    try {
                        item.message[idx] = 'Blind channel ' + itm.ch_no + ', ' + itm.direction.toUpperCase();
                    } catch (e) {
                        item.message[idx] = JSON.stringify(itm);
                    }
                });
                var parsed_message = item.message.join('<br>');
                console.log(parsed_message);
                var itemTr = $('<tr></tr>')
                    .append('<td class="text-center">' + item.index + '</td>')
                    .append('<td class="text-center">' + item.room_id + '</td>')
                    .append('<td class="text-center">' + item.user_id + '</td>')
                    .append('<td class="text-center">' + parsed_message + '</td>')
                    .append('<td class="text-center">' + item.controlled_time + '</td>');
                $('#list-table-body').append(itemTr);
            });
            controlhistory.updatePagination(pagination);
        };

        $.ajax({
            url: controlhistory.url.api,
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
                    console.log("error in getting control history");
                    jmessager.show({
                        title: jprops.title.error,
                        msg: jprops.contents.error + result.error.code
                    });
                }
            }
        });
    },
    doValidate: function () {

        var file = $("#configuration-file-input").val();

        if (jutils.empty(file)) {
            jmessager.show({
                msg: jprops.validate.file.empty
            });
            return false;
        }

        return true;

    },
    updatePagination: function (currentPagination) {
        //initializing component members
        var paginationHandler = {
            dataReloadFn: controlhistory.doSearch,
            paginationUl: $('#pagination-ul'),
            goFirstLi: false,
            goPrevLi: false,
            goNextLi: false,
            goLastLi: false,
            PAGINATION_SIZE: 5,
            pageArray: [],
            startPageNo: 0,
            endPageNo: 0,
            currentPaginationIndex: 0,
            lastPaginationIndex: 0,
            hasFirst: false,
            hasPrev: false,
            hasNext: false,
            hasLast: false,
            updatePagination: function () {
                if (!this.hasFirst) {
                    this.goFirstLi = $('<li class="disabled"><a href="javascript:;">«</a></li>');
                } else {
                    this.goFirstLi = $('<li><a href="#">«</a></li>');
                    this.goFirstLi.bind('click', this.goFirstHandler(this));
                }

                if (!this.hasPrev) {
                    this.goPrevLi = $('<li class="disabled"><a href="javascript:;">&lt;</a></li>');
                } else {
                    this.goPrevLi = $('<li><a href="#">&lt;</a></li>');
                    this.goPrevLi.bind('click', this.goPrevHandler(this));
                }

                if (!this.hasNext) {
                    this.goNextLi = $('<li class="disabled"><a href="javascript:;">&gt;</a></li>');
                } else {
                    this.goNextLi = $('<li><a href="#">&gt;</a></li>');
                    this.goNextLi.bind('click', this.goNextHandler(this));
                }

                if (!this.hasLast) {
                    this.goLastLi = $('<li class="disabled"><a href="javascript:;">»</a></li>');
                } else {
                    this.goLastLi = $('<li><a href="#">»</a></li>');
                    this.goLastLi.bind('click', this.goLastHandler(this));
                }

                this.paginationUl.empty();
                this.paginationUl.append(this.goFirstLi);
                this.paginationUl.append(this.goPrevLi);
                for (var index in this.pageArray) {
                    this.paginationUl.append(this.pageArray[index]);
                }
                this.paginationUl.append(this.goNextLi);
                this.paginationUl.append(this.goLastLi);
            },
            goPage: function (pageNo) {
                this.dataReloadFn(pageNo);
            },
            goPrevHandler: function (handler) {
                return function () {
                    if (handler.hasPrev)
                        handler.goPage(((handler.currentPaginationIndex - 1) * handler.PAGINATION_SIZE) + 1);
                };
            },
            goNextHandler: function (handler) {
                return function () {
                    if (handler.hasNext)
                        handler.goPage(((handler.currentPaginationIndex + 1) * handler.PAGINATION_SIZE) + 1);
                };
            },
            goFirstHandler: function (handler) {
                return function () {
                    if (handler.hasFirst)
                        handler.goPage(1);
                };
            },
            goLastHandler: function (handler) {
                return function () {
                    if (handler.hasLast)
                        handler.goPage((handler.lastPaginationIndex * handler.PAGINATION_SIZE) + 1);
                };
            },
            init: function (currentPagination) {
                /*
                if PAGINATION_SIZE is '5' and current page_no is '1',
                that means currentPaginatino is [1,2,3,4,5] and currentPaginatinoIndex is '0'
                ex) PAGINATION_SIZE: 5
                    [1,2,3,4,5] = paginationIndex '0'
                    [6,7,8,9,10] = paginationIndex '1'
                    [11,12,13,14,15] = paginationIndex '2'
                    ... 
                */
                this.currentPaginationIndex = Math.floor((currentPagination.page_no - 1) / this.PAGINATION_SIZE);
                var lastPageNo = Math.floor((currentPagination.total - 1) / currentPagination.page_size + 1);

                //the last-pagination-index that contains the last page.
                this.lastPaginationIndex = Math.floor((lastPageNo - 1) / this.PAGINATION_SIZE);

                /*
                the current-pagination`s startPageNo and endPageNo
                if PAGINATION_SIZE = 5 and currentPageNo = 7
                then startPageNo = 6 and endPageNo = 10
                => [[start-6], (current-7), 8, 9, [end-10]]
                */
                this.startPageNo = (this.currentPaginationIndex * this.PAGINATION_SIZE) + 1;
                this.endPageNo = (this.currentPaginationIndex + 1) * this.PAGINATION_SIZE;

                if (this.endPageNo > lastPageNo) {
                    this.endPageNo = lastPageNo;
                }

                if (this.startPageNo > this.PAGINATION_SIZE) {
                    this.hasFirst = true;
                    this.hasPrev = true;
                }

                if (this.lastPaginationIndex > this.currentPaginationIndex) {
                    this.hasNext = true;
                    this.hasLast = true;
                }

                for (var i = this.startPageNo; i <= this.endPageNo; i++) {
                    var pageLi = $('<li><a href="#">' + i + '</a></li>');
                    pageLi.bind('click', (function (pageNo, handler) {
                        return function () {
                            handler.goPage(pageNo);
                        };
                    })(i, this));
                    if (i == currentPagination.page_no) {
                        pageLi.addClass('active');
                    }
                    this.pageArray.push(pageLi);
                }
                this.updatePagination();
            }
        };

        // init pagination
        paginationHandler.init(currentPagination);
    }

};


$(function () {
    controlhistory.doInit();
});