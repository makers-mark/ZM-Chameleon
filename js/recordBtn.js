const placeRecordIcon = ( lockRecordButton = false, recordButtonSize = 70, disableRecordOnAlert = false ) => {
    let monitorName = document.getElementById('monitorName') || document.getElementsByTagName('img')[0].alt;
    monitorName     = monitorName.innerHTML || monitorName;
    let cancelAlarm = document.getElementById('cancelAlarmLink') || document.getElementById('enableAlmBtn');
    let forceAlarm  = document.getElementById('forceAlarmLink') || document.getElementById('forceAlmBtn');

    if ( !cancelAlarm || !forceAlarm ) return;

    const moveRecordIcon = position => {
        recordDiv.style.left = `${position.x}px`;
        recordDiv.style.top = `${position.y}px`;
    };

    let state = 'Idle';
    const recordDiv = document.createElement('span');
    const recordButton = document.createElement('button');
    
    
    recordButton.style.backgroundColor  = 'darkred';
    recordButton.style.width            =
    recordButton.style.height           =
    recordButton.style.borderRadius     = `${recordButtonSize}px`;
    recordButton.className              = state;
    recordButton.id                     = 'recordButton';

    recordDiv.id                        = 'recordDiv';
    recordDiv.className                 = state;
    recordDiv.draggable                 = !lockRecordButton; 

    recordDiv.style.fontSize            = `${recordButtonSize}px`;
    recordDiv.style.position            = 'fixed';
    recordDiv.appendChild(recordButton);
    recordDiv.appendChild(document.createTextNode('REC'));
    content.appendChild(recordDiv);


    chrome.storage.local.get({
        [monitorName + '_rec']: {
            x: [].x || undefined,
            y: [].y || undefined
        }
    }, position => {
        recordDiv.style.left = `${position[monitorName + '_rec'].x}px`;
        recordDiv.style.top = `${position[monitorName + '_rec'].y}px`;
    });

    const observer = new MutationObserver( mutation => {
        recordButton.className  = 
        recordDiv.className     = 
        state                   = 
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

    let offset = [0, 0];

    if (!lockRecordButton){
        recordDiv.addEventListener('dragend', e => {
            let x = e.clientX - offset[0];
            let y = e.clientY - offset[1];
            //recordDiv.remove();

            moveRecordIcon( {
                x: x,
                y: y
            });

            recordButton.className = recordDiv.className = state;
            chrome.runtime.sendMessage({
                setOverlay: true,
                key: monitorName + '_rec',
                value: {
                    x: x,
                    y: y
                }
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
        //let forceAlarm = document.getElementById('forceAlarmLink') || document.getElementById('forceAlmBtn');
        //let cancelAlarm = document.getElementById('cancelAlarmLink') || document.getElementById('enableAlmBtn');

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
