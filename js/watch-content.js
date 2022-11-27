(() => {
    "use strict";

    let state = 'Idle';
    let fpsX;
    let fpsY;
    let recX;
    let recY;
    let windowState;
    let overrideZoom;
    let zoomFactor;

    document.addEventListener('DOMContentLoaded', () => {
        let monitorName = document.getElementById('monitorName') || document.getElementsByTagName('img')[0].alt;//document.getElementsByTagName('h2')[0];
        monitorName = monitorName.innerHTML || monitorName;
        let cancelAlarm = document.getElementById('cancelAlarmLink') || document.getElementById('enableAlmBtn');
        let forceAlarm = document.getElementById('forceAlarmLink') || document.getElementById('forceAlmBtn');
        let content = document.getElementById('content');
        let recordDiv;
        let recordButton;
        let maximizeSingleView;

        chrome.runtime.sendMessage({
            watchPageOpen: true,
            monitorName: monitorName
        }, reply => {
            if (reply){
                windowState = reply.windowState;
                maximizeSingleView = reply.maximizeSingleView;
                overrideZoom = reply.overrideZoom;
                zoomFactor = reply.zoomFactor;

                if (overrideZoom) setupZoom();
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
                        mutation[0].target.innerText || ''; //With version 1.35.15 two mutations started showing because the state is 'updated', even if it hasn't changed, because the fpsvalue changes
                                                                                //Commit: https://github.com/ZoneMinder/zoneminder/commit/6e17b04a7e901f7ad6546fb0dccd9cd7a7efbb36
                    }).observe(
                        document.querySelector('[id^="stateValue"]'),
                        {
                            attributeOldValue: false,
                            characterData: false,
                            subtree: false,
                            childList: false,
                            attributeFilter: [
                                "class"
                            ]
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

        //The montage page opens a monitor in a new
        //window, so close it on double click
        document.addEventListener("dblclick", e => {

            if (windowState === 'popup'){  //Fix this, add window.type and windowType for popup to happen in older versions of zm
                window.close()
            } else {
                window.history.back();
                if (maximizeSingleView && windowState === 'normal'){
                    chrome.runtime.sendMessage({fullscreenToggle: true});
                }
            }
            //chrome.runtime.sendMessage({goToConsole: true});
        });

        const setupZoom = () => {
            //override the default zoneminder zoom in watch.js
            const script = document.createElement('script');
            script.textContent = `function handleClick(){}`;
            document.head.appendChild(script);

            //Do not display the Ctrl-click zoom options on hover through the title attribute
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `#imageFeed, div#content > div {pointer-events: none !important;}`
            document.head.appendChild(style);

            let scale     = 1;
            let isPanning = false;
            let pointX    = 0;
            let pointY    = 0;
            let initialXY = {x: 0, y: 0};
            //const imageFeed = document.getElementById("imageFeed");
            const imageFeed = document.querySelector('div#content > div')

            imageFeed.style.title = '0';

            imageFeed.style.transformOrigin = '0 0';
    
            function setTransform(){imageFeed.style.transform = "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";}
            
            content.addEventListener("mousedown", e => {
                //console.log(e.target);
                if (e.target.id == 'content' || e.target.id.includes('liveStream')){
                    e.preventDefault();
                    if (e.which === 2){
                        //Reset the zoom when the middle mouse button is pressed
                        imageFeed.style.transform = 'translate(0px, 0px) scale(1)';
                        imageFeed.style.top       = imageFeed.style.left = pointX = pointY = 0;
                        scale                     = 1;
                        initialXY                 = {x: 0, y: 0};
                    } else {
                        initialXY = { x: e.clientX - pointX, y: e.clientY - pointY };
                        isPanning = true;
                    }
                }
            });

            content.addEventListener("mouseup", e => {
                isPanning = false;
            });

            content.addEventListener("mousemove", e => {
                //e.preventDefault();
                //console.log(e.target);
                if (!isPanning) {
                    return;
                }
                pointX = (e.clientX - initialXY.x);
                pointY = (e.clientY - initialXY.y);
                setTransform();
            });

            content.addEventListener('wheel', e => {
                e.preventDefault();
                const xScale = (e.clientX - pointX) / scale;
                const yScale = (e.clientY - pointY) / scale;
                const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

                (delta > 0) ? (scale *= zoomFactor) : (scale /= zoomFactor);

                pointX = e.clientX - xScale * scale;
                pointY = e.clientY - yScale * scale;

                setTransform();
            }, {passive: false});
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
                fpsSpan.textContent = mutation[0].target.innerText || '';
            }).observe(
                document.getElementById('fpsValue') || document.querySelector('[id*="FPSValue"]'),
                {
                    attributeOldValue: false,
                    characterData: true,
                    subtree: false,
                    childList: true,
                    attributes: false
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
                    }, 3000);
                } else if (state === 'Alert' && !disableRecordOnAlert){
                    forceAlarm.click();
                } else {
                    cancelAlarm.click();
                }
            });
        };
    }); //DOMContentLoaded
})();