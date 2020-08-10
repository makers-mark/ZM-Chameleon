"use strict";

//Sometimes on the login page ?view=login will not be displayed
//in the url. Also sometimes on the console page ?view=console will
//not be displayed in the url. This is a quick way to make sure
//that we are on the login page to do work. Sometimes index.php
//will not be displayed on either the console or login pages.

//Currently these are the matches in the manifest for this script
//to be injected in:
//  "matches": [
//      "*://*/zm/*view=login*",
//      "*://*/zm/index.php",
//      "*://*/zm/"
//]
//document.addEventListener('DOMContentLoaded', () => {  This has to be declared when a content script is directly injected with the declarative content api, otherwise run_at 'document_idle' the default does the job.

    chrome.runtime.sendMessage({loginPageOpen: true});
    chrome.storage.local.get({
      userName: '',
      password: '',
      obfuscate: false
    }, (item) => {
      const user = document.getElementById('inputUsername') || null;
      if (user && item.obfuscate){
        user.type = 'password';
        user.value = item.userName;
      } else  if (user && item.userName !== ''){
        user.value = item.userName;
      }
      if (item.password !== ''){
        document.getElementById('inputPassword').value = item.password || null;
      }
    });

//});