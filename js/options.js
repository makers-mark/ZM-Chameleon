"use strict";

document.addEventListener('DOMContentLoaded', () => {
  var customLocation = document.getElementById('customLocation');
  var alarmOpacity = document.getElementById('alarmOpacity');
  var alertOpacity = document.getElementById('alertOpacity');
  var userName = document.getElementById('userName');
  var password = document.getElementById('password');
  var widthMax = document.getElementById('widthMax');
  var flashSpeed = document.getElementById('flashSpeed');
  var alertOpacityText = document.getElementById('alertOpacityText');
  var alarmOpacityText = document.getElementById('alarmOpacityText');
  var showFps = document.getElementById('showFps');
  var fpsColor = document.getElementById('fpsColor');
  var lockRecordButton = document.getElementById('lockRecordButton');
  var versionH3 = document.getElementById('version');
  var version = chrome.runtime.getManifest().version;
  if (version.indexOf('.') === -1){version += '.0';}
  versionH3.innerText = 'Version ' + version;

  chrome.storage.local.get({
    customLocation: '',
    alarmOpacity: 0.5,
    alertOpacity: 0.5,
    userName: '',
    password: '',
    widthMax: 10,
    flashSpeed: 0.6,
    showFps: true,
    fpsColor: '#ffffff',
    lockRecordButton: false
  }, (item) => {
    customLocation.value = item.customLocation;
    alarmOpacity.value = item.alarmOpacity;
    alertOpacity.value = item.alertOpacity;
    userName.value = item.userName;
    password.value = item.password;
    widthMax.value = item.widthMax;
    flashSpeed.value = item.flashSpeed;
    alertOpacityText.textContent = item.alertOpacity;
    alarmOpacityText.textContent = item.alarmOpacity;
    showFps.checked = item.showFps;
    fpsColor.value = item.fpsColor;
    lockRecordButton.checked = item.lockRecordButton;
  });

  document.getElementById('clearStorage').addEventListener('click', () => chrome.runtime.sendMessage({clearStorage: true}));

  alertOpacity.onchange = () => {
    alertOpacityText.textContent = alertOpacity.value;
    chrome.storage.local.set({'alertOpacity': alertOpacity.value});
  }
  alarmOpacity.onchange = () => {
    alarmOpacityText.textContent = alarmOpacity.value;
    chrome.storage.local.set({'alarmOpacity': alarmOpacity.value});
  }
  widthMax.onchange = () => chrome.storage.local.set({'widthMax': widthMax.value});
  flashSpeed.onchange = () => chrome.storage.local.set({'flashSpeed': flashSpeed.value});
  userName.onchange = () => chrome.storage.local.set({'userName': userName.value});
  password.onchange = () => chrome.storage.local.set({'password': password.value});
  customLocation.onchange = () => chrome.storage.local.set({'customLocation': customLocation.value});
  showFps.onchange = () => chrome.storage.local.set({'showFps': showFps.checked})
  fpsColor.onchange = () => chrome.storage.local.set({'fpsColor': fpsColor.value});
  lockRecordButton.onchange = () =>  chrome.storage.local.set({'lockRecordButton': lockRecordButton.checked});
})