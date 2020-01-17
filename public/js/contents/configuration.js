/** Configuration Js */
var configuration = {
    message: false,
    form: false,
    params: {},
    //url
    url: {
        api: '/restapi/v1/tso/import-configuration-file',
    },
    //이벤트를 바인딩한다.
    doInit: function () {

        var p = this;

        p.form = $('#configuration-form');

        p.doCheckFile();
        //excel file search click event
        $('#configuration-file-upload').bind("click", p.doFindFile);
        $('#configuration-file-text').bind("click", p.doFindFile);

        //excel file register event
        $('#configuration-register').bind("click", p.doRegister);

        //excel file cancle event
        $('#configuration-cancle').bind("click", p.doCancle);

    },
    doFindFile: function (event) {

        if (this.id != 'configuration-file-upload' && this.id != 'configuration-file-text') {
            return false;
        }

        $("#configuration-file-input").trigger('click');
    },
    doRegister: function () {
        if (this.id != 'configuration-register') {
            return false;
        }

        if (!configuration.doValidate())
            return false;

        var p = this;

        var form = configuration.form;
        var data = form.serializeObject();
        var formData = new FormData();

        formData.append("file", $("#configuration-file-input")[0].files[0]);

        $.ajax({
            url: configuration.url.api,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            error: function (xhr, status, error) {
                console.log(error);
            },
            success: function (xml) {
                var code = xml.code;

                if (code == 200) {
                    jmessager.show({
                        msg: jprops.success.uploadConfiguration
                    });
                } else if (code != 403 && code != 401) {
                    console.log(xml);
                    console.log("configuration error");
                    jmessager.show({
                        title: jprops.title.error,
                        msg: jprops.contents.error + xml.error.code
                    });
                }

                configuration.doCancle();
            }
        });


    },
    doCheckFile: function () {

        $("#configuration-file-input").on('change', function () {
            var file_name = $("#configuration-file-input").val().split('/').pop().split('\\').pop();;
            var ext = $("#configuration-file-input").val().split(".").pop().toLowerCase();

            if (ext.length > 0) {
                if ($.inArray(ext, ["xls", "xlsx"]) == -1) {
                    jmessager.show({
                        msg: jprops.validate.file.excel
                    });

                    $("#configuration-file-input").val('');
                    $("#configuration-file-text").val('');
                    return false;
                } else {
                    $("#configuration-file-text").val(file_name);
                }
            }
        });
    },
    doCancle: function () {
        $("#configuration-file-input").val("");
        $("#configuration-file-text").val("");
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

    }
}

$(function () {
    configuration.doInit();
});