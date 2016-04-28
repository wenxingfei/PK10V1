/**
 * Created by Felix on 2016/4/26.
 */
var pk10 = pk10 || {};
pk10.licenseMgr = function(){

    var onCopyUuidBtnClick = function(){
        clipboard.copy(
            device.uuid,
            function(r){
                window.plugins.toast.showShortCenter("复制成功！");
            },
            function(e){
                window.plugins.toast.showShortCenter("复制失败！");
            }
        );
    };

    var onRegisterBtnClick = function(success){
        var license = $('#license').val();
        localStorage.license = license;
        if(!license){
            window.plugins.toast.showShortCenter("请输入授权码！");
            return;
        }
        var checkResult = licenseService.checkLicense(license);
        if(checkResult.isValid){
            alert("授权成功，有效期至{0}。".format(checkResult.exirationDate.format("yyyy-MM-dd")));
            $('#licensePopup').popup('close');
            if(success) success();
        } else if(checkResult.exirationDate){
            window.plugins.toast.showShortCenter("授权码已过期！");
        } else {
            window.plugins.toast.showShortCenter("授权码不正确！");
        }
    };

    var openRegisterWin = function(success){
        if($('#licensePopup').length){
            $('#licensePopup').popup('open');
            return;
        }

        $.get('licensePopup.html', function(html){
            //var $popup = $(html);
            //$popup.appendTo('body');
            //$popup.trigger("create");
            var $popup = $(html);
            $popup.appendTo("div[data-role=page]:first");
            $popup.trigger('create');
            $('#licensePopup').popup();
            $('#uuid').text(device.uuid);
            $('#btnCopyUuid').click(onCopyUuidBtnClick);
            $('#btnRegister').click(function(){onRegisterBtnClick(success)});
            $('#btnQuit').click(navigator.app.exitApp);
            $('#licensePopup').popup('open');
        });
    };

    var properties = {
        /*
        @function 打开注册弹窗
        @params
        @return
         */
        openRegisterWin: openRegisterWin
    };

    return properties;
}();