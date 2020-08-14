(() => {
    "use strict";

    let ref = document.referrer;
    let monitorName = document.getElementById('monitorName').innerText;
    let cancelAlarm = document.getElementById('cancelAlarmLink');
    let forceAlarm = document.getElementById('forceAlarmLink');
    let lockRecordButton = false;
    let disableRecordOnAlert = true;
    let recordButtonSize = 70;
    let state = 'Idle';
    let fpsSize = 30;
    let fpsX = undefined;
    let fpsY = undefined;
    let recX;
    let recY;
    const config = {childList: true};

    if (ref.includes('view=montage')){
        let recordDiv;
        let recordButton;
        let content = document.getElementById('content');
        const fps = document.getElementById('fpsValue');
        const fpsCallback = (mutation) => fpsDiv.innerText = mutation[0].addedNodes[0].data;
        const fpsObserver = new MutationObserver(fpsCallback);
        fpsObserver.observe(fps, config);        
        document.addEventListener('mousedown', (e) => {
            if (e.which === 2){
            e.preventDefault();
            chrome.runtime.sendMessage({fullscreen: true});
            }
        });
 

        const showFpsFunc = (color = '#ffffff', x, y) => {
            let offset = [];

            let fpsDiv = document.createElement('div');
            fpsDiv.id = 'fpsDiv';
            fpsDiv.draggable = true;
            fpsDiv.style.fontSize = `${fpsSize}px`;
            fpsDiv.style.color = color;

            //If the fps position has never been set, it will be 'undefined' and we will
            //put it at the bottom center of the maximized window. After it has been moved
            //and set somewhere else, we use the pixel position of the top-left corner of the div.
            x ? fpsDiv.style.left = `${x}px` : fpsDiv.style.left = 'calc(50vw - 1.6em';
            y ? fpsDiv.style.top = `${y}px` : fpsDiv.style.top = 'calc(100vh - 1.3em)';

            content.appendChild(fpsDiv);
            fpsDiv.addEventListener('mousedown', (event) => {
                //handle the click position on the div
                let bounds = fpsDiv.getBoundingClientRect();
                offset = [
                    event.clientX - bounds.left,
                    event.clientY - bounds.top
                ];
            });
            fpsDiv.addEventListener('dragend', (event) => {
                event.preventDefault();
                fpsX = event.clientX - offset[0];
                fpsY = event.clientY - offset[1];
                fpsDiv.parentNode.removeChild(fpsDiv);
                chrome.runtime.sendMessage({setMonitor: true, monitorName: monitorName, positionX: recX, positionY: recY, fpsPosX: fpsX, fpsPosY: fpsY});
                showFpsFunc(color, fpsX, fpsY);
            });
        }

        const placeDiv = (x, y) => {
            let offset = [];
            recordDiv = document.createElement('div');
            let recordText = document.createTextNode('REC');
            recordButton = document.createElement('button');
            recordButton.style.backgroundColor = 'darkred';
            recordButton.style.width = recordButton.style.height = recordButton.style.borderRadius = recordDiv.style.fontSize = `${recordButtonSize}px`;
            recordButton.id = 'recordButton';

            recordDiv.appendChild(recordButton);
            recordDiv.appendChild(recordText);
            recordDiv.style.position = 'fixed';
            recordDiv.style.top = `${y}px`;
            recordDiv.style.left = `${x}px`;
            recordDiv.id = 'recordDiv';
            recordDiv.draggable = !lockRecordButton;
            recordDiv.className = recordButton.className = state;
            content.appendChild(recordDiv);

            if (!lockRecordButton){
                recordDiv.addEventListener('dragend', (event) => {
                    event.preventDefault();
                    recordDiv.parentNode.removeChild(recordDiv);
                    recX = event.clientX - offset[0];
                    recY = event.clientY - offset[1];                    
                    chrome.runtime.sendMessage({setMonitor: true, monitorName: monitorName, positionX: recX, positionY: recY, fpsPosX: fpsX, fpsPosY: fpsY});
                    placeDiv(recX, recY);
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
                    There is probably a better way around this.*/

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

        chrome.runtime.sendMessage({fullscreenWatch: true, monitorName: monitorName}, reply => {
            if (reply){
                lockRecordButton = reply.lockRecordButton;
                disableRecordOnAlert = reply.disableRecordOnAlert;
                recordButtonSize = reply.recordButtonSize;
                fpsSize = reply.fpsSize;
                if (forceAlarm && cancelAlarm){
                    placeDiv(reply.obj[monitorName].x, reply.obj[monitorName].y);
                    const recording = document.getElementById('stateValue');
                    const callback = mutation => {
                        state = mutation[0].addedNodes[0].data;
                        recordButton.className = recordDiv.className = state;
                    };
                    const observer = new MutationObserver(callback);
                    observer.observe(recording, config);
                }
                if (reply.showFps) showFpsFunc(reply.fpsColor, reply.obj[monitorName].fpsPosX, reply.obj[monitorName].fpsPosY);
            }
        });

        //The page was navigated to from the montage screen which opens a new
        //window, so close it on double click
        document.ondblclick = e => {
            e.preventDefault();
            window.close();
        };
    } else {
        chrome.runtime.sendMessage({fullscreenWatch: false});
        //The page was navigated to from the console screen which opens in the
        //same window, so don't close it and just go back.
        document.ondblclick = e => {
            e.preventDefault();
            window.history.back();
        }
    }
})();