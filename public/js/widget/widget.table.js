(function ($) {

    //===========================================================================//
    //목록테이블 위젯
    //===========================================================================//
    $.fn.appTableWidget = function (args) {

        var options = $.extend(true, {

            //목록 검색 AJAX URL
            url: '',

            //테이블 CSS
            cls: 'basic-table red-table',

            //테이블 title
            title: '리스트',

            //페이징 영역
            paging: false,

            //페이징 출력수
            limit: false,

            //칼럼 정의
            //width, data, cls, format, header{title,format,cls}
            columns: [],

            //헤더 HTML(옵션): 입력된 경우 columns의 header는 무시된다.
            headerEl: false,

            //COLGROUP HTML(옵션): 입력된 경우 columns의 header는 무시된다.
            colgroupEl: false,

            //표시종류  
            mode: 'LIST',

            //그리드타입 (LOAD:검색형, EDIT:편집형)
            type: 'LOAD',

            //헤더 제외여부
            noneHeader: false,

            //데이터가 없을때 빈항목 생성여부
            initial: false,

            //빈항목 기본데이터
            initialData: false,

            //기본검색 조건
            params: {},

            //검색데이타
            rows: false,

            //검색건수
            count: 0,

            //삭제데이터
            removeRows: false,

            //UNIQUE INDEX
            unique: 0,

            //검색페이징객체
            pagination: {
                page: 1,
                total: 0,
                count: 0,
                limit: 0,
                pages: 0,
                display: 5
            },
            //데이터가 없을경우 메세지
            emptyText: jprops.validate.empty.item,

            //초기 데이터행의 메세지
            placeholder: false,

            //검색후 처리함수
            callback: false,

            callbackRow: false,
            //행선택 이벤트
            selectRow: false,
            
            selectRowEvent: false,

            callbackEmpty: false,
            events: [] // name, selector, callback
        }, args);

        //현재객체
        var thisWgt = this;

        //목록테이블객체
        var thisElm = $(this);

        var thisMode = thisElm.data("mode");

        if (thisMode)
            options.mode = thisMode;

        //이벤트 바인딩
        this.initBindEvent = function () {
            if (!options.events)
                return;
            $.each(options.events, function (i, o) {
                thisElm.find(o.selector).off(o.name).on(o.name, o.callback);
            });
        };

        //데이터 초기화
        var _initRows = function () {
            options.rows = [];
            options.removeRows = [];
            options.unique = 0;
            options.count = 0;
        };
        //데이터 추가
        var _addRows = function (row, idx) {

            row['__rowIndex'] = options.unique;

            //특정행에 추가
            if (idx || idx == 0)
                options.rows.splice(idx, 0, row);
            else
                options.rows.push(row);

            options.unique++;

            return row;
        };
        //데이터 삭제
        var _delRows = function (idx) {
            var row = _getRows(idx);
            //데이터 제거
            options.rows.splice(idx, 1);
            //삭제데이터 저장
            if (row.oper != jstatus.INSERT) {
                var delRow = { oper: jstatus.DELETE };
                $.extend(delRow, row);
                options.removeRows.push(delRow);
            }
        };
        //데이터 이동
        var _moveRows = function (idx, offset) {
            options.rows.move(idx, offset);
        };
        //데이터 가져오기
        var _getRows = function (idx) {
            if (idx || idx == 0)
                return options.rows[idx];
            return options.rows;
        };
        var _setRow = function (idx, row) {
            if (options.rows[idx]) {
                thisWgt.loadData(row, idx);
                $.extend(true, options.rows[idx], row);
            }
        };
        //데이터 건수
        var _getCount = function () {
            return options.rows.length;
        };
        //삭제된 데이터 가져오기
        var _getRemoveRows = function () {
            return options.removeRows;
        };
        //현재 UNIQUE KEY 가져오기
        var _getUnique = function () {
            return options.unique;
        };

        //검색된 데이터 건수 가져오기
        this.getLoadCount = function () {
            return options.count;
        };
        //현재 데이터 건수 가져오기
        this.getCount = function () {
            return _getCount();
        };
        //현재 데이터 목록 가져오기
        this.getRows = function () {
            return _getRows();
        };
        //특정 데이터 가져오기
        this.getRow = function (rowidx) {
            return _getRows(rowidx);
        };
        this.setRow = function (rowidx, row) {
            _setRow(rowidx, row);
        };

        //현재 삭제 데이터 목록 가져오기
        this.getRemoveRows = function () {
            return _getRemoveRows();
        };
        this.getId = function () {
            return thisElm.attr('id');
        };
        this.getUnique = function () {
            return _getUnique();
        };

        //특정값이 일치하는 행이 있는지 체크
        this.existKey = function (data) {

            var exist = false;

            $.each(_getRows(), function (i, row) {
                var isKey = true;
                $.each(data, function (key, value) {
                    if (row[key] != value) {
                        isKey = false;
                        return false;
                    }
                });
                //해당키에 맞는 행인 경우
                if (isKey) {
                    exist = true;
                    return false;
                }
            });
            return exist;
        };


        //목록형 데이터행 생성
        this.loadData = function (json, index) {
            var row;
            if(options.params.flag == 'administrator'){
                row = $('<tr data-toggle="modal" data-target="#modal"></tr>');
            }else{
                row = $('<tr></tr>');
            }            
            var rowidx = thisElm.find('tbody > tr:last').index() + 1;
            var create = true;
            if (index || index == 0) {
                rowidx = index;
                create = false;
            }

            $.each(options.columns, function (colidx, c) {

                json['rowidx'] = rowidx;

                //console.log(c.format); 

                var name = c.data;
                var value = json[c.data];
                var text = (c.format ? c.format(value, json, name, c) : value);
                var cls = (c.cls ? c.cls : '');
                var align = c.align; // r,c,l
                var cspan = (c.colspan ? ' colspan="' + c.colspan + '"' : '');
                var rspan = (c.rowspan ? ' rowspan="' + c.rowspan + '"' : '');

                if (align)
                    cls += ' ' + align;

                var col;
                if(c.type == 'static_button'){
                    var btn = $(c.data);
                    btn.bind('click', function () {
                        var rowidx = btn.parent().parent().index('tr');
                        c.clickEvent(json, rowidx);
                    });
                    col  = $('<td ' + cspan + rspan + ' class="' + cls + '"></td>');
                    col.html(btn);
                }else {
                    col  = $('<td ' + cspan + rspan + ' class="' + cls + '">' + jutils.nvl(text) + '</td>');
                }

                //열선택 이벤트 (사용안함)
                //if (options.selectCol) {
                //	col.bind('click', function() {
                //	    var ridx = $(this).parent().index('tr');
                //	    var cidx = $(this).index('tr:eq('+ridx+') td');
                //		options.selectCol(value, json, ridx, cidx, name);
                //	});
                //}
                row.append(col);
            });
            //행선택이벤트
            if (options.selectRow) {
                row.bind('click', function () {
                    var rowidx = $(this).parent().index('tr');
                    options.selectRowEvent(json, rowidx);
                });
            }

            if (create) {
                row.hide();
                thisElm.find('tbody').append(row); 
                row.fadeIn(200);
            }
            else {
                thisElm.find('tbody > tr').eq(index).replaceWith(row);
                //이벤트 바인딩
                thisWgt.initBindEvent();
                //행단위 이벤트처리
                if (options.callbackRow) {
                    options.callbackRow(thisWgt, json, row);
                }

                if (options.callback)
                    options.callback(thisWgt, _getRows());
            }
            return row;
        };

        //행단위 데이터 생성
        this.loadRow = function (data) {
            var el = false;
            //데이터행 로드
            el = thisWgt.loadData(data);
            //이벤트 바인딩
            thisWgt.initBindEvent();
            //행단위 이벤트처리
            if (options.callbackRow) {
                options.callbackRow(thisWgt, data, el);
            }
        };

        //행단위 append
        this.appendRow = function (data) {

            var cnt = _getCount();

            //메세지행을 삭제하기 위해 행수를 확인한다.
            if (cnt == 0) {
                thisElm.find('tbody > tr').eq(0).remove();
            }
            //데이터 추가
            var row = _addRows($.extend(data, { oper: jstatus.SELECT }));

            thisWgt.loadRow(row);

            //이벤트 바인딩
            thisWgt.initBindEvent();

            if (options.callback)
                options.callback(thisWgt, _getRows());
        };
        //콤보박스 리프레시
        //라디오박스나 체크박스의 경우 명칭 RENAME
        var _copyWidget = function (copyRow) {

            var sep = '--';
            var index = _getUnique();

            copyRow.refreshComboWidget();
            copyRow.find('input[type="text"]').val('');
            copyRow.find('input[type="hidden"]').val('');
            copyRow.find('input[type="checkbox"]').each(function (i) {
                $(this).prop('checked', false);

                var name = this.name;
                if (name.indexOf(sep) > 0) {
                    name = name.substring(0, name.indexOf(sep))
                        + sep
                        + index;
                    $(this).prop('name', name);
                }
            });
            copyRow.find('input[type="radio"]').each(function (i) {
                var name = this.name;
                if (name.indexOf(sep) > 0) {
                    name = name.substring(0, name.indexOf(sep))
                        + sep
                        + index;
                    $(this).prop('name', name);
                }
            });
        };

        //행단위 복사
        this.copyRow = function (idx) {

            var getRow = thisElm.find('tbody > tr:eq(' + idx + ')');
            var showRow = getRow.parent().parent();
            var copyRow = getRow.clone(true, true);

            //데이터 추가
            var data = { oper: jstatus.INSERT };

            if (options.initialData)
                $.extend(data, options.initialData);

            var row = _addRows(data);

            _copyWidget(copyRow);

            copyRow.insertAfter(getRow);

        };

        //행단위 신규생성
        this.createRow = function () {
            var cnt = _getCount();

            //메세지행을 삭제하기 위해 행수를 확인한다.
            if (cnt == 0) {
                thisElm.find('tbody > tr').eq(0).remove();
            }
            //데이터 추가
            var row = _addRows({ oper: jstatus.INSERT });

            thisWgt.loadRow(row);

            if (options.callback)
                options.callback(thisWgt, _getRows());
        };

        //행단위 remove (목록형에만 사용함)
        this.removeRow = function (idx) {

            if (options.mode != 'LIST')
                return false;

            var rowEl = thisElm.find('tbody > tr:eq(' + idx + ')');

            var min = 0;
            if (options.initial)
                min = 1;

            //데이터 제거
            _delRows(idx);

            rowEl.remove();

            // 2017.03.03 shlee. 단일행만 남았을때 단일행이 삭제되지 않는 버그 수정
            if (_getCount() < min) {
                thisWgt.createRow();
                return false;
            }
        };

        //행단위 이동처리 (목록형에만 사용)
        this.moveRow = function (idx, arrow) {

            var el = thisElm.find('tbody');

            var rowEl = el.find('tr').eq(idx);

            if (!rowEl.length)
                return;

            if (arrow == 'up') {
                rowEl.prev().before(rowEl);
                _moveRows(idx, -1);
            }
            else {
                rowEl.next().after(rowEl);
                _moveRows(idx, 1);
            }
        };

        //데이터 재생성
        this.loadRows = function (rows) {

            var el = thisElm;
            var mode = options.mode;

            el = thisElm.find('tbody');
            //초기화
            el.html('');
            //데이터 초기화
            _initRows();

            if (rows.length == 0) {
                //로드형인 경우 빈항목 텍스트 표시
                if (options.type == 'LOAD') {
                    el.append('<tr class="app_empty_text"><td colspan="' + options.columns.length + '">' + options.emptyText + '</td></tr>');
                }
                //이벤트 바인딩
                thisWgt.initBindEvent();
                //검색후 빈값일 경우에 처리
                if (options.callbackEmpty)
                    options.callbackEmpty(thisWgt);
            }
            else {
                var start = 0;
                if (options.paging)
                    start = (options.pagination.page - 1) * options.pagination.limit;

                $.each(rows, function (i, o) {

                    var sequence = start + i + 1;
                    var data = o;
                    $.extend(data, {
                        oper: jstatus.SELECT,
                        sequence: sequence
                    });

                    //데이터 추가
                    var row = _addRows(data);
                    //데이터행 로드
                    thisWgt.loadRow(row);
                });
                //이벤트 바인딩
                thisWgt.initBindEvent();
                //데이터 로드후 CALLBACK
                if (options.callback)
                    options.callback(thisWgt, _getRows());
            }

        }

        //그리드 리셋
        this.reset = function () {

            //데이터 초기화
            _initRows();

            //행전체 삭제
            thisElm.find('tbody > tr').remove();

            //초기행 표시여부
            if (options.initial && _getCount() == 0) {
                //데이터 추가
                var data = { oper: jstatus.INSERT };
                if (options.initialData)
                    $.extend(data, options.initialData);

                var row = _addRows(data);
                thisWgt.loadRow(row);
                //이벤트 바인딩
                thisWgt.initBindEvent();

                if (options.callback)
                    options.callback(thisWgt, _getRows());
            }

            options.pagination = $.extend(options.pagination, {
                page: 1,
                total: 0,
                count: 0,
                pages: 0,
                limit: (options.limit ? options.limit : 0)
            });
            thisWgt.createPaging();
        };

        //데이터 로드
        this.load = function (params) {

            //확인검색시 페이지 리셋처리
            if (!params.page) {
                options.appending = false;
                options.params.page = 1;
            }

            if (params)
                $.extend(true, options.params, params);

            if (options.paging &&
                !options.params.page)
                options.params['page'] = 1;

            options.pagination['page'] = options.params['page'];

            if (options.limit) {
                options.params['limit'] = options.limit;
                options.pagination['limit'] = options.params['limit'];
            }

            //데이터 초기화
            this.reset();

            var url, type, data;

            switch (options.params.flag) {
                case "management":
                    url = options.url + "?floor_no=" + params.floor;
                    type = 'GET';
                    break;
                case "administrator":
                    url = options.url;
                    type = 'GET';
                    break;

                default:
                    url = options.url;
                    type = 'POST';
                    data = options.params;
                    break;
            }

            $.ajax({
                url: url,
                dataType: 'json',
                type: type,
                data: data,
                success: function (result) {
                    var data = result.data;

                    if (!data)
                        return;

                    if (data.page) {
                        options.pagination = $.extend(options.pagination, {
                            total: data.total,
                            count: data.count,
                            pages: data.pages,
                            limit: data.limit,
                            page: data.page
                        });
                        thisWgt.createPaging();
                    }

                    var rows;

                    switch (options.params.flag) {
                        case "management":
                            (data.rooms).forEach(function(element) {
                                if(element.blind_info && element.blind_info.length > 0){
                                    element.blind_control = 'YES';
                                }else{
                                    element.blind_control = '-';
                                }
                            });
                            rows = data.rooms;
                            break;
                        case "administrator":
                            rows = data;
                            break;
                        default:
                            rows = data.rows;
                            break;
                    }


                    //로드된 데이터가 없을 경우
                    if (!rows || rows.length == 0) {
                        //로드형인 경우 빈항목 텍스트 표시
                        if (options.type == 'LOAD') {
                            thisWgt.loadRows([]);
                        }
                        return;
                    }
                    //검색건수 셋팅
                    if (rows.length)
                        options.count = rows.length;



                    //데이터 재생성
                    thisWgt.loadRows(rows);
                },
                error: function (e) {
                    //console.log(e);
                }
            });

        };

        //테이블 생성
        this.create = function () {

            thisElm.html('');

            //데이터 초기화
            _initRows();

            if (options.mode == 'LIST') {
                var table = $('<table class="' + options.cls + '"></table>');
                var colgroup = (options.colgroupEl ? options.colgroupEl : this.createColgroup());
                var colheader = (options.headerEl ? options.headerEl : this.createHeader());
                var coltext = '';

                //초기텍스트가 있는 경우
                if (options.placeholder)
                    coltext = '<tr><td class="placeholder-text" colspan="' + options.columns.length + '">' + options.placeholder + '</td></tr>';

                table.append('<caption>' + options.title + '</caption>');
                table.append('<colgroup>' + colgroup + '</colgroup>');

                //헤더제외가 아닌 경우
                if (!options.noneHeader)
                    table.append('<thead>' + colheader + '</thead>');

                table.append('<tbody>' + coltext + '</tbody>');
                thisElm.append(table);
            }
        };

        //Colgroup 생성
        this.createColgroup = function () {

            var s = '';

            $.each(options.columns, function (i, c) {

                var w = c.width;
                s += '<col style="width:' + w + '"/>';
            });
            return s;
        };

        //제목행 생성
        this.createHeader = function () {

            var s = '<tr>';

            $.each(options.columns, function (i, c) {

                //헤더객체
                var h = c.header;

                if (!h)
                    return true;

                var title = (h.format ? h.format(h.title, i) : h.title);
                var cls = '';
                var cspan = (h.colspan ? ' colspan="' + h.colspan + '"' : '');
                var rspan = (h.rowspan ? ' rowspan="' + h.rowspan + '"' : '');

                if (h.cls)
                    cls = ' class="' + h.cls + '"';
                //else if (c.cls)
                //	cls = ' class="'+c.cls+'"';

                s += '<th scope="col"' + cls + '' + cspan + '' + rspan + '>' + title + '</th>';
            });
            s += '</tr>';
            return s;
        };

        //페이징 생성
        this.createPaging = function () {

            if (!options.paging)
                return;

            var p = options.pagination;
            var o = $(options.paging);

            o.html('');

            if (p.total == 0)
                return;

            var el = $('<table></table>');
            var tr = $('<tr></tr>');
            var i = 1, base = Math.floor((p.page - 1) / p.display) * p.display;

            if (p.page == 1) {
                tr.append('<td><a href="javascript:;"><div class="left-arrow-last"></div></a></td>');
                tr.append('<td><a href="javascript:;"><div class="left-arrow-one"></div></a></td>');
            } else {
                tr.append('<td><a href="javascript:;" data-page="1"              ><div class="left-arrow-last"></div></a></td>');
                tr.append('<td><a href="javascript:;" data-page="' + (p.page - 1) + '" ><div class="left-arrow-one"></div></a></td>');
            }

            for (i = 1; i <= p.pages; i++) {
                var pageNo = base + i;
                if (i > p.display || pageNo > p.pages)
                    break;
                tr.append('<td><a href="javascript:;" data-page="' + pageNo + '">' + pageNo + '</a></td>');
                //(p.page==pageNo ? ' active' : '')
            }

            if (p.page == p.pages || p.pages == 0) {
                tr.append('<td><a href="javascript:;"><div class="right-arrow-one"></div></a></td>');
                tr.append('<td><a href="javascript:;"><div class="right-arrow-last"></div></a></td>');
            } else {
                tr.append('<td><a href="javascript:;" data-page="' + (p.page + 1) + '"><div class="right-arrow-one"></div></a></td>');
                tr.append('<td><a href="javascript:;" data-page="' + p.pages + '"   ><div class="right-arrow-last"></div></a></td>');
            }
            el.append(tr);
            el.find('a').bind('click', function () {
                var page = $(this).data('page');
                if (page)
                    thisWgt.load({ page: page });
            });
            o.append(el);

            o.trigger("create");
        };

        //테이블생성
        this.create();

        return this;
    };

}(jQuery));
