document.addEventListener('DOMContentLoaded', () => { 
    let script = document.createElement('script');
    script.textContent = `function handleClick(){}`
    document.head.appendChild( script );
    script.addEventListener('load', () => script.remove() );

/*     let vjsScript = document.createElement('script');
    vjsScript.textContent = `
    function vjsReplay(){
        vid.play();
    }`;
    document.head.appendChild( vjsScript );
    vjsScript.addEventListener('load', () => vjsScript.remove() ); */

});

const setupZoom = ( zoomFactor = 1.2 ) => {
/*     const style = document.createElement('style');
    style.innerHTML = `div#eventVideo {pointer-events: none !important;}`
    document.head.appendChild(style); */

    chrome.runtime.onMessage.addListener(( msg ) => {
        zoomFactor = msg.zoomFactor;
        return true;
    });

    const clickThreshold = 1;
    let scale     = 1;
    let panning   = false;
    let pointX    = 0;
    let pointY    = 0;
    let initialXY = {
        x: 0,
        y: 0
    };
    let clickXY = {
        x: 0,
        y: 0
    }

    const videoFeed = document.getElementById('videoFeed');
    videoFeed.style.transformOrigin = '0 0';

    const setTransform = () => videoFeed.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;

    const resetTransform = () => {
        videoFeed.style.top = videoFeed.style.left = pointX = pointY = 0;
        scale = 1;
        initialXY = { x: 0, y: 0 };
        setTransform();
    }
    
    const content = document.getElementById('eventVideo');

    let barColor = window.getComputedStyle(document.body).backgroundColor;
    //document.getElementById('videoobj').style.backgroundColor  = barColor;  //Black bars when aspect ratio is kept should be the same color as the background

    content.addEventListener("mousedown", e => {
        e.preventDefault();
        if ( e.buttons === 4 ){ //Reset the zoom and scale when the middle mouse button is pressed
            resetTransform();
        } else {
/*             e.stopImmediatePropagation()
            if ( document.querySelector('div.vjs-progress-holder.vjs-slider').getAttribute('aria-valuenow') === '100' ){
                document.getElementById('nextBtn').click();
            } */

            initialXY = {
                x: e.clientX - pointX,
                y: e.clientY - pointY
            };
            clickXY = {
                x: e.clientX,
                y: e.clientY
            }


            panning = true;
        }
    })

    window.addEventListener("mouseup", e => {
        panning = false;
        if ( Math.abs( e.clientX - clickXY.x ) <= clickThreshold && Math.abs( e.clientY - clickXY.y ) <= clickThreshold ){
            document.getElementsByClassName('vjs-play-control')[0]?.click() ?? document.getElementById('playBtn')?.click();
        }
        clickXY = { x: 0, y: 0 };
    });

    content.addEventListener("mousemove", e => {
        if ( !panning ) {
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

const setupControlBar = ( controlBarPosition = 95) => {

    const toolBar = document.getElementById('toolbar');
    const dvrControls = document.getElementById('dvrControls');
    const controlBar = document.getElementsByClassName('vjs-control-bar')[0] ?? document.getElementById('progressBar');
    controlBar.id = 'progressBar';
    //controlBar.style.position.top = `${controlBarPosition}%`;
    const replayControl = document.querySelector('[class="d-flex flex-row"]');
    const replayRate = document.getElementById('rate');


    replayControl.id = 'replayCtrl';
    replayControl.appendChild( replayRate );
    //replayControl.style.display = 'flex';
    //const replayControl = document.getElementById('replayControl');

    let controlDiv = document.createElement('div');
    controlDiv.id = 'controlDiv';
    controlDiv.classList = 'video-js vjs-default-skin vjs-controls-enabled vjs-has-started vjs-paused';
    controlDiv.style.position = 'fixed';
    controlDiv.style.top = `${controlBarPosition}%`;

    controlDiv.draggable = true;
    controlDiv.appendChild( replayControl );
    controlDiv.appendChild( toolBar );
    controlDiv.appendChild( dvrControls );
    //controlDiv.appendChild( replayRate );

    controlDiv.appendChild( controlBar );

    document.getElementById('content').appendChild(controlDiv);

    const placeControlBar = ( position ) => controlDiv.style.top = `${position}%`;

    let offset = 0;

    controlDiv.addEventListener('dragend', e => {
        let y = 100 * ( e.clientY - offset ) / window.innerHeight;
        placeControlBar( y );
        chrome.storage.local.set({
            controlBarPosition: y
        })
/*         chrome.runtime.sendMessage({
            setOverlay: true,
            key: 'controlBarPosition',
            value: y
        }) */
    })

    controlDiv.addEventListener('mousedown', e => {
        offset = e.clientY - controlDiv.getBoundingClientRect().top;
    });

    controlDiv.addEventListener('wheel', e => {
        e.preventDefault;
        let el;
        if ( e.wheelDelta > 0 ){
            el = document.getElementById('slowFwdBtn');
            el.disabled = false;
        } else {
            el = document.getElementById('slowRevBtn');
            el.disabled = false;
        }
        el.click();
    })


}

const showEventStats = ( position ) => {

    const moveEventStats = ( position ) => {
        eventStats.style.left = `${position.x}px`;
        eventStats.style.top = `${position.y}px`;
    };

    const eventStats = document.getElementsByClassName('eventStats')[0];
    eventStats.style.left = `${position.x}px`;
    eventStats.style.top = `${position.y}px`;
    eventStats.draggable = true;
    offset = [];

    eventStats.addEventListener('mousedown', e => {
        let bounds = eventStats.getBoundingClientRect();
        offset = [
            e.clientX - bounds.left,
            e.clientY - bounds.top
        ];
    })

    eventStats.addEventListener('dragend', e => {
        moveEventStats(
            {
                x: position.x = e.clientX - offset[0],
                y: position.y = e.clientY - offset[1]
            }
        );

        chrome.storage.local.set({
            eventStatsPosition: {
                x: position.x,
                y: position.y
            }
        });
    })
}

const setATagsUndraggable = ( aTags ) => {
    for ( var aTag of aTags ){
        aTag.draggable = false;
    };
};

const undoShowEventStats = () => {
    const eventStats = document.getElementsByClassName('eventStats')[0];
}
    
/* })(
    (consoleIconSVG) = `M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,
2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,
0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855
,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,
2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z`
); */