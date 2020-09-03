(() => {
    "use strict";
    let zmMontageLayout = document.getElementById('zmMontageLayout');
    chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value});

    //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
    zmMontageLayout.addEventListener('input', () => {
        chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || 3});
    });
    document.addEventListener('mousedown', e => {
        if (e.buttons === 3){
            window.location = '?view=console';
            chrome.runtime.sendMessage({goToConsole: true});
        } else if (e.which ===2){
            e.preventDefault();
            chrome.runtime.sendMessage({fullscreen: true});
        }
    });

    document.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
/* Getting ready to populate the options page (or another) with certain things/options.
    let monitors = document.getElementsByClassName('monitor');
    for (var monitor of monitors) {
        console.log(monitor.scrollWidth);
    }; */
})();