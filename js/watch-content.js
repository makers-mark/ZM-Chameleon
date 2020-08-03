"use strict";

var ref = document.referrer;
var monitorName = document.getElementById('monitorName').innerText;
var showFps;
var cancelAlarm = document.getElementById('cancelAlarmLink');
var forceAlarm = document.getElementById('forceAlarmLink');
var lockRecordButton = false;
var disableRecordOnAlert = true;
var recordButtonSize = 70;
var state = 'Idle';

if (ref.indexOf('view=montage') > 0){
    var recordDiv;
    var recordButton;
    var content = document.getElementById('content');

    function showFpsFunc(color = '#ffffff', x = 0, y = 80){
        const config = {childList: true};        
        var fpsDiv = document.createElement('div');
        fpsDiv.id = 'fpsDiv';
        fpsDiv.draggable = true;
        fpsDiv.style.color = color;

        fpsDiv.style.left = x + 'px';
        fpsDiv.style.top = y + 'px';

        const fps = document.getElementById('fpsValue');
        const fpsCallback = (mutation) => fpsDiv.innerText = mutation[0].addedNodes[0].data;
        const fpsObserver = new MutationObserver(fpsCallback);
        fpsObserver.observe(fps, config);    

        content.appendChild(fpsDiv);
        fpsDiv.addEventListener('dragend', (event) => {
            event.preventDefault();
            fpsDiv.parentNode.removeChild(fpsDiv);
            chrome.runtime.sendMessage({setFps: true, x: event.clientX, y: event.clientY});
            showFpsFunc(color, event.clientX, event.clientY);
        });
    }

    function placeDiv(x, y){
        var offset = [];
        recordDiv = document.createElement('div');
        var recordText = document.createTextNode('REC');
        recordButton = document.createElement('button');
        recordButton.style.backgroundColor = 'darkred';
        recordButton.style.width = recordButton.style.height = recordButton.style.borderRadius = recordDiv.style.fontSize = recordButtonSize + 'px';
        recordButton.id = 'recordButton';

        recordDiv.appendChild(recordButton);
        recordDiv.appendChild(recordText);
        recordDiv.style.position = 'fixed';
        recordDiv.style.top = y + 'px';
        recordDiv.style.left = x + 'px';
        recordDiv.id = 'recordDiv';
        recordDiv.draggable = !lockRecordButton;
        recordDiv.className = recordButton.className = state;
        content.appendChild(recordDiv);

        if (!lockRecordButton){
            recordDiv.addEventListener('dragend', (event) => {
                event.preventDefault();
                recordDiv.parentNode.removeChild(recordDiv);
                chrome.runtime.sendMessage({setMonitor: true, monitorName: monitorName, positionX: event.clientX - offset[0], positionY: event.clientY - offset[1]});

                placeDiv(event.clientX - offset[0], event.clientY - offset[1]);
            });
        
            recordDiv.addEventListener('mousedown', (event) => {
                //handle the click position on the div
                let bounds = recordDiv.getBoundingClientRect();
                offset = [
                    event.clientX - bounds.left, 
                    event.clientY - bounds.top
                ];
            });            
        }

        recordDiv.addEventListener('click', () => {
            if (state === 'Idle'){
                forceAlarm.click();
/*  This code below allows for an immediate animation when you click the REC div
    and allows for non-recordable monitors to lose the animation and class if the state 
    doesn't change, the question is how long to wait? Could make an option for it.
    Response times can vary and machines vary. I will leave this alone for now.
    There is probably a better way around this in the options page.*/

                recordButton.className = recordDiv.className = 'Alarm';
                setTimeout(() => { 
                    if (state === 'Idle'){
                        recordButton.className = recordDiv.className = state;
                    }
                }, 1500);
            } else if (state === 'Alert' && !disableRecordOnAlert){
                forceAlarm.click();
            } else {
                cancelAlarm.click();
            }
        });
    }

    chrome.runtime.sendMessage({fullscreenWatch: true, monitorName: monitorName}, (msg) =>{
        lockRecordButton = msg.lockRecordButton;
        disableRecordOnAlert = msg.disableRecordOnAlert;
        recordButtonSize = msg.recordButtonSize;
        if (forceAlarm && cancelAlarm){
            placeDiv(msg.obj[monitorName].x, msg.obj[monitorName].y);
            const recording = document.getElementById('stateValue');
            const config = {childList: true};
            const callback = (mutation) => {
                state = mutation[0].addedNodes[0].data;
                console.log(state);
                recordButton.className = recordDiv.className = state;
            };
            const observer = new MutationObserver(callback);
            observer.observe(recording, config);
        }
        if (msg.showFps){
            showFpsFunc(msg.fpsColor, msg.x, msg.y);
        }
    }); 

    //The page was navigated to from the montage screen which opens a new
    //window, so close it on double click
    document.ondblclick = (e) => {
        e.preventDefault();
        window.close();
    };
} else {
    chrome.runtime.sendMessage({fullscreenWatch: false}, (re) => {});
    //The page was navigated to from the console screen which opens in the
    //same window, so don't close it and just go back.
    document.ondblclick = (e) => {
        e.preventDefault();
        window.history.back();
    }
}