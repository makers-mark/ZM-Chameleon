"use strict";

var ref = document.referrer;
var monitorName = document.getElementById('monitorName').innerText;
var showFps;
var cancelAlarm = document.getElementById('cancelAlarmLink');
var forceAlarm = document.getElementById('forceAlarmLink');
var lockRecordButton = false;

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

    function placeDiv(recording, x, y){
        var offset = [];
        recordDiv = document.createElement('div');
        var recordText = document.createTextNode('REC');
        recordButton = document.createElement('button');
        recordButton.style.backgroundColor = 'darkred';
        recordButton.id = 'recordButton';

        recordDiv.appendChild(recordButton);
        recordDiv.appendChild(recordText);
        recordDiv.style.position = 'fixed';
        recordDiv.style.top = y + 'px';
        recordDiv.style.left = x + 'px';
        recordDiv.id = 'recordDiv';
        if (!lockRecordButton) {recordDiv.draggable = true;}
        if (recording){
            recordDiv.className = recordButton.className = 'recording';
        } else {
            recordDiv.className = recordButton.className = 'notRecording';
        }
        content.appendChild(recordDiv);

        if (!lockRecordButton){
            recordDiv.addEventListener('dragend', (event) => {
                event.preventDefault();
                let recording = 0;
                if (recordButton.classList.contains('recording')){
                    recording = 1;
                }
                recordDiv.parentNode.removeChild(recordDiv);
                chrome.runtime.sendMessage({setMonitor: true, monitorName: monitorName, positionX: event.clientX - offset[0], positionY: event.clientY - offset[1]});

                placeDiv(recording, event.clientX - offset[0], event.clientY - offset[1]);
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
            if (recordButton.classList.contains('recording')){
                if (recordButton.classList.contains('alerting')){
                    recordDiv.className = recordButton.className = 'recording';
                    forceAlarm.click();                    
                    return;
                }
                recordDiv.className = 'notRecording'
                recordButton.className = 'alerting';
                cancelAlarm.click();
            } else {
                recordDiv.className = recordButton.className = 'recording';
                forceAlarm.click();
            }
        });
    }

    chrome.runtime.sendMessage({fullscreenWatch: true, monitorName: monitorName}, (msg) =>{
        lockRecordButton = msg.lockRecordButton;
        if (forceAlarm && cancelAlarm){
            placeDiv(0, msg.obj[monitorName].x, msg.obj[monitorName].y);
            const recording = document.getElementById('stateValue');
            const config = {childList: true};
            const callback = (mutation) => {
                var state = mutation[0].addedNodes[0].data;
                if (state === 'Alarm' || state === 'Alert'){
                    recordButton.className = recordDiv.className = 'recording';
                    if (state === 'Alert'){
                        recordButton.classList.add('alerting');
                    }
                } else {
                    recordButton.className = recordDiv.className = 'notRecording';
                }
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
    chrome.runtime.sendMessage({fullscreenWatch: false}, (re) => {
        //console.log(re);
    });
    //The page was navigated to from the console screen which opens in the
    //same window, so don't close it and just go back.
    document.ondblclick = (e) => {
        e.preventDefault();
        window.history.back();
    }
}