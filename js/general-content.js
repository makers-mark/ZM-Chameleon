(() => {
    "use strict";

    document.addEventListener('contextmenu', e => {
        e.preventDefault();
    });

    document.addEventListener('mousedown', e => {
        if (e.buttons === 4){
            //Keep mousewheel click (toggle fullscreen) from propogating
            //to after the toggle into 'scroll'

            e.preventDefault();
            chrome.runtime.sendMessage({ fullscreenToggle: true });
        }
    })
})();
