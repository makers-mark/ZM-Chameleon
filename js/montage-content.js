"use strict";

var zmMontageLayout = document.getElementById('zmMontageLayout');
chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value});

//Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
zmMontageLayout.addEventListener('input', () => {
    chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || 3});
});