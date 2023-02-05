const setupZoom = ( zoomFactor ) => {
    chrome.runtime.onMessage.addListener( (msg) => {
        zoomFactor = msg.zoomFactor;
        return true;
    });

    //override the default zoneminder zoom in watch.js
    const script = document.createElement('script');
    script.textContent = `function handleClick(){}`;
    document.head.appendChild(script);

    //Do not display the Ctrl-click zoom options on hover through the title attribute
    const style = document.createElement('style');
    //style.type = 'text/css'; //<<deprecated
    style.innerHTML = `#imageFeed, div#content > div {pointer-events: none !important;}`
    document.head.appendChild(style);

    let scale     = 1;
    let isPanning = false;
    let pointX    = 0;
    let pointY    = 0;
    let initialXY = {x: 0, y: 0};

    const imageFeed = document.querySelector('div#content > div')
    imageFeed.style.title = '0';
    imageFeed.style.transformOrigin = '0 0';

    const setTransform = () => imageFeed.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    
    let content = document.getElementById('content');
    content.addEventListener("mousedown", e => {
        if (e.target.id == 'content' || e.target.id.includes('liveStream')){
            e.preventDefault();
            if (e.buttons === 4){
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
