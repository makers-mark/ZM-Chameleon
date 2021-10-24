(() => {
    "use strict";

    let customLocation = document.getElementById('customLocation');
    let alarmOpacity = document.getElementById('alarmOpacity');
    let alertOpacity = document.getElementById('alertOpacity');
    let userName = document.getElementById('userName');
    let password = document.getElementById('password');
    let widthMax = document.getElementById('widthMax');
    let flashSpeed = document.getElementById('flashSpeed');
    let alertOpacityText = document.getElementById('alertOpacityText');
    let alarmOpacityText = document.getElementById('alarmOpacityText');
    let showFps = document.getElementById('showFps');
    let fpsColor = document.getElementById('fpsColor');
    let lockRecordButton = document.getElementById('lockRecordButton');
    let versionH3 = document.getElementById('version');
    let obfuscate = document.getElementById('obfuscate');
    let disableRecordOnAlert = document.getElementById('disableRecordOnAlert');
    let recordButton = document.getElementById('recordButton');
    let recordDiv = document.getElementById('recordDiv');
    let dropShadowString = document.getElementById('dropShadowString');
    let dropShadowStringReset = document.getElementById('dropShadowStringReset');
    let dropShadowApply = document.getElementById('dropShadowApply');
    let inversionAmount = document.getElementById('inversionAmount');
    let inversionAmountText = document.getElementById('inversionAmountText');
    let fpsSize = document.getElementById('fpsSize');
    let defaultShadow = '2px 4px 6px';
    let fpsSpan = document.getElementById('fpsSpan');
    let applyFilters = document.getElementById('applyFilters');
    let aspectRatio = document.getElementById('aspectRatio');
    let forceAspect = document.getElementById('forceAspect');

    document.getElementById('whoami').innerText = chrome.runtime.getURL('') || '';
    let version = chrome.runtime.getManifest().version;
    if (!version.includes('.')) version += '.0';
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
        fpsColor: '#00ff00',
        fpsSize: 30,
        lockRecordButton: false,
        obfuscate: false,
        disableRecordOnAlert: false,
        recordButtonSize: 70,
        dropShadowString: defaultShadow,
        inversionAmount: 1,
        applyFilters: false,
        aspectRatio: '16/9',
        forceAspect: true
    }, settings => {
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
        fpsSize.value = settings.fpsSize;
        fpsSpan.style.color = fpsColor.value = settings.fpsColor;
        lockRecordButton.checked = settings.lockRecordButton;
        obfuscate.checked = settings.obfuscate;
        disableRecordOnAlert.checked = settings.disableRecordOnAlert;
        recordButtonSize.value = settings.recordButtonSize;
        recordButton.style.height = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${settings.recordButtonSize}px`;
        dropShadowString.value = settings.dropShadowString;
        inversionAmount.value = settings.inversionAmount;
        inversionAmountText.textContent = settings.inversionAmount;
        fpsSpan.style.fontSize = `${settings.fpsSize}px`;
        fpsSpan.innerText = ((Math.random() * 10) + 20).toFixed(2);
        applyFilters.checked = settings.applyFilters;
        aspectRatio.value = settings.aspectRatio;
        forceAspect.checked = settings.forceAspect;
    });

    document.getElementById('clearStorage').addEventListener('click', () => chrome.runtime.sendMessage({clearStorage: true}));
    recordDiv.addEventListener('click', () => recordDiv.classList.contains('Alarm') ? recordButton.className = recordDiv.className = 'Idle' : recordButton.className = recordDiv.className = 'Alarm');
    alertOpacity.onchange = () => chrome.storage.local.set({alertOpacity: alertOpacityText.textContent = alertOpacity.value});
    alarmOpacity.onchange = () => chrome.storage.local.set({alarmOpacity: alarmOpacityText.textContent = alarmOpacity.value});
    inversionAmount.onchange = () => chrome.storage.local.set ({inversionAmount: inversionAmountText.textContent = inversionAmount.value});
    recordButtonSize.oninput = () => recordButton.style.height = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${recordButtonSize.value}px`;
    recordButtonSize.onchange = () => chrome.storage.local.set({recordButtonSize: recordButtonSize.value});
    dropShadowApply.onclick = () => chrome.storage.local.set({dropShadowString: dropShadowString.value});
    dropShadowStringReset.onclick = () => chrome.storage.local.set({dropShadowString: defaultShadow}, () => dropShadowString.value = defaultShadow);
    widthMax.onchange = () => chrome.storage.local.set({widthMax: parseInt(widthMax.value, 10)});
    flashSpeed.onchange = () => chrome.storage.local.set({flashSpeed: flashSpeed.value});
    userName.onchange = () => chrome.storage.local.set({userName: userName.value});
    password.onchange = () => chrome.storage.local.set({password: password.value});
    customLocation.onchange = () => chrome.storage.local.set({customLocation: customLocation.value});
    showFps.onchange = () => chrome.storage.local.set({showFps: showFps.checked});
    fpsSize.onchange = () => chrome.storage.local.set({fpsSize: fpsSize.value});
    fpsSize.oninput = () =>  fpsSpan.style.fontSize = `${fpsSize.value}px`;
    fpsColor.onchange = () => chrome.storage.local.set({fpsColor: fpsColor.value});
    fpsColor.oninput = () => fpsSpan.style.color = fpsColor.value;
    lockRecordButton.onchange = () =>  chrome.storage.local.set({lockRecordButton: lockRecordButton.checked});
    obfuscate.onchange = () => chrome.storage.local.set({obfuscate: obfuscate.checked});
    disableRecordOnAlert.onchange = () => chrome.storage.local.set({disableRecordOnAlert: disableRecordOnAlert.checked});
    applyFilters.onchange = () => chrome.storage.local.set({applyFilters: applyFilters.checked});
    aspectRatioApply.onclick = () => chrome.storage.local.set({aspectRatio: aspectRatio.value});
    aspectRatioReset.onclick = () => chrome.storage.local.set({aspectRatio: '16/9'}, () => aspectRatio.value = '16/9');
    forceAspect.onchange = () => chrome.storage.local.set({forceAspect: forceAspect.checked});
})();