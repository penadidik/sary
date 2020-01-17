(function () {
    var requestPool = [];
    var orgOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (qq) {
        var updateProgress = function (evt) {
            //프로그래스 로딩바를 사용하는 경우 쓸 수 있음.
        };
        var transferComplete = function (evt) {
            //console.log(evt);
            var code = 200;
            try {
                code = JSON.parse(evt.currentTarget.response).code;
            } catch (e) {}
            if (code == 403) {
                console.log(code);
                jmessager.show({
                    title: 'Session expired',
                    msg: 'Please login again.',
                    fn: function () { 
                        Controller.doLogout();
                    }
                });               
            }else if (code == 401) {
                console.log(code);
                jmessager.show({
                    title: 'Unauthorized',
                    msg: 'Please login first.',
                    fn: function () { 
                        Controller.doLogout();
                    }
                });               
            }
        };
        var transferFailed = function (evt) {};
        var transferCanceled = function (evt) {};

        var loadEndEvent = function (evt) {};

        this.addEventListener("progress", updateProgress);
        this.addEventListener("load", transferComplete);
        this.addEventListener("error", transferFailed);
        this.addEventListener("abort", transferCanceled);
        this.addEventListener("loadend", loadEndEvent);

        orgOpen.apply(this, arguments);
    };
})();