"use strict";

  chrome.storage.local.get({
    userName: '',
    password: '',
    obfuscate: false
  }, (item) => {
    const user = document.getElementById('inputUsername');
    if (item.obfuscate){
      user.type = 'password';
      user.value = item.userName;
    } else  if (item.userName !== ''){
      user.value = item.userName;
    }
    if (item.password !== ''){
      document.getElementById('inputPassword').value = item.password;
    }
  });