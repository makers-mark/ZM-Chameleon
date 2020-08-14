(() => {
    "use strict";

    let zmMontageLayout = document.getElementById('zmMontageLayout');
    chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value});

    //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
    zmMontageLayout.addEventListener('input', () => {
        chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || 3});
    });
    document.addEventListener('mousedown', evt => {
        if (evt.buttons === 3){
            window.location = '?view=console';
            chrome.runtime.sendMessage({goToConsole: true});
        } else if (evt.which ===2){
            evt.preventDefault();
            chrome.runtime.sendMessage({fullscreen: true});
        }
    });

    document.addEventListener('contextmenu', evt => {
        evt.preventDefault();
    });
})();