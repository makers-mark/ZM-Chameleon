"use strict";

document.addEventListener('mousedown', e => {
    if (e.buttons === 3){
        window.location = '?view=console';
        chrome.runtime.sendMessage({goToConsole: true});
    } else if (e.which === 2){
        e.preventDefault();
        chrome.runtime.sendMessage({fullscreen: true});
    }
});