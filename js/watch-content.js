(() => {
    "use strict";

    let state = 'Idle';
    let fpsX;
    let fpsY;
    let recX;
    let recY;
    let windowType;

    document.addEventListener('DOMContentLoaded', () => {

        let monitorName = document.getElementById('monitorName').innerText;
        let cancelAlarm = document.getElementById('cancelAlarmLink');
        let forceAlarm = document.getElementById('forceAlarmLink');
        let content = document.getElementById('content');
        let recordDiv;
        let recordButton;
        let maximizeSingleView;

        chrome.runtime.sendMessage({
            watchPageOpen: true,
            monitorName: monitorName
        }, reply => {
            if (reply){
                windowType = reply.windowType;
                maximizeSingleView = reply.maximizeSingleView;
                if (forceAlarm && cancelAlarm){
                    placeDiv(
                        recX = reply.obj[monitorName].x,
                        recY = reply.obj[monitorName].y,
                        reply.lockRecordButton,
                        reply.recordButtonSize,
                        reply.disableRecordOnAlert
                    );
                    const observer = new MutationObserver( mutation => {
                        recordButton.className = 
                        recordDiv.className = 
                        state = 
                        mutation[0].addedNodes[0].data
                    }).observe(
                        document.getElementById('stateValue'),
                        {
                            childList: true
                        }
                    );
                }
                if (reply.showFps) showFpsFunc(
                    reply.fpsColor,
                    fpsX = reply.obj[monitorName].fpsPosX,
                    fpsY = reply.obj[monitorName].fpsPosY,
                    undefined,   //Init value of 0.00 fps until the fps mutation observer updates.
                    reply.fpsSize
                );
            }
        });  

        document.addEventListener('mousedown', (e) => {
            if (e.which === 2){
                e.preventDefault();
                chrome.runtime.sendMessage({fullscreen: true});
            }
        });

        //The montage page opens a monitor in a new
        //window, so close it on double click
        document.ondblclick = e => {
            e.preventDefault();
            if (windowType === 'popup'){
                window.close()
            } else {
                window.history.back();
                if (maximizeSingleView){
                    chrome.runtime.sendMessage({fullscreen: true});
                }
            }
            //chrome.runtime.sendMessage({goToConsole: true});
        };

        const showFpsFunc = (
            color = '#ffffff',
            x,
            y,
            initValue = '0.00',
            fpsSize = 30
        ) => {
            let offset = [];
            let fpsSpan = document.createElement('span');
            fpsSpan.id = 'fpsSpan';
            fpsSpan.draggable = true;
            fpsSpan.style.lineHeight = fpsSpan.style.height = fpsSpan.style.fontSize = `${fpsSize}px`;
            fpsSpan.style.color = color;
            fpsSpan.textContent = initValue;

            //If the fps position has never been set, it will be 'undefined' and we will
            //put it at the bottom center of the maximized window. After it has been moved
            //and set somewhere else, we use the pixel position of the top-left corner of the span.

            x ? fpsSpan.style.left = `${x}px` : fpsSpan.style.left = 'calc(50vw - 1.6em)';
            y ? fpsSpan.style.top = `${y}px` : fpsSpan.style.top = 'calc(100vh - 1.3em)';
            content.appendChild(fpsSpan);

            fpsSpan.addEventListener('mousedown', e => {
                let bounds = fpsSpan.getBoundingClientRect();
                offset = [
                    e.clientX - bounds.left,
                    e.clientY - bounds.top
                ];
            });

            fpsSpan.addEventListener('dragend', e => {
                //Save the current fps value after a move or else when you
                //move it there is nothing to display until a fps update.
                let initValue = fpsSpan.innerText;
                fpsSpan.remove();
                showFpsFunc(color,
                    fpsX = e.clientX - offset[0],
                    fpsY = e.clientY - offset[1],
                    initValue,
                    fpsSize
                );
                chrome.runtime.sendMessage({
                    setMonitor: true,
                    monitorName: monitorName,
                    positionX: recX,
                    positionY: recY,
                    fpsPosX: fpsX,
                    fpsPosY: fpsY
                });
            });
            const fpsObserver = new MutationObserver( mutation => {
                fpsSpan.textContent = mutation[0].addedNodes[0].data
            }).observe(
                document.getElementById('fpsValue'),
                {
                    childList: true
                }
            );
        };

        const placeDiv = (
            x,
            y,
            lockRecordButton = false,
            recordButtonSize = 70,
            disableRecordOnAlert = false
        ) => {

            let offset = [0, 0];
            recordDiv = document.createElement('span');
            recordButton = document.createElement('button');
            recordButton.style.backgroundColor = 'darkred';
            recordButton.style.width =
            recordButton.style.height =
            recordButton.style.borderRadius = `${recordButtonSize}px`;
            recordButton.id = 'recordButton';

            recordDiv.style.fontSize = `${recordButtonSize}px`;
            recordDiv.style.position = 'fixed';
            recordDiv.style.top = `${y}px`;
            recordDiv.style.left = `${x}px`;
            recordDiv.id = 'recordDiv';
            recordDiv.className = recordButton.className = state;
            recordDiv.draggable = !lockRecordButton;

            recordDiv.appendChild(recordButton);
            recordDiv.appendChild(document.createTextNode('REC'));
            content.appendChild(recordDiv);

            if (!lockRecordButton){
                recordDiv.addEventListener('dragend', e => {
                    recordDiv.remove();
                    placeDiv(
                        recX = e.clientX - offset[0],
                        recY = e.clientY - offset[1],
                        lockRecordButton,
                        recordButtonSize,
                        disableRecordOnAlert
                    );
                    chrome.runtime.sendMessage({
                        setMonitor: true,
                        monitorName: monitorName,
                        positionX: recX,
                        positionY: recY,
                        fpsPosX: fpsX,
                        fpsPosY: fpsY
                    });
                });

                recordDiv.addEventListener('mousedown', e => {
                    //handle the click position on the div
                    let bounds = recordDiv.getBoundingClientRect();
                    offset = [
                        e.clientX - bounds.left,
                        e.clientY - bounds.top
                    ];
                });
            }

            recordDiv.addEventListener('click', () => {
                if (state === 'Idle'){
                    forceAlarm.click();
                /*  This code below allows for an immediate animation when you click the REC div
                    and allows for non-recordable monitors to lose the animation and class if the state
                    doesn't change.*/

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
        };
    }); //DOMContentLoaded
})();