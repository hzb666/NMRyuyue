// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @icon         http://skl.bjmu.edu.cn/images/logo/logo-console-84.png
// @match        http://skl.bjmu.edu.cn/Console/Appointment/AppointmentBoxContainer?id=*
// @grant        none
// ==/UserScript==

// ==UserScript==
// @name         New Userscript with GUI
// @namespace    http://tampermonkey.net/
// @version      0.2
// @icon         http://skl.bjmu.edu.cn/images/logo/logo-console-84.png
// @match        http://skl.bjmu.edu.cn/Console/Appointment/AppointmentBoxContainer?id=*
// @grant        none
// ==/UserScript==

// 初始化可更改区域的变量
var targetTime = '22:59:59'; // 23:00北京时间
var customHour = 16; // 自定义预约时间的小时（北京时间）
var customMinute = 0; // 自定义预约时间的分钟
var Period = 12; // 自定义时间段个数
var DateFrom = 2; // 自定义距今几天

var timeList = []; // 初始化为空数组
var timeListData = localStorage.getItem('timeList');
var backupDatesData = localStorage.getItem('backupDates'); // 从localStorage获取备份日期
var interval2 = null;

if (timeListData) {
    timeList = JSON.parse(timeListData);
}

var backupDates = backupDatesData ? JSON.parse(backupDatesData) : []; // 如果没有备份日期，初始化为空数组

// 创建图形界面
(function() {
    'use strict';

    // 创建浮动面板
    var panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.width = '250px';
    panel.style.backgroundColor = 'white';
    panel.style.border = '2px solid #ccc';
    panel.style.padding = '10px';
    panel.style.zIndex = '9999';
    document.body.appendChild(panel);

    // 添加拖拽功能
    panel.onmousedown = function(event) {
        var offsetX = event.clientX - panel.getBoundingClientRect().left;
        var offsetY = event.clientY - panel.getBoundingClientRect().top;

        function mouseMoveHandler(e) {
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }

        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };
    // 添加标题
    var title = document.createElement('h3');
    title.innerText = '预约设置';
    panel.appendChild(title);

    // 目标时间输入框
    var targetTimeLabel = document.createElement('label');
    targetTimeLabel.innerText = '脚本运行时间 (HH:mm:ss):';
    panel.appendChild(targetTimeLabel);
    var targetTimeInput = document.createElement('input');
    targetTimeInput.type = 'text';
    targetTimeInput.value = targetTime;
    panel.appendChild(targetTimeInput);
    panel.appendChild(document.createElement('br'));

    // 自定义预约时间输入框
    var customHourLabel = document.createElement('label');
    customHourLabel.innerText = '预约小时:';
    panel.appendChild(customHourLabel);
    var customHourInput = document.createElement('input');
    customHourInput.type = 'number';
    customHourInput.value = customHour;
    panel.appendChild(customHourInput);
        panel.appendChild(document.createElement('br'));

    var customMinuteLabel = document.createElement('label');
    customMinuteLabel.innerText = '预约分钟:';
    panel.appendChild(customMinuteLabel);
    var customMinuteInput = document.createElement('input');
    customMinuteInput.type = 'number';
    customMinuteInput.value = customMinute;
    panel.appendChild(customMinuteInput);
    panel.appendChild(document.createElement('br'));

    // 时间段个数输入框
    var periodLabel = document.createElement('label');
    periodLabel.innerText = '时间段个数:';
    panel.appendChild(periodLabel);
    var periodInput = document.createElement('input');
    periodInput.type = 'number';
    periodInput.value = Period;
    panel.appendChild(periodInput);
    panel.appendChild(document.createElement('br'));

    // 距今几天输入框
    var dateFromLabel = document.createElement('label');
    dateFromLabel.innerText = '距今几天:';
    panel.appendChild(dateFromLabel);
    var dateFromInput = document.createElement('input');
    dateFromInput.type = 'number';
    dateFromInput.value = DateFrom;
    panel.appendChild(dateFromInput);
    panel.appendChild(document.createElement('br'));

    // 保存按钮
    var saveButton = document.createElement('button');
    saveButton.innerText = '保存设置';
    saveButton.onclick = function() {
        targetTime = targetTimeInput.value;
        customHour = parseInt(customHourInput.value, 10);
        customMinute = parseInt(customMinuteInput.value, 10);
        Period = parseInt(periodInput.value, 10);
        DateFrom = parseInt(dateFromInput.value, 10);
        localStorage.setItem('targetTime', targetTime);
        localStorage.setItem('customHour', customHour);
        localStorage.setItem('customMinute', customMinute);
        localStorage.setItem('Period', Period);
        localStorage.setItem('DateFrom', DateFrom);
        alert('设置已保存');
    };
    panel.appendChild(saveButton);

    // 从localStorage加载已保存的设置
    if (localStorage.getItem('targetTime')) targetTime = localStorage.getItem('targetTime');
    if (localStorage.getItem('customHour')) customHour = parseInt(localStorage.getItem('customHour'), 10);
    if (localStorage.getItem('customMinute')) customMinute = parseInt(localStorage.getItem('customMinute'), 10);
    if (localStorage.getItem('Period')) Period = parseInt(localStorage.getItem('Period'), 10);
    if (localStorage.getItem('DateFrom')) DateFrom = parseInt(localStorage.getItem('DateFrom'), 10);

    // 原有的逻辑保持不变...
    function checkTimeAndAct() {
        var currentDate = new Date();
        var currentTime = currentDate.toTimeString().split(' ')[0];
        var currentDay = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

        console.log('Current Time:', currentTime);

        if (currentTime === targetTime) {
            var backupDate = new Date(currentDate);
            backupDate.setDate(backupDate.getDate() + DateFrom); // 获取第几天
            backupDate.setHours(customHour, customMinute, 0, 0); // 设置为自定义时间（北京时间）

            backupDates = [];
            for (var i = 0; i < Period; i++) {
                var year = backupDate.getFullYear();
                var month = String(backupDate.getMonth() + 1).padStart(2, '0');
                var day = String(backupDate.getDate()).padStart(2, '0');
                var hours = String(backupDate.getHours()).padStart(2, '0');
                var minutes = String(backupDate.getMinutes()).padStart(2, '0');
                var formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:00`;

                backupDates.push(formattedDate);
                backupDate.setMinutes(backupDate.getMinutes() + 30);
            }

            localStorage.setItem('backupDates', JSON.stringify(backupDates));
            timeList = backupDates;
            localStorage.setItem('timeList', JSON.stringify(timeList));
            console.log('Backup dates:', backupDates);
            console.log('Time list:', timeList);
        }

        var isRefreshRequired = localStorage.getItem('refreshRequired');
        if (currentTime === targetTime && currentDay !== 5 && currentDay !== 6) {
            if (isRefreshRequired !== 'true') {
                localStorage.setItem('refreshRequired', 'true');
                location.replace(location.href);
            }
        }
        if (currentTime === targetTime && (currentDay === 5 || currentDay === 6)) {
                // 只有在星期五或星期六时生成预约，不刷新
                setTimeout(function () {
                    doGenerateNextWeekAppointmentTimes('56cf339b-4442-4d58-b6ef-0e556395bde1')},500);

                setTimeout(function () {
                    localStorage.setItem('refreshRequired', 'true')},500);
            }


        if (isRefreshRequired) {
            // 预约操作逻辑...
            setTimeout(function () {
                localStorage.removeItem('refreshRequired');
                var isSubmitClicked = false;
                console.log('Backup dates:', backupDates);
                console.log(time_step);
                for (var i = 0; i < timeList.length; i++) {
                    var time_step = timeList[i];
                    var targetElement = document.getElementById(time_step.replace(/\//g, '-'));

                    console.log(`Trying to click on: ${time_step}`, targetElement); // 调试日志

                    if (targetElement && !targetElement.disabled && targetElement.offsetParent !== null) {
                        // 触发 mousedown 事件
                        var mouseDownEvent = new MouseEvent("mousedown", {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        targetElement.dispatchEvent(mouseDownEvent);

                    } else {
                        console.warn(`Element with ID ${time_step} not found or not interactable!`); // 警告日志
                    }
                }

                var nextStepButton = document.getElementById("nextStep");
                if (nextStepButton) {
                    nextStepButton.click();
                }

                function checkAndFillInput() {
                    var ExperimentationContentInput = document.getElementById("ExperimentationContent");
                    if (ExperimentationContentInput) {
                        ExperimentationContentInput.value = "1";
                        var nextStepButton2 = document.getElementById("nextStep2");
                        nextStepButton2.click();
                        clearInterval(interval);
                        interval2 = setTimeout(lastStep, 200);
                    }
                }

                var interval = setInterval(checkAndFillInput, 200);

                function lastStep() {
                    if (isSubmitClicked) return;
                    var spans = document.querySelectorAll('span');
                    for (var i = 0; i < spans.length; i++) {
                        var span = spans[i];
                        if (span.textContent.includes("我已仔细阅读并同意以上条款")) {
                            span.click();
                            setTimeout(function () {
                                var nextStepButton3 = document.getElementById("submitBooking");
                                nextStepButton3.click();
                                isSubmitClicked = true;
                                clearInterval(interval2);
                            }, 100);
                            setTimeout(function () {
                                location.reload();
                            }, 9800);
                            break;
                        }
                    }
                }

            }, 500);
        }
    }

    setInterval(checkTimeAndAct, 1000);
    console.log('Script is running!');

})();
