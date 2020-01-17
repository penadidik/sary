/** Administrator Js */
var administrator = {
    message: false,
    form: false,
    grid: false,
    params: {
        _csrf: '',
    },
    //url
    url: {
        api: '/restapi/v1/tso/admins'
    },
    //이벤트를 바인딩한다.
    doInit: function () {
        var p = this;

        p.params._csrf = $('input[name$="_csrf"]').val();

        console.log(administrator.params._csrf);
        $('#add-new-admin').bind("click", p.doAdd);
    },
    doInitGrid: function () {
        var p = this;
        var label = jprops.room;
        this.grid = $('#table_id').DataTable({
            ajax: {
                url: p.url.api,
                dataSrc: 'data'
            },
            columns: [{
                data: 'admin_id',
                render: function (data, type, row) {
                    if (type == 'display') {
                        return '<i class="fa "></i><i class="fa fa-calendar-o" aria-hidden="true"></i> '+data;
                    }
                    return data;
                },
            }, {
                data: 'description'
            }]
        });

        $('#table_id tbody').on('click', 'tr', function () {
            var data = p.grid.row(this).data();
            administrator.onSelect(data);
        });

        // // 그리드 위젯 정의
        // this.grid = $("#admin-table").appTableWidget({
        //     url: this.url.api,
        //     title: '',
        //     selectRow: true,
        //     selectRowEvent: p.onSelect,
        //     columns: [{
        //             data: 'admin_id',
        //             width: '30%',
        //             align: 'c',
        //             header: {
        //                 title: 'Administrator ID'
        //             }
        //         },
        //         {
        //             data: 'description',
        //             width: '50%',
        //             align: 'c',
        //             header: {
        //                 title: 'Description'
        //             }
        //         },
        //         // {
        //         //     data: '<button type="button" class="btn btn-secondary point-cursor" data-toggle="modal" data-target="#modal" style="padding:2px 10px">X</button>',
        //         //     width: 'auto',
        //         //     align: 'c',
        //         //     type: 'static_button',
        //         //     clickEvent: p.doDelete,
        //         //     header: {
        //         //         title: 'Remove'
        //         //     }
        //         // },
        //     ]
        // });
    },
    doReload: function () {
        //administrator.grid.load({
        //   flag: 'administrator'
        //});
        administrator.grid.ajax.reload();
    },
    onSelect: function (json, idx) {
        Controller.doInitModal();
        $('#modal-title').text('Administrator information');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        var html = '';
        html += '<div class="form-group">';
        html += '<label>Admin ID</label>';
        html += '<input class="form-control" name="admin_id" value="' + json.admin_id + '" readonly>';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Password</label>';
        html += '<input type="password" class="form-control" name="admin_password" value="' + (json.admin_password ? json.admin_password : '') + '">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Room ID</label>';
        html += '<input class="form-control" name="description" value="' + (json.description ? json.description : '') + '">';
        html += '</div>';
        $('#modal-form').append(html);

        var form = $('#modal-form');
        var updateBtn = $('<button class="pull-right btn btn-red ml10" id="managemnt-blind-channels-add-btn" value="I">Update</button>');
        $('#modal-btn').append(updateBtn);

        $('#modal').modal();
        updateBtn.bind("click", function () {
            $('.modal').click();

            //var data = JSON.stringify(form.serializeObject());
            var data = form.serializeObject();
            data._csrf = administrator.params._csrf;
            if (json.admin_password != data.admin_password) {
                if (data.admin_password.trim() == '') {
                    data.admin_password = null;
                } else {
                    data.admin_password = Controller.hashFn(data.admin_password);
                }
            } else {
                delete data.admin_password;
            }
            data = JSON.stringify(data);

            $.ajax({
                type: 'PUT',
                url: administrator.url.api + '/' + json.admin_id,
                data: data,
                contentType: 'application/json',
                success: function (xml) {
                    var code = xml.code;
                    if (code == 200) {
                        administrator.doReload();
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
        });

        var deleteBtn = $('<button class="pull-right btn btn-gray ml10" id="managemnt-blind-channels-add-btn" value="I">Remove</button>');
        $('#modal-btn').append(deleteBtn);
        deleteBtn.bind("click", function () {
            $('.modal').click();
            var data = JSON.stringify(form.serializeObject());
            $.ajax({
                type: 'DELETE',
                url: administrator.url.api + '/' + json.admin_id,
                contentType: 'application/json',
                success: function (xml) {
                    var code = xml.code;
                    if (code == 200) {
                        administrator.doReload();
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
        });
    },
    doDelete: function (json, idx) {
        Controller.doInitModal();
        $('#modal-title').text('Remove Administrator');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        var html = '';
        html += '<div class="form-group">';
        html += '<div class="modal-body">Are you sure you want to remove?</div>';
        html += '</div>';
        $('#modal-form').append(html);
        var deleteBtn = $('<button class="pull-right btn btn-gray ml10" id="managemnt-blind-channels-add-btn" value="I">Remove</button>');
        $('#modal-btn').append(deleteBtn);
        deleteBtn.bind("click", function () {
            $('.modal').click();
        });
    },
    doAdd: function () {
        Controller.doInitModal();
        $('#modal-title').text('Administrator information');
        $('#modal .modal-body').empty();
        $('#modal .modal-body').append('<form id="modal-form"></form>');

        // var csr = $('input[name$="_csrf"]').val(); 
        var html = '';
        html += '<div class="form-group">';
        html += '<label>Admin ID</label>';
        html += '<input class="form-control" name="admin_id">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Password</label>';
        html += '<input class="form-control" name="admin_password">';
        html += '</div>';

        html += '<div class="form-group">';
        html += '<label>Room ID</label>';
        html += '<input class="form-control" name="description">';
        html += '</div>';
        $('#modal-form').append(html);

        var addBtn = $('<button class="pull-right btn btn-red ml10" id="managemnt-blind-channels-add-btn" value="I">Add</button>');
        $('#modal-btn').append(addBtn);

        var form = $('#modal-form');
        addBtn.bind("click", function () {
            if (!administrator.doValidate(form)) {
                return;
            }

            $('.modal').click();
            var data = form.serializeObject();
            data._csrf = administrator.params._csrf;
            if (data.admin_password) {
                data.admin_password = Controller.hashFn(data.admin_password);
            }
            data = JSON.stringify(data);

            $.ajax({
                type: 'POST',
                url: administrator.url.api,
                data: data,
                contentType: 'application/json',
                success: function (xml) {
                    var code = xml.code;
                    if (code == 200) {
                        administrator.doReload();
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
        });
    },
    doValidate: function (form) {
        var input = form.find('input');
        var result = true;
        $.each(input, function () {
            if (jutils.empty(this.value) && $(this).attr('name') == 'admin_id') {
                $(this).parent('div').find('label').css('color', 'red');
                $(this).focus();
                result = false;
                return false;
            }
        });
        return result;
    }
};


$(function () {
    administrator.doInit();
    administrator.doInitGrid();
    //administrator.doReload();
});