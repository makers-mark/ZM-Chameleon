"use strict";

var zmMontageLayout = document.getElementById('zmMontageLayout');
chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value}, (msg) =>{
    //console.log(msg);
});
var openPopupDiv = document.createElement('div');
var openPopupImg = document.createElement('img');
var content = document.getElementById('content');

openPopupImg.src = chrome.extension.getURL('icons/icon-128.png');
openPopupDiv.id = 'openPopupDiv';
openPopupImg.id = 'openPopupImg';
openPopupImg.style.width = 'auto';
openPopupImg.style.height = '50px';
openPopupDiv.style.opacity = '.8';
openPopupDiv.style.top = '0px';
openPopupDiv.style.right = '0px';
openPopupDiv.style.position = 'fixed';
openPopupDiv.draggable = 'true';
openPopupDiv.onclick = () => {
    window.location = 'index.php?view=console';
}

openPopupDiv.appendChild(openPopupImg);
content.appendChild(openPopupDiv);

//Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
zmMontageLayout.addEventListener('input', () => {
    chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || 3});
});