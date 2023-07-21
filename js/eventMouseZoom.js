const setupZoom = ( zoomFactor = 1.2 ) => {

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL( 'js/handleClick.js' );
    script.addEventListener('load', () => script.remove() );

    chrome.runtime.onMessage.addListener(( msg ) => {
        zoomFactor = msg.zoomFactor;
        return true;
    });

    let scale     = 1;
    let panning   = false;
    let pointX    = 0;
    let pointY    = 0;
    let initialXY = {
        x: 0,
        y: 0
    };

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

    content.addEventListener("mousedown", e => {
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
    });

    content.addEventListener('click', e => {
        //play pause
    })

    window.addEventListener("mouseup", e => {
        panning = false;
    });

    content.addEventListener("mousemove", e => {
        if ( !panning ) {
            return;
        }
        pointX = ( e.clientX - initialXY.x );
        pointY = ( e.clientY - initialXY.y );
        setTransform();
    });

    content.addEventListener('wheel', e => {
        e.preventDefault();
        const xScale = ( e.clientX - pointX ) / scale;
        const yScale = ( e.clientY - pointY ) / scale;
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

        delta > 0  ? scale *= zoomFactor : scale /= zoomFactor;

        pointX = e.clientX - xScale * scale;
        pointY = e.clientY - yScale * scale;
        setTransform();
    }, { passive: false });
}

const setupControlBar = ( controlBarPosition = 95) => {

    const toolBar = document.getElementById('toolbar');
    const dvrControls = document.getElementById('dvrControls');
    const controlBar = document.getElementsByClassName('vjs-control-bar')[0];

    let controlDiv = document.createElement('div');
    controlDiv.classList = 'video-js vjs-default-skin vjs-controls-enabled vjs-has-started vjs-paused';

    controlBar.style.top = `${controlBarPosition}%`;
    controlBar.draggable = true;
    controlBar.appendChild( toolBar );
    controlBar.appendChild( dvrControls );
    controlDiv.appendChild( controlBar );

    document.getElementById('content').appendChild(controlDiv);

    const placeControlBar = ( position ) => controlBar.style.top = `${position}%`;

    let offset = 0;
    controlBar.addEventListener('dragend', e => {
        let recY = 100 * ( e.clientY - offset ) / window.innerHeight;
        placeControlBar( recY );
        chrome.runtime.sendMessage({
            setOverlay: true,
            key: 'controlBarPosition',
            value: recY
        });
    });

    controlBar.addEventListener('mousedown', e => {
        //let bounds = controlBar.getBoundingClientRect();
        offset = e.clientY - controlBar.getBoundingClientRect().top;
    });
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
    });

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
    });

    //eventStats.addEventListener('mouseenter', () => {
    //    panel.style.scale           = scale + 0.05;
    //    panel.style.opacity         = 0.88;
    //    panel.style.borderRadius    = `${Math.floor( Math.random() * brFactor )}px ${Math.floor( Math.random() * brFactor )}px`;
    //    scaleControl.style.display  = "block";
    //});

    //eventStats.addEventListener('mouseleave', () => {
        //panel.style.scale           = scale;
        //panel.style.opacity         = opacity;
        //panel.style.borderRadius    = '100px';
        //scaleControl.style.display  = "none";

        //Close Dropdowns that are open when mouse leaves panel
        //panel.querySelectorAll("[aria-labelledby^='dropdown_']").forEach( el => {
        //    el.classList.remove('show');
        //});
    //});
};

const setATagsUndraggable = ( aTags ) => {
    for ( var aTag of aTags ){
        aTag.draggable = false;
    };
};

const undoShowEventStats = () => {
    const eventStats = document.getElementsByClassName('eventStats')[0];
}
