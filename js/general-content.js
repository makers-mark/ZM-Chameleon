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
        }
        if (e.buttons === 3){
            //Both left and right buttons were pressed. If we are in a single view
            //of a monitor, a popup window where'popup=1' is in the url. Just
            //close the window. If the monitor window is not a popup, go to the 
            //console view.
            //e.preventDefault();
            if (window.location.href.includes('popup=1')){
                window.close();
            } else {
                if (window.location.href.includes('?view=montage')){
                    window.location = '?view=console';
                } else {
                    window.location = '?view=montage';
                }
                //chrome.runtime.sendMessage({goToConsole: true});
            }
        } else if (e.buttons === 4){
            //e.preventDefault();
            chrome.runtime.sendMessage({fullscreenToggle: true});
        }
    });
})();