(() => {
    "use strict";

    let settings = {};
    let tabId = [];

    window.requestAnimationFrame(() => {
        window.focus();
    });

    chrome.runtime.onUpdateAvailable.addListener( () => {
        chrome.runtime.reload();
    });

    chrome.runtime.onInstalled.addListener( () =>{
        chrome.storage.local.get({
            customLocation: '',
            alarmOpacity: 0.5,
            alertOpacity: 0.5,
            maximizeSingleView: true,
            zmMontageLayout: 3,
            monitorOverride: false,
            monitors: 4,
            hideHeader: false,
            gridColor: '#000000',
            gridWidth: 0,
            toggleScroll: true,
            flashAlarm: true,
            toggleDark: true,
            flashWidth: 10,
            widthMax: 20,
            flashSpeed: 0.6,
            invertColors: false,
            showFps: true,
            fpsColor: '#00ff00',
            fpsSize: 30,
            dropShadow: false,
            shadowColor: '#000000',
            borderRadius: 0,
            lockRecordButton: false,
            disableRecordOnAlert: false,
            recordButtonSize: 70,
            dropShadowString: '2px 4px 6px',
            inversionAmount: 1,
            transparentGrid: false,
            applyFilters: false
        }, localStorage => {
            settings = localStorage;
        });

        chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryPrefix: 'view=montage'}
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryPrefix: 'view=watch'}
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryPrefix: 'view=console'}
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    });

    chrome.tabs.onRemoved.addListener( id => {
        //If this is not here, when you change a value for certain things
        //(flash, grid, css filters) on the options page, it will error if
        //the ZoneMinder tab has closed. Those settings check for tabId
        //before attempting to insertCSS into a tab that no longer exists.
        if (tabId.includes(id)){
            tabId = tabId.filter( item => item !== id);
        }
    });

    chrome.storage.onChanged.addListener( change => {
        let values = Object.getOwnPropertyNames(change);
        values.forEach( value => {
            switch(value){
                default:
                    settings[value] = change[value].newValue;
                    break;

                case 'hideHeader':
                    settings.hideHeader = change[value].newValue;
                    hideHeader();
                    break;

                case 'monitorOverride':
                case 'monitors':
                case 'zmMontageLayout':
                    settings[value] = change[value].newValue;
                    monitorOverride();
                    break;

                case 'gridWidth':
                case 'gridColor':
                case 'transparentGrid':
                    settings[value] = change[value].newValue;
                    if (tabId) gridHandler();
                    break;

                case 'customLocation':
                    changeDeclarativeContent(change[value].newValue);
                    break;

                case 'toggleScroll':
                    settings.toggleScroll = change[value].newValue;
                    toggleScroll();
                    break;

                case 'dropShadow':
                case 'invertColors':
                case 'shadowColor':
                case 'dropShadowString':
                case 'inversionAmount':
                    settings[value] = change[value].newValue;
                    if (tabId) filterHandler();
                    break;

                case 'borderRadius':
                    settings[value] = change[value].newValue;
                    borderRadius();
                    break;

                case 'flashAlarm':
                case 'flashWidth':
                case 'alertOpacity':
                case 'alarmOpacity':
                case 'flashSpeed':
                    settings[value] = change[value].newValue;
                    if (tabId) flashAlarm();
            }
        });
    });

    const changeDeclarativeContent = customLocation => {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {urlContains: customLocation}
                    })
                ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    };

    chrome.tabs.onUpdated.addListener( (id, tab) => {
        if (tab.title && tab.title === 'ZM - Montage'){
            if (!tabId.includes(id)){
                tabId.push(id);
            }
        }
    });

    chrome.runtime.onMessage.addListener( (msg, sender, callback) => {
        let value = Object.getOwnPropertyNames(msg)[0];
        switch (value){
            case 'fullscreenToggle':
                toggleFullscreenFn();
                break;

            case 'zmMontageChanged':
                settings.zmMontageLayout = msg.value;
                chrome.storage.local.set({zmMontageLayout: msg.value});
                break;

            case 'popupOpen':
                callback({
                    hideHeader: settings.hideHeader,
                    toggleDark: settings.toggleDark,
                    widthMax: settings.widthMax,
                    monitorOverride: settings.monitorOverride,
                    monitors: settings.monitors,
                    gridColor: settings.gridColor,
                    gridWidth: settings.gridWidth,
                    toggleScroll: settings.toggleScroll,
                    flashAlarm: settings.flashAlarm,
                    flashWidth: settings.flashWidth,
                    maximizeSingleView: settings.maximizeSingleView,
                    invertColors: settings.invertColors,
                    dropShadow: settings.dropShadow,
                    shadowColor: settings.shadowColor,
                    borderRadius: settings.borderRadius,
                    transparentGrid: settings.transparentGrid
                });
                break;

            case 'clearStorage':
                if (tabId.length > 0){
                    chrome.storage.local.clear( () =>{
                        if (!lastError()) alert('Storage Cleared! Click OK to reload the extension and the ZoneMinder page.');
                        tabId.forEach( id => {
                            chrome.tabs.executeScript(id, {code: `window.location.reload();`}, () =>{
                                chrome.runtime.reload(); //Shouldn't run this on every open ZoneMinder tab, just once is enough.
                            });
                        });
                    });
                } else {
                    chrome.storage.local.clear( () => {
                        if (!lastError()) alert('Storage Cleared! Click OK to reload the extension.');
                        chrome.runtime.reload();
                    });
                }
                break;

            case 'montageOpen':
                if (!tabId.includes(sender.tab.id)){
                    tabId.push(sender.tab.id);
                }
                initMontage();
                hideHeader();
                chrome.storage.local.set({zmMontageLayout: msg.zmMontageLayout});
                flashAlarm();
                monitorOverride();
                toggleScroll();
                widthMax();
                filterHandler();
                gridHandler();
                borderRadius();
                break;

            case "setMonitor":
                chrome.storage.local.set({
                    [msg.monitorName]: {
                        x: msg.positionX,
                        y: msg.positionY,
                        fpsPosX: msg.fpsPosX,
                        fpsPosY: msg.fpsPosY
                    }
                });
                break;

            case "goToConsole":
                chrome.windows.getCurrent( window => {
                    chrome.windows.update(window.id, {state: 'normal'});
                });
                break;

            case 'watchPageOpen':
                //If the watch page was clicked on from the montage page and not the
                //console page and the setting is selected in the popup. Maximize the monitor.
                if (settings.maximizeSingleView){
                    let windowState;
                    chrome.windows.getCurrent( window => {
                        windowState = window.state;
                        chrome.windows.update(window.id, {
                            state: 'fullscreen'
                        });
                    });
                    chrome.tabs.insertCSS(sender.tab.id, {code:
                        `img:first-child {object-fit: contain !important;
                        width: 100vw !important; height: 100vh !important;}
                        div#content {margin: 0 !important;}
                        div.navbar, div#header, div#monitorStatus, div#dvrControls,
                        div#replayStatus, div#ptzControls, div#events, div.warning {display: none !important;}
                        div.fixed-top.container-fluid, div#header, div.d-flex {display: none !important;}`
                    });
                    chrome.storage.local.get({
                        [msg.monitorName]: {
                            x: [msg.monitorName].x || 0,
                            y: [msg.monitorName].y || 0,
                            fpsPosX: [msg.monitorName].fpsPosX || undefined,
                            fpsPosY: [msg.monitorName].fpsPosY || undefined
                        }
                    }, obj => {
                        callback({
                            obj: obj,
                            showFps: settings.showFps,
                            fpsColor: settings.fpsColor,
                            lockRecordButton: settings.lockRecordButton,
                            disableRecordOnAlert: settings.disableRecordOnAlert,
                            recordButtonSize: settings.recordButtonSize,
                            fpsSize: settings.fpsSize,
                            windowState: windowState,
                            maximizeSingleView: settings.maximizeSingleView
                        });
                        if (settings.applyFilters) filterHandler([sender.tab.id]);
                    });
                }
        }
        //We have to return true or else the message port
        //will close before storage.local.get is returned.
        return true;
    });

    const initMontage = () => {
        tabId.forEach( id => chrome.tabs.insertCSS(id, {
            code:
            `.monitorState {display: none !important;}
            #content {width: 100% !important; margin: 0px !important;}
            #header {border-bottom: 0px !important; margin: 0px !important;}`
        }));
    };

    const borderRadius = () => tabId.forEach( id => chrome.tabs.insertCSS(id, {code:
        `img {border-radius:${settings.borderRadius}% !important;}`
    }));

    const gridHandler = () => {
        tabId.forEach( id => {
            settings.transparentGrid ?
            chrome.tabs.insertCSS(id, {code:
                `img {border:${settings.gridWidth}px solid transparent !important;}`
            }) : 
            chrome.tabs.insertCSS(id, {code:
                `img {border:${settings.gridWidth}px solid ${settings.gridColor} !important;}`
            });
        });
    };

    const widthMax = () => {
        if (settings.gridWidth > settings.widthMax) settings.gridWidth = settings.widthMax;
        if (settings.flashWidth > settings.widthMax) settings.flashWidth = settings.widthMax;
    };

    const toggleFullscreenFn = () => {
        chrome.windows.getCurrent( window => {
            window.state !== 'fullscreen' ?
            chrome.windows.update(window.id, {state: 'fullscreen'}) : 
            chrome.windows.update(window.id, {state: 'normal'});
        });
    }

    const lastError = () => {
        const lastErrorMsg = chrome.runtime.lastError;
        if (lastErrorMsg){
            console.log(JSON.stringify(lastErrorMsg));
            return true;
        }
        return false;
    };

    const monitorOverride = () => {
        tabId.forEach( id => {
            if (settings.monitorOverride){
                chrome.tabs.insertCSS(id, {code:
                    `.monitorFrame {width:${100 / settings.monitors}% !important;}`
                });
            } else {
                if (settings.zmMontageLayout == 1){
                    //freeform is selected in ZoneMinder, so do nothing
                    return;
                }
                chrome.tabs.insertCSS(id, {code:
                    `.monitorFrame {width:${100 / settings.zmMontageLayout}% !important;}`
                });
            }
        });
    };

    const toggleScroll = () => {
        tabId.forEach( id => {
            settings.toggleScroll ?
            chrome.tabs.insertCSS(id, {code:
                '::-webkit-scrollbar {width: 0px !important;}'
            }) :
                chrome.tabs.insertCSS(id, {code:
                    '::-webkit-scrollbar {all: auto !important;}'
            });
        });
    };

    const filterHandler = (sender = tabId) => {
        sender.forEach( sender => {
            if (settings.dropShadow && settings.invertColors){
                chrome.tabs.insertCSS(sender, {code:
                    `img {filter: drop-shadow(${settings.dropShadowString} ${settings.shadowColor})
                    invert(${settings.inversionAmount}) !important;}`
                });
            } else if (settings.dropShadow && !settings.invertColors){
                chrome.tabs.insertCSS(sender, {code:
                    `img {filter: drop-shadow(${settings.dropShadowString} ${settings.shadowColor})
                    !important;}`
                });
            } else if (!settings.dropShadow && settings.invertColors){
                chrome.tabs.insertCSS(sender, {code:
                    `img {filter: invert(${settings.inversionAmount}) !important;}`
                });
            } else {
                chrome.tabs.insertCSS(sender, {code:
                    'img {filter: none !important;}'
                });
            }
        });
    };

    const flashAlarm = () => {
        //At some point between ZM 1.34.x and 1.35.14, the img no longer got the alarm or alert
        //class. So div.alarm img and div.alert img were added below to the css selectors.
        const flash = (id) => {
            chrome.tabs.insertCSS(id, {code:
                `@-webkit-keyframes alarm {from, to {outline-color: transparent;} 50% {outline-color: rgba(255,0,0,
                ${settings.alarmOpacity});}} div.alarm > div.imageFeed > img, img.alarm {outline: ${settings.flashWidth}px solid rgba(255,0,0,
                ${settings.alarmOpacity}); outline-offset: -${settings.flashWidth}px; animation: alarm
                ${settings.flashSpeed}s linear infinite;}
                @-webkit-keyframes alert {from, to {outline-color: transparent;} 50% {outline-color: rgba(255,247,28,
                ${settings.alertOpacity});}} div.alert > div.imageFeed > img, img.alert {outline: ${settings.flashWidth}px solid rgba(255,247,28,
                ${settings.alertOpacity}); outline-offset: -${settings.flashWidth}px; animation: alert
                ${settings.flashSpeed}s linear infinite;}`
            }, () => {
                lastError();
            });
        };
        
        tabId.forEach( id => settings.flashAlarm ?
            flash(id) :
            chrome.tabs.insertCSS(id, {code:
                'div.alarm img, div.alert img, img.alarm, img.alert {animation: none; outline: unset;}'
            })
        );
    };

    const hideHeader = () => {
        tabId.forEach( id => {
            if (settings.hideHeader){
                //div.fixed-top new bootstrap header in 1.35.5
                chrome.tabs.insertCSS(id, {code:
                    `div.navbar{display: none !important;}
                    div#header{display: none !important;}
                    div.fixed-top {display: none !important;}
                    div#page {padding-bottom: 0px !important; padding-right: 0px !important; padding-left: 0px !important;}` //New bootstrap padding padding in montage page in 1.35.16
                    , runAt: 'document_start' //Pay attention to this 12/25/2020
                });
            } else {
                chrome.tabs.insertCSS(id, {code:
                    `div.navbar{display: block !important;}
                    div#header{display: block !important;} 
                    div.fixed-top {display: block !important;}
                    div#page {padding-bottom: 10px !important; padding-right: 15px !important; padding-left: 15px !important;}`
                    , runAt: 'document_start'
                });
            }
        });
    };
})();