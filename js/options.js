(() => {
    "use strict";

    const num = {
        1: 'One',
        2: 'Two',
        3: 'Three',
        4: 'Four',
        5: 'Five',
        6: 'Six',
        7: 'Seven',
        8: 'Eight'
    };

    const defaultWatchCSS = '';
    const defaultEventCSS = '';
    const defaultMontageCSS = '';

    const defaultGhostCSS =`
        #navbar-container {
            transform-origin: top center;
            transform: perspective(100em) rotateX(-75deg);
            filter: blur(4px) !important;
            width: 100% !important;
        }
        div#navbar-container:hover {
            transform: rotate(0);
            filter: none !important;
        }
        /*Header in 1.36*/
        div.fixed-top.container-fluid {
            transform-origin: top center;
            transform: perspective(100em) rotateX(-75deg);
        }
        div.fixed-top.container-fluid:hover {
            transform: rotate(0);
        }
`


    //let customLocation              = document.getElementById('customLocation');
    let autoScale                   = document.getElementById('autoScale');
    let alarmOpacity                = document.getElementById('alarmOpacity');
    let alertOpacity                = document.getElementById('alertOpacity');
    let widthMax                    = document.getElementById('widthMax');
    let flashSpeed                  = document.getElementById('flashSpeed');
    let alertOpacityText            = document.getElementById('alertOpacityText');
    let alarmOpacityText            = document.getElementById('alarmOpacityText');
    let showFps                     = document.getElementById('showFps');
    let fpsColor                    = document.getElementById('fpsColor');
    let lockRecordButton            = document.getElementById('lockRecordButton');
    let versionH3                   = document.getElementById('version');
    let obfuscate                   = document.getElementById('obfuscate');
    let disableRecordOnAlert        = document.getElementById('disableRecordOnAlert');
    let recordButton                = document.getElementById('recordButton');
    let recordDiv                   = document.getElementById('recordDiv');
    let dropShadowString            = document.getElementById('dropShadowString');
    let dropShadowStringReset       = document.getElementById('dropShadowStringReset');
    let dropShadowApply             = document.getElementById('dropShadowApply');
    let inversionAmount             = document.getElementById('inversionAmount');
    let inversionAmountText         = document.getElementById('inversionAmountText');
    let fpsSize                     = document.getElementById('fpsSize');
    let fpsSpan                     = document.getElementById('fpsSpan');
    let applyFilters                = document.getElementById('applyFilters');
    let aspectRatio                 = document.getElementById('aspectRatio');
    let aspectRatioApply            = document.getElementById('aspectRatioApply');
    let maintainSingleMonitorAspect = document.getElementById('maintainSingleMonitorAspect');
    let overrideZoom                = document.getElementById('overrideZoom');
    let zoomFactor                  = document.getElementById('zoomFactor');
    let backgroundColor             = document.getElementById('backgroundColor');
    let consoleScale                = document.getElementById('consoleScale');
    let strokeColor                 = document.getElementById('strokeColor');
    let strokeOpacity               = document.getElementById('strokeOpacity');
    let strokeOpacityText           = document.getElementById('strokeOpacityText');
    let fillOpacity                 = document.getElementById('fillOpacity');
    let fillOpacityText             = document.getElementById('fillOpacityText');
    let ghostHeaderMontage          = document.getElementById('ghostHeaderMontage');
    let ghostHeaderWatch            = document.getElementById('ghostHeaderWatch');

    let ghostCSS                    = document.getElementById('ghostCSS');
    let ghostCSSApply               = document.getElementById('ghostCSSApply');
    let ghostCSSReset               = document.getElementById('ghostCSSReset');

    let customCSSMontage                   = document.getElementById('customCSSMontage');
    let customCSSApplyMontage              = document.getElementById('customCSSApplyMontage');
    let customCSSResetMontage              = document.getElementById('customCSSResetMontage');

    let customCSSWatch              = document.getElementById('customCSSWatch');
    let customCSSApplyWatch         = document.getElementById('customCSSApplyWatch');
    let customCSSResetWatch         = document.getElementById('customCSSResetWatch');
    let hideHeaderWatch             = document.getElementById('hideHeaderWatch');
    
    let customCSSEvent              = document.getElementById('customCSSEvent');
    let customCSSApplyEvent         = document.getElementById('customCSSApplyEvent');
    let customCSSResetEvent         = document.getElementById('customCSSResetEvent');
    let hideHeaderEvent             = document.getElementById('hideHeaderEvent');
    
    let eventsPageSticky            = document.getElementById('eventsPageSticky');
    let eventStats                  = document.getElementById('eventStats');
    let maintainEventAspect         = document.getElementById('maintainEventAspect');
    let defaultAspectText           = document.getElementById('defaultAspectText');
    let defaultShadowText           = document.getElementById('defaultShadowText');
    let monitorsPerRow;

    window.addEventListener('resize', e => {
        windowAspect( e.target.innerWidth, e.target.innerHeight );
    })

    document.getElementById('whoami').innerText = chrome.runtime.getURL('') || '';
    let version = chrome.runtime.getManifest().version;
    if (!version.includes('.')) version += '.0';
    versionH3.innerText = `Version ${version}`;

    defaultAspectText.innerText = defaultAspectRatio || '';
    defaultShadowText.innerText = defaultShadow || '';

    const btnClick = el => {
      
        // This is to clear the previous clicked content.
        let tabcontent = document.getElementsByClassName('tabcontent');
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = 'none';
        }

        // Set the tab to be "active".
        let tablinks = document.getElementsByClassName('tablinks');
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(' active', '');
        }
      
        // Display the clicked tab and set it to active.
        let elContent = document.getElementById([el.id + 'Tab']);
        elContent.style.display = 'block';
        el.className += ' active';
    }

    let mainBtns = document.getElementById('mainBtns')
    let btns = mainBtns.getElementsByTagName('button');
    let i = btns.length;

    const windowAspect = ( w, h ) => {
        let paragraph2 = document.getElementById('aspectCalculator2');
        paragraph2.innerHTML = `With ${monitorsPerRow} monitor${monitorsPerRow == 1 ? '': 's'} per row and a window width of ${w}px, these aspect ratios will give you:<br>`
        for ( let x = 1; x <= 8; x++ ){
            paragraph2.innerHTML += `${num[x]} Row${x == 1 ? '': 's'} @ Aspect Ratio of <a id="wlink${x}">${( x * ( w / monitorsPerRow ) / h )}</a><br>`;
        }
        for ( let x = 1; x <= 8; x++){
            document.getElementById(`wlink${x}`).addEventListener('click', e => {
                aspectRatio.value = `${ x * ( w / monitorsPerRow ) / h }`;
                aspectRatioApply.click();
            })
        }
    }

    while ( i-- ){
        btns[i].addEventListener('click', e => { btnClick( e.target ) })
    }

    document.getElementById('montage').click();

    chrome.storage.local.get({
        //customLocation: '',
        alarmOpacity: 0.5,
        alertOpacity: 0.5,
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
        aspectRatio: defaultAspectRatio,
        maintainSingleMonitorAspect: false,
        overrideZoom: true,
        zoomFactor: 1.2,
        backgroundColor: '#222222',
        consoleScale: 2,
        strokeColor: '#00c7b0',
        strokeOpacity: 0.18,
        fillColor: '#666ff0',
        fillOpacity: 0.14,
        monitorsPerRow: 3,
        ghostHeader: {
            [titles.MONTAGE]: false,
            [titles.WATCH]: false,
            [titles.EVENT]: false,
        },
        ghostCSS: defaultGhostCSS,
        customCSSMontage: defaultMontageCSS,
        customCSSWatch: defaultWatchCSS,
        customCSSEvent: defaultEventCSS,
        eventStats: true,
        eventsPageSticky: true,
        maintainEventAspect: false,
        hideHeader: {
            [titles.MONTAGE]: false,
            [titles.WATCH]: false,
            [titles.EVENT]: false
        },
        autoScale: '-1'
    }, settings => {
        //customLocation.value                = settings.customLocation;
        widthMax.value                      = settings.widthMax;
        flashSpeed.value                    = settings.flashSpeed;
        alertOpacityText.textContent        = settings.alertOpacity = alertOpacity.value;
        alarmOpacityText.textContent        = settings.alarmOpacity = alarmOpacity.value;
        showFps.checked                     = settings.showFps;
        fpsSize.value                       = settings.fpsSize;
        fpsSpan.style.color                 = fpsColor.value = settings.fpsColor;
        lockRecordButton.checked            = settings.lockRecordButton;
        obfuscate.checked                   = settings.obfuscate;
        disableRecordOnAlert.checked        = settings.disableRecordOnAlert;
        recordButtonSize.value              = settings.recordButtonSize;
        recordButton.style.height           = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${settings.recordButtonSize}px`;
        dropShadowString.value              = settings.dropShadowString;
        inversionAmountText.textContent     = inversionAmount.value = settings.inversionAmount;
        fpsSpan.style.fontSize              = `${settings.fpsSize}px`;
        fpsSpan.innerText                   = ((Math.random() * 10) + 20).toFixed(2);
        applyFilters.checked                = settings.applyFilters;
        aspectRatio.value                   = settings.aspectRatio;
        maintainSingleMonitorAspect.checked = settings.maintainSingleMonitorAspect;
        overrideZoom.checked                = settings.overrideZoom;
        zoomFactor.value                    = settings.zoomFactor;
        backgroundColor.value               = settings.backgroundColor;
        consoleScale.value                  = settings.consoleScale;
        strokeColor.value                   = settings.strokeColor;
        strokeOpacityText.textContent       = strokeOpacity.value = settings.strokeOpacity;
        fillColor.value                     = settings.fillColor;
        fillOpacityText.textContent         = fillOpacity.value = settings.fillOpacity;

        ghostCSS.value                      = settings.ghostCSS;

        ghostHeaderMontage.checked          = settings.ghostHeader[titles.MONTAGE];
        ghostHeaderWatch.checked            = settings.ghostHeader[titles.WATCH];
        ghostHeaderEvent.checked            = settings.ghostHeader[titles.EVENT];

        customCSSMontage.value              = settings.customCSSMontage;
        customCSSWatch.value                = settings.customCSSWatch;
        customCSSEvent.value                = settings.customCSSEvent;

        hideHeaderWatch.value               = settings.hideHeader[titles.WATCH];
        hideHeaderEvent.value               = settings.hideHeader[titles.EVENT];

        eventsPageSticky.checked            = settings.eventsPageSticky;
        eventStats.checked                  = settings.eventStats;
        maintainEventAspect.checked         = settings.maintainEventAspect;

        monitorsPerRow                      = settings.monitorsPerRow;
        autoScale.value                     = settings.autoScale;

        let paragraph = document.getElementById('aspectCalculator');
        paragraph.innerHTML = `With ${monitorsPerRow} monitors per row and a screen width of ${screen.width}px, these aspect ratios will give you:<br>`

        for ( let x = 1; x <= 8; x++ ){
            paragraph.innerHTML += `${num[x]} Row${x === 1 ? '': 's'} @ Aspect Ratio of <a id="link${x}">${ x * ( screen.width / monitorsPerRow ) / screen.height }</a><br>`;
        }
        for ( let x = 1; x <= 8; x++ ){
            document.getElementById(`link${x}`).addEventListener('click', e => {
                aspectRatio.value = `${ x * ( screen.width / monitorsPerRow ) / screen.height}`;
                aspectRatioApply.click();
            })
        }
    
        windowAspect( window.innerWidth, window.innerHeight );
    });

    document.getElementById('clearStorage').addEventListener('click', () => 
        chrome.runtime.sendMessage({ clearStorage: true })
    );

    recordDiv.addEventListener('click', () => 
        recordDiv.classList.contains('Alarm') ?
        recordButton.className = recordDiv.className = 'Idle' :
        recordButton.className = recordDiv.className = 'Alarm'
    );

    alertOpacity.onchange                = () => chrome.storage.local.set({ alertOpacity: alertOpacityText.textContent = alertOpacity.value });
    alarmOpacity.onchange                = () => chrome.storage.local.set({ alarmOpacity: alarmOpacityText.textContent = alarmOpacity.value });
    inversionAmount.onchange             = () => chrome.storage.local.set({ inversionAmount: inversionAmountText.textContent = inversionAmount.value });
    recordButtonSize.oninput             = () => recordButton.style.height = recordButton.style.width = recordButton.style.borderRadius = recordDiv.style.fontSize = `${recordButtonSize.value}px`;
    recordButtonSize.onchange            = () => chrome.storage.local.set({ recordButtonSize: recordButtonSize.value });
    dropShadowApply.onclick              = () => chrome.storage.local.set({ dropShadowString: dropShadowString.value });
    dropShadowStringReset.onclick        = () => chrome.storage.local.set({ dropShadowString: defaultShadow }, () => dropShadowString.value = defaultShadow);
    widthMax.onchange                    = () => chrome.storage.local.set({ widthMax: parseInt( widthMax.value, 10 )});
    flashSpeed.onchange                  = () => chrome.storage.local.set({ flashSpeed: flashSpeed.value });
    //customLocation.onchange              = () => chrome.storage.local.set({ customLocation: customLocation.value });
    showFps.onchange                     = () => chrome.storage.local.set({ showFps: showFps.checked });
    fpsSize.onchange                     = () => chrome.storage.local.set({ fpsSize: fpsSize.value });
    fpsSize.oninput                      = () => fpsSpan.style.fontSize = `${fpsSize.value}px`;
    fpsColor.onchange                    = () => chrome.storage.local.set({ fpsColor: fpsColor.value });
    fpsColor.oninput                     = () => fpsSpan.style.color = fpsColor.value;
    lockRecordButton.onchange            = () => chrome.storage.local.set({ lockRecordButton: lockRecordButton.checked });
    obfuscate.onchange                   = () => chrome.storage.local.set({ obfuscate: obfuscate.checked });
    disableRecordOnAlert.onchange        = () => chrome.storage.local.set({ disableRecordOnAlert: disableRecordOnAlert.checked });
    applyFilters.onchange                = () => chrome.storage.local.set({ applyFilters: applyFilters.checked });
    aspectRatioApply.onclick             = () => chrome.storage.local.set({ aspectRatio: aspectRatio.value });
    aspectRatioReset.onclick             = () => chrome.storage.local.set({ aspectRatio: defaultAspectRatio}, () => aspectRatio.value = defaultAspectRatio );
    maintainSingleMonitorAspect.onchange = () => chrome.storage.local.set({ maintainSingleMonitorAspect: maintainSingleMonitorAspect.checked });
    overrideZoom.onchange                = () => chrome.storage.local.set({ overrideZoom: overrideZoom.checked });
    zoomFactor.onchange                  = () => chrome.storage.local.set({ zoomFactor: zoomFactor.value });
    backgroundColor.oninput              = () => chrome.storage.local.set({ backgroundColor: backgroundColor.value });
    strokeColor.oninput                  = () => chrome.storage.local.set({ strokeColor: strokeColor.value });
    strokeOpacity.oninput                = () => chrome.storage.local.set({ strokeOpacity: strokeOpacityText.textContent = strokeOpacity.value });
    fillColor.oninput                    = () => chrome.storage.local.set({ fillColor: fillColor.value });
    fillOpacity.oninput                  = () => chrome.storage.local.set({ fillOpacity: fillOpacityText.textContent = fillOpacity.value });
    consoleScale.oninput                 = () => chrome.storage.local.set({ consoleScale: consoleScale.value });
    eventStats.onchange                  = () => chrome.storage.local.set({ eventStats: eventStats.checked });
    maintainEventAspect.onchange         = () => chrome.storage.local.set({ maintainEventAspect: maintainEventAspect.checked });
    eventsPageSticky.onchange            = () => chrome.storage.local.set({ eventsPageSticky: eventsPageSticky.checked });

    ghostHeaderMontage.addEventListener('change', () => {
        chrome.storage.local.get( 'ghostHeader', edit => {
            edit.ghostHeader[titles.MONTAGE] = ghostHeaderMontage.checked;
            chrome.storage.local.set({ ghostHeader: edit.ghostHeader });
        })
    })

    ghostHeaderWatch.addEventListener('change', () => {
        chrome.storage.local.get( 'ghostHeader', edit => {
            edit.ghostHeader[titles.WATCH] = ghostHeaderWatch.checked;
            chrome.storage.local.set({ ghostHeader: edit.ghostHeader });
        })
    })

    ghostHeaderEvent.addEventListener('change', () => {
        chrome.storage.local.get( 'ghostHeader', edit => {
            edit.ghostHeader[titles.EVENT] = ghostHeaderEvent.checked;
            chrome.storage.local.set({ ghostHeader: edit.ghostHeader });
        })
    })

    ghostCSSApply.onclick = () => {
        chrome.storage.local.set({ ghostCSS: ghostCSS.value        });
        
    }
    customCSSApplyMontage.onclick = () => chrome.storage.local.set({ customCSSMontage: customCSSMontage.value });
    customCSSApplyWatch.onclick = () => chrome.storage.local.set({ customCSSWatch: customCSSWatch.value });
    customCSSApplyEvent.onclick = () => chrome.storage.local.set({ customCSSEvent: customCSSEvent.value });

    ghostCSSReset.onclick = () => chrome.storage.local.set({ ghostCSS: ghostCSS.value = defaultGhostCSS });
    customCSSResetMontage.onclick = () => {
        chrome.storage.local.set({ customCSSMontage:  defaultMontageCSS });
        //chrome.notifications.create('', {  title: 'Just wanted to notify you', iconUrl: 'icons/icon-32.png', message: `Reset Custom Montage`,  type: 'basic'});
        //chrome.runtime.sendMessage({ notification: true, message: `Thank You for Resetting ${this}`})
    }
    customCSSResetWatch.onclick = () => chrome.storage.local.set({ customCSSWatch: defaultWatchCSS });
    customCSSResetEvent.onclick = () => chrome.storage.local.set({ customCSSEvent: defaultEventCSS });

    hideHeaderWatch.addEventListener('click', () => {
        chrome.storage.local.get( 'hideHeader', edit => {
            edit.hideHeader[titles.WATCH] = hideHeaderWatch.checked;
            chrome.storage.local.set({ hideHeader: edit.hideHeader });
        })
    })

    hideHeaderEvent.addEventListener('click', () => {
        chrome.storage.local.get( 'hideHeader', edit => {
            edit.hideHeader[titles.EVENT] = hideHeaderEvent.checked;
            chrome.storage.local.set({ hideHeader: edit.hideHeader });
        })
    })

    autoScale.addEventListener('change', (e) => {
        console.log(autoScale.value)
        chrome.storage.local.set({ autoScale: autoScale.value});
    })


})();