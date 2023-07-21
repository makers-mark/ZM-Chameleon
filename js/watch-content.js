document.addEventListener('DOMContentLoaded', () => { 
    let script = document.createElement('script');
    script.textContent = `function handleClick(){}`
    document.head.appendChild( script );
    script.addEventListener('load', () => script.remove() );
})

const setupZoom = ( zoomFactor ) => {


    chrome.runtime.onMessage.addListener(( msg ) => {
        zoomFactor = msg.zoomFactor;
        return true;
    });

    //override the default zoneminder zoom in watch.js
    //Do not display the Ctrl-click zoom options on hover through the title attribute
/*     const style = document.createElement('style');
    style.innerHTML = `#imageFeed, div#content:not(:last-child) {pointer-events: none !important;}`
    document.head.appendChild(style); */

    let scale     = 1;
    let panning = false;
    let pointX    = 0;
    let pointY    = 0;
    let initialXY = {
        x: 0,
        y: 0
    };

    const imageFeed = document.querySelector('div#content > div');
    imageFeed.setAttribute('title', '');
    imageFeed.style.transformOrigin = '0 0';

    const setTransform = () => imageFeed.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;

    const resetTransform = () => {
        imageFeed.style.top = imageFeed.style.left = pointX = pointY = 0;
        scale = 1;
        initialXY = { x: 0, y: 0 };
        setTransform();
    }
    
    let content = document.getElementById('content');

    content.addEventListener("mousedown", e => {
        if ( e.target.id == 'content' || e.target.id.includes('liveStream') ){
            e.preventDefault();
            if ( e.buttons === 4 ){ //Reset the zoom and scale when the middle mouse button is pressed
                resetTransform();
            } else {
                initialXY = {
                    x: e.clientX - pointX,
                    y: e.clientY - pointY
                };
                panning = true;
            }
        }
    })

    content.addEventListener("mouseup", e => {
        panning = false;
    })

    content.addEventListener("mousemove", e => {
        if (!panning) {
            return;
        }
        pointX = ( e.clientX - initialXY.x );
        pointY = ( e.clientY - initialXY.y );
        setTransform();
    })

    content.addEventListener('wheel', e => {
        e.preventDefault();
        const xScale = ( e.clientX - pointX ) / scale;
        const yScale = ( e.clientY - pointY ) / scale;

        e.deltaY < 0  ? scale *= zoomFactor : scale /= zoomFactor;

        pointX = e.clientX - xScale * scale;
        pointY = e.clientY - yScale * scale;

        setTransform();
    }, { passive: false })
}

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

    let offset = [ 0, 0 ];

    if (!lockRecordButton){
        recordDiv.addEventListener('dragend', e => {
            let x = e.clientX - offset[0];
            let y = e.clientY - offset[1];

            moveRecordIcon( {
                x: x,
                y: y
            });

            recordButton.className = recordDiv.className = state;
            chrome.storage.local.set({
                [monitorName + '_rec']: { x, y }
            })
        });

        recordDiv.addEventListener('mousedown', e => {
            let bounds = recordDiv.getBoundingClientRect();
            offset = [
                e.clientX - bounds.left,
                e.clientY - bounds.top
            ];
        });
    }

    recordDiv.addEventListener('click', () => {

        if ( state === 'Idle' ){
            forceAlarm.click();
        /*  This code below allows for an immediate animation when you click the REC div
            and allows for non-recordable monitors to lose the animation and class if the state
            doesn't change.*/

            recordButton.className = recordDiv.className = 'Alarm';
            setTimeout(() => {
                if ( state === 'Idle' ){
                    recordButton.className = recordDiv.className = state;
                }
            }, 3000);
        } else if (state === 'Alert' && !disableRecordOnAlert){
            forceAlarm.click();
        } else {
            cancelAlarm.click();
        }
    })
}

const showFpsFunc = ( color = '#ffffff', fpsSize = 30 ) => {

    let monitorName = document.getElementById('monitorName') || document.getElementsByTagName('img')[0].alt;
    monitorName = monitorName.innerHTML || monitorName;
    let initValue = '0.00';
    let offset = [];
    let fpsSpan = document.createElement('span');

    fpsSpan.id                  = 'fpsSpan';
    fpsSpan.style.display       = 'block';
    fpsSpan.draggable           = true;
    fpsSpan.style.lineHeight    =
    fpsSpan.style.height        =
    fpsSpan.style.fontSize      = `${fpsSize}px`;
    fpsSpan.style.color         = color;
    fpsSpan.textContent         = initValue;

    const moveFps = ( position ) => {
        fpsSpan.style.left = `${position.x}px`;
        fpsSpan.style.top = `${position.y}px`;
    }
     chrome.storage.local.get({
        [monitorName + '_fps']: {
            x: [].x || undefined,
            y: [].y || undefined
        }
    }, position => {

        position[monitorName + '_fps'].x ? fpsSpan.style.left = `${position[monitorName + '_fps'].x}px` : fpsSpan.style.left = 'calc(50vw - 1.6em)';
        position[monitorName + '_fps'].y ? fpsSpan.style.top = `${position[monitorName + '_fps'].y}px` : fpsSpan.style.top = 'calc(100vh - 1.3em)';
        
        document.getElementById('content').appendChild(fpsSpan);
    })

    fpsSpan.addEventListener('mousedown', e => {
        let bounds = fpsSpan.getBoundingClientRect();
        offset = [
            e.clientX - bounds.left,
            e.clientY - bounds.top
        ];
    });

    fpsSpan.addEventListener('dragend', e => {
        let position = {
            x: e.clientX - offset[0],
            y: e.clientY - offset[1]
        };

        moveFps( {x: position.x, y: position.y} );

        chrome.storage.local.set({
            [ monitorName + '_fps' ]: position
        });
    })

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
    )
}
