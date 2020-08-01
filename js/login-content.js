"use strict";

  chrome.storage.local.get({
    userName: '',
    password: ''
  }, (item) => {
    if (item.userName !== ''){
      document.getElementById('inputUsername').value = item.userName;
    }
    if (item.password !== ''){
      document.getElementById('inputPassword').value = item.password;
    }
  });