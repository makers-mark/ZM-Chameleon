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
  var obfuscate = document.getElementById('obfuscate');
  var disableRecordOnAlert = document.getElementById('disableRecordOnAlert');
  var recordButton = document.getElementById('recordButton');
  var recordDiv = document.getElementById('recordDiv');
  var dropShadowString = document.getElementById('dropShadowString');
  var dropShadowStringReset = document.getElementById('dropShadowStringReset');
  var dropShadowApply = document.getElementById('dropShadowApply');
  var inversionAmount = document.getElementById('inversionAmount');
  var inversionAmountText = document.getElementById('inversionAmountText');
  
  var defaultShadow = '2px 4px 6px';
  document.getElementById('whoami').innerText = chrome.runtime.getURL('') || '';
  var version = chrome.runtime.getManifest().version;
  if (version.indexOf('.') === -1){version += '.0.0';}
  versionH3.innerText = `Version ${version}`;

  chrome.storage.local.get({
    customLocation: '',
    alarmOpacity: 0.5,
    alertOpacity: 0.5,
    userName: '',
    password: '',
    widthMax: 20,
    flashSpeed: 0.6,
    showFps: true,
    fpsColor: '#ffffff',
    lockRecordButton: false,
    obfuscate: false,
    disableRecordOnAlert: false,
    recordButtonSize: 70,
    dropShadowString: defaultShadow,
    inversionAmount: 1
  }, (settings) => {
    customLocation.value = settings.customLocation;
    alarmOpacity.value = settings.alarmOpacity;
    alertOpacity.value = settings.alertOpacity;
    userName.value = settings.userName;
    password.value = settings.password;
    widthMax.value = settings.widthMax;
    flashSpeed.value = settings.flashSpeed;
    alertOpacityText.textContent = settings.alertOpacity;
    alarmOpacityText.textContent = settings.alarmOpacity;
    showFps.checked = settings.showFps;
    fpsColor.value = settings.fpsColor;
    lockRecordButton.checked = settings.lockRecordButton;
    obfuscate.checked = settings.obfuscate;
    disableRecordOnAlert.checked = settings.disableRecordOnAlert;
    recordButtonSize.value = settings.recordButtonSize;
    recordButton.style.height = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${settings.recordButtonSize}px`;
    dropShadowString.value = settings.dropShadowString;
    inversionAmount.value = settings.inversionAmount;
    inversionAmountText.textContent = settings.inversionAmount;
  });

  document.getElementById('clearStorage').addEventListener('click', () => chrome.runtime.sendMessage({clearStorage: true}));

  recordDiv.addEventListener('click', () => {
    if (recordDiv.classList.contains('Alarm')){
      recordButton.className = recordDiv.className = 'Idle';
    } else {
      recordButton.className = recordDiv.className = 'Alarm';
    }
  });
  alertOpacity.onchange = () => {
    alertOpacityText.textContent = alertOpacity.value;
    chrome.storage.local.set({alertOpacity: alertOpacity.value});
  };
  alarmOpacity.onchange = () => {
    alarmOpacityText.textContent = alarmOpacity.value;
    chrome.storage.local.set({alarmOpacity: alarmOpacity.value});
  };
  inversionAmount.onchange = () => {
    inversionAmountText.textContent = inversionAmount.value;
    chrome.storage.local.set ({inversionAmount: inversionAmount.value});
  }
  recordButtonSize.oninput = () => recordButton.style.height = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${recordButtonSize.value}px`;
  recordButtonSize.onchange = () => chrome.storage.local.set({recordButtonSize: recordButtonSize.value});
  dropShadowApply.onclick = () => chrome.storage.local.set({dropShadowString: dropShadowString.value});
  dropShadowStringReset.onclick = () => chrome.storage.local.set({dropShadowString: defaultShadow}, () => dropShadowString.value = defaultShadow);
  
  widthMax.onchange = () => chrome.storage.local.set({widthMax: widthMax.value});
  flashSpeed.onchange = () => chrome.storage.local.set({flashSpeed: flashSpeed.value});
  userName.onchange = () => chrome.storage.local.set({userName: userName.value});
  password.onchange = () => chrome.storage.local.set({password: password.value});
  customLocation.onchange = () => chrome.storage.local.set({customLocation: customLocation.value});
  showFps.onchange = () => chrome.storage.local.set({showFps: showFps.checked})
  fpsColor.onchange = () => chrome.storage.local.set({fpsColor: fpsColor.value});
  lockRecordButton.onchange = () =>  chrome.storage.local.set({lockRecordButton: lockRecordButton.checked});
  obfuscate.onchange = () => chrome.storage.local.set({obfuscate: obfuscate.checked});
  disableRecordOnAlert.onchange = () => chrome.storage.local.set({disableRecordOnAlert: disableRecordOnAlert.checked});
})