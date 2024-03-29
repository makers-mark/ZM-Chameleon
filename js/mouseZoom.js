const setupZoom = ( zoomFactor ) => {
    chrome.runtime.onMessage.addListener(( msg ) => {
        zoomFactor = msg.zoomFactor;
        return true;
    });

    //override the default zoneminder zoom in watch.js
    //Do not display the Ctrl-click zoom options on hover through the title attribute
    const style = document.createElement('style');
    style.innerHTML = `#imageFeed, div#content > div {pointer-events: none !important;}`
    document.head.appendChild(style);

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
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

        delta > 0  ? scale *= zoomFactor : scale /= zoomFactor;

        pointX = e.clientX - xScale * scale;
        pointY = e.clientY - yScale * scale;

        setTransform();
    }, { passive: false })
}
