"use strict";

var zmMontageLayout = document.getElementById('zmMontageLayout');
chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value}, (msg) =>{
    //console.log(msg);
});

//Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
zmMontageLayout.addEventListener('input', () => {
    chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || 3});
});
document.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (e.buttons === 3){
      window.location = '?view=console';
      chrome.runtime.sendMessage({goToConsole: true});
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})