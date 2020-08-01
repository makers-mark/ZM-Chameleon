'use strict';
//Watch for middle mouse wheel press to toggle fullscreen.
document.addEventListener('mousedown', (e) => {  
  if (e.which === 2){
    e.preventDefault();
    chrome.runtime.sendMessage({fullscreen: true});
  }
});