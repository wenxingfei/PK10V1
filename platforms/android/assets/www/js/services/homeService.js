﻿var homeService = function() {
    var _currentPeriodNumber = 0;
    var _nextAwardTime = new Date;
    var _isTableInited = false;
    var _tableService = awardTableService.newInstance;
    var _timer;
    var _taskId1;
    var _taskId2;

    var insertNewAwardResultToTable = function(awardResult) {
        var $tr = _tableService.createTableRow(awardResult);
        $('#tbTodayResult tbody').prepend($tr);
    };

    var updateCurrentAwardInfo = function(data){
        var awardNumbers = data.current.awardNumbers;
        var $balls = $('#currentAwardNumbers').children();
        $(awardNumbers).each(function(i, num){
            $balls[i].className = "no" + num;
        });
        $('#currentPeriodNumber').text(pk10.msgs.currentPeriodNumber.format(data.current.periodNumber));
    };

    var updateNextTimeInfo = function(){
        var timeSpan = Date.getTimeSpan(new Date(), _nextAwardTime);
        var hours = timeSpan.days ? timeSpan.days * 24 + timeSpan.hours : timeSpan.hours;
        var strHours = hours.toString();
        var strMinutes = timeSpan.minutes.toString();
        var strSeconds = timeSpan.seconds.toString();
        if(strHours.length == 1) strHours = "0" + strHours;
        if(strMinutes.length == 1) strMinutes = "0" + strMinutes;
        if(strSeconds.length == 1) strSeconds = "0" + strSeconds;
        if(timeSpan.days){
            $('#days').text(timeSpan.days + "天");
            $('#days').show();
        } else{
            $('#days').hide();
        }
        $('#hours').text(strHours);
        $('#minutes').text(strMinutes);
        $('#seconds').text(strSeconds);
    };

    var showWaittingAwardResultMsg = function(){
        $('#currentAwardNumbers').hide();
        $('#currentPeriodNumber').text(pk10.msgs.currentPeriodNumber.format(_currentPeriodNumber + 1));
        $('#waittingMsg').show();
        $('#hours').text("00");
        $('#minutes').text("00");
        $('#seconds').text("00");
    };

    var hideWaittingAwardResultMsg = function(){
        $('#currentAwardNumbers').show();
        $('#waittingMsg').hide();
    };

    var onAwardDataUpdate = function(data){
        insertNewAwardResultToTable(data.current);
        updateCurrentAwardInfo(data);
    };

    var startTimedTask = function () {
        clearTimedTask();
        _timer = setInterval(function () {
            if(!_isTableInited) return;
            var currentTime = new Date();
            if (currentTime.getTime() > _nextAwardTime.getTime()) {
                showWaittingAwardResultMsg();
                awardDataService.getCurrentAwardResult(function (data) {
                    if (data.current.periodNumber > _currentPeriodNumber) {
                        _currentPeriodNumber = data.current.periodNumber;
                        _nextAwardTime = data.next.awardTime;
                        onAwardDataUpdate(data);
                    }
                });
            } else{
                hideWaittingAwardResultMsg();
                updateNextTimeInfo();
            }
        }, 1000);
    };

    var clearTimedTask = function(){
        if (_timer) clearInterval(_timer);
    };

    var startTimedUpdateTableTask = function(){
        if(_taskId1) timedTaskService.removeTask(_taskId1);
        _taskId1 = timedTaskService.addTask(function(){
            if(!_isTableInited) return;
            var currentTime = new Date();
            if (currentTime.getTime() > _nextAwardTime.getTime()) {
                showWaittingAwardResultMsg();
                awardDataService.getCurrentAwardResult(function (data) {
                    if (data.current.periodNumber > _currentPeriodNumber) {
                        _currentPeriodNumber = data.current.periodNumber;
                        _nextAwardTime = data.next.awardTime;
                        onAwardDataUpdate(data);
                    }
                });
            } else{
                hideWaittingAwardResultMsg();
            }
        });
    };

    var startTimedUpdateNextTimeInfoTask = function(){
        if(_taskId2) timedTaskService.removeTask(_taskId2);
        _taskId2 = timedTaskService.addTask(function(){
            var currentTime = new Date();
            if (currentTime.getTime() < _nextAwardTime.getTime()){
                updateNextTimeInfo();
            }
        });
    };
    
    var properties = {
        initTable: function(success, error){
            _isTableInited = false;
            _tableService.initTable(new Date, $('#tbTodayResult'), function(currentAwardResult){
                _currentPeriodNumber = currentAwardResult.periodNumber;
                //获取最新一期的开奖数据
                awardDataService.getCurrentAwardResult(function (data) {
                    if (data.current.periodNumber > _currentPeriodNumber) {
                        _currentPeriodNumber = data.current.periodNumber;
                        insertNewAwardResultToTable(data.current);
                    }
                    _nextAwardTime = data.next.awardTime;
                    _isTableInited = true;
                    if (success) success();
                }, function (err) {
                    window.plugins.toast.showLongCenter(pk10.msgs.getCurrentAwardDataFailed);
                    if(error) error(err);
                });
            }, error);
        },
        initCurrentAwardInfo: function(){
            awardDataService.getCurrentAwardResult(function (data) {
                _currentPeriodNumber = data.current.periodNumber;
                _nextAwardTime = data.next.awardTime;
                updateCurrentAwardInfo(data);
            });
        },
        strartTimedUpdateData: function(){
            //startTimedTask();
            startTimedUpdateTableTask();
            startTimedUpdateNextTimeInfoTask();
        }
    };

    return properties;
}();