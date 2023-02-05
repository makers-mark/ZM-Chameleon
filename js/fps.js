const showFpsFunc = ( monitorName, color = '#ffffff', position = {x: undefined, y: undefined}, initValue = '0.00', fpsSize = 30 ) => {

    let offset = [];
    let fpsSpan = document.createElement('span');

    fpsSpan.id                  = 'fpsSpan';
    fpsSpan.draggable           = true;
    fpsSpan.style.lineHeight    =
    fpsSpan.style.height        =
    fpsSpan.style.fontSize      = `${fpsSize}px`;
    fpsSpan.style.color         = color;
    fpsSpan.textContent         = initValue;

    //If the fps position has never been set, it will be 'undefined' and we will
    //put it at the bottom center of the maximized window. After it has been moved
    //and set somewhere else, we use the pixel position of the top-left corner of the span.

    position.x ? fpsSpan.style.left = `${position.x}px` : fpsSpan.style.left = 'calc(50vw - 1.6em)';
    position.y ? fpsSpan.style.top = `${position.y}px` : fpsSpan.style.top = 'calc(100vh - 1.3em)';

    document.getElementById('content').appendChild(fpsSpan);

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

        showFpsFunc(
            monitorName,
            color,
            {
                x: position.x = e.clientX - offset[0],
                y: position.y = e.clientY - offset[1]
            },
            initValue,
            fpsSize
        );
        chrome.runtime.sendMessage({
            setOverlay: true,
            key: monitorName + '_fps',
            value: {
                x: position.x,
                y: position.y
            }
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
