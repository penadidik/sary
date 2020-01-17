/** Login Js */
var login = {
    message: false,
    form: false,
    params: {},
    //url
    url: {
        api: '',
        main: jprops.page.dashboard
    },
    api: {
        login: '/openapi/v1/tso/login-web'
    },
    //이벤트를 바인딩한다.
    doInit: function () {

        var p = this;

        p.form = $('#login-form');


        //$('#tso-smart-room-user-id').val(localStorage.getItem('tso-smart-room-user-id')); // Don't store user id

        //login btn event
        $('#login-btn').bind("click", p.doLogin);
        // 아이디 필드를 포커스 한다.
        $("#tso-smart-room-user-id").focus();
        
        var onPressEnterKey = function(event){
            if ( event.which == 13 ) {
                login.doLogin();
                event.preventDefault();
             }            
        };
        $('#tso-smart-room-user-id').keypress(onPressEnterKey);
        $('#tso-smart-room-user-password').keypress(onPressEnterKey);
        
    }, //로그인을 처리한다.
    doLogin: function () {
        var form = login.form;

        //validation check
        if (!login.doValidate())
            return false;

        var user_id = $('#tso-smart-room-user-id').val();
        var user_passwrod = $('#tso-smart-room-user-password').val();

        //localStorage.setItem("tso-smart-room-user-id", user_id); // Don't store user id


        var data = form.serializeObject();
        data.is_web_login = true;
        data.password = Controller.hashFn(data.password);
        /** api call **/
        $.ajax({
            url: login.api.login,
            data: data,
            type: 'POST',
            error: function (xhr, status, error) {
                console.log(error);
            },
            success: function (result) {
                var code = result.code;
                if (code == 200) {
                    if (!result.data.is_admin) {
                        document.cookie = 'Authorization=; path=/';
                        jmessager.show({
                            title: 'Access Denied',
                            msg: 'You must have administrator privileges to access the system.'
                        });
                    } else {
                        document.cookie = 'Authorization=' + result.data.access_key + '; path=/';
                        window.location.replace(login.url.main);
                    }
                } else {
                    jmessager.show({
                        title: jprops.title.error,
                        msg: jprops.contents.error + result.error.code
                    });
                }
            }
        });
    },
    //로그인시 VALIDATION
    doValidate: function () {        
        if (jutils.empty($("#tso-smart-room-user-id").val())) {
            jmessager.show({
                msg: jprops.validate.login.userid,
                fn: function () {
                    $("#tso-smart-room-user-id").focus();
                }
            });
            return false;
        }

        //Not use this...
        // if (jutils.empty($("#tso-smart-room-user-password").val())) {
        //     jmessager.show({
        //         msg: jprops.validate.login.password,
        //         fn: function () {
        //             $("#tso-smart-room-user-password").focus();
        //         }
        //     });
        //     return false;
        // }

        return true;
    }
}

$(function () {
    login.doInit();
});